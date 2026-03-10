import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  Loader2, 
  Sprout, 
  UserPlus, 
  User, 
  Phone, 
  MapPin, 
  Globe,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { toast } from 'sonner';

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, signUpWithPhoneNumber, verifyPhoneSignup, signInWithGoogleAuth, isLoading: authLoading } = useAuth();
  const { languages, currentLanguage } = useLanguage();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    language: currentLanguage || 'en',
    password: '',
    confirmPassword: ''
  });

  const [showEmailSignup, setShowEmailSignup] = useState(false);

  // Voice synthesis
  const [speechSynthesis, setSpeechSynthesis] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Voice guidance messages in different languages
  const voiceMessages = {
    en: {
      step1: "Please enter your full name",
      step2: "Enter your 10-digit phone number",
      step3: "Enter your email address. This is optional",
      step4: "Select your preferred language",
      step5: "Enter your farming location"
    },
    hi: {
      step1: "कृपया अपना पूरा नाम दर्ज करें",
      step2: "अपना 10 अंकों का फोन नंबर दर्ज करें", 
      step3: "अपना ईमेल पता दर्ज करें। यह वैकल्पिक है",
      step4: "अपनी पसंदीदा भाषा चुनें",
      step5: "अपना खेती का स्थान दर्ज करें"
    },
    te: {
      step1: "దయచేసి మీ పూర్తి పేరు నమోదు చేయండి",
      step2: "మీ 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి",
      step3: "మీ ఇమెయిల్ చిరునామా నమోదు చేయండి। ఇది ఐచ్ఛికం",
      step4: "మీ ఇష్టమైన భాషను ఎంచుకోండి", 
      step5: "మీ వ్యవసాయ ప్రాంతాన్ని నమోదు చేయండి"
    }
  };
  // Speak voice guidance
  const speakMessage = (message, lang = formData.language) => {
    if (!speechSynthesis || !isVoiceEnabled) return;
    
    speechSynthesis.cancel(); // Cancel any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    speechSynthesis.speak(utterance);
  };

  // Speak step guidance when step changes
  useEffect(() => {
    if (!otpSent && step >= 1 && step <= 5) {
      const message = voiceMessages[formData.language]?.[`step${step}`] || voiceMessages.en[`step${step}`];
      setTimeout(() => speakMessage(message), 500); // Small delay for better UX
    }
  }, [step, formData.language, otpSent]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      setError('Name is required');
      speakMessage('Name is required', 'en');
      return;
    }
    if (step === 2 && formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      speakMessage('Please enter a valid phone number', 'en');
      return;
    }
    if (step === 5 && !formData.location.trim()) {
      setError('Location is required');
      speakMessage('Location is required', 'en');
      return;
    }
    
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleSendOTP = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      speakMessage('Please enter a valid phone number', 'en');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signUpWithPhoneNumber(formData.phone, {
        name: formData.name,
        email: formData.email || null,
        location: formData.location,
        language: formData.language
      });

      if (result.success) {
        setOtpSent(true);
        toast.success('OTP sent to your phone number!');
        speakMessage('OTP sent to your phone number', 'en');
      } else {
        setError(result.message);
        toast.error(result.message);
        speakMessage('Failed to send OTP', 'en');
        
        // If phone auth fails, show email signup option
        if (result.message.includes('operation-not-allowed')) {
          setError('Phone authentication is not available. Please use email signup or Google sign-in.');
          speakMessage('Phone authentication is not available. Please use email signup or Google sign-in.', 'en');
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send OTP';
      setError(errorMessage);
      toast.error(errorMessage);
      speakMessage('Failed to send OTP', 'en');
      
      // Show alternative options
      if (errorMessage.includes('operation-not-allowed')) {
        setError('Phone authentication is not enabled. Please use Google sign-in or contact support.');
        speakMessage('Phone authentication is not enabled. Please use Google sign-in.', 'en');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      speakMessage('Please enter the 6-digit OTP', 'en');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyPhoneSignup(otp);

      if (result.success) {
        toast.success('Account created successfully!');
        speakMessage('Account created successfully', 'en');
        // Navigation will be handled by useEffect
      } else {
        setError(result.message);
        toast.error(result.message);
        speakMessage('Invalid OTP', 'en');
      }
    } catch (err) {
      const errorMessage = err.message || 'Invalid OTP';
      setError(errorMessage);
      toast.error(errorMessage);
      speakMessage('Invalid OTP', 'en');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      speakMessage('Please fill in all required fields', 'en');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      speakMessage('Passwords do not match', 'en');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      speakMessage('Password must be at least 6 characters', 'en');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Import signUpWithEmail directly
      const { signUpWithEmail } = await import('@/features/auth/services/authService');
      const result = await signUpWithEmail(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone ? `+91${formData.phone}` : null,
        location: formData.location,
        language: formData.language
      });

      if (result.success) {
        toast.success('Account created successfully!');
        speakMessage('Account created successfully', 'en');
        // Navigation will be handled by useEffect
      } else {
        setError(result.message);
        toast.error(result.message);
        speakMessage('Account creation failed', 'en');
      }
    } catch (err) {
      const errorMessage = err.message || 'Account creation failed';
      setError(errorMessage);
      toast.error(errorMessage);
      speakMessage('Account creation failed', 'en');
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signInWithGoogleAuth();

      if (result.success) {
        toast.success('Google sign-up successful!');
        speakMessage('Google sign-up successful', 'en');
        // Navigation will be handled by useEffect
      } else {
        setError(result.message);
        toast.error(result.message);
        speakMessage('Google sign-up failed', 'en');
        
        // If Google auth also fails, suggest email signup
        if (result.message.includes('operation-not-allowed')) {
          setError('Google authentication is not enabled. Please try email signup.');
          setShowEmailSignup(true);
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Google sign-up failed';
      setError(errorMessage);
      toast.error(errorMessage);
      speakMessage('Google sign-up failed', 'en');
      
      // Fallback to email signup
      setShowEmailSignup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
  };

  const steps = [
    { icon: User, title: "Name", sub: "What should we call you?" },
    { icon: Phone, title: "Phone", sub: "Your contact number" },
    { icon: Mail, title: "Email", sub: "Email address (optional)" },
    { icon: Globe, title: "Language", sub: "Preferred language" },
    { icon: MapPin, title: "Location", sub: "Where are you farming?" }
  ];

  if (authLoading) {
    return (
      <div className="no-scroll-view bg-[#fdfbf7] text-[#2a3328] font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#768870]" />
          <p className="text-sm font-medium text-[#7a8478]">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="no-scroll-view bg-[#fdfbf7] text-[#2a3328] font-sans">
      {/* Header */}
      <header className="app-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#768870] rounded-lg flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#768870]">Kisan Connect</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className={`p-1.5 rounded-full transition-colors ${
              isVoiceEnabled 
                ? 'bg-[#768870] text-white' 
                : 'bg-[#f4f2eb] text-[#7a8478] hover:bg-[#eeede6]'
            }`}
            title={isVoiceEnabled ? 'Disable voice guidance' : 'Enable voice guidance'}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <LanguageSelector variant="compact" />
          {!otpSent && (
            <div className="text-[10px] font-black uppercase tracking-widest text-[#7a8478]/50">
              Step {step} of 5
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 px-4">
        <div className="w-full max-w-lg space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-[#f4f2eb] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#eeede6]">
              <UserPlus className="w-8 h-8 text-[#768870]" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#2a3328] tracking-tight">Join Kisan Connect</h1>
            <p className="text-sm font-medium text-[#7a8478]">
              {otpSent ? 'Enter the OTP sent to your phone' : 'Create your farmer account'}
            </p>
          </div>
          {!otpSent ? (
            <>
              {/* Progress Indicator */}
              <div className="flex justify-between mb-8 relative px-4">
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#eeede6] -translate-y-1/2 -z-10" />
                <div
                  className="absolute top-1/2 left-4 h-0.5 bg-[#768870] -translate-y-1/2 -z-10 transition-all duration-500"
                  style={{ width: `${((step - 1) / 4) * 100}%` }}
                />
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  const isDone = idx + 1 < step;
                  const isCurrent = idx + 1 === step;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white text-xs ${
                        isDone ? 'bg-[#768870] border-[#768870] text-white' :
                        isCurrent ? 'border-[#768870] text-[#768870] scale-110' :
                        'border-[#eeede6] text-[#7a8478]'
                      }`}>
                        {isDone ? <CheckCircle className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form Card */}
              <div className="kisan-card bg-white border-[#eeede6] shadow-xl shadow-[#768870]/5 p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-extrabold text-[#2a3328] tracking-tight">{steps[step - 1].sub}</h2>
                </div>

                <div className="space-y-6">
                  {/* Step 1: Name */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Full Name"
                          className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                          autoFocus
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Phone */}
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
                          onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="99999 99999"
                          className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-16 pr-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                          autoFocus
                          required
                        />
                      </div>
                      <p className="text-[9px] text-[#7a8478]/60 font-medium">We'll send an OTP to verify your number</p>
                    </div>
                  )}
                  {/* Step 3: Email (Optional) */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="name@example.com (optional)"
                          className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                          autoFocus
                        />
                      </div>
                      <p className="text-[9px] text-[#7a8478]/60 font-medium">Optional - for account recovery and updates</p>
                    </div>
                  )}

                  {/* Step 4: Language */}
                  {step === 4 && (
                    <div className="grid grid-cols-1 gap-3">
                      {languages.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => handleInputChange('language', lang.code)}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                            formData.language === lang.code 
                              ? 'border-[#768870] bg-[#768870]/5 shadow-sm' 
                              : 'border-[#eeede6] hover:bg-[#f4f2eb]'
                          }`}
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

                  {/* Step 5: Location */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g. Warangal, Telangana"
                          className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                          autoFocus
                          required
                        />
                      </div>
                      <p className="text-[9px] text-[#7a8478]/60 font-medium">Your farming location for local weather and news</p>
                    </div>
                  )}

                  {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 pt-4">
                    {step > 1 && (
                      <button
                        onClick={handleBack}
                        className="flex-1 p-3 rounded-xl border-2 border-[#eeede6] bg-white text-[#7a8478] font-black text-xs uppercase tracking-widest hover:bg-[#f4f2eb] transition-all flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                    )}
                    <button
                      onClick={step === 5 ? handleSendOTP : handleNext}
                      disabled={isLoading}
                      className="flex-[2] kisan-btn-primary p-3 rounded-xl text-xs shadow-lg shadow-[#768870]/20 active:scale-95 uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                          {step === 5 ? 'Send OTP' : 'Continue'}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Email Signup Alternative */}
                  {step === 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setShowEmailSignup(true)}
                        className="text-xs font-bold text-[#768870] hover:underline"
                      >
                        Use Email Instead
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* OTP Verification */
            <div className="kisan-card bg-white border-[#eeede6] shadow-xl shadow-[#768870]/5 p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-extrabold text-[#2a3328] tracking-tight">Verify Your Phone</h2>
                <p className="text-sm text-[#7a8478] mt-2">Enter the 6-digit code sent to +91{formData.phone}</p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl px-4 py-4 text-center text-2xl font-bold text-[#2a3328] focus:outline-[#768870]/50 transition-all tracking-widest"
                    autoFocus
                    maxLength={6}
                  />
                </div>

                {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full kisan-btn-primary py-4 rounded-xl text-sm shadow-lg shadow-[#768870]/20 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Create Account'}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setError('');
                    }}
                    className="text-xs font-bold text-[#768870] hover:underline"
                  >
                    Change Phone Number
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email Signup Fallback */}
          {showEmailSignup && !otpSent && (
            <div className="kisan-card bg-white border-[#eeede6] shadow-xl shadow-[#768870]/5 p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-extrabold text-[#2a3328] tracking-tight">Email Signup</h2>
                <p className="text-sm text-[#7a8478] mt-2">Create account with email and password</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8478]/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl px-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                    required
                    minLength={6}
                  />
                </div>

                <div className="relative">
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full bg-[#fdfbf7] border border-[#eeede6] rounded-xl px-4 py-3 text-sm font-semibold text-[#2a3328] focus:outline-[#768870]/50 transition-all"
                    required
                  />
                </div>

                {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

                <button
                  onClick={handleEmailSignup}
                  disabled={isLoading}
                  className="w-full kisan-btn-primary py-4 rounded-xl text-sm shadow-lg shadow-[#768870]/20 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account with Email'}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setShowEmailSignup(false)}
                    className="text-xs font-bold text-[#768870] hover:underline"
                  >
                    Back to Phone Signup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Google Sign-up Option */}
          {!otpSent && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#eeede6]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#fdfbf7] px-4 text-[#7a8478] font-bold tracking-widest">Or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full kisan-card p-4 flex items-center justify-center gap-3 bg-white hover:bg-[#f4f2eb] border-[#eeede6] hover:border-[#768870]/30 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="font-bold text-sm">Continue with Google</span>}
              </button>
            </div>
          )}

          {/* Login Link */}
          <div className="text-center">
            <p className="text-xs font-medium text-[#7a8478]">
              Already have an account? 
              <Link to="/login" className="text-[#768870] font-black hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>

          {/* reCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;