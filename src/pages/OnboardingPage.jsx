import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Phone,
  MapPin,
  Globe,
  Mic,
  MicOff,
  ArrowRight,
  Loader2,
  Sprout,
  CheckCircle,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    language: currentLanguage || 'en',
    location: '',
  });

  // Web Speech API for voice input
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      setRecognition(recognitionInstance);
    }
  }, []);

  const startVoiceInput = (field) => {
    if (!recognition) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    setIsListening(true);
    setActiveVoiceField(field);

    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-IN';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (field === 'name') {
        setFormData(prev => ({ ...prev, name: transcript }));
      } else if (field === 'phone') {
        const numbers = transcript.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, phone: numbers }));
      } else if (field === 'location') {
        setFormData(prev => ({ ...prev, location: transcript }));
      }
      setIsListening(false);
      setActiveVoiceField(null);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setActiveVoiceField(null);
      toast.error('Voice input failed. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveVoiceField(null);
    };

    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    setActiveVoiceField(null);
  };

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) return toast.error('Name is required');
    if (step === 2 && formData.phone.length !== 10) return toast.error('10-digit phone is required');
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => step > 1 && setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.location.trim()) return toast.error('Location is required');
    setIsLoading(true);
    try {
      changeLanguage(formData.language);
      const result = await updateProfile({
        ...formData,
        phone: `+91${formData.phone}`,
        onboardingCompleted: true,
      });
      if (result.success) {
        toast.success('Setup complete!');
        navigate('/dashboard');
      }
    } finally { setIsSaving(false); setIsLoading(false); }
  };

  const steps = [
    { icon: User, title: "Identity", sub: "Tell us your name" },
    { icon: Phone, title: "Contact", sub: "How can we reach you?" },
    { icon: Globe, title: "Language", sub: "Preferred communication" },
    { icon: MapPin, title: "Location", sub: "Your farming region" }
  ];

  return (
    <div className="no-scroll-view bg-[#fdfbf7] text-[#2a3328] font-sans">
      <header className="app-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#768870] rounded-lg flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#768870]">Account Setup</span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/50">
          Step {step} of 4
        </div>
      </header>

      <main className="fit-content w-full flex flex-col items-center justify-center p-6 px-4">
        <div className="w-full max-w-lg">
          {/* Progress Indicator */}
          <div className="flex justify-between mb-12 relative px-4">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#eeede6] -translate-y-1/2 -z-10" />
            <div
              className="absolute top-1/2 left-4 h-0.5 bg-[#768870] -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isDone = idx + 1 < step;
              const isCurrent = idx + 1 === step;
              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all bg-white ${isDone ? 'bg-[#768870] border-[#768870] text-white' :
                      isCurrent ? 'border-[#768870] text-[#768870] scale-110 shadow-lg' :
                        'border-[#eeede6] text-[#7a8478]'
                    }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${isCurrent ? 'text-[#2a3328]' : 'text-[#7a8478]/40'}`}>{s.title}</span>
                </div>
              );
            })}
          </div>

          <div className="kisan-card p-8 bg-white border-[#eeede6] shadow-xl shadow-[#768870]/5">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#2a3328] tracking-tight">{steps[step - 1].sub}</h2>
              <p className="text-[11px] font-bold text-[#7a8478]/50 uppercase tracking-widest mt-1">Onboarding Process</p>
            </div>

            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                    <input
                      type="text"
                      value={formData.name}
                      autoFocus
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Full Name"
                      className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-12 py-3 text-sm font-semibold focus:outline-[#768870]/50"
                    />
                    <button
                      onClick={() => isListening ? stopVoiceInput() : startVoiceInput('name')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${activeVoiceField === 'name' ? 'bg-red-500 text-white animate-pulse' : 'text-[#7a8478]/40 hover:bg-[#f4f2eb]'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#7a8478]/40 border-r border-[#eeede6] pr-2 pointer-events-none">
                      <Phone className="w-4 h-4" />
                      <span className="text-[10px] font-bold">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      autoFocus
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      placeholder="99999 99999"
                      className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-16 pr-12 py-3 text-sm font-semibold focus:outline-[#768870]/50"
                    />
                    <button
                      onClick={() => isListening ? stopVoiceInput() : startVoiceInput('phone')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${activeVoiceField === 'phone' ? 'bg-red-500 text-white animate-pulse' : 'text-[#7a8478]/40 hover:bg-[#f4f2eb]'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 gap-3">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setFormData(p => ({ ...p, language: lang.code }))}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${formData.language === lang.code ? 'border-[#768870] bg-[#768870]/5 shadow-sm' : 'border-[#eeede6] hover:bg-[#f4f2eb]'}`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="text-sm font-black text-[#2a3328]">{lang.nativeName}</div>
                          <div className="text-[10px] font-bold text-[#7a8478]/60 uppercase tracking-widest">{lang.name}</div>
                        </div>
                      </div>
                      {formData.language === lang.code && <CheckCircle className="w-5 h-5 text-[#768870]" />}
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                    <input
                      type="text"
                      value={formData.location}
                      autoFocus
                      onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Warangal, Telangana"
                      className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-12 py-3 text-sm font-semibold focus:outline-[#768870]/50"
                    />
                    <button
                      onClick={() => isListening ? stopVoiceInput() : startVoiceInput('location')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${activeVoiceField === 'location' ? 'bg-red-500 text-white animate-pulse' : 'text-[#7a8478]/40 hover:bg-[#f4f2eb]'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 p-4 rounded-xl border-2 border-[#eeede6] bg-white text-[#7a8478] font-black text-xs uppercase tracking-widest hover:bg-[#f4f2eb] transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={step === 4 ? handleSubmit : handleNext}
                  disabled={isLoading}
                  className="flex-[2] kisan-btn-primary p-4 rounded-xl text-xs shadow-lg shadow-[#768870]/20 active:scale-95 uppercase tracking-[0.2em]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <span className="flex items-center gap-2">
                      {step === 4 ? 'Complete Setup' : 'Continue'}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
