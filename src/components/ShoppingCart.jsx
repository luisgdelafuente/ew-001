import React from 'react';
import { translations } from '../translations';
import * as Tooltip from '@radix-ui/react-tooltip';

const calculateDiscount = (count) => {
  if (count <= 1) return 0;
  if (count === 2) return 10;
  if (count === 3) return 20;
  if (count === 4) return 30;
  return 40;
};

const formatPrice = (price, locale = 'es-ES') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const ShoppingCart = ({ selectedVideos, onRemoveVideo, onOrder, onBack, language }) => {
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

      <div className="flex justify-between items-center mt-6">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={onBack}
                className="bg-white/5 text-white h-14 px-6 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors border border-white/10 font-medium"
              >
                {t.videoScripts.backButton}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content 
                className="relative z-50 bg-black/90 text-white px-3 py-2 rounded-lg text-sm"
                sideOffset={5}>
                Empezar de nuevo (las ideas de videos se borrarán)
                <Tooltip.Arrow className="fill-black/90" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <button 
          onClick={onOrder}
          className="bg-[#7B7EF4] text-white h-14 px-6 rounded-lg hover:bg-[#6B6EE4] transition-colors font-medium"
        >
          {t.cart.orderButton}
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart;