import React from 'react';

function LoadingModal({ isOpen, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/5 rounded-2xl p-8 border border-white/10 shadow-xl max-w-md w-full mx-4 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg font-medium text-center">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingModal;