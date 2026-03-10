import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Mic, MicOff, Volume2, MessageCircle, Sprout, Settings, Bell, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { LoadingDots } from '@/components/ui/LoadingSpinner';
import { sendChatMessage } from '@/services/aiChatbotService';
import BottomNav from '@/components/navigation/BottomNav';

const ChatPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage: selectedLanguage } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 'greeting',
      role: 'assistant',
      text: t('chatbot.greeting'),
      timestamp: new Date(),
      suggestions: t('chatbot.suggestedQuestions', { returnObjects: true }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [voices, setVoices] = useState([]);
  const [isSpeechSupported] = useState('speechSynthesis' in window);

  // Requirement 2, 3: Load voices and handle changes
  useEffect(() => {
    if (!isSpeechSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    // Some browsers need this event to load voices
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = null;
      }
      window.speechSynthesis.cancel();
    };
  }, [isSpeechSupported]);

  /**
   * Requirement 1, 4, 5: Enable Web Speech API with language-specific voice selection.
   */
  const speakText = (text, language) => {
    if (!isSpeechSupported) {
      alert("Voice not supported in this browser.");
      return;
    }

    // Requirement 5: Cancel any previous speech
    window.speechSynthesis.cancel();

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Requirement 4: Map UI language to locale
    const langMap = { en: "en-US", hi: "hi-IN", te: "te-IN" };
    const targetLang = langMap[language] || "en-US";
    utterance.lang = targetLang;

    // Requirement 4: Select voice dynamically
    // Priority: 1. Exact match for locale, 2. Start match for language, 3. Any available voice
    let voice = voices.find(v => v.lang === targetLang);
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(language));
    }

    if (voice) {
      utterance.voice = voice;
    }

    // Set some natural defaults
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Requirement 2, 5: Fetch AI response with silent retry/replacement logic.
   */
  const fetchAIResponse = async (userText, assistantMsgId) => {
    try {
      const response = await sendChatMessage(userText, selectedLanguage);

      if (response.isSuccess) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                ...msg,
                text: response.reply,
                suggestions: response.suggestions,
                isRetrying: false,
                isError: false,
              }
              : msg
          )
        );
        // Speech will be triggered manually by the LISTEN button to respect autoplay policy
      } else if (response.isBusy) {
        // Requirement 2: Show retrying state in UI
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, text: "Retrying...", isRetrying: true }
              : msg
          )
        );
        // SILENT BACKGROUND RETRY
        setTimeout(() => fetchAIResponse(userText, assistantMsgId), 5000);
      }
    } catch (error) {
      console.error("[ChatPage] Critical API Failure:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
              ...msg,
              text: selectedLanguage === 'hi' ? "AI सेवा अस्थायी रूप से अनुपलब्ध है। पृष्ठभूमि में पुन: प्रयास किया जा रहा है..." : "AI service unavailable. Background retrying...",
              isRetrying: true,
              isError: true
            }
            : msg
        )
      );
      setTimeout(() => fetchAIResponse(userText, assistantMsgId), 10000);
    }
  };

  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Requirement 6: Stop playback on new interaction
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const assistantMsgId = `assistant_${Date.now()}`;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantMsgId,
        role: 'assistant',
        text: selectedLanguage === 'hi' ? "सोच रहा हूँ..." : "Thinking...",
        isRetrying: true,
        timestamp: new Date(),
      },
    ]);

    setInput('');
    fetchAIResponse(messageText, assistantMsgId);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#fdfbf7] text-[#2a3328]">
      {/* Header */}
      <header className="app-header px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#768870] rounded-lg flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight truncate whitespace-nowrap">AI Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <LanguageSelector variant="compact" />
          <button onClick={() => navigate('/news')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"><Bell className="w-4 h-4" /></button>
          <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-h-0 relative max-w-[1200px] mx-auto w-full">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-[2rem] p-5 shadow-sm ${message.role === 'user' ? 'bg-[#768870] text-white shadow-[#768870]/20' : 'bg-white border border-[#eeede6] text-[#2a3328]'}`}>
                <div className="text-sm sm:text-base leading-relaxed font-medium">
                  {message.isRetrying ? (
                    <div className="flex items-center gap-3">
                      {message.isError ? <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" /> : <LoadingDots />}
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7a8478]">
                        {message.text}
                      </span>
                    </div>
                  ) : (
                    message.text
                  )}
                </div>

                {message.role === 'assistant' && (
                  <button
                    onClick={() => speakText(message.text, selectedLanguage)}
                    title={!isSpeechSupported ? "Voice not supported in this browser." : (voices.length === 0 ? "Loading voices..." : "Listen to this response")}
                    className={`mt-4 flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all border ${!isSpeechSupported
                      ? 'opacity-40 cursor-not-allowed border-red-200 text-red-500'
                      : 'border-[#768870]/20 text-[#7a8478] hover:bg-[#768870] hover:text-white hover:border-[#768870]'
                      } text-[10px] font-black uppercase tracking-[0.15em] active:scale-95`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{!isSpeechSupported ? "UNSUPPORTED" : "LISTEN"}</span>
                  </button>
                )}

                {!message.isRetrying && message.suggestions && message.role === 'assistant' && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="px-4 py-2 text-[11px] font-bold rounded-xl bg-[#f4f2eb] text-[#768870] hover:bg-[#768870] hover:text-white transition-all border border-[#eeede6] active:scale-95">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-6 bg-transparent">
          <div className="bg-white border border-[#eeede6] rounded-[2.5rem] p-2 flex items-center gap-2 shadow-xl shadow-black/5">
            <button className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-[#f4f2eb] text-[#7a8478] hover:bg-[#eeede6]">
              <Mic className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chatbot.placeholder')}
              className="flex-1 bg-transparent text-sm sm:text-base font-semibold focus:outline-none px-3 placeholder:text-[#7a8478]/40"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-12 h-12 bg-[#768870] rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:opacity-90 transition-all shadow-lg shadow-[#768870]/20 active:scale-90"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
      <footer className="app-footer flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
};

export default ChatPage;
