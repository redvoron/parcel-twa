import { useEffect, useRef, useState } from 'react';
import { Message } from '../data/messages';
import { Input, Button, Avatar } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styled from 'styled-components';

interface ChatProps {
  messages: Message[];
  userId: string;
  onSendMessage: (text: string) => void;
  userProfiles: Record<string, { 
    username?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
    avatar_url?: string;
  }>;
}

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 20px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const MessagesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageBubble = styled.div<{ $isMine: boolean }>`
  position: relative;
  max-width: 100%;
  padding: 8px 12px 12px 12px;
  border-radius: 12px;
  align-self: ${props => props.$isMine ? 'flex-end' : 'flex-start'};
  background: ${props => props.$isMine ? '#007AFF' : '#F0F0F0'};
  color: ${props => props.$isMine ? '#fff' : '#000'};
  text-align: left;
`;

const Composer = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #eee;
`;

const MessageTime = styled.span`
  position: absolute;
  right: 10px;
  bottom: 0px;
  font-size: 10px;
  color: ${props => props.color || 'rgba(0,0,0,0.45)'};
  margin-left: 8px;
`;

const MessageGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

export default function Chat({ messages, userId, onSendMessage, userProfiles }: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const getUserName = (id: string) => {
    const profile = userProfiles[id];
    if (!profile) return 'Anonymous';
    return `${profile.first_name} ${profile.last_name}`.trim() || profile.username || 'Anonymous';
  };

  return (
    <ChatContainer>
      <MessagesList>
        {messages.map((message, index) => {
          const isMine = message.sender_id === userId;
          const showAvatar = !isMine && (!messages[index - 1] || messages[index - 1].sender_id !== message.sender_id);
          
          return (
            <MessageGroup key={message.id}>
              {!isMine && showAvatar && (
                <Avatar 
                  src={userProfiles[message.sender_id]?.avatar_url}
                  size="small"
                >
                  {getUserName(message.sender_id)[0]}
                </Avatar>
              )}
              <div style={{ flex: 1 }}>
                {!isMine && showAvatar && (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {getUserName(message.sender_id)}
                  </div>
                )}
                <MessageBubble $isMine={isMine}>
                  {message.data?.message as string}
                  <MessageTime color={isMine ? 'rgba(255,255,255,0.7)' : undefined}>
                    {formatTime(message.created_at)}
                  </MessageTime>
                </MessageBubble>
              </div>
            </MessageGroup>
          );
        })}
        <div ref={messagesEndRef} />
      </MessagesList>
      
      <Composer>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onPressEnter={handleSend}
          style={{ flex: 1 }}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />}
          onClick={handleSend}
        />
      </Composer>
    </ChatContainer>
  );
}