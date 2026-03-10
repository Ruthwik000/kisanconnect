import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { useVoiceAgent } from '../../hooks/useVoiceAgent';
import { cn } from '../utils/utils';

/**
 * Voice Agent Button Component
 * Displays current voice state with visual indicators
 * Handles touch/click interactions for voice control
 */
export const VoiceAgentButton = ({ 
  onTranscript, 
  onError,
  language = 'en',
  className,
  size = 'default' // 'sm' | 'default' | 'lg'
}) => {
  const [isActive, setIsActive] = useState(false);

  const {
    voiceState,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceAgent({
    onTranscript,
    onError,
    language,
    autoStart: false
  });

  if (!isSupported) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground text-sm", className)}>
        <MicOff className="w-4 h-4" />
        <span>Voice not supported</span>
      </div>
    );
  }

  const handleToggle = () => {
    if (isActive) {
      stopListening();
      setIsActive(false);
    } else {
      startListening();
      setIsActive(true);
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    default: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getStateColor = () => {
    switch (voiceState.currentState) {
      case 'listening':
        return 'bg-green-500 hover:bg-green-600';
      case 'processing':
        return 'bg-blue-500';
      case 'speaking':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStateIcon = () => {
    switch (voiceState.currentState) {
      case 'listening':
        return <Mic className={cn(iconSizes[size], "animate-pulse")} />;
      case 'processing':
        return <Loader2 className={cn(iconSizes[size], "animate-spin")} />;
      case 'speaking':
        return <Volume2 className={cn(iconSizes[size], "animate-pulse")} />;
      default:
        return isActive ? <Mic className={iconSizes[size]} /> : <MicOff className={iconSizes[size]} />;
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative rounded-full text-white transition-all shadow-lg",
        "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        getStateColor(),
        className
      )}
      disabled={voiceState.currentState === 'processing' || voiceState.currentState === 'speaking'}
      aria-label={isActive ? "Stop voice input" : "Start voice input"}
    >
      {getStateIcon()}
      
      {/* Pulse animation ring for listening state */}
      {voiceState.currentState === 'listening' && (
        <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75" />
      )}
    </button>
  );
};

export default VoiceAgentButton;
