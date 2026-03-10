import React from 'react';
import { Leaf } from 'lucide-react';
import ImageUploadCard from './ImageUploadCard';

const WelcomeView = ({ onCameraClick, onUploadClick }) => {
  return (
    <div className="w-full max-w-4xl h-full sm:h-auto flex flex-col items-center justify-evenly sm:justify-center sm:space-y-12">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#f4f2eb] rounded-[2.5rem] flex items-center justify-center mx-auto border border-[#eeede6] shadow-sm mb-2">
          <Leaf className="w-10 h-10 sm:w-12 sm:h-12 text-[#768870]" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2a3328] tracking-tighter leading-tight">
            Crop Diagnostics
          </h1>
          <p className="text-sm sm:text-base font-medium text-[#7a8478] opacity-80">
            Upload, capture, or paste (Ctrl+V) a photo
          </p>
        </div>
      </div>

      <ImageUploadCard 
        onCameraClick={onCameraClick}
        onUploadClick={onUploadClick}
      />

      {/* Hint text to fill bottom space on mobile */}
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a8478]/30 sm:hidden">
        Powered by Kisan Connect AI
      </div>
    </div>
  );
};

export default WelcomeView;