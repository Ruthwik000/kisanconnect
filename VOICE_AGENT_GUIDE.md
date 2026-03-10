# 🎤 Voice Agent - Complete Guide

## Overview

The Voice Agent is a continuous speech-to-text and text-to-speech system that enables natural conversational interactions with your KisanMitra application.

## Features

✅ **Continuous Voice Recognition**
- Auto-starts listening after responses
- Detects when you stop speaking
- Auto-restarts if no speech detected

✅ **Text-to-Speech Responses**
- AI speaks back to you
- Multilingual voice support (English, Hindi, Telugu)
- Natural-sounding voices

✅ **Visual State Indicators**
- 🟢 Green pulse: Listening
- 🔵 Blue pulse: Processing
- 🟣 Purple pulse: Speaking
- ⚪ Gray: Inactive

✅ **Multilingual Support**
- English (en-IN)
- Hindi (hi-IN)
- Telugu (te-IN)

✅ **Smart Auto-Restart**
- Silently restarts listening when idle
- Pauses during AI responses
- Handles errors gracefully

## Architecture

```
┌─────────────────────────────────────────┐
│         Voice Agent Service             │
│  (Singleton, manages all voice I/O)     │
└──────────────┬──────────────────────────┘
               │
               ├─────► Web Speech API (Browser)
               │       - SpeechRecognition
               │       - SpeechSynthesis
               │
               ├─────► State Management
               │       - listening
               │       - processing
               │       - speaking
               │       - inactive
               │
               └─────► Event Callbacks
                       - onStateChange
                       - onTranscript
                       - onError
```

## Files Created

```
kisan-connect/
├── src/
│   ├── shared/
│   │   ├── services/
│   │   │   └── voiceAgentService.js      # Core voice service (singleton)
│   │   ├── hooks/
│   │   │   └── useVoiceAgent.js          # React hook for voice functionality
│   │   └── components/
│   │       ├── VoiceAgentButton.jsx      # Standalone voice button
│   │       └── VoiceChatInterface.jsx    # Full chat UI with voice
│   └── features/
│       └── voice-agent/
│           └── VoiceAgentPage.jsx        # Demo page
└── docs/
    └── VOICE_AGENT_GUIDE.md              # This file
```

## Usage

### 1. Standalone Voice Button

Add voice input to any form or component:

```jsx
import VoiceAgentButton from '../shared/components/VoiceAgentButton';

function MyComponent() {
  const handleTranscript = (transcript, confidence) => {
    console.log('User said:', transcript);
    console.log('Confidence:', confidence);
    // Do something with the transcript
  };

  return (
    <VoiceAgentButton
      onTranscript={handleTranscript}
      language="en"
      size="default" // 'sm' | 'default' | 'lg'
    />
  );
}
```

### 2. Full Chat Interface

Complete conversational interface with auto-scrolling and voice responses:

```jsx
import VoiceChatInterface from '../shared/components/VoiceChatInterface';

function ChatPage() {
  const handleSendMessage = async (message) => {
    // Call your AI backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    return data.response;
  };

  return (
    <div className="h-screen">
      <VoiceChatInterface
        onSendMessage={handleSendMessage}
        language="en"
        placeholder="Type or speak your message..."
      />
    </div>
  );
}
```

### 3. Custom Integration with Hook

For advanced use cases, use the `useVoiceAgent` hook directly:

```jsx
import { useVoiceAgent } from '../shared/hooks/useVoiceAgent';

function CustomComponent() {
  const {
    voiceState,
    isSupported,
    startListening,
    stopListening,
    speak,
    setProcessing
  } = useVoiceAgent({
    onTranscript: (transcript, confidence) => {
      console.log('Received:', transcript);
    },
    onError: (error) => {
      console.error('Voice error:', error);
    },
    language: 'en',
    autoStart: false
  });

  const handleQuery = async (text) => {
    setProcessing(true);
    
    // Call your API
    const response = await callYourAPI(text);
    
    // Speak the response
    await speak(response);
    
    setProcessing(false);
  };

  return (
    <div>
      <button onClick={startListening}>Start</button>
      <button onClick={stopListening}>Stop</button>
      <p>State: {voiceState.currentState}</p>
    </div>
  );
}
```

