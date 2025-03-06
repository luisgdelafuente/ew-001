import React from 'react';

function Footer() {
  return (
    <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            © 2025 Epica Works | contacto: hello@epicaworks.com
          </div>
          <div className="text-sm text-gray-400">
            v.0.0.3
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;