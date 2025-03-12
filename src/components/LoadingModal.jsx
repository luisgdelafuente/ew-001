import React, { useState, useEffect } from 'react';
import { translations } from '../translations';

function LoadingModal({ isOpen, message, language = 'es' }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showStep2, setShowStep2] = useState(false);
  const t = translations[language];

  useEffect(() => {
    if (isOpen && message.includes('video')) {
      setCurrentStep(2);
      setShowStep2(true);
    } else if (isOpen) {
      setCurrentStep(1);
      setShowStep2(false);
    }
  }, [isOpen, message]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/5 rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl w-full max-w-md backdrop-blur-sm">
        <div className="flex flex-col">
          {/* Progress Steps */}
          <div className="flex flex-col space-y-6">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-[#7B7EF4]' : 'bg-white/10'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {showStep2 && (
                  <div className={`w-0.5 h-12 my-2 transition-colors duration-500 ${
                    currentStep >= 2 ? 'bg-[#7B7EF4]' : 'bg-white/10'
                  }`} />
                )}
              </div>
              <div className={`flex-1 transition-opacity duration-500 ${
                currentStep === 1 ? 'opacity-100' : 'opacity-50'
              }`}>
                <h3 className="text-lg font-medium text-white mb-2">{t.processing.analyzingWebsite}</h3>
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white mr-2" />
                  <p className="text-sm text-gray-300">{t.processing.extractingInfo}</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            {showStep2 && (
              <div className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-[#7B7EF4]' : 'bg-white/10'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className={`flex-1 transition-opacity duration-500 ${
                  currentStep === 2 ? 'opacity-100' : 'opacity-50'
                }`}>
                  <h3 className="text-lg font-medium text-white mb-2">{t.processing.creatingProposals}</h3>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-b-white mr-2" />
                    <p className="text-sm text-gray-300">{t.processing.generatingIdeas}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingModal;