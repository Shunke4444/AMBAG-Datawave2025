import React from 'react';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function PaymentHeader({ title = "Share Payment" }) {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b p-6">
      <div className="max-w-4xl mx-auto flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-4 hover:bg-primary/90 transition-colors"
          aria-label="Go back"
        >
          <ArrowBack />
        </button>
        <h1 className="text-2xl font-bold text-textcolor">{title}</h1>
      </div>
    </header>
  );
}
