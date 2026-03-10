import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Camera, MessageCircle, Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'scan', icon: Camera, label: 'Scan', path: '/disease' },
    { id: 'chat', icon: MessageCircle, label: 'AI Chat', path: '/chat' },
    { id: 'updates', icon: Newspaper, label: 'Updates', path: '/news' },
  ];

  return (
    <div className="w-full bg-white border-t border-[#eeede6] py-1 px-4 h-full flex items-center shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-around w-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-all px-6 h-full relative group ${isActive ? 'text-[#768870]' : 'text-[#7a8478]/60 hover:text-[#768870]'
                }`}
            >
              {isActive && (
                <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-8 h-1 bg-[#768870] rounded-b-full shadow-[0_2px_4px_rgba(118,136,112,0.3)]" />
              )}
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              <span className={`text-[9px] uppercase tracking-widest font-black transition-all ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
