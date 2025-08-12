import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

export default function ChatArea({ messages, isTyping, errorMsg, inputValue }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <section className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto lg:max-w-4xl">
        <ul className="space-y-4">
          {errorMsg && (
            <li className="flex justify-center">
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {errorMsg}
              </div>
            </li>
          )}
          
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}
          <li ref={messagesEndRef} />
        </ul>
      </div>
    </section>
  );
}
