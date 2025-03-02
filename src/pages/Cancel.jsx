import React from 'react';
import { Link } from 'react-router-dom';

function Cancel() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-montreal">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
      
      <div className="relative z-10 px-4 py-12 flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-medium text-center mb-2">Payment Cancelled</h1>
          <p className="text-gray-300 text-center mb-6">Your payment was cancelled. No charges were made.</p>
          
          <div className="flex flex-col gap-4">
            <Link to="/" className="block w-full bg-[#7B7EF4] text-white py-3 px-4 rounded-xl hover:bg-[#6B6EE4] focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors font-medium text-center">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cancel;