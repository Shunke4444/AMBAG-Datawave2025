import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useChatHistory } from "../../contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import QuickActions from "./components/QuickActions";
import { askChatbot } from "../../lib/api";
import {
  Menu as MenuIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";

export default function AIAssistant() {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [deepResearchActive, setDeepResearchActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    currentChatId, 
    createNewChat, 
    updateChatMessages,
    getCurrentChat,
    setChatSessionId,
  } = useChatHistory();
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Get current chat messages
  const currentChat = getCurrentChat();
  const messages = useMemo(() => {
    const msgs = currentChat?.messages || [];
    return msgs;
  }, [currentChat]);

  // Create initial chat if none exists
  useEffect(() => {
    if (!currentChatId) {
      createNewChat();
    }
  }, [currentChatId, createNewChat]);

  const handleUserInput = async (input) => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, userMessage];
    updateChatMessages(currentChatId, updatedMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const existingSession = currentChat?.sessionId || null;
      const res = await askChatbot({ prompt: input, session_id: existingSession || undefined });
      const { response, session_id } = res;
      if (!existingSession && session_id) {
        setChatSessionId(currentChatId, session_id);
      }
      const botMessage = {
        id: Date.now() + 1,
        text: response || "No response received",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      const finalMessages = [...updatedMessages, botMessage];
      updateChatMessages(currentChatId, finalMessages);
    } catch (e) {
      const errDetail = e?.response?.data?.detail
        ? JSON.stringify(e.response.data.detail)
        : e?.response?.data
        ? JSON.stringify(e.response.data)
        : e?.message;
      const botMessage = {
        id: Date.now() + 1,
        text: `Sorry, I couldn't reach the assistant. ${errDetail ? `(${errDetail})` : ''}`.trim(),
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      const finalMessages = [...updatedMessages, botMessage];
      updateChatMessages(currentChatId, finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  // Local helpers for files

  // submit handled inline via MessageInput

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput(inputValue);
    }
  };

  const handleQuickAction = (action) => {
    setActiveButton(action);
    setTimeout(() => setActiveButton(null), 200); // Reset after 200ms

    if (action === "deep-research") {
      setDeepResearchActive(true);
      handleUserInput("Tell me about Deep Research");
    } else if (action === "what-if") {
      navigate("/what-if");
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      const fileData = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      };

      setUploadedFiles((prev) => [...prev, fileData]);
    });

    // Reset file input
    event.target.value = "";
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("image/")) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (fileType.includes("pdf")) {
      return <PdfIcon className="w-4 h-4" />;
    } else {
      return <DocumentIcon className="w-4 h-4" />;
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
          
          <button onClick={() => navigate(-1)} className="cursor-pointer hover:bg-gray-200 w-fit p-4 rounded-4xl" >
            <BackIcon />
          </button>
        </header>

    <section className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto lg:max-w-4xl">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
              <header className="text-center">
                <h2 className="text-3xl font-light text-textcolor">
                  Hello, <span className="text-primary font-medium">Johnny</span>
                </h2>
              </header>
            </div>
          )}
      <MessageList messages={messages} isTyping={isTyping} />
        </div>
      </section>

      <footer className="bg-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <QuickActions onPick={(text) => handleUserInput(text)} />
          )}

          <MessageInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            isTyping={isTyping}
            onSubmit={(e) => { e.preventDefault(); handleUserInput(inputValue); }}
            onKeyPress={handleKeyPress}
            uploadedFiles={uploadedFiles.map(f => ({ id: f.id, icon: getFileIcon(f.type), name: f.name, sizeLabel: formatFileSize(f.size) }))}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            onQuickAction={handleQuickAction}
          />
        </div>
      </footer>
    </main>
    </>
  );
}
