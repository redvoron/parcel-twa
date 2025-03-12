import { Message, messagesApi } from "../data/messages";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../main";
import Chat from "./Chat";
import { getUserProfile } from "../data/users";

const ChatMain = ({ companionId, orderId }: { companionId?: string; orderId?: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { userContext } = useContext(GlobalContext);
  const [userProfiles, setUserProfiles] = useState({});
  

   //TODO: remove mock userId
  const userId = userContext?.data || "19b31340-f88c-48dc-bc97-cbe80427ba37";
  const getMessages = async () => {
    if (!companionId || !orderId) {
      return;
    }
    const messages = await messagesApi.getMessagesBetweenUsers(userId, companionId, orderId);
    setMessages(messages);
  };

  const handleSendMessage = async (text: string) => {
    if (!orderId || !companionId) {
      return;
    }

    await messagesApi.createMessage({
      order_id: orderId,
      sender_id: userId,
      reciever_id: companionId,
      is_read: false,
      data: { message: text }
    });
  };

  const getUserProfiles = async () => {
    if (!companionId || !userId) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users: Record<string, any> = {};
    users[companionId] = await getUserProfile(companionId);
    users[userId] = await getUserProfile(userId);
    
    setUserProfiles(users);
  };


  useEffect(() => {
    if (userId && orderId && companionId) {
      getMessages();
      getUserProfiles();
      const unsubscribe =     messagesApi.subscribeToUserMessagesForOrder(orderId, userId, companionId, (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      return () => unsubscribe();
    }
  }, [userId, orderId, companionId]);


  return (
    <Chat
      messages={messages}
      userId={userId}
      onSendMessage={handleSendMessage}
      userProfiles={userProfiles}
    />
  );

};

export default ChatMain;
