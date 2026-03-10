import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus, Loader2, Mic, MicOff, Volume2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { sendChatMessage } from '@/services/aiChatbotService';

const FloatingChatbot = () => {
    const { t } = useTranslation();
    const { currentLanguage: selectedLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'greeting',
            role: 'assistant',
            text: t('chatbot.greeting'),
            suggestions: t('chatbot.suggestedQuestions', { returnObjects: true }),
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    /**
     * Requirement 6: Web Speech API for the Listen Feature.
     */
    const speakText = (text, language) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const langMap = { en: "en-US", hi: "hi-IN", te: "te-IN" };
        utterance.lang = langMap[language] || "en-US";

        // Pick best voice
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang === utterance.lang);
        if (voice) utterance.voice = voice;

        window.speechSynthesis.speak(utterance);
    };

    /**
     * Requirement 2, 5: Fetch AI response with silent background retry.
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
                speakText(response.reply, selectedLanguage);
            } else if (response.isBusy) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMsgId
                            ? { ...msg, text: "Retrying...", isRetrying: true }
                            : msg
                    )
                );
                setTimeout(() => fetchAIResponse(userText, assistantMsgId), 5000);
            }
        } catch (error) {
            console.error("[FloatingChatbot] Critical API Failure:", error);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMsgId
                        ? {
                            ...msg,
                            text: selectedLanguage === 'hi' ? "AI व्यस्त है। पृष्ठभूमि में पुन: प्रयास..." : "AI busy. Background retrying...",
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

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const assistantMsgId = `assistant_${Date.now()}`;

        const userMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            text: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [
            ...prev,
            userMessage,
            {
                id: assistantMsgId,
                role: 'assistant',
                text: selectedLanguage === 'hi' ? "सोच रहा हूँ..." : "Thinking...",
                isRetrying: true,
                timestamp: new Date()
            }
        ]);

        setInput('');
        fetchAIResponse(messageText, assistantMsgId);
    };

    const handleSuggestionClick = (suggestion) => {
        handleSend(suggestion);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#768870] p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">KisanMitra AI</h3>
                                    <p className="text-[10px] text-white/80">Always active</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-md transition-colors"><Minus className="w-4 h-4" /></button>
                                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${message.role === 'user'
                                        ? 'bg-[#768870] text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                        }`}>
                                        <div className="flex flex-col">
                                            {message.isRetrying ? (
                                                <div className="flex items-center gap-2">
                                                    {message.isError ? <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" /> : <Loader2 className="w-3 h-3 text-[#768870] animate-spin" />}
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{message.text}</span>
                                                </div>
                                            ) : (
                                                message.text
                                            )}
                                        </div>

                                        {!message.isRetrying && message.role === 'assistant' && (
                                            <button
                                                onClick={() => speakText(message.text, selectedLanguage)}
                                                disabled={!message.text || !('speechSynthesis' in window)}
                                                title={!('speechSynthesis' in window) ? "Voice not supported" : ""}
                                                className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#7a8478] hover:text-[#768870] transition-colors uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <Volume2 className="w-3.5 h-3.5" />
                                                <span>LISTEN</span>
                                            </button>
                                        )}

                                        {!message.isRetrying && message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {message.suggestions.map((s, i) => (
                                                    <button key={i} onClick={() => handleSuggestionClick(s)} className="px-3 py-1.5 text-[10px] bg-gray-100 hover:bg-[#768870] hover:text-white rounded-lg transition-colors border border-gray-200">
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex gap-2 items-center">
                                <button className="p-2 rounded-full transition-all flex-shrink-0 bg-gray-100 text-gray-500 hover:bg-gray-200"><Mic className="w-4 h-4" /></button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={t('chatbot.placeholder')}
                                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#768870]/20"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    className="p-2 bg-[#768870] text-white rounded-full disabled:opacity-50 hover:opacity-90 transition-all active:scale-90 flex-shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${isOpen ? 'bg-white text-[#768870]' : 'bg-[#768870] text-white'}`}>
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>
        </div>
    );
};

export default FloatingChatbot;
