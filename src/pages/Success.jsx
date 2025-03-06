import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Footer from '../components/Footer';

function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-montreal flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
      
      <div className="relative z-10 flex-1 px-4 py-12 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#7B7EF4]/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#7B7EF4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl font-medium text-center mb-2">Payment Successful!</h1>
            <p className="text-gray-300 text-center mb-6">Thank you for your order. We'll start working on your videos right away.</p>
            
            <div className="mb-6">
              <div className="border border-white/10 rounded-xl p-4 mb-4">
                <h2 className="font-medium mb-2">Order Summary</h2>
                <p className="text-gray-300 text-sm mb-1">Order ID: {sessionId}</p>
                <p className="text-gray-300 text-sm">Date: {new Date().toLocaleDateString()}</p>
              </div>
              
              <p className="text-gray-300 text-sm">
                A confirmation email will be sent shortly. We'll contact you soon with updates about your videos.
              </p>
            </div>
            
            <Link to="/" className="block w-full bg-[#7B7EF4] text-white py-3 px-4 rounded-xl hover:bg-[#6B6EE4] focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors font-medium text-center">
              Return to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Success;