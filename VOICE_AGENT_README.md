# 🎤 Voice Agent - Quick Start

## What You Got

A complete voice-enabled chat interface with:
- ✅ Speech-to-text (continuous listening)
- ✅ Text-to-speech (AI speaks back)
- ✅ Auto-restart when no speech detected
- ✅ Multilingual (English, Hindi, Telugu)
- ✅ Visual state indicators

## Files Created

```
src/
├── shared/
│   ├── services/voiceAgentService.js     # Core voice service
│   ├── hooks/useVoiceAgent.js            # React hook
│   └── components/
│       ├── VoiceAgentButton.jsx          # Standalone voice button
│       └── VoiceChatInterface.jsx        # Full chat UI
└── features/voice-agent/
    └── VoiceAgentPage.jsx                # Demo page
```

## Try It Now

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Visit the demo:**
   ```
   http://localhost:8080/voice-agent
   ```

3. **Click the microphone and speak!**

## Visual States

- 🟢 **Green pulse** = Listening for your voice
- 🔵 **Blue pulse** = Processing your request
- 🟣 **Purple pulse** = AI is speaking
- ⚪ **Gray** = Inactive

## How It Works

```
You speak ──► Speech Recognition ──► Your AI Backend ──► TTS ──► You hear response
              (Web Speech API)                           (Browser voices)
```

## Quick Integration

### Option 1: Add to Existing Chat

```jsx
import VoiceAgentButton from '../shared/components/VoiceAgentButton';

<VoiceAgentButton
  onTranscript={(text) => handleUserInput(text)}
  language="en"
/>
```

### Option 2: Full Chat Interface

```jsx
import VoiceChatInterface from '../shared/components/VoiceChatInterface';

<VoiceChatInterface
  onSendMessage={async (msg) => {
    const response = await yourAPI(msg);
    return response;
  }}
  language="en"
/>
```

## Connect Your AI

Edit `src/features/voice-agent/VoiceAgentPage.jsx`:

```javascript
const handleSendMessage = async (message) => {
  // Replace this with your actual API call
  const response = await fetch('YOUR_API_ENDPOINT', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  return await response.json();
};
```

### Quick Options:

**Gemini API:**
```javascript
const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: message }] }]
  })
});
```

**OpenAI:**
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }]
  })
});
```

## Browser Support

✅ **Works in:**
- Chrome (Desktop & Android)
- Edge
- Safari 14.1+ (iOS & macOS)

⚠️ **Requires HTTPS** (except localhost)

## Troubleshooting

**Not working?**
1. Check browser console for errors
2. Allow microphone permissions
3. Use HTTPS or localhost
4. Test in Chrome first

**Auto-restart not working?**
- Make sure you're not stopping it manually
- Check browser console for errors

## Next Steps

1. ✅ **Test the demo** - Try different languages
2. 🔌 **Connect your AI** - Replace mock responses
3. 🎨 **Customize styling** - Match your app's theme
4. 📱 **Test on mobile** - Works great on phones too!

## Full Documentation

See `VOICE_AGENT_GUIDE.md` for:
- Complete API reference
- Advanced customization
- Performance tips
- Security best practices

---

**Questions?** Check the full guide or browser console for errors.

**Ready to deploy?** Remember: HTTPS required for voice features in production!
