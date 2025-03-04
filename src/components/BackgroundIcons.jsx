import React from 'react';

const BackgroundIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Video Camera */}
      <div className="absolute top-[15%] left-[10%] text-white/10 animate-float" style={{ animationDelay: '0s' }}>
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
      </div>
      
      {/* Film Strip */}
      <div className="absolute top-[30%] right-[8%] text-white/10 animate-float" style={{ animationDelay: '1.5s' }}>
        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
        </svg>
      </div>
      
      {/* Play Button */}
      <div className="absolute bottom-[20%] left-[15%] text-white/10 animate-float" style={{ animationDelay: '3s' }}>
        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      </div>
      
      {/* Video Clapper */}
      <div className="absolute top-[60%] right-[12%] text-white/10 animate-float" style={{ animationDelay: '2s' }}>
        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 10h-2V7H4v3H2v7h18v-7zM9.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
          <path d="M18 5V3H6v2h12zm-6 2l-4-2h8l-4 2z"/>
        </svg>
      </div>
      
      {/* Screen/Monitor */}
      <div className="absolute top-[45%] left-[20%] text-white/10 animate-float" style={{ animationDelay: '4s' }}>
        <svg className="w-18 h-18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
        </svg>
      </div>
      
      {/* Smartphone Video */}
      <div className="absolute bottom-[35%] right-[20%] text-white/10 animate-float" style={{ animationDelay: '2.5s' }}>
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
          <path d="M12 17c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
          <path d="M10 10l5 3-5 3z"/>
        </svg>
      </div>
      
      {/* Video Library */}
      <div className="absolute top-[75%] left-[5%] text-white/10 animate-float" style={{ animationDelay: '1s' }}>
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
        </svg>
      </div>
      
      {/* Video Settings */}
      <div className="absolute top-[10%] right-[25%] text-white/10 animate-float" style={{ animationDelay: '3.5s' }}>
        <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
        </svg>
      </div>
    </div>
  );
};

export default BackgroundIcons;