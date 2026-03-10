import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIAssistantBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#768870] rounded-xl p-4 text-white flex flex-col justify-between shadow-lg shadow-[#768870]/10 border border-white/5 h-[140px] flex-shrink-0">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-white/20 rounded-lg">
          <MessageCircle className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold leading-none mb-1.5">Kisan AI Assistant</h3>
          <p className="text-white/80 text-[10px] leading-tight font-medium">
            Ask questions about fertilizer application and soil pH management.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/chat')}
        className="w-full bg-white text-[#768870] py-2 rounded-lg text-[10px] font-bold hover:bg-white/95 transition-all shadow-sm active:scale-95 mt-2"
      >
        Ask a Question
      </button>
    </div>
  );
};

export default AIAssistantBanner;