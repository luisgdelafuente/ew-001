import React from 'react';
import { Link } from 'react-router-dom';
import { translations } from '../translations';

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' }
];

function Header({ showBackButton = false, onBack, language, setLanguage }) {
  const t = translations[language];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label={t.header.backButton}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <a 
              href="https://app.epicaworks.com"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center"
              aria-label="Epica Works Homepage"
            >
              <img 
                src="https://epicaworks.com/es/wp-content/uploads/sites/7/2025/03/epica-logo-280px.png" 
                alt="Epica Logo" 
                className="h-10 sm:h-12"
                style={{ maxWidth: '160px', objectFit: 'contain' }}
              />
            </a>
          </div>
          
          <div className="flex items-center gap-6">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 border-white/10 rounded-lg text-xs sm:text-sm font-medium text-white focus:border-[#7B7EF4] focus:ring-1 focus:ring-[#7B7EF4] transition-colors cursor-pointer hover:bg-white/10 py-1.5 px-2 sm:px-3"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              {LANGUAGES.map(({ code, name }) => (
                <option key={code} value={code} style={{ color: 'black' }}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;