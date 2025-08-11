import React from 'react';

export default function QuickActions({ onPick }) {
  return (
    <div className="mb-[2rem] flex flex-wrap justify-center gap-2 ">
      <button onClick={() => onPick('How do I create a new group expense?')} className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-red-950 transition-colors">
        How do I create a new group expense?
      </button>
      <button onClick={() => onPick('Show me my spending analytics')} className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-red-950 transition-colors">
        Show me my spending analytics
      </button>
      <button onClick={() => onPick('Help me split a bill with friends')} className="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-red-950 transition-colors">
        Help me split a bill with friends
      </button>
    </div>
  );
}
