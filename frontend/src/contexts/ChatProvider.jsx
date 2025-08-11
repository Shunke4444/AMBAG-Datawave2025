// ChatProvider.jsx
import { useState, useEffect } from 'react';
import { ChatContext } from './ChatContext';

const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('ambag-chat-history');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChatHistory(parsedChats);

      if (!currentChatId && parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
      }
    }
  }, [currentChatId]);

  // Save chat history to localStorage on changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('ambag-chat-history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
  sessionId: null,
      createdAt: new Date().toISOString(),
      lastMessage: '',
    };
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat;
  };

  const updateChatMessages = (chatId, messages) => {
    setChatHistory(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages,
              lastMessage: messages[messages.length - 1]?.text?.slice(0, 50) + '...' || '',
              title: messages.find(m => m.sender === 'user')?.text?.slice(0, 30) + '...' || 'New Chat',
            }
          : chat
      )
    );
  };

  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const getCurrentChat = () => {
    return chatHistory.find(chat => chat.id === currentChatId);
  };

  const setChatSessionId = (chatId, sessionId) => {
    setChatHistory(prev => prev.map(chat => (
      chat.id === chatId ? { ...chat, sessionId } : chat
    )));
  };

  return (
    <ChatContext.Provider
      value={{
        chatHistory,
        currentChatId,
        setCurrentChatId,
        createNewChat,
        updateChatMessages,
        deleteChat,
        getCurrentChat,
  setChatSessionId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
