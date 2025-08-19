import React from 'react';

const AgenticPrompt = ({ daysLeft }) => {
  if (daysLeft === 1) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        <span className="text-red-700 font-medium">AI Suggestion: Would you like to take a loan to reach your goal?</span>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-lg">Loan with Members</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Loan with BPI</button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 mt-2">
      <span className="text-orange-700 font-medium">AI Suggestion: Would you like to pay now?</span>
      <div className="flex gap-2">
        <button className="bg-primary text-white px-4 py-2 rounded-lg">Yes</button>
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Ignore</button>
      </div>
    </div>
  );
};

export default AgenticPrompt;
