import React from 'react';

export default function Footer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/20 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="h-12 sm:h-16 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            © 2025 <a href="https://epicaworks.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Epica Works</a>
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            v.0.0.8
          </div>
        </div>
      </div>
    </div>
  );
}