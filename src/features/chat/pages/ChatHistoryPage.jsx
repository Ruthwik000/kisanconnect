import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  MessageCircle, 
  Calendar, 
  Search,
  Trash2,
  Eye,
  Filter,
  Clock,
  User,
  Bot,
  Sprout,
  Settings,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import { 
  getUserConversationsFromFirestore,
  deleteConversationFromFirestore 
} from '@/features/chat/services/chatFirestoreService';
import BottomNav from '@/shared/components/navigation/BottomNav';
import { toast } from 'sonner';

const ChatHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadChatHistory();
  }, [user?.uid]);

  const loadChatHistory = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const history = await getUserConversationsFromFirestore(user.uid, 100);
      setConversations(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await deleteConversationFromFirestore(conversationId);
      setConversations(conversations.filter(conv => conv.id !== conversationId));
      toast.success('Conversation deleted successfully');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (searchTerm === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      conversation.title?.toLowerCase().includes(searchLower) ||
      conversation.messages?.some(msg => 
        msg.content?.toLowerCase().includes(searchLower)
      )
    );
  });

  const formatDate = (timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString(
        currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-IN',
        { year: 'numeric', month: 'short', day: 'numeric' }
      );
    }
  };

  const getLastMessage = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'No messages';
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const content = lastMessage.content || '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  const getMessageCount = (conversation) => {
    return conversation.messages?.length || 0;
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#fdfbf7] text-[#2a3328]">
      {/* Header */}
      <header className="app-header px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/chat')}
            className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#768870] rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight truncate whitespace-nowrap">
              Chat History
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <LanguageSelector variant="compact" />
          <button onClick={() => navigate('/news')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0">
            <Bell className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-[#eeede6] flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#7a8478]" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#eeede6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#768870] focus:border-transparent"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-4 py-4 border-b border-[#eeede6] animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-[#f4f2eb] rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#f4f2eb] w-3/4 rounded mb-2" />
                    <div className="h-3 bg-[#f4f2eb] w-1/2 rounded mb-1" />
                    <div className="h-3 bg-[#f4f2eb] w-1/4 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-[#f4f2eb] rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-[#7a8478]" />
            </div>
            <h3 className="text-lg font-bold text-[#2a3328] mb-2">No conversations found</h3>
            <p className="text-[#7a8478] text-sm mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start chatting with the AI assistant to see your history here'
              }
            </p>
            <button
              onClick={() => navigate('/chat')}
              className="bg-[#768870] text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Chatting
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#eeede6]">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="px-4 py-4 hover:bg-[#f4f2eb]/30 transition-colors cursor-pointer"
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-[#768870] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-sm text-[#2a3328] truncate">
                        {conversation.title || conversation.topic || 'Untitled Conversation'}
                      </h3>
                      <span className="text-xs text-[#7a8478] flex-shrink-0 ml-2">
                        {formatDate(conversation.updatedAt || conversation.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#7a8478] line-clamp-2 mb-2">
                      {getLastMessage(conversation)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-[#7a8478]">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{getMessageCount(conversation)} messages</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{conversation.language?.toUpperCase() || 'EN'}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#eeede6] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#2a3328] truncate">
                {selectedConversation.title || selectedConversation.topic || 'Conversation Details'}
              </h2>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages?.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-[#768870] text-white' 
                      : 'bg-[#f4f2eb] text-[#7a8478]'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-[#768870] text-white'
                      : 'bg-[#f4f2eb] text-[#2a3328]'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.timestamp && (
                      <p className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-white' : 'text-[#7a8478]'
                      }`}>
                        {new Date(message.timestamp.toDate()).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#eeede6] flex gap-2">
              <button
                onClick={() => {
                  navigate('/chat', { state: { conversationId: selectedConversation.id } });
                }}
                className="flex-1 bg-[#768870] text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Continue Chat
              </button>
              <button
                onClick={() => deleteConversation(selectedConversation.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
};

export default ChatHistoryPage;