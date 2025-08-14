import React from "react";

export default function SuggestionButtons({ onSuggestionClick }) {
  const suggestions = [
    "How do I create a new group expense?",
    "Show me my spending analytics",
    "Help me split a bill with friends"
  ];

  return (
    <div className="mb-[2rem] flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-red-950 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
