import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatHistory } from "../../contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import {
  Menu as MenuIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  Close as CloseIcon,
  Mic as MicIcon,
  Send as SendIcon,
} from "@mui/icons-material";

export default function AIAssitant() {
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
    getCurrentChat 
  } = useChatHistory();
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Get current chat messages
  const currentChat = getCurrentChat();
  const messages = currentChat?.messages || [];

  // Create initial chat if none exists
  useEffect(() => {
    if (!currentChatId) {
      createNewChat();
    }
  }, [currentChatId, createNewChat]);

  // Update chat when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      updateChatMessages(currentChatId, messages);
    }
  }, [messages.length]); // Only trigger when message count changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserInput = (input) => {
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

    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };

      const finalMessages = [...updatedMessages, botMessage];
      updateChatMessages(currentChatId, finalMessages);
      setIsTyping(false);
    }, 1500);
  };

  // delete when chatbot is online
  const generateBotResponse = (input) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("goal") || lowerInput.includes("expense")) {
      return "I can help you create and manage group goals! Would you like to create a new expense goal or check existing ones?";
    } else if (
      lowerInput.includes("contribute") ||
      lowerInput.includes("pay")
    ) {
      return "To contribute to a goal, go to the goal details and click 'Contribute'. You can pay via GCash, bank transfer, or cash.";
    } else if (
      lowerInput.includes("approval") ||
      lowerInput.includes("manager")
    ) {
      return "Managers can approve pending goals in the approval section. Members need manager approval for new goals after the first one.";
    } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! I'm here to help with your AMBAG group expenses. What would you like to know?";
    } else if (lowerInput.includes("deep research")) {
      return "Deep Research helps you analyze your group's spending patterns, identify trends, and get insights on how to optimize your shared expenses.";
    } else if (
      lowerInput.includes("what-if") ||
      lowerInput.includes("what if")
    ) {
      return "What-if scenarios let you explore different contribution amounts, payment schedules, and see how they affect your group goals timeline.";
    } else {
      return "I'm here to help with AMBAG - group expense management. Try asking about goals, contributions, or approvals!";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create message with text and files
    const messageText = inputValue.trim();
    if (!messageText && uploadedFiles.length === 0) return;

    const userMessage = {
      id: Date.now(),
      text: messageText || "Shared files",
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    const updatedMessages = [...messages, userMessage];
    updateChatMessages(currentChatId, updatedMessages);
    setInputValue("");
    setUploadedFiles([]); // Clear uploaded files
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "I can see you've shared some files with me! ";

      if (uploadedFiles.length > 0) {
        const fileTypes = uploadedFiles.map((f) => {
          if (f.type.includes("image/")) return "image";
          if (f.type.includes("pdf")) return "PDF";
          return "document";
        });
        botResponse += `I've received ${
          uploadedFiles.length
        } file(s): ${fileTypes.join(", ")}. `;
      }

      if (messageText) {
        botResponse += generateBotResponse(messageText);
      } else {
        botResponse += "How can I help you analyze or work with these files?";
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };

      const finalMessages = [...updatedMessages, botMessage];
      updateChatMessages(currentChatId, finalMessages);
      setIsTyping(false);
    }, 1500);
  };

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
        <header className="bg-white shadow-sm px-4 py-3 flex items-center space-x-3">
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

          <ul className="space-y-4">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <article
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-200 text-textcolor shadow-sm"
                  }`}
                >
                  {message.files?.length > 0 && (
                    <aside className="mb-2 space-y-1">
                      {message.files.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center p-2 rounded-lg ${
                            message.sender === "user"
                              ? "bg-shadow"
                              : "bg-gray-100"
                          }`}
                        >
                          <span
                            className={`mr-2 ${
                              message.sender === "user"
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          >
                            {getFileIcon(file.type)}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span
                              className={`text-xs font-medium truncate max-w-24 ${
                                message.sender === "user"
                                  ? "text-white"
                                  : "text-textcolor"
                              }`}
                            >
                              {file.name}
                            </span>
                            <span
                              className={`text-xs ${
                                message.sender === "user"
                                  ? "text-gray-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </aside>
                  )}

                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <time
                    className={`text-xs mt-1 block ${
                      message.sender === "user"
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp}
                  </time>
                </article>
              </li>
            ))}

            {isTyping && (
              <li className="flex justify-start">
                <div className="bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </div>
                </div>
              </li>
            )}
            <li ref={messagesEndRef} />
          </ul>
        </div>
      </section>

      <footer className="bg-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Suggestion bubbles - only show when no messages */}
          {messages.length === 0 && (
            <div className="mb-[2rem] flex flex-wrap justify-center gap-2 ">
              <button
                onClick={() => handleUserInput("How do I create a new group expense?")}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-red-950 transition-colors"
              >
                How do I create a new group expense?
              </button>
              <button
                onClick={() => handleUserInput("Show me my spending analytics")}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-red-950 transition-colors"
              >
                Show me my spending analytics
              </button>
              <button
                onClick={() => handleUserInput("Help me split a bill with friends")}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-red-950 transition-colors"
              >
                Help me split a bill with friends
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <fieldset className="bg-white border border-gray-300 rounded-3xl px-6 py-4 transition-shadow hover:shadow-sm">
              <div className="flex items-center h-12 mb-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything"
                  className="flex-1 text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-500"
                  disabled={isTyping}
                />
              </div>

              {uploadedFiles.length > 0 && (
                <aside className="mb-4 flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center bg-gray-100 rounded-lg px-3 py-2 text-sm"
                    >
                      <span className="text-gray-600 mr-2">
                        {getFileIcon(file.type)}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-textcolor truncate max-w-32">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={`Remove ${file.name}`}
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </aside>
              )}

              <nav className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    type="button"
                    className={`text-xl font-light transition-colors ${
                      activeButton === "add"
                        ? "text-primary"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                    onClick={() => {
                      setActiveButton("add");
                      setTimeout(() => setActiveButton(null), 200);
                      fileInputRef.current?.click();
                    }}
                    aria-label="Upload files"
                  >
                    +
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                    className="hidden"
                    aria-hidden="true"
                  />

                  <button
                    type="button"
                    className={`text-xs font-medium transition-colors ${
                      deepResearchActive || activeButton === "deep-research"
                        ? "text-primary"
                        : "text-textcolor hover:text-primary"
                    }`}
                    onClick={() => handleQuickAction("deep-research")}
                  >
                    Deep Research
                  </button>

                  <button
                    type="button"
                    className={`text-xs font-medium transition-colors ${
                      activeButton === "what-if"
                        ? "text-primary"
                        : "text-textcolor hover:text-primary"
                    }`}
                    onClick={() => handleQuickAction("what-if")}
                  >
                    What-If
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Voice input"
                    disabled={isTyping}
                  >
                    <MicIcon className="w-5 h-5" />
                  </button>

                  <button
                    type="submit"
                    disabled={
                      (!inputValue.trim() && uploadedFiles.length === 0) ||
                      isTyping
                    }
                    className="p-2.5 bg-primary text-white rounded-full hover:bg-shadow disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    title="Send message"
                  >
                    <SendIcon className="w-4 h-4" />
                  </button>
                </div>
              </nav>
            </fieldset>
          </form>
        </div>
      </footer>
    </main>
    </>
  );
}
