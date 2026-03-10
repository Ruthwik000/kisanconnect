import React from 'react';
import { Camera, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ImageUploadCard = ({ onCameraClick, onUploadClick }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full max-w-2xl px-2">
      <button
        onClick={onCameraClick}
        className="kisan-card p-10 sm:p-12 flex flex-col items-center gap-6 kisan-card-hover group border-dashed hover:border-[#768870] bg-white transition-all shadow-sm active:scale-95"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f4f2eb] rounded-3xl flex items-center justify-center group-hover:bg-[#768870]/10 transition-colors">
          <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-[#768870]" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-lg sm:text-xl mb-0.5">{t('disease.takePhoto')}</h3>
          <p className="text-[10px] sm:text-[11px] text-[#7a8478] uppercase font-black tracking-[0.2em] opacity-40">Device Camera</p>
        </div>
      </button>

      <button
        onClick={onUploadClick}
        className="kisan-card p-10 sm:p-12 flex flex-col items-center gap-6 kisan-card-hover group border-dashed hover:border-[#768870] bg-white transition-all shadow-sm active:scale-95"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f4f2eb] rounded-3xl flex items-center justify-center group-hover:bg-[#768870]/10 transition-colors">
          <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-[#768870]" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-lg sm:text-xl mb-0.5">{t('disease.uploadImage')}</h3>
          <p className="text-[10px] sm:text-[11px] text-[#7a8478] uppercase font-black tracking-[0.2em] opacity-40">Gallery Upload</p>
        </div>
      </button>
    </div>
  );
};

export default ImageUploadCard;