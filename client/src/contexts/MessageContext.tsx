import React, { createContext, useContext, useState, ReactNode } from 'react';
import MessageModal from '../components/MessageModal';

interface Message {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface MessageContextType {
  showMessage: (message: Omit<Message, 'id'>) => void;
  hideMessage: (id: string) => void;
  clearAllMessages: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const showMessage = (messageData: Omit<Message, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const message: Message = {
      id,
      ...messageData,
      autoClose: messageData.autoClose ?? true,
      autoCloseDelay: messageData.autoCloseDelay ?? 5000
    };
    
    setMessages(prev => [...prev, message]);
  };

  const hideMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearAllMessages = () => {
    setMessages([]);
  };

  return (
    <MessageContext.Provider value={{ showMessage, hideMessage, clearAllMessages }}>
      {children}
      {messages.map((message) => (
        <MessageModal
          key={message.id}
          isOpen={true}
          type={message.type}
          title={message.title}
          message={message.message}
          onClose={() => hideMessage(message.id)}
          autoClose={message.autoClose}
          autoCloseDelay={message.autoCloseDelay}
        />
      ))}
    </MessageContext.Provider>
  );
};
