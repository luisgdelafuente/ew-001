import React from 'react';

function Footer() {
  return (
    <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            © 2025 Epica Works | contacto: hello@epicaworks.com
          </div>
          <div className="text-sm text-gray-400">
            v.0.0.6
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;