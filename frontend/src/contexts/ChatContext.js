// ChatContext.js
import { createContext, useContext } from 'react';

// 1. Create the context
export const ChatContext = createContext(null);

// 2. Custom hook to use the context
export const useChatHistory = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatProvider');
  }
  return context;
};