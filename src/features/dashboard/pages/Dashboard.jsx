import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Camera,
  Cloud,
  Droplets,
  Wind,
  Sprout,
  Settings,
  Bell,
  MapPin,
  Calendar,
  Sun,
  FileText,
  Activity
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { LanguageSelector } from '@/shared/ui/LanguageSelector';
import BottomNav from '@/shared/components/navigation/BottomNav';
import { 
  getDashboardData, 
  getLatestMarketPrices, 
  getLatestSchemes,
  subscribeToNewsUpdatesForDashboard,
  subscribeToMarketPrices,
  getWeatherData
} from '@/features/dashboard/services/dashboardService';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { currentLanguage } = useLanguage();
  
  const [currentDate, setCurrentDate] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's location or default
  const userLocation = userProfile?.location || 'Hyderabad, Telangana';
  const locationCity = userLocation.split(',')[0].trim();

  useEffect(() => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString(
      currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-US', 
      options
    ));
  }, [currentLanguage]);

  // Load initial data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        const [dashData, prices, schemesData, weatherData] = await Promise.all([
          getDashboardData(user.uid),
          getLatestMarketPrices(3),
          getLatestSchemes(2),
          getWeatherData(locationCity)
        ]);

        setDashboardData(dashData);
        setMarketPrices(prices);
        setSchemes(schemesData);
        setWeather(weatherData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.uid, locationCity]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribeNews = subscribeToNewsUpdatesForDashboard((news) => {
      setDashboardData(prev => prev ? { ...prev, news } : null);
    }, 3);

    const unsubscribePrices = subscribeToMarketPrices((prices) => {
      setMarketPrices(prices.slice(0, 3));
    }, 3);

    return () => {
      unsubscribeNews();
      unsubscribePrices();
    };
  }, [user?.uid]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const userName = userProfile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Farmer';
    
    let greetingKey = 'dashboard.goodMorning';
    if (hour >= 12 && hour < 17) greetingKey = 'dashboard.goodAfternoon';
    else if (hour >= 17) greetingKey = 'dashboard.goodEvening';

    return `${t(greetingKey)}, ${userName}`;
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#fdfbf7] text-[#2a3328] font-sans">
      {/* Header */}
      <header className="app-header px-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#768870] rounded-lg flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight truncate whitespace-nowrap">Kisan Connect</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <LanguageSelector variant="compact" />
          <button onClick={() => navigate('/news')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors flex-shrink-0"><Bell className="w-4 h-4" /></button>
          <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-[#f4f2eb] rounded-full text-[#7a8478] transition-colors flex-shrink-0"><Settings className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full max-w-[1200px] mx-auto overflow-hidden px-4 py-3 sm:px-6 gap-3">
        {/* User Identity Row */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold leading-tight mb-1 truncate">{getGreeting()}</h1>
            <div className="flex items-center gap-2 sm:gap-3 text-[#7a8478] text-[8px] sm:text-[9px]">
              <div className="flex items-center gap-1 uppercase font-bold tracking-widest opacity-60">
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">{currentDate}</span>
                <span className="sm:hidden">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
              </div>
              <div className="flex items-center gap-1 uppercase font-bold tracking-widest opacity-60">
                <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="truncate max-w-[100px] sm:max-w-none">{userLocation.split(',')[0]}</span>
              </div>
            </div>
          </div>
          {dashboardData?.diseaseStats && (
            <div className="flex items-center gap-1.5 text-[#768870] flex-shrink-0">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-xs font-bold">
                {dashboardData.diseaseStats.totalDetections} {t('dashboard.scans', 'scans')}
              </span>
            </div>
          )}
        </div>

        {/* Mobile-First Layout */}
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden pb-2">
          {/* Top Section: Weather & AI Assistant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-shrink-0">
            {/* Weather Card */}
            <div className="kisan-card p-3 sm:p-4 border-[#eeede6] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[140px] sm:min-h-[160px]">
              <div className="flex justify-between items-start">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-[#7a8478] uppercase tracking-widest">{t('weather.localWeather', 'Local Weather')}</h3>
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#eab308]" />
              </div>

              {weather ? (
                <>
                  <div className="flex flex-col items-center justify-center my-2">
                    <div className="text-2xl sm:text-3xl font-black leading-none tracking-tighter">{weather.temperature}°C</div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-[#7a8478] mt-1 uppercase tracking-wide capitalize">{weather.condition}</p>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 border-t border-[#eeede6] pt-2 sm:pt-3">
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                      <div className="flex items-center gap-1.5 text-[#7a8478]">
                        <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="font-semibold">{t('weather.humidity', 'Humidity')}</span>
                      </div>
                      <span className="font-bold text-[#2a3328]">{weather.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                      <div className="flex items-center gap-1.5 text-[#7a8478]">
                        <Wind className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="font-semibold">{t('weather.windSpeed', 'Wind Speed')}</span>
                      </div>
                      <span className="font-bold text-[#2a3328]">{weather.windSpeed} km/h</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
                      <div className="flex items-center gap-1.5 text-[#7a8478]">
                        <Cloud className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="font-semibold">{t('weather.cloudCover', 'Cloud Cover')}</span>
                      </div>
                      <span className="font-bold text-[#2a3328]">{weather.cloudCover}%</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center">
                  <div className="text-[#7a8478] text-xs mb-2">{t('weather.weatherUnavailable', 'Weather data unavailable')}</div>
                  <p className="text-[8px] text-[#7a8478]/60">{t('weather.checkConnection', 'Check your internet connection')}</p>
                </div>
              )}
            </div>

            {/* AI Assistant Banner */}
            <div className="bg-[#768870] rounded-xl p-3 sm:p-4 text-white flex flex-col justify-between shadow-lg shadow-[#768870]/10 border border-white/5 min-h-[140px] sm:min-h-[160px]">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg flex-shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[11px] sm:text-[12px] font-bold leading-none mb-1.5">{t('dashboard.kisanAiAssistant', 'Kisan AI Assistant')}</h3>
                  <p className="text-white/80 text-[8px] sm:text-[9px] leading-tight font-medium">
                    {dashboardData?.recentConversations?.length > 0 
                      ? `${t('dashboard.youHave', 'You have')} ${dashboardData.recentConversations.length} ${t('dashboard.recentConversations', 'recent conversations')}`
                      : t('dashboard.askQuestions', 'Ask questions about farming, fertilizers, and crop management')
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/chat')}
                className="w-full bg-white text-[#768870] py-2 rounded-lg text-[9px] sm:text-[10px] font-bold hover:bg-white/95 transition-all shadow-sm active:scale-95 mt-2"
              >
                {dashboardData?.recentConversations?.length > 0 ? t('dashboard.continueChat', 'Continue Chat') : t('dashboard.askQuestion', 'Ask a Question')}
              </button>
            </div>
          </div>

          {/* Second Section: Quick Actions */}
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            <div className="kisan-card p-3 sm:p-4 flex flex-col justify-between hover:border-[#768870]/30 transition-all border-[#eeede6] bg-white group shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[100px] sm:min-h-[120px]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#f4f2eb] rounded-lg flex items-center justify-center group-hover:bg-[#768870]/10 transition-colors">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#768870]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm">{t('dashboard.scanCrop', 'Scan Crop')}</h4>
                  <p className="text-[8px] sm:text-[10px] text-[#7a8478] line-clamp-2">{t('dashboard.detectPests', 'Detect pests & diseases')}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/disease')}
                className="w-full bg-[#768870] text-white py-2 rounded-lg text-[10px] sm:text-xs font-bold mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {t('dashboard.openScanner', 'Open Scanner')}
              </button>
            </div>

            <div className="kisan-card p-3 sm:p-4 flex flex-col justify-between hover:border-[#768870]/30 transition-all border-[#eeede6] bg-white group shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[100px] sm:min-h-[120px]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#f4f2eb] rounded-lg flex items-center justify-center group-hover:bg-[#768870]/10 transition-colors">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#768870]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm">{t('dashboard.newsSchemes', 'News & Schemes')}</h4>
                  <p className="text-[8px] sm:text-[10px] text-[#7a8478] line-clamp-2">{t('dashboard.latestUpdates', 'Latest updates')}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/news')}
                className="w-full bg-[#768870] text-white py-2 rounded-lg text-[10px] sm:text-xs font-bold mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {t('dashboard.viewUpdates', 'View Updates')}
              </button>
            </div>
          </div>

          {/* Bottom Section: Market & Schemes */}
          <div className="kisan-card p-3 sm:p-4 border-[#eeede6] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-[#7a8478] uppercase tracking-widest">{t('dashboard.marketGovtSchemes', 'Market & Govt. Schemes')}</h3>
              <button
                onClick={() => navigate('/news')}
                className="text-[9px] sm:text-[10px] text-[#768870] font-bold hover:underline"
              >
                {t('dashboard.viewAll', 'View All')}
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-pulse text-[#7a8478] text-xs">{t('dashboard.loadingUpdates', 'Loading updates...')}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* Market Prices */}
                {marketPrices.length > 0 ? (
                  marketPrices.slice(0, 2).map((price) => (
                    <div key={price.id} className="bg-[#f4f2eb] p-2.5 sm:p-3 rounded-lg flex flex-col gap-1 border border-[#eeede6]/50">
                      <span className="font-bold text-[10px] sm:text-xs text-[#2a3328] line-clamp-1">
                        {price.title?.[currentLanguage] || price.title?.en || `${price.commodity} Price`}
                      </span>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] sm:text-[10px] text-[#768870] font-bold">
                          ₹{price.price}/{price.unit || 'qtl'}
                        </p>
                        {price.change && (
                          <span className={`text-[8px] sm:text-[9px] font-medium ${
                            price.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {price.change}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#f4f2eb] p-2.5 sm:p-3 rounded-lg flex flex-col gap-1 border border-[#eeede6]/50">
                    <span className="font-bold text-[10px] sm:text-xs text-[#2a3328]">{t('dashboard.marketPrices', 'Market Prices')}</span>
                    <p className="text-[9px] sm:text-[10px] text-[#7a8478] font-medium">{t('dashboard.noDataAvailable', 'No data available')}</p>
                  </div>
                )}

                {/* Government Schemes */}
                {schemes.length > 0 ? (
                  schemes.slice(0, 2).map((scheme) => (
                    <div key={scheme.id} className="bg-[#f4f2eb] p-2.5 sm:p-3 rounded-lg flex flex-col gap-1 border border-[#eeede6]/50">
                      <span className="font-bold text-[10px] sm:text-xs text-[#2a3328] line-clamp-1">
                        {scheme.title?.[currentLanguage] || scheme.title?.en || 'Government Scheme'}
                      </span>
                      <p className="text-[8px] sm:text-[9px] text-[#7a8478] font-medium leading-tight line-clamp-2">
                        {scheme.summary?.[currentLanguage] || scheme.summary?.en || 'New government scheme for farmers'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#f4f2eb] p-2.5 sm:p-3 rounded-lg flex flex-col gap-1 border border-[#eeede6]/50">
                    <span className="font-bold text-[10px] sm:text-xs text-[#2a3328]">{t('dashboard.governmentSchemes', 'Government Schemes')}</span>
                    <p className="text-[8px] sm:text-[9px] text-[#7a8478] font-medium">{t('dashboard.noDataAvailable', 'No data available')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Nav */}
      <footer className="app-footer flex-shrink-0">
        <BottomNav />
      </footer>
    </div>
  );
};

export default Dashboard;
