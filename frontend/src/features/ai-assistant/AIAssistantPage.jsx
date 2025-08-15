import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatHistory } from "../../contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";
import SuggestionButtons from "./components/SuggestionButtons";
import {
  Menu as MenuIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";

export default function AIAssitant() {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const { 
    currentChatId, 
    createNewChat, 
    updateChatMessages,
    getCurrentChat,
    setCurrentChatId,
  } = useChatHistory();
  
  const navigate = useNavigate();

  // Get current chat messages
  const currentChat = getCurrentChat();
  const messages = currentChat?.messages || [];

  const shouldShowSuggestions = messages.length === 0;

  // Create initial chat if none exists
  useEffect(() => {
    if (!currentChatId) {
      createNewChat();
    }
  }, [currentChatId, createNewChat]);

  // When switching chats, reset AI session and any error state
  useEffect(() => {
    setSessionId(null);
    setErrorMsg("");
  }, [currentChatId]);

  const handleUserInput = async (input) => {
    if (!input.trim()) return;

    // Ensure we have a chat to append to
    const justCreated = !currentChatId;
    const maybeNewChat = justCreated ? createNewChat() : null;
    const targetChatId = currentChatId || maybeNewChat?.id;
    
    if (justCreated && targetChatId) {
      setCurrentChatId(targetChatId);
    }

    // Get current messages for this chat
    const currentChatObj = justCreated ? maybeNewChat : getCurrentChat();
    const baseMessages = currentChatObj?.messages || [];

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...baseMessages, userMessage];
    updateChatMessages(targetChatId, updatedMessages);
    
    setInputValue("");
    setIsTyping(true);
    setIsSending(true);
    setErrorMsg("");

    try {
      const { askChatbot } = await import("../../lib/api");
      const result = await askChatbot(input, sessionId);
      if (result?.session_id && !sessionId) {
        setSessionId(result.session_id);
      }
      const botMessage = {
        id: Date.now() + 1,
        text: result?.response || "",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      const finalMessages = [...updatedMessages, botMessage];
      updateChatMessages(targetChatId, finalMessages);
    } catch (err) {
      console.error("Chatbot error:", err);
      setErrorMsg("Chatbot is unavailable right now. Please try again.");
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create message with text and files
    const messageText = inputValue.trim();
    if (!messageText && uploadedFiles.length === 0) return;

    // Use the same logic as handleUserInput for consistency
    await handleUserInput(messageText);
    setUploadedFiles([]); // Clear uploaded files
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(inputValue);
    }
  };

  const handleQuickAction = (action) => {
    setActiveButton(action);
    setTimeout(() => setActiveButton(null), 200);

    if (action === "deep-research") {
      setDeepResearchActive(true);
    } else if (action === "what-if") {
      navigate("/what-if");
    }
  };

  return (
    <>
      <ChatSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <main className="flex flex-col h-screen bg-white relative transition-all duration-300 lg:ml-80">
        
        <header className="bg-white shadow-sm px-4 py-3 flex items-center space-x-3 justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-textcolor hover:text-opacity-80 transition-colors lg:hidden"
              aria-label="Toggle chat history"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-medium text-textcolor">Ask 
              <span className="font-bold text-primary ml-1">
                BAYO
              </span>
            </h1>
          </div>
          
          <button 
            onClick={() => navigate(-1)} 
            className="cursor-pointer hover:bg-gray-200 w-fit p-4 rounded-4xl"
          >
            <BackIcon />
          </button>
        </header>

        <ChatArea 
          messages={messages}
          isTyping={isTyping}
          errorMsg={errorMsg}
        />

        <footer className="bg-white px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {shouldShowSuggestions && (
              <SuggestionButtons onSuggestionClick={handleUserInput} />
            )}
            
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              onSubmit={handleSubmit}
              onKeyPress={handleKeyPress}
              isTyping={isTyping}
              activeButton={activeButton}
              setActiveButton={setActiveButton}
              deepResearchActive={deepResearchActive}
              onQuickAction={handleQuickAction}
            />
          </div>
        </footer>
      </main>
    </>
  );
}

