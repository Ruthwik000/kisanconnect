import React, { useState } from 'react';
import VoiceChatInterface from '../../shared/components/VoiceChatInterface';
import { Card } from '../../shared/ui/card';

/**
 * Voice Agent Demo Page
 * Showcases the voice chat interface with mock AI responses
 */
const VoiceAgentPage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Mock AI response - Replace with your actual API call
  const handleSendMessage = async (message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock responses based on keywords
    if (message.toLowerCase().includes('weather')) {
      return 'The weather today is sunny with a high of 28°C. Perfect conditions for farming!';
    } else if (message.toLowerCase().includes('crop') || message.toLowerCase().includes('disease')) {
      return 'I can help you identify crop diseases. Please upload a photo of the affected plant, and I will analyze it for you.';
    } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return 'Namaste! I am KisanMitra, your agricultural assistant. How can I help you today?';
    } else {
      return `I understand you asked: "${message}". I'm here to help with farming advice, crop disease detection, weather updates, and more. What would you like to know?`;
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                🎤 Voice Agent
              </h1>
              <p className="text-muted-foreground mt-2">
                Speak naturally or type your questions
              </p>
            </div>

            {/* Language Selector */}
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLanguage(lang.code)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentLanguage === lang.code
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Voice Chat Interface */}
        <Card className="h-[600px] overflow-hidden">
          <VoiceChatInterface
            onSendMessage={handleSendMessage}
            language={currentLanguage}
            placeholder={
              currentLanguage === 'hi'
                ? 'अपना संदेश टाइप करें या बोलें...'
                : currentLanguage === 'te'
                ? 'మీ సందేశాన్ని టైప్ చేయండి లేదా మాట్లాడండి...'
                : 'Type or speak your message...'
            }
          />
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-muted/50">
          <h2 className="text-xl font-semibold mb-3">How to Use Voice Agent</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">🎙️</span>
              <span><strong>Click the microphone button</strong> to start voice input</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">🗣️</span>
              <span><strong>Speak your question</strong> - the system will automatically detect when you stop</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">🔄</span>
              <span><strong>Auto-restart:</strong> If no speech is detected, listening automatically restarts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">🔊</span>
              <span><strong>Voice responses:</strong> The AI will speak back to you in your selected language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">⌨️</span>
              <span><strong>Type instead:</strong> You can also type your questions manually</span>
            </li>
          </ul>

          <div className="mt-4 p-4 bg-background rounded-lg border border-border">
            <p className="text-sm font-medium">Visual Indicators:</p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Listening</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm">Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-sm">Speaking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm">Inactive</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAgentPage;
