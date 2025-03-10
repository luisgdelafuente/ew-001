import React from 'react';
import { translations } from '../translations';

const calculateDiscount = (count) => {
  if (count < 2) return 0;
  // Linear discount from 20% to 50% based on video count (2-10)
  const percentage = 20 + ((count - 2) * (50 - 20) / (10 - 2));
  return Math.min(50, Math.max(20, percentage));
};

const formatPrice = (price, locale = 'es-ES') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const ShoppingCart = ({ selectedVideos, onRemoveVideo, onOrder, language }) => {
  const t = translations[language];
  const basePrice = 99;
  const discount = calculateDiscount(selectedVideos.length);
  const subtotal = basePrice * selectedVideos.length;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  return (
    <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
      <h3 className="text-xl font-bold mb-4">{t.cart.title}</h3>
      
      <div className="space-y-4 mb-6">
        {selectedVideos.map((video) => (
          <div key={video.id} className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-white">{video.title}</p>
              <p className="text-sm text-gray-400">{formatPrice(basePrice)}</p>
            </div>
            <button
              onClick={() => onRemoveVideo(video.id)}
              className="ml-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <div className="flex justify-between text-gray-400">
          <span>{t.cart.subtotal}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[#7B7EF4]">
            <span>{t.cart.discount} ({discount.toFixed(1)}%)</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
          <span>{t.cart.total}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <button
        className="w-full mt-6 bg-[#7B7EF4] text-white py-3 px-4 rounded-xl hover:bg-[#6B6EE4] transition-colors font-medium"
        onClick={onOrder}
      >
        {t.cart.orderButton}
      </button>
    </div>
  );
};

export default ShoppingCart;