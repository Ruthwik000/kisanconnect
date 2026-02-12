import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, TrendingUp, FileText, Banknote, Calendar, ExternalLink, Sprout, Bell, Settings, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { getNews } from '@/api/mockApi';
import BottomNav from '@/components/navigation/BottomNav';

const NewsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState('schemes');
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'schemes', label: t('news.schemes'), icon: FileText },
    { id: 'news', label: t('news.agricultural'), icon: TrendingUp },
    { id: 'prices', label: t('news.marketPrices'), icon: Banknote },
  ];

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      try {
        const data = await getNews();
        setNews(data);
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

  const filteredNews = news.filter((item) => {
    if (activeTab === 'schemes') return item.category === 'scheme';
    if (activeTab === 'news') return item.category === 'news';
    if (activeTab === 'prices') return item.category === 'price';
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-IN',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#fdfbf7] text-[#2a3328]">
      {/* Unified Header */}
      <header className="app-header px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#768870] rounded-lg flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight truncate whitespace-nowrap">{t('news.title')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <LanguageSelector variant="compact" />
          <button onClick={() => navigate('/news')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"><Bell className="w-4 h-4" /></button>
          <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] flex-shrink-0"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Tabs Row (Fixed) */}
      <div className="bg-white border-b border-[#eeede6] px-6 py-2 flex gap-4 overflow-x-auto scrollbar-hide flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold text-xs whitespace-nowrap ${activeTab === tab.id
              ? 'bg-[#768870] text-white shadow-md shadow-[#768870]/20'
              : 'bg-[#f4f2eb] text-[#7a8478] border border-[#eeede6] hover:bg-[#eeede6]'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content (Flex-1) */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto overflow-y-auto scrollbar-hide p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="kisan-card p-4 animate-pulse">
                <div className="h-32 bg-[#f4f2eb] rounded-xl mb-4" />
                <div className="h-4 bg-[#f4f2eb] w-3/4 rounded mb-2" />
                <div className="h-3 bg-[#f4f2eb] w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map((item) => (
              <article key={item.id} className="kisan-card p-0 overflow-hidden flex flex-col border-[#eeede6] bg-white shadow-sm hover:border-[#768870]/30 transition-all group">
                <div className="h-32 bg-[#f4f2eb] relative overflow-hidden">
                  <img src={item.imageUrl} alt="News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm border border-[#eeede6] rounded-lg text-[9px] font-black uppercase tracking-wider text-[#768870]">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#2a3328] leading-tight mb-2">{item.title[currentLanguage]}</h3>
                    <p className="text-[11px] text-[#7a8478] line-clamp-2 font-medium leading-relaxed">{item.summary[currentLanguage]}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f4f2eb]">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-[#7a8478]/50 uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    <button className="flex items-center gap-1.5 text-[11px] font-black text-[#768870] uppercase tracking-tighter hover:opacity-80">
                      Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {filteredNews.length === 0 && !isLoading && (
          <div className="kisan-card p-12 text-center max-w-md mx-auto mt-20 border-dashed">
            <p className="text-sm font-bold text-[#7a8478]">No updates available in this category.</p>
          </div>
        )}
      </main>

      <footer className="app-footer flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
};

export default NewsPage;
