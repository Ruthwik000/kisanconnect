import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageSelector = ({ variant = 'compact', className = '' }) => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === currentLanguage);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 md:gap-2 bg-[#f5f0e8] px-2 md:px-4 py-1.5 md:py-2 rounded-full border border-[#e8dfd1] cursor-pointer hover:bg-[#ebe5d9] transition-all group"
      >
        <Globe className={`w-4 h-4 transition-colors ${isOpen ? 'text-[#6b7c68]' : 'text-[#8a9a87] group-hover:text-[#6b7c68]'}`} />
        <span className="text-sm font-bold uppercase tracking-wide text-[#2d3e2a]">
          {variant === 'full' ? currentLang?.nativeName : currentLanguage}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#8a9a87] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute right-0 top-full mt-3 z-50 min-w-[200px] bg-white rounded-2xl border border-[#e8dfd1] shadow-premium overflow-hidden p-2"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-colors ${currentLanguage === lang.code
                    ? 'bg-[#6b7c68]/10 text-[#6b7c68]'
                    : 'hover:bg-[#f5f0e8] text-[#2d3e2a]'
                    }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{lang.nativeName}</p>
                    <p className="text-xs text-[#8a9a87]">{lang.name}</p>
                  </div>
                  {currentLanguage === lang.code && (
                    <div className="w-5 h-5 rounded-full bg-[#6b7c68] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
