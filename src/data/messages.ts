import supabase from "./supabaseClient";

export interface Message {
  id: number;
  order_id: number | null;
  created_at: string;
  data: Record<string, unknown> | null;
  sender_id: string;
  reciever_id: string;
}

export interface CreateMessageParams {
  order_id: number;
  data?: Record<string, unknown>;
  sender_id: string;
  reciever_id: string;
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
    user2Id: string
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user1Id},reciever_id.eq.${user1Id}`)
      .or(`sender_id.eq.${user2Id},reciever_id.eq.${user2Id}`)
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
    orderId: number,
    myUserId: string,
    otherUserId: string,
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
          filter: `order_id=eq.${orderId} AND (sender_id=eq.${myUserId} AND reciever_id=eq.${otherUserId}) OR (sender_id=eq.${otherUserId} AND reciever_id=eq.${myUserId})`,
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
};