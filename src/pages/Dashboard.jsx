import React, { useEffect, useState } from 'react';
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
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import BottomNav from '@/components/navigation/BottomNav';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    setCurrentDate(now.toLocaleDateString('en-US', options));
  }, []);

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
        <div className="flex items-end justify-between flex-shrink-0 h-[40px]">
          <div>
            <h1 className="text-xl font-bold leading-none mb-1">Good Morning, {user?.name?.split(' ')[0] || 'Shradhha'}</h1>
            <div className="flex items-center gap-3 text-[#7a8478]">
              <div className="flex items-center gap-1 uppercase font-bold text-[9px] tracking-widest opacity-60">
                <Calendar className="w-3 h-3" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center gap-1 uppercase font-bold text-[9px] tracking-widest opacity-60">
                <MapPin className="w-3 h-3" />
                <span>Sangareddi, Telangana</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 flex-1 min-h-0 overflow-hidden pb-2">
          {/* Left Column: Weather + AI Assistant */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            {/* Weather Card */}
            <div className="kisan-card p-5 flex-1 flex flex-col justify-between border-[#eeede6] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-0">
              <div className="flex justify-between items-start">
                <h3 className="text-[10px] font-bold text-[#7a8478] uppercase tracking-widest">Local Weather</h3>
                <Sun className="w-5 h-5 text-[#eab308]" />
              </div>

              <div className="flex flex-col items-center justify-center my-2">
                <div className="text-4xl font-black leading-none tracking-tighter">23°C</div>
                <p className="text-[11px] font-bold text-[#7a8478] mt-1.5 uppercase tracking-wide">Clear Sky</p>
              </div>

              <div className="space-y-2.5 border-t border-[#eeede6] pt-4">
                {[
                  { icon: Droplets, val: '43%', label: 'Humidity' },
                  { icon: Wind, val: '13 km/h', label: 'Wind Speed' },
                  { icon: Cloud, val: '20%', label: 'Cloud Cover' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-[#7a8478]">
                      <item.icon className="w-3 h-3" />
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <span className="font-bold text-[#2a3328]">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant Banner */}
            <div className="bg-[#768870] rounded-xl p-4 text-white flex flex-col justify-between shadow-lg shadow-[#768870]/10 border border-white/5 h-[140px] flex-shrink-0">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-bold leading-none mb-1.5">Kisan AI Assistant</h3>
                  <p className="text-white/80 text-[10px] leading-tight font-medium">Ask questions about fertilizer application and soil pH management.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/chat')}
                className="w-full bg-white text-[#768870] py-2 rounded-lg text-[10px] font-bold hover:bg-white/95 transition-all shadow-sm active:scale-95 mt-2"
              >
                Ask a Question
              </button>
            </div>
          </div>

          {/* Right Column: Features & Updates */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            {/* Top Row: Navigation Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-0">
              <div className="kisan-card p-5 flex flex-col justify-between hover:border-[#768870]/30 transition-all border-[#eeede6] bg-white group shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-full">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#f4f2eb] rounded-xl flex items-center justify-center group-hover:bg-[#768870]/10 transition-colors">
                    <Camera className="w-5 h-5 text-[#768870]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm">Scan Crop</h4>
                    <p className="text-[10px] text-[#7a8478] line-clamp-2">Detect pests & diseases using AI instantly</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/disease')}
                  className="w-full bg-[#768870] text-white py-2.5 rounded-lg text-xs font-bold mt-4 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Open Scanner
                </button>
              </div>

              <div className="kisan-card p-5 flex flex-col justify-between hover:border-[#768870]/30 transition-all border-[#eeede6] bg-white group shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-full">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#f4f2eb] rounded-xl flex items-center justify-center group-hover:bg-[#768870]/10 transition-colors">
                    <FileText className="w-5 h-5 text-[#768870]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm">News & Schemes</h4>
                    <p className="text-[10px] text-[#7a8478] line-clamp-2">Latest government agricultural programs and news</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/news')}
                  className="w-full bg-[#768870] text-white py-2.5 rounded-lg text-xs font-bold mt-4 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  View Updates
                </button>
              </div>
            </div>

            {/* Bottom Row: Market & Govt. Schemes */}
            <div className="kisan-card p-5 flex-1 min-h-0 border-[#eeede6] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
              <h3 className="text-[10px] font-bold text-[#7a8478] uppercase tracking-widest mb-3">Market & Govt. Schemes</h3>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-[#f4f2eb] p-4 rounded-xl flex flex-col justify-center gap-1.5 border border-[#eeede6]/50">
                  <span className="font-bold text-xs text-[#2a3328]">PM-KISAN Update</span>
                  <p className="text-[10px] text-[#7a8478] font-medium leading-tight">New installment of ₹2000 will be credited by Feb 5, 2026.</p>
                </div>
                <div className="bg-[#f4f2eb] p-4 rounded-xl flex flex-col justify-center gap-1.5 border border-[#eeede6]/50">
                  <span className="font-bold text-xs text-[#2a3328]">Wheat Market Price</span>
                  <p className="text-[10px] text-[#768870] font-bold flex items-center gap-2">
                    ↑ ₹2,150/qtl <span className="text-[#7a8478] font-medium text-[9px]">(+2.4%)</span>
                  </p>
                </div>
              </div>
            </div>
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
