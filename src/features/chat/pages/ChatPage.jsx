import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Mic, MicOff, Volume2, MessageCircle, Sprout, Settings, Bell, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { LoadingDots } from '@/shared/ui/LoadingSpinner';
import { sendChatMessage } from '@/features/chat/services/chatService';
import { saveConversationToFirestore, updateConversationInFirestore, getConversationById } from '@/features/chat/services/chatFirestoreService';
import BottomNav from '@/shared/components/navigation/BottomNav';
import { toast } from 'sonner';
import { useVoiceAgent } from '@/shared/hooks/useVoiceAgent';

const ChatPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 'greeting',
      role: 'assistant',
      content: t('chatbot.greeting'),
      timestamp: new Date(),
      suggestions: t('chatbot.suggestedQuestions', { returnObjects: true }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Use the voice agent hook
  const {
    voiceState,
    isSupported,
    startListening,
    stopListening,
    speak,
    setProcessing
  } = useVoiceAgent({
    onTranscript: (transcript, confidence) => {
      // Transcript received, update input
      setInput(transcript);
      
      // In voice mode, automatically send after receiving transcript
      if (voiceMode) {
        handleSend(transcript);
      }
    },
    onError: (error) => {
      // Only log and show toasts for significant errors
      if (error === 'no-speech') {
        // Silent - this is expected behavior in voice mode
        return;
      }
      
      console.error('Voice error:', error);
      
      if (error === 'not-allowed' || error === 'service-not-allowed') {
        toast.error('Microphone permission denied. Please enable it in browser settings.');
        setVoiceMode(false);
      } else if (error === 'audio-capture') {
        toast.error('No microphone detected. Please check your microphone.');
        setVoiceMode(false);
      } else if (error === 'network') {
        toast.error('Network error. Please check your internet connection.');
      } else if (error !== 'aborted') {
        // Only show toast for unexpected errors
        toast.error('Voice error occurred. Retrying...');
      }
    },
    language: currentLanguage,
    autoStart: false
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load existing conversation if conversationId is provided in state
  useEffect(() => {
    const loadExistingConversation = async () => {
      const conversationId = location.state?.conversationId;
      if (conversationId && user?.uid) {
        setIsLoadingConversation(true);
        try {
          const conversation = await getConversationById(conversationId);
          if (conversation && conversation.userId === user.uid) {
            setCurrentConversationId(conversationId);
            setMessages(conversation.messages || []);
            console.log('Loaded existing conversation:', conversationId);
            toast.success('Conversation loaded successfully');
            
            // Clear the state to prevent reloading on refresh
            navigate(location.pathname, { replace: true });
          } else {
            toast.error('Conversation not found or access denied');
          }
        } catch (error) {
          console.error('Error loading conversation:', error);
          toast.error('Failed to load conversation');
        } finally {
          setIsLoadingConversation(false);
        }
      }
    };

    loadExistingConversation();
  }, [location.state?.conversationId, user?.uid, navigate, location.pathname]);

  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setProcessing(true);

    try {
      // Get conversation history (last 10 messages for context)
      const history = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await sendChatMessage(messageText, currentLanguage, history);

      const botMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      const updatedMessages = [...messages, userMessage, botMessage];
      setMessages(updatedMessages);

      // Save conversation to Firestore (only if user is logged in)
      if (user?.uid) {
        try {
          // Filter out the greeting message for saving
          const messagesToSave = updatedMessages.filter(msg => msg.id !== 'greeting');
          
          if (currentConversationId) {
            // Update existing conversation
            await updateConversationInFirestore(currentConversationId, [userMessage, botMessage]);
          } else {
            // Create new conversation
            const result = await saveConversationToFirestore(
              user.uid, 
              messagesToSave, 
              currentLanguage,
              messageText.substring(0, 50) // Use first 50 chars as topic
            );
            if (result.success) {
              setCurrentConversationId(result.conversationId);
            }
          }
        } catch (error) {
          console.error('Error saving conversation:', error);
          // Don't show error to user as chat still works
        }
      }

      // In voice mode, automatically speak the response
      if (voiceMode) {
        await speak(response.message, {
          rate: 0.95,
          pitch: 1.0,
          volume: 1.0
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: error.message.includes('API key') 
          ? t('errors.apiKeyMissing') || 'Please configure your Gemini API key in the .env file'
          : t('errors.serverError') || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      if (voiceMode) {
        await speak(errorMessage.content);
      } else {
        toast.error(error.message.includes('API key') ? 'API key not configured' : 'Failed to get response');
      }
    } finally {
      setIsLoading(false);
      setProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const toggleVoiceMode = async () => {
    if (!isSupported) {
      toast.error('Voice features are not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    const newVoiceMode = !voiceMode;

    if (newVoiceMode) {
      // Test microphone access first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Check if audio is actually being captured
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
        
        toast.success('🎤 Voice mode activated! Start speaking...', {
          duration: 3000,
        });
        
        setVoiceMode(true);
        
        // Start listening after a brief delay
        setTimeout(() => {
          startListening();
        }, 500);
        
      } catch (error) {
        console.error('Microphone access error:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          toast.error('Microphone permission denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No microphone found. Please connect a microphone and try again.');
        } else {
          toast.error('Failed to access microphone. Please check your settings.');
        }
        return;
      }
    } else {
      // Stop voice mode
      setVoiceMode(false);
      stopListening();
      toast.success('Voice mode deactivated');
    }
  };

  const toggleVoiceInput = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    if (voiceMode) {
      // If in voice mode, toggle it off
      toggleVoiceMode();
      return;
    }

    if (voiceState.isListening) {
      // Stop one-time listening
      stopListening();
    } else {
      // Start one-time listening
      startListening();
      toast.success('Listening... Speak now');
    }
  };

  const speakMessage = async (text) => {
    if (!isSupported) {
      toast.error('Text-to-speech is not supported in your browser.');
      return;
    }

    try {
      await speak(text, {
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0
      });
      toast.success('Playing audio...');
    } catch (error) {
      console.error('Speech error:', error);
      toast.error('Failed to speak message.');
    }
  };

  const { isListening, isProcessing, isSpeaking, currentState } = voiceState;

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#fdfbf7] text-[#2a3328]">
      {/* 1. Header (Fixed) */}
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
            <span className="font-bold text-sm sm:text-base tracking-tight truncate whitespace-nowrap">AI Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button 
            onClick={() => navigate('/chat/history')} 
            className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"
            title="Chat History"
          >
            <History className="w-4 h-4" />
          </button>
          <LanguageSelector variant="compact" />
          <button onClick={() => navigate('/news')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"><Bell className="w-4 h-4" /></button>
          <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      {/* 2. Main Chat Area (Flex-1) */}
      <main className="flex-1 flex flex-col min-h-0 relative max-w-[1200px] mx-auto w-full">
        {/* Loading Conversation Indicator */}
        {isLoadingConversation && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="inline-flex items-center gap-3 bg-[#768870] text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl">
              <LoadingDots />
              <span>Loading conversation...</span>
            </div>
          </div>
        )}

        {/* Voice Mode Indicator */}
        {voiceMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#768870] to-[#5a6b54] text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl border-2 border-white/20">
              <div className="relative">
                <Mic className="w-5 h-5" />
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold">
                  {currentState === 'speaking' ? '🗣️ AI Speaking...' 
                   : currentState === 'listening' ? '🎤 Listening...' 
                   : currentState === 'processing' ? '⏳ Thinking...' 
                   : '✨ Voice Mode Active'}
                </span>
                {isListening && !input && (
                  <span className="text-[10px] opacity-75 mt-0.5">Speak now or wait for auto-restart...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-[2rem] p-5 shadow-sm ${message.role === 'user'
                  ? 'bg-[#768870] text-white shadow-[#768870]/20'
                  : 'bg-white border border-[#eeede6] text-[#2a3328]'
                  }`}
              >
                <div className="text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line">
                  {message.content}
                </div>

                {message.role === 'assistant' && (
                  <button
                    onClick={() => speakMessage(message.content)}
                    className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#7a8478] hover:text-[#768870] transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </button>
                )}

                {message.suggestions && message.suggestions.length > 0 && message.role === 'assistant' && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 text-[11px] font-bold rounded-xl bg-[#f4f2eb] text-[#768870] hover:bg-[#768870] hover:text-white transition-all border border-[#eeede6] active:scale-95"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#eeede6] rounded-[2rem] px-6 py-4 flex items-center gap-4 shadow-sm">
                <LoadingDots />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7a8478]">{t('chatbot.thinking')}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar - Unified and Padded */}
        <div className="p-4 sm:p-6 bg-transparent">
          <div className="bg-white border border-[#eeede6] rounded-[2.5rem] p-2 flex items-center gap-2 shadow-xl shadow-black/5">
            <button
              onClick={toggleVoiceInput}
              onDoubleClick={toggleVoiceMode}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 relative ${
                voiceMode
                  ? 'bg-gradient-to-br from-[#768870] to-[#5a6b54] text-white shadow-lg'
                  : isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-[#f4f2eb] text-[#7a8478] hover:bg-[#eeede6]'
              }`}
              title={voiceMode ? 'Double-click to exit voice mode' : 'Click for one-time voice input, Double-click for continuous voice mode'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {voiceMode && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                </span>
              )}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !voiceMode && handleSend()}
              placeholder={
                voiceMode 
                  ? (currentState === 'speaking' ? 'AI is speaking...' 
                     : currentState === 'listening' ? 'Listening...' 
                     : currentState === 'processing' ? 'Processing...'
                     : 'Waiting...')
                  : isListening 
                  ? 'Listening...' 
                  : t('chatbot.placeholder')
              }
              className="flex-1 bg-transparent text-sm sm:text-base font-semibold focus:outline-none px-3 placeholder:text-[#7a8478]/40"
              disabled={voiceMode || isListening}
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || voiceMode}
              className="w-12 h-12 bg-[#768870] rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:opacity-90 transition-all shadow-lg shadow-[#768870]/20 active:scale-90 flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Voice Mode Hint */}
          {!voiceMode && (
            <div className="text-center mt-2 space-y-1">
              <p className="text-[10px] text-[#7a8478]/60 font-medium">
                💡 Double-click microphone for hands-free voice mode
              </p>
              <p className="text-[9px] text-[#7a8478]/40 font-medium">
                Auto-restart enabled: continues listening after each response
              </p>
            </div>
          )}
          
          {voiceMode && (
            <div className="text-center mt-2">
              <p className="text-[10px] text-[#768870] font-bold">
                {currentState === 'listening' ? '🔴 Listening - Speak now!' 
                 : currentState === 'speaking' ? '🔊 AI is responding...' 
                 : currentState === 'processing' ? '⏳ Processing your request...'
                 : '⏸️ Paused'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 3. Footer Navigation (Fixed) */}
      <footer className="app-footer flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
};

export default ChatPage;
