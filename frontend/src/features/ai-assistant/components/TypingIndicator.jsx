import React from "react";

export default function TypingIndicator() {
  return (
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
  );
}
