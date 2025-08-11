import React, { useRef } from 'react';
import { Close as CloseIcon, Mic as MicIcon, Send as SendIcon } from '@mui/icons-material';

export default function MessageInput({ inputValue, setInputValue, isTyping, onSubmit, onKeyPress, uploadedFiles, onFileUpload, onRemoveFile, onQuickAction }) {
  const fileInputRef = useRef(null);

  return (
    <form onSubmit={onSubmit}>
      <fieldset className="bg-white border border-gray-300 rounded-3xl px-6 py-4 transition-shadow hover:shadow-sm">
        <div className="flex items-center h-12 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Ask anything"
            className="flex-1 text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-500"
            disabled={isTyping}
          />
        </div>

        {uploadedFiles.length > 0 && (
          <aside className="mb-4 flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center bg-gray-100 rounded-lg px-3 py-2 text-sm">
                <span className="text-gray-600 mr-2">{file.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-textcolor truncate max-w-32">{file.name}</span>
                  <span className="text-xs text-gray-500">{file.sizeLabel}</span>
                </div>
                <button type="button" onClick={() => onRemoveFile(file.id)} className="ml-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label={`Remove ${file.name}`}>
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </aside>
        )}

        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button type="button" className="text-xl font-light text-gray-400 hover:text-gray-600 transition-colors" onClick={() => fileInputRef.current?.click()} aria-label="Upload files">+</button>

            <input type="file" ref={fileInputRef} onChange={onFileUpload} multiple accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls" className="hidden" aria-hidden="true" />

            <button type="button" className="text-xs font-medium text-textcolor hover:text-primary transition-colors" onClick={() => onQuickAction('deep-research')}>Deep Research</button>
            <button type="button" className="text-xs font-medium text-textcolor hover:text-primary transition-colors" onClick={() => onQuickAction('what-if')}>What-If</button>
          </div>

          <div className="flex items-center space-x-2">
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Voice input" disabled={isTyping}>
              <MicIcon className="w-5 h-5" />
            </button>
            <button type="submit" disabled={(!inputValue.trim() && uploadedFiles.length === 0) || isTyping} className="p-2.5 bg-primary text-white rounded-full hover:bg-shadow disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors" title="Send message">
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </fieldset>
    </form>
  );
}