## API Reference

### VoiceAgentService

Singleton service that manages all voice interactions.

**Methods:**

```javascript
// Start/Stop listening
voiceAgentService.startListening()
voiceAgentService.stopListening()
voiceAgentService.pauseListening()
voiceAgentService.resumeListening()

// Text-to-Speech
await voiceAgentService.speak(text, options)
voiceAgentService.stopSpeaking()

// Configuration
voiceAgentService.setLanguage(languageCode)  // 'en', 'hi', 'te'
voiceAgentService.setProcessing(isProcessing)
voiceAgentService.enableAutoRestart()
voiceAgentService.disableAutoRestart()

// State
const state = voiceAgentService.getState()
// Returns: { isListening, isProcessing, isSpeaking, currentLanguage }

// Check browser support
const isSupported = voiceAgentService.isSupported()

// Cleanup
voiceAgentService.cleanup()
```

**Events:**

```javascript
voiceAgentService.onStateChange = (state, details) => {
  // state: 'listening' | 'processing' | 'speaking' | 'inactive'
  // details: { isListening, isProcessing, isSpeaking }
}

voiceAgentService.onTranscript = (transcript, confidence) => {
  // Called when speech is recognized
}

voiceAgentService.onError = (error) => {
  // Called on errors
}
```

### useVoiceAgent Hook

React hook for voice functionality.

**Parameters:**

```javascript
const options = {
  onTranscript: (transcript, confidence) => {},
  onError: (error) => {},
  language: 'en',  // 'en' | 'hi' | 'te'
  autoStart: false
};

const {
  voiceState,     // { isListening, isProcessing, isSpeaking, currentState }
  isSupported,    // boolean
  startListening, // () => void
  stopListening,  // () => void
  pauseListening, // () => void
  resumeListening,// () => void
  speak,          // (text, options?) => Promise<void>
  stopSpeaking,   // () => void
  setProcessing   // (boolean) => void
} = useVoiceAgent(options);
```

### VoiceAgentButton Props

```typescript
interface VoiceAgentButtonProps {
  onTranscript: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  language?: 'en' | 'hi' | 'te';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}
```

### VoiceChatInterface Props

```typescript
interface VoiceChatInterfaceProps {
  onSendMessage: (message: string) => Promise<string>;
  language?: 'en' | 'hi' | 'te';
  placeholder?: string;
  className?: string;
}
```

## State Flow

```
INACTIVE
   │
   ├─► [User clicks mic] ──► LISTENING
   │                            │
   │                            ├─► [Speech detected] ──► PROCESSING
   │                            │                             │
   │                            │                             ├─► [API call]
   │                            │                             │
   │                            │                             └─► SPEAKING
   │                            │                                    │
   │                            │                                    └─► INACTIVE ──┐
   │                            │                                                   │
   │                            └─► [No speech] ──────────────────────────────────┘
   │                                   (auto-restart after 500ms)
   │
   └─► [User clicks stop] ──► INACTIVE
```

## Integrating with Your AI Backend

### Option 1: Replace Mock in VoiceAgentPage

Edit `src/features/voice-agent/VoiceAgentPage.jsx`:

```javascript
const handleSendMessage = async (message) => {
  // Replace with your actual API
  const response = await fetch('YOUR_API_ENDPOINT', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${YOUR_TOKEN}`
    },
    body: JSON.stringify({ message, language: currentLanguage })
  });
  
  const data = await response.json();
  return data.response;
};
```

### Option 2: Gemini API Integration

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const handleSendMessage = async (message) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(message);
  const response = await result.response;
  return response.text();
};
```

### Option 3: OpenAI/ChatGPT

```javascript
const handleSendMessage = async (message) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};
```

## Browser Compatibility

### Speech Recognition
✅ Chrome (Desktop & Android)
✅ Edge
✅ Safari 14.1+ (iOS & macOS)
❌ Firefox (limited support)

### Speech Synthesis
✅ Chrome
✅ Edge
✅ Safari
✅ Firefox

**Fallback:** The component automatically detects browser support and shows a "not supported" message.

## Troubleshooting

### Voice Not Working?

