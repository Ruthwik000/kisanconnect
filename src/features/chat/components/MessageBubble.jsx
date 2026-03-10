import React from 'react';
import { User, Bot } from 'lucide-react';

const MessageBubble = ({ message, isUser }) => {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-[#768870]' : 'bg-[#f4f2eb]'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-[#768870]" />
        )}
      </div>
      
      <div className={`max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-3 rounded-2xl ${
          isUser 
            ? 'bg-[#768870] text-white rounded-br-md' 
            : 'bg-white border border-[#eeede6] text-[#2a3328] rounded-bl-md'
        }`}>
          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;