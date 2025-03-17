import React from 'react';
import { translations } from '../translations';

function LoadingModal({ isOpen, language = 'es', mode = 'full' }) {
  const t = translations[language];

  if (!isOpen) return null;

  // Show only one message based on mode
  const message = mode === 'full' 
    ? t.processing.analyzingWebsite 
    : t.processing.generatingIdeas;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/5 rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl w-full max-w-md backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-[#7B7EF4] flex items-center justify-center animate-pulse">
            {mode === 'full' ? (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-2">{message}</h3>
            <div className="w-full bg-white/10 rounded-full h-1">
              <div className="bg-[#7B7EF4] h-1 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '90%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingModal;