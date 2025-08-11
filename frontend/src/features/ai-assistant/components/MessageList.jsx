import React, { useEffect, useRef } from 'react';

export default function MessageList({ messages, isTyping }) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <ul className="space-y-4">
      {messages.map((message) => (
        <li key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <article className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.sender === 'user' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-textcolor shadow-sm'}`}>
            <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
            <time className={`text-xs mt-1 block ${message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'}`}>{message.timestamp}</time>
          </article>
        </li>
      ))}
      {isTyping && (
        <li className="flex justify-start">
          <div className="bg-white border border-gray-200 shadow-sm px-4 py-3 rounded-2xl">
            <div className="flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        </li>
      )}
      <li ref={bottomRef} />
    </ul>
  );
}
