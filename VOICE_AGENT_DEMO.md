# 🎤 Voice Agent - Visual Demo Guide

## 🚀 Your Voice Agent is Live!

**URL:** http://localhost:8081/voice-agent

---

## 📸 What You'll See

### 1. Landing Page

```
┌─────────────────────────────────────────────────────┐
│  🎤 Voice Agent                      🇬🇧 🇮🇳 🇮🇳   │
│  Speak naturally or type your questions             │
│                                                     │
│  [English]  [हिंदी]  [తెలుగు]  ← Language selector │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                     │
│                   Chat Messages                     │
│                    appear here                      │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │ [Status: Inactive]                      │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  [ 🎤 ]  [Type or speak...]          [ ➤ ]        │
│   ^                                       ^         │
│   Voice button                         Send btn    │
└─────────────────────────────────────────────────────┘
```

### 2. States You'll See

#### 🟢 LISTENING (Green Pulse)
```
[ 🎤 ]  ← Button pulses green
  ↓
"Listening..." indicator at top
```
**When:** After clicking mic button or auto-restart

#### 🔵 PROCESSING (Blue Spinner)
```
[ ⏳ ]  ← Spinning loader
  ↓
"Processing..." indicator
```
**When:** Sending your message to AI

#### 🟣 SPEAKING (Purple Pulse)
```
[ 🔊 ]  ← Speaker icon pulses
  ↓
"Speaking..." indicator
```
**When:** AI is reading response aloud

#### ⚪ INACTIVE (Gray)
```
[ 🎙️ ]  ← Microphone off
```
**When:** Idle (briefly before auto-restart)

---

## 🎬 Demo Flow

### Try This Sequence:

1. **Click the microphone button** 🎤
   - Button turns green with pulse ring
   - "Listening..." appears

2. **Say: "Hello, can you help me with farming?"**
   - Button turns blue (processing)
   - Your message appears in chat
   - AI types response
   - Response is spoken aloud (purple state)

3. **Wait a moment after AI finishes**
   - Button briefly goes gray (inactive)
   - Automatically turns green again (listening)
   - You can speak again WITHOUT clicking!

4. **Try: "What's the weather today?"**
   - Entire cycle repeats automatically

5. **Switch language to Hindi**
   - Click "हिंदी" button
   - Try: "मुझे मदद चाहिए"
   - AI responds in Hindi (if configured)

---

## 🎨 Visual Elements

### Message Bubbles

**Your messages (right side, blue):**
```
                            ┌──────────────────┐
                            │ Hello!           │
                            │ 10:30 AM         │
                            └──────────────────┘
```

**AI responses (left side, gray):**
```
┌─────────────────────────────┐
│ How can I help you today?  │
│ 10:30 AM                    │
└─────────────────────────────┘
```

### Typing Indicator

When AI is thinking:
```
┌──────────────┐
│ ● ● ●        │  ← Bouncing dots
└──────────────┘
```

### State Indicator Bar

Above input area:
```
┌───────────────────────────────┐
│ ● Listening...                │  ← Green dot
└───────────────────────────────┘

┌───────────────────────────────┐
│ ● Processing...               │  ← Blue dot
└───────────────────────────────┘

┌───────────────────────────────┐
│ ● Speaking...                 │  ← Purple dot
└───────────────────────────────┘
```

---

## 🧪 Test Cases

### ✅ Test 1: Basic Conversation
1. Click mic
2. Say "hello"
3. Verify response appears and is spoken
4. Verify auto-restart

### ✅ Test 2: Multiple Languages
1. Click "हिंदी"
2. Speak in Hindi
3. Verify recognition works
4. Switch back to English

### ✅ Test 3: Text Input
1. Type message manually (don't use voice)
2. Click send
3. Verify response is spoken

### ✅ Test 4: Silent Auto-Restart
1. Click mic (starts listening)
2. Don't say anything for 3 seconds
3. Watch it briefly go inactive
4. See it automatically restart

### ✅ Test 5: Stop and Start
1. Click mic (starts)
2. Click again (stops)
3. Verify it doesn't auto-restart

---

## 📱 Mobile Testing

On mobile devices (Chrome/Safari):

1. **Tap the microphone** (not double-click)
2. Browser asks for mic permission → Allow
3. Speak clearly
4. Auto-restart works same as desktop

**Mobile-specific features:**
- Touch-friendly button sizes
- Optimized keyboard handling
- Scroll behavior on typing

---

## 🎯 What to Look For

### ✅ Good Signs
- ✓ Green pulse while listening
- ✓ Smooth state transitions
- ✓ Auto-restart after responses
- ✓ Voice responses play clearly
- ✓ Messages appear instantly

### ⚠️ Issues to Check
- ❌ Button stays gray → Check mic permissions
- ❌ No auto-restart → Check browser console
- ❌ No voice response → Check speaker volume
- ❌ Poor recognition → Speak more clearly

---

## 🔧 Quick Fixes

### Mic Not Working?
1. Check permissions (browser icon in address bar)
2. Try in Chrome first
3. Make sure you're on localhost or HTTPS

### No Auto-Restart?
1. Check browser console for errors
2. Verify you didn't stop it manually
3. Refresh the page

### Can't Hear Responses?
1. Check system volume
2. Try: `window.speechSynthesis.speak(new SpeechSynthesisUtterance('test'))`
3. Close other audio apps

---

## 💡 Pro Tips

1. **Best Browsers:**
   - Chrome: Full support ✅
   - Edge: Full support ✅
   - Safari: Good support ✅
   - Firefox: Limited ⚠️

2. **Best Practice:**
   - Speak at normal pace
   - Pause 0.5s after each sentence
   - Use good microphone
   - Reduce background noise

3. **Cool Tricks:**
   - Press Enter to send text
   - Switch languages mid-conversation
   - Mix voice and text input

---

## 📊 Expected Performance

**Voice Recognition:**
- Latency: < 1 second
- Accuracy: 85-95% (good conditions)
- Auto-restart: ~500ms delay

**Text-to-Speech:**
- Latency: Instant start
- Voice quality: System-dependent
- Interruption: Automatic on new input

---

## 🎪 Demo Script

**For showing to others:**

> "Let me show you our voice agent. Watch the button colors - 
> green means listening, blue is processing, purple is speaking.
>
> [Click mic] 'What's the weather today?'
>
> See? It recognized my speech, sent it to the AI, and now it's 
> speaking back to me. And watch this - it automatically starts 
> listening again without me clicking anything!
>
> [Wait] Now I can just speak again: 'Thank you!'
>
> It works in multiple languages too. [Switch to Hindi]
> Now it understands Hindi!"

---

## 📸 Screenshot Checklist

Take screenshots of:
- [ ] Clean interface on load
- [ ] Green listening state
- [ ] Blue processing state
- [ ] Purple speaking state
- [ ] Message history with bubbles
- [ ] Language selector
- [ ] Mobile view

---

## 🚀 Next: Replace Mock Responses

**Current:** Returns canned responses
**Next:** Connect to real AI

Edit `src/features/voice-agent/VoiceAgentPage.jsx`:

```javascript
const handleSendMessage = async (message) => {
  // REPLACE THIS with your API:
  const response = await fetch('YOUR_API_HERE', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  return await response.json();
};
```

---

**Ready to impress? Open http://localhost:8081/voice-agent and start talking! 🎤**
