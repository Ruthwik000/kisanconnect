import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading, placeholder = "Ask about crops, fertilizers, diseases..." }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white border-t border-[#eeede6]">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 bg-[#fdfbf7] border border-[#eeede6] rounded-xl px-4 py-3 text-sm font-medium text-[#2a3328] focus:outline-[#768870]/50 transition-all disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="w-12 h-12 bg-[#768870] text-white rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default ChatInput;