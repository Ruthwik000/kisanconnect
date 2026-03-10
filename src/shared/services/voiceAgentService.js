/**
 * Voice Agent Service
 * Handles continuous speech recognition and text-to-speech
 * with auto-restart functionality
 */

// Set to true for debugging
const DEBUG = false;

class VoiceAgentService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isProcessing = false;
    this.isSpeaking = false;
    this.autoRestart = true;
    this.currentLanguage = 'en-IN';
    this.onStateChange = null;
    this.onTranscript = null;
    this.onError = null;
    
    // Language mappings for speech recognition
    this.languageMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'te': 'te-IN'
    };
    
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; // Stop after each phrase
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = this.currentLanguage;

    // Event handlers
    this.recognition.onstart = () => {
      if (DEBUG) console.log('Voice recognition started');
      this.isListening = true;
      this.updateState('listening');
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      if (DEBUG) console.log('Transcript:', transcript, 'Confidence:', confidence);
      
      if (this.onTranscript) {
        this.onTranscript(transcript, confidence);
      }
    };

    this.recognition.onerror = (event) => {
      // Only log non-expected errors
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      
      // Handle no-speech silently (expected behavior)
      if (event.error === 'no-speech') {
        this.isListening = false;
        this.updateState('inactive');
        
        // Auto-restart silently on no-speech if autoRestart is enabled
        if (this.autoRestart) {
          setTimeout(() => this.startListening(), 500);
        }
        return;
      }
      
      // Don't restart on abort (user-initiated stop)
      if (event.error === 'aborted') {
        this.isListening = false;
        this.updateState('inactive');
        return;
      }
      
      // Handle other errors
      if (this.onError) {
        this.onError(event.error);
      }
      
      // Retry on other errors
      if (this.autoRestart) {
        setTimeout(() => this.startListening(), 1000);
      }
    };

    this.recognition.onend = () => {
      if (DEBUG) console.log('Voice recognition ended');
      this.isListening = false;
      
      // Auto-restart if enabled and not processing/speaking
      if (this.autoRestart && !this.isProcessing && !this.isSpeaking) {
        setTimeout(() => this.startListening(), 200);
      } else {
        this.updateState('inactive');
      }
    };
  }

  startListening() {
    if (this.isListening || this.isSpeaking || !this.recognition) {
      return;
    }

    try {
      this.recognition.lang = this.currentLanguage;
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      // Recognition might already be started, ignore
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.autoRestart = false; // Disable auto-restart
      this.recognition.stop();
    }
  }

  pauseListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  resumeListening() {
    if (!this.isSpeaking) {
      this.startListening();
    }
  }

  async speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Pause listening while speaking
      this.pauseListening();
      this.isSpeaking = true;
      this.updateState('speaking');

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice based on language
      const voices = this.synthesis.getVoices();
      const langCode = this.currentLanguage.split('-')[0];
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(langCode) || voice.lang.startsWith(this.currentLanguage)
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.lang = this.currentLanguage;
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onend = () => {
        if (DEBUG) console.log('Speech finished');
        this.isSpeaking = false;
        
        // Resume listening after speaking
        if (this.autoRestart) {
          setTimeout(() => {
            this.updateState('inactive');
            this.resumeListening();
          }, 500);
        } else {
          this.updateState('inactive');
        }
        
        resolve();
      };

      utterance.onerror = (event) => {
        if (DEBUG) console.error('Speech synthesis error:', event);
        this.isSpeaking = false;
        this.updateState('inactive');
        reject(event);
      };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.updateState('inactive');
    }
  }

  setLanguage(languageCode) {
    const mappedLang = this.languageMap[languageCode] || 'en-IN';
    this.currentLanguage = mappedLang;
    
    if (this.recognition) {
      this.recognition.lang = mappedLang;
    }
  }

  setProcessing(isProcessing) {
    this.isProcessing = isProcessing;
    if (isProcessing) {
      this.pauseListening();
      this.updateState('processing');
    } else {
      this.updateState('inactive');
    }
  }

  enableAutoRestart() {
    this.autoRestart = true;
  }

  disableAutoRestart() {
    this.autoRestart = false;
  }

  updateState(state) {
    if (this.onStateChange) {
      this.onStateChange(state, {
        isListening: this.isListening,
        isProcessing: this.isProcessing,
        isSpeaking: this.isSpeaking
      });
    }
  }

  getState() {
    return {
      isListening: this.isListening,
      isProcessing: this.isProcessing,
      isSpeaking: this.isSpeaking,
      currentLanguage: this.currentLanguage
    };
  }

  isSupported() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!(SpeechRecognition && window.speechSynthesis);
  }

  cleanup() {
    this.stopListening();
    this.stopSpeaking();
    this.autoRestart = false;
  }
}

// Singleton instance
const voiceAgentService = new VoiceAgentService();

export default voiceAgentService;
