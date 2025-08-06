import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  Home as HomeIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useChatHistory } from '../../contexts/ChatContext';

export default function ChatSidebar({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    chatHistory, 
    currentChatId, 
    setCurrentChatId, 
    createNewChat, 
    deleteChat 
  } = useChatHistory();

  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    createNewChat();
    onClose?.(); 
  };

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
    onClose?.(); 
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  const handleBackToHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 bg-opacity-40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 h-full w-80 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0 left-0' : '-translate-x-full left-0'}
        lg:translate-x-0 lg:left-64 lg:shadow-none lg:z-0
      `}>
        <div className="flex flex-col h-full">
          <header className="p-4 border-b border-gray-200">
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleNewChat}
                className="flex items-center space-x-3 w-full text-left px-4 py-3 text-textcolor hover:bg-gray-50 rounded-lg transition-colors"
              >
                <AddIcon className="w-5 h-5" />
                <span className="text-sm">New Chat</span>
              </button>
              
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-3 w-full text-left px-4 py-3 text-textcolor hover:bg-gray-50 rounded-lg transition-colors lg:hidden"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-sm">Back to Home</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Recent</h3>
              
              <div className="space-y-1">
                {filteredChats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No chats found</p>
                    <button
                      onClick={handleNewChat}
                      className="text-primary hover:text-shadow text-sm mt-2"
                    >
                      Start a new conversation
                    </button>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => handleChatSelect(chat.id)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-colors group relative
                        ${currentChatId === chat.id 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-gray-50 text-textcolor'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className={`text-sm font-medium truncate ${
                            currentChatId === chat.id ? 'text-white' : 'text-textcolor'
                          }`}>
                            {chat.title === "New Chat" ? 
                              (chat.messages.find(m => m.sender === 'user')?.text?.slice(0, 30) + "..." || "New Chat") : 
                              chat.title
                            }
                          </p>
                          <p className={`text-xs truncate mt-1 ${
                            currentChatId === chat.id ? 'text-red-100' : 'text-gray-500'
                          }`}>
                            {chat.lastMessage}
                          </p>
                        </div>
                        
                        <button
                          onClick={(e) => handleDeleteChat(e, chat.id)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all ${
                            currentChatId === chat.id ? 'text-white hover:bg-shadow' : 'text-gray-400'
                          }`}
                          aria-label="Delete chat"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
