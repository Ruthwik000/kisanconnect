import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';

const DiagnosisResult = ({ result, selectedImage, onReset }) => {
  const { currentLanguage } = useLanguage();

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'early':
        return {
          icon: CheckCircle,
          class: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          label: 'Early',
        };
      case 'moderate':
        return {
          icon: AlertTriangle,
          class: 'bg-amber-50 text-amber-700 border-amber-100',
          label: 'Moderate',
        };
      case 'severe':
        return {
          icon: XCircle,
          class: 'bg-red-50 text-red-700 border-red-100',
          label: 'Severe',
        };
      default:
        return {
          icon: AlertTriangle,
          class: 'bg-amber-50 text-amber-700 border-amber-100',
          label: severity,
        };
    }
  };

  return (
    <div className="w-full h-full max-w-6xl flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 p-0 lg:p-4 overflow-hidden">
      <div className="flex flex-col min-h-0 lg:h-full">
        <div className="kisan-card overflow-hidden p-0 flex flex-col bg-white h-full shadow-lg rounded-[2rem]">
          {selectedImage && <img src={selectedImage} alt="Crop" className="w-full h-48 sm:h-64 lg:h-full object-cover" />}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2a3328] tracking-tighter">
                  {typeof result.name === 'string' ? result.name : result.name[currentLanguage]}
                </h2>
                <p className="text-[10px] sm:text-[11px] font-black text-[#7a8478] uppercase tracking-[0.2em] mt-1">
                  Diagnosis Result
                </p>
              </div>
              <div className="px-3 py-1.5 bg-[#f4f2eb] border border-[#eeede6] rounded-xl">
                <span className="text-[11px] font-black tracking-tight">{result.confidence}% Match</span>
              </div>
            </div>

            {(() => {
              const config = getSeverityConfig(result.severity);
              const Icon = config.icon;
              return (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${config.class} shadow-sm`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {result.isHealthy ? 'Healthy' : config.label} Condition
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="flex flex-col min-h-0 gap-4 lg:h-full">
        <div className="kisan-card p-6 sm:p-8 border-l-8 border-l-[#768870] bg-white flex-1 overflow-y-auto scrollbar-hide shadow-lg rounded-[2rem]">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-3 sticky top-0 bg-white pb-2 z-10">
            <CheckCircle className="w-5 h-5 text-[#768870]" />
            {result.isHealthy ? 'Plant Health Report' : 'Treatment Protocol'}
          </h3>
          <div className="text-sm sm:text-base text-[#7a8478] font-medium leading-relaxed whitespace-pre-line">
            {result.fullAnalysis}
          </div>
        </div>

        <button
          onClick={onReset}
          className="kisan-btn-primary w-full py-5 rounded-2xl shadow-xl shadow-[#768870]/20 flex-shrink-0 text-base mb-2 lg:mb-0"
        >
          <RefreshCw className="w-5 h-5" />
          Start New Diagnosis
        </button>
      </div>
    </div>
  );
};

export default DiagnosisResult;