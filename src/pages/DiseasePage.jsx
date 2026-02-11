import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Volume2,
  RefreshCw,
  ExternalLink,
  Leaf,
  ArrowRight,
  Sprout,
  Settings,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { AnalyzingAnimation } from '@/components/ui/LoadingSpinner';
import { analyzePlantImageWithGemini } from '@/services/geminiService';
import BottomNav from '@/components/navigation/BottomNav';

const DiseasePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showPasteHint, setShowPasteHint] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Handle clipboard paste for images
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleImageFromFile(file);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleImageFromFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result);
        setSelectedFile(file);
        analyzeImage(file);
      };
      reader.readAsDataURL(file);
      
      setShowPasteHint(true);
      setTimeout(() => setShowPasteHint(false), 2000);
    }
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleImageFromFile(file);
  };

  const analyzeImage = async (file) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const geminiResult = await analyzePlantImageWithGemini(file, currentLanguage);
      
      if (geminiResult.success) {
        setResult({
          name: geminiResult.disease,
          confidence: Math.round(geminiResult.confidence * 100),
          isHealthy: geminiResult.isHealthy,
          severity: geminiResult.isHealthy ? 'early' : 'moderate',
          fullAnalysis: geminiResult.fullAnalysis,
        });
      }
    } catch (error) {
      console.error('Disease detection error:', error);
      setResult({
        name: 'Error',
        confidence: 0,
        isHealthy: false,
        severity: 'severe',
        fullAnalysis: `❌ Error: ${error.message}\n\nPlease make sure:\n• Your Gemini API key is configured in .env\n• You have internet connection\n• The image is clear and shows a cotton plant`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'early':
        return {
          icon: CheckCircle,
          class: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          label: t('disease.early'),
        };
      case 'moderate':
        return {
          icon: AlertTriangle,
          class: 'bg-amber-50 text-amber-700 border-amber-100',
          label: t('disease.moderate'),
        };
      case 'severe':
        return {
          icon: XCircle,
          class: 'bg-red-50 text-red-700 border-red-100',
          label: t('disease.severe'),
        };
      default:
        return {
          icon: AlertTriangle,
          class: 'bg-amber-50 text-amber-700 border-amber-100',
          label: severity,
        };
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#fdfbf7] text-[#2a3328]">
      {/* 1. Header (Fixed Height) */}
      <header className="app-header px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#768870] rounded-lg flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight truncate whitespace-nowrap">{t('disease.title')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <LanguageSelector variant="compact" />
          <button onClick={() => navigate('/news')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"><Bell className="w-4 h-4" /></button>
          <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      {/* 2. Main Content (Flex-1, Spaced for Full Screen Experience) */}
      <main className="flex-1 flex flex-col items-center justify-center sm:justify-center p-4 sm:p-6 min-h-0 overflow-hidden relative">
        {/* Paste Hint Notification */}
        {showPasteHint && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-[#768870] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
              <Camera className="w-4 h-4" />
              <span>Image pasted! ✓</span>
            </div>
          </div>
        )}

        {!selectedImage && !isAnalyzing && !result && (
          <div className="w-full max-w-4xl h-full sm:h-auto flex flex-col items-center justify-evenly sm:justify-center sm:space-y-12">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#f4f2eb] rounded-[2.5rem] flex items-center justify-center mx-auto border border-[#eeede6] shadow-sm mb-2">
                <Leaf className="w-10 h-10 sm:w-12 sm:h-12 text-[#768870]" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2a3328] tracking-tighter leading-tight">Crop Diagnostics</h1>
                <p className="text-sm sm:text-base font-medium text-[#7a8478] opacity-80">Upload, capture, or paste (Ctrl+V) a photo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full max-w-2xl px-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
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
                onClick={() => fileInputRef.current?.click()}
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

            {/* Hint text to fill bottom space on mobile */}
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a8478]/30 sm:hidden">
              Powered by Kisan Connect AI
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
          </div>
        )}

        {isAnalyzing && (
          <div className="w-full max-w-md flex flex-col items-center justify-center p-4">
            <div className="kisan-card w-full overflow-hidden p-0 animate-pulse border-[#768870]/20 bg-white shadow-xl rounded-[2rem]">
              {selectedImage && <img src={selectedImage} alt="Selected" className="w-full h-48 object-cover opacity-40" />}
              <div className="p-12 flex flex-col items-center justify-center">
                <AnalyzingAnimation text={t('disease.analyzing')} />
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="w-full h-full max-w-6xl flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 p-0 lg:p-4 overflow-hidden">
            <div className="flex flex-col min-h-0 lg:h-full">
              <div className="kisan-card overflow-hidden p-0 flex flex-col bg-white h-full shadow-lg rounded-[2rem]">
                {selectedImage && <img src={selectedImage} alt="Crop" className="w-full h-48 sm:h-64 lg:h-full object-cover" />}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2a3328] tracking-tighter">{typeof result.name === 'string' ? result.name : result.name[currentLanguage]}</h2>
                      <p className="text-[10px] sm:text-[11px] font-black text-[#7a8478] uppercase tracking-[0.2em] mt-1">Diagnosis Result</p>
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
                        <span className="text-xs font-bold uppercase tracking-widest">{result.isHealthy ? 'Healthy' : config.label} Condition</span>
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
                onClick={resetScan}
                className="kisan-btn-primary w-full py-5 rounded-2xl shadow-xl shadow-[#768870]/20 flex-shrink-0 text-base mb-2 lg:mb-0"
              >
                <RefreshCw className="w-5 h-5" />
                Start New Diagnosis
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Navigation (Fixed Height) */}
      <footer className="app-footer flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
};

export default DiseasePage;
