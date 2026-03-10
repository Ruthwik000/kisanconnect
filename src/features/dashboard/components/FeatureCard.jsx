import React from 'react';

const FeatureCard = ({ icon: Icon, title, description, buttonText, onClick }) => {
  return (
    <div className="kisan-card p-5 flex flex-col justify-between hover:border-[#768870]/30 transition-all border-[#eeede6] bg-white group shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-full">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#f4f2eb] rounded-xl flex items-center justify-center group-hover:bg-[#768870]/10 transition-colors">
          <Icon className="w-5 h-5 text-[#768870]" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-[10px] text-[#7a8478] line-clamp-2">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className="w-full bg-[#768870] text-white py-2.5 rounded-lg text-xs font-bold mt-4 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default FeatureCard;