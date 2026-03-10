import React from 'react';
import { AnalyzingAnimation } from '@/shared/ui/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const AnalyzingView = ({ selectedImage }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-md flex flex-col items-center justify-center p-4">
      <div className="kisan-card w-full overflow-hidden p-0 animate-pulse border-[#768870]/20 bg-white shadow-xl rounded-[2rem]">
        {selectedImage && (
          <img 
            src={selectedImage} 
            alt="Selected" 
            className="w-full h-48 object-cover opacity-40" 
          />
        )}
        <div className="p-12 flex flex-col items-center justify-center">
          <AnalyzingAnimation text={t('disease.analyzing')} />
        </div>
      </div>
    </div>
  );
};

export default AnalyzingView;