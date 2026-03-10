import { useState, useEffect, useRef } from 'react';
import voiceAgentService from '../services/voiceAgentService';

/**
 * Custom hook for voice agent functionality
 * Provides voice recognition and synthesis with state management
 */
export const useVoiceAgent = ({ 
  onTranscript, 
  onError,
  language = 'en',
  autoStart = false 
} = {}) => {
  const [voiceState, setVoiceState] = useState({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    currentState: 'inactive' // inactive | listening | processing | speaking
  });
  
  const [isSupported, setIsSupported] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Check browser support
    setIsSupported(voiceAgentService.isSupported());

    if (!voiceAgentService.isSupported()) {
      console.warn('Voice agent not supported in this browser');
      return;
    }

    // Initialize callbacks
    if (!isInitialized.current) {
      voiceAgentService.onStateChange = (state, details) => {
        setVoiceState({
          currentState: state,
          ...details
        });
      };

      voiceAgentService.onTranscript = (transcript, confidence) => {
        if (onTranscript) {
          onTranscript(transcript, confidence);
        }
      };

      voiceAgentService.onError = (error) => {
        if (onError) {
          onError(error);
        }
      };

      isInitialized.current = true;
    }

    // Set language
    voiceAgentService.setLanguage(language);

    // Auto-start if enabled
    if (autoStart) {
      voiceAgentService.startListening();
    }

    // Cleanup on unmount
    return () => {
      voiceAgentService.cleanup();
    };
  }, []);

  // Update language when it changes
  useEffect(() => {
    voiceAgentService.setLanguage(language);
  }, [language]);

  const startListening = () => {
    voiceAgentService.enableAutoRestart();
    voiceAgentService.startListening();
  };

  const stopListening = () => {
    voiceAgentService.disableAutoRestart();
    voiceAgentService.stopListening();
  };

  const pauseListening = () => {
    voiceAgentService.pauseListening();
  };

  const resumeListening = () => {
    voiceAgentService.resumeListening();
  };

  const speak = async (text, options) => {
    try {
      await voiceAgentService.speak(text, options);
    } catch (error) {
      console.error('Error speaking:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  const stopSpeaking = () => {
    voiceAgentService.stopSpeaking();
  };

  const setProcessing = (isProcessing) => {
    voiceAgentService.setProcessing(isProcessing);
  };

  return {
    voiceState,
    isSupported,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    speak,
    stopSpeaking,
    setProcessing
  };
};

export default useVoiceAgent;