1. **HTTPS Required**
   - Web Speech API only works on HTTPS or localhost
   - Deploy to HTTPS in production

2. **Microphone Permissions**
   - Browser will ask for microphone access
   - User must grant permission

3. **Check Browser Console**
   ```javascript
   // Test in console
   const recognition = new webkitSpeechRecognition();
   console.log('Speech Recognition:', !!recognition);
   console.log('Speech Synthesis:', !!window.speechSynthesis);
   ```

### Auto-Restart Not Working?

- Check `autoRestart` is enabled:
  ```javascript
  voiceAgentService.enableAutoRestart();
  ```

- Verify state transitions:
  ```javascript
  voiceAgentService.onStateChange = (state) => {
    console.log('State changed to:', state);
  };
  ```

### Poor Recognition Quality?

1. **Use better microphone**
2. **Reduce background noise**
3. **Speak clearly and at normal pace**
4. **Check language setting matches speech**

### TTS Not Speaking?

1. **Wait for voices to load:**
   ```javascript
   window.speechSynthesis.onvoiceschanged = () => {
     const voices = window.speechSynthesis.getVoices();
     console.log('Voices loaded:', voices.length);
   };
   ```

2. **Test manually:**
   ```javascript
   const utterance = new SpeechSynthesisUtterance('Hello');
   window.speechSynthesis.speak(utterance);
   ```

## Performance Tips

1. **Debounce API Calls**
   - Don't call API on every interim result
   - Wait for final transcript

2. **Cancel Previous Requests**
   - Use AbortController for fetch
   - Cancel ongoing requests when new speech starts

3. **Optimize TTS**
   - Chunk long responses
   - Use shorter, conversational text

4. **Battery Considerations**
   - Stop listening when app is in background
   - Disable auto-restart when not needed

## Security Considerations

1. **Microphone Permissions**
   - Always explain why you need mic access
   - Only start listening with user interaction

2. **Data Privacy**
   - Speech data is processed by browser's built-in APIs
   - No audio sent to third parties (unless you explicitly do so)
   - Clear privacy policy for users

3. **HTTPS Only**
   - Never use voice features on HTTP in production

## Advanced Customization

### Custom Voice Settings

```javascript
const speak = async (text) => {
  await voiceAgentService.speak(text, {
    rate: 1.2,    // Speed (0.1 to 10)
    pitch: 1.0,   // Pitch (0 to 2)
    volume: 0.8   // Volume (0 to 1)
  });
};
```

### Custom Recognition Settings

Edit `voiceAgentService.js`:

```javascript
this.recognition.continuous = true;  // Keep listening
this.recognition.interimResults = true; // Get partial results
this.recognition.maxAlternatives = 3; // Get multiple interpretations
```

### Adding New Languages

1. Update language map in `voiceAgentService.js`:
```javascript
this.languageMap = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'te': 'te-IN',
  'ta': 'ta-IN',  // Add Tamil
  'bn': 'bn-IN'   // Add Bengali
};
```

2. Add to language selector in `VoiceAgentPage.jsx`

## Testing

### Manual Testing Checklist

- [ ] Click mic button, speak, verify transcript
- [ ] Test auto-restart (speak, wait, speak again)
- [ ] Test all three languages
- [ ] Test text input (without voice)
- [ ] Test voice responses
- [ ] Test in different browsers
- [ ] Test on mobile devices
- [ ] Test with poor network

### Automated Testing (Optional)

```javascript
// Mock Web Speech API in tests
global.SpeechRecognition = class {
  start() {}
  stop() {}
};

global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn()
};
```

## Next Steps

1. **Integrate with Real AI Backend**
   - Replace mock responses
   - Add conversation history
   - Implement context awareness

2. **Add More Features**
   - Voice commands ("show weather", "detect disease")
   - Custom wake words
   - Multi-turn conversations

3. **Improve UX**
   - Add visual waveform while listening
   - Show confidence scores
   - Add voice feedback sounds

4. **Deploy**
   - Set up HTTPS
   - Configure CORS for API
   - Test on production

## Resources

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SpeechRecognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [SpeechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify browser compatibility
3. Test microphone with other apps
4. Review this guide's troubleshooting section

---

**Happy Voice Coding! 🎤**
