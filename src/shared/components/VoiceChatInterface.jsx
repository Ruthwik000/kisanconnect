import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useVoiceAgent } from '../../hooks/useVoiceAgent';
import VoiceAgentButton from '../VoiceAgentButton';
import { cn } from '../utils/utils';

/**
 * Voice Chat Interface Component
 * Full chat interface with voice input/output
 * Auto-scrolling messages, typing indicators, and voice responses
 */
export const VoiceChatInterface = ({ 
  onSendMessage,
  language = 'en',
  placeholder = 'Type or speak your message...',
  className 
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const { voiceState, speak, setProcessing } = useVoiceAgent({
    onTranscript: (transcript) => {
      setInputText(transcript);
      handleSend(transcript);
    },
    onError: (error) => {
      console.error('Voice error:', error);
      // You can show a toast notification here
    },
    language,
    autoStart: false
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text = inputText) => {
    if (!text.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    setProcessing(true);

    try {
      // Call your API endpoint
      const response = await onSendMessage(text.trim());
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response
      await speak(response);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>Start a conversation by typing or speaking!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] px-4 py-2 rounded-2xl",
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : message.isError
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted'
              )}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.text}
              </p>
              <span className="text-xs opacity-60 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-2xl">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice State Indicator */}
      {voiceState.currentState !== 'inactive' && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              voiceState.currentState === 'listening' && "bg-green-500",
              voiceState.currentState === 'processing' && "bg-blue-500",
              voiceState.currentState === 'speaking' && "bg-purple-500"
            )} />
            <span className="text-muted-foreground">
              {voiceState.currentState === 'listening' && 'Listening...'}
              {voiceState.currentState === 'processing' && 'Processing...'}
              {voiceState.currentState === 'speaking' && 'Speaking...'}
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-end gap-2">
          {/* Voice Button */}
          <VoiceAgentButton
            language={language}
            onTranscript={(transcript) => {
              setInputText(transcript);
              handleSend(transcript);
            }}
            size="default"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={1}
              disabled={isProcessing}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isProcessing}
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatInterface;
