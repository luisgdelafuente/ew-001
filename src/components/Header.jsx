import React from 'react';
import { Link } from 'react-router-dom';

function Header({ showBackButton = false, onBack }) {
  return (
    <header className="relative z-20 px-4 py-6 mb-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Go back"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="https://epicaworks.com/es/wp-content/uploads/sites/7/2025/03/epica-logo-280px.png" 
                alt="Epica Logo" 
                className="h-8"
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://epicaworks.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Visit Epica Works
            </a>
            <a 
              href="mailto:hello@epicaworks.com"
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;