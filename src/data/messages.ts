import supabase from "./supabaseClient";

export interface Message {
  id: number;
  order_id: number | null;
  created_at: string;
  data: Record<string, unknown> | null;
  sender_id: string;
  reciever_id: string;
  is_read: boolean;
}
export interface MessageCount {
  orderId: number;
  total: number;
  unread: number;
}
export interface CreateMessageParams {
  order_id: string;
  data?: Record<string, unknown>;
  sender_id: string;
  reciever_id: string;
  is_read: boolean;
}
export interface Conversation {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageDate: string;
  avatar: string;
}
export const messagesApi = {
  // Получить все сообщения для конкретного заказа
  async getMessagesByOrderId(orderId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Получить диалог между двумя пользователями
  async getMessagesBetweenUsers(
    user1Id: string,
    user2Id: string,
    orderId: string
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user1Id},reciever_id.eq.${user1Id}`)
      .or(`sender_id.eq.${user2Id},reciever_id.eq.${user2Id}`)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Создать новое сообщение
  async createMessage(params: CreateMessageParams): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([params])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Получить последние сообщения пользователя
  async getUserLatestMessages(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},reciever_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  },

  async getConversations(userId: string, orderId: number, isMyOrder: boolean) {
    // Получаем сообщения и связанные данные пользователей
    const { data, error } = await supabase
      .from('messages')
      .select(`
        sender_id,
        reciever_id,
        is_read,
        data,
        created_at,
        sender:sender_id(username, first_name, last_name, avatar_url),
        reciever:reciever_id(username, first_name, last_name, avatar_url)
      `)
      .eq(isMyOrder ? 'reciever_id' : 'sender_id', userId)
      .eq('order_id', orderId);
      
    if (error) throw error;

    // Создаем Map для хранения информации о пользователях и счетчиков
    const conversationsMap = new Map<string, Conversation>();

    data?.forEach(message => {

      const otherUserId = message.sender_id === userId ? message.reciever_id : message.sender_id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userInfo: any = message.sender_id === userId ? message.reciever : message.sender || {};

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          username: userInfo?.username || '',
          firstName: userInfo?.first_name || '',
          lastName: userInfo?.last_name || '',
          unreadCount: 0,
          lastMessage: message.data?.message || '',
          lastMessageDate: message.created_at || '',
          avatar: userInfo?.avatar_url || ''
        });
      }

      // Подсчитываем непрочитанные сообщения
      if (!message.is_read && message.reciever_id === userId) {
        const current = conversationsMap.get(otherUserId)!;
        current.unreadCount += 1;
        conversationsMap.set(otherUserId, current);
      }
    });

    return Array.from(conversationsMap.values());
  },

  // Подписаться на новые сообщения для заказа
  subscribeToOrderMessages(
    orderId: number,
    myUserId: string,
    callback: (message: Message) => void
  ): (() => void) {
    const subscription = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId} AND (sender_id=eq.${myUserId} OR reciever_id=eq.${myUserId})`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  subscribeToUserMessagesForOrder(
    orderId: string,
    myUserId: string,
    otherUserId: string,
    callback: (message: Message) => void
  ): (() => void) {
    const subscription = supabase
      .channel(`messages_channel_${orderId}_${myUserId}_${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const payloadMessage = payload.new as Message;
          if ((payloadMessage.sender_id === myUserId && payloadMessage.reciever_id === otherUserId) || (payloadMessage.sender_id === otherUserId && payloadMessage.reciever_id === myUserId)) {
            callback(payload.new as Message); 
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  async readMessages(orderId: number, userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('order_id', orderId)
      .eq('reciever_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return data;
  },

  async getMessagesCount(orderId: number, userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('count')
      .eq('order_id', orderId)
      .eq('reciever_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return data[0].count;
  },

  async getMessagesCountForUser(userId: string): Promise<MessageCount[]> {
    try {
      // Получаем все сообщения и обрабатываем на клиенте
      const { data: allMessages, error: messagesError } = await supabase
        .from('messages')
        .select('order_id, is_read')
        .eq('reciever_id', userId);
        
      if (messagesError) throw messagesError;
      
      const messagesByOrder: Record<string, { total: number; unread: number }> = {};
      
      if (allMessages) {
        allMessages.forEach((msg: { order_id: number; is_read: boolean }) => {
          const orderId = String(msg.order_id);
          if (!messagesByOrder[orderId]) {
            messagesByOrder[orderId] = { total: 0, unread: 0 };
          }
          messagesByOrder[orderId].total += 1;
          if (!msg.is_read) {
            messagesByOrder[orderId].unread += 1;
          }
        });
      }
      
      return Object.keys(messagesByOrder).map(orderId => ({
        orderId: Number(orderId),
        total: messagesByOrder[orderId].total,
        unread: messagesByOrder[orderId].unread
      }));
    } catch (error) {
      console.error('Error in getMessagesCountForUser:', error);
      return [];
    }
  },

  async getUnreadMessagesByOrder(orderId: number) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        sender_id,
        reciever_id,
        is_read
      `)
      .eq('order_id', orderId);
      
    if (error) throw error;

    // Группируем сообщения по получателям и считаем непрочитанные
    const unreadByUser: Record<string, number> = {};
    
    data?.forEach(message => {
      if (!message.is_read) {
        if (!unreadByUser[message.reciever_id]) {
          unreadByUser[message.reciever_id] = 0;
        }
        unreadByUser[message.reciever_id]++;
      }
    });

    // Преобразуем в массив объектов для удобства использования
    return Object.entries(unreadByUser).map(([userId, count]) => ({
      userId,
      unreadCount: count
    }));
  },
};
