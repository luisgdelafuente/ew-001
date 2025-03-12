import React from 'react';
import { translations } from '../translations';
import * as Tooltip from '@radix-ui/react-tooltip';

const formatPrice = (price, locale = 'es-ES') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const OrderDetails = ({ selectedVideos, onBack, language }) => {
  const t = translations[language];
  const basePrice = 99;
  // Linear discount from 10% to 40% based on video count (1-10)
  const discount = 10 + ((selectedVideos.length - 1) * (40 - 10) / (10 - 1));
  const subtotal = basePrice * selectedVideos.length;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleDownload = () => {
    let content = '';

    // Add title and company info
    content += 'Propuesta de Videos\n';
    content += '='.repeat('Propuesta de Videos'.length) + '\n\n';
    content += 'Epica Works\n';
    content += 'hello@epicaworks.com\n\n';

    // Add selected videos
    content += `${t.order.selectedVideos}\n`;
    content += '-'.repeat(t.order.selectedVideos.length) + '\n\n';

    selectedVideos.forEach((video, index) => {
      content += `${index + 1}. ${video.title}\n`;
      content += `   ${video.description}\n`;
      content += `   ${video.duration}s - ${video.type === 'direct' ? t.videoTypes.direct : t.videoTypes.indirect}\n\n`;
    });

    // Add price summary
    content += 'Resumen de la Oferta\n';
    content += '-'.repeat('Resumen de la Oferta'.length) + '\n\n';
    content += `${t.cart.subtotal}: ${formatPrice(subtotal)}\n`;
    
    if (discount > 0) {
      content += `${t.cart.discount} (${discount.toFixed(1)}%): -${formatPrice(discountAmount)}\n`;
    }
    
    content += `${t.cart.total}: ${formatPrice(total)}\n`;

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'epica-works-order.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Selected Videos */}
          <div>
            <h3 className="text-xl font-medium mb-4">{t.order.selectedVideos}</h3>
            <div className="space-y-4">
              {selectedVideos.map((video, index) => (
                <div key={video.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium text-[#7B7EF4]">{video.title}</h4>
                    <span className="text-gray-400">{formatPrice(basePrice)}</span>
                  </div>
                  <p className="text-gray-400 mb-2">{video.description}</p>
                  <div className="text-sm text-gray-500">
                    <span className="text-[#7B7EF4]">{video.duration}s</span> • 
                    <span className="ml-2">{video.type === 'direct' ? t.videoTypes.direct : t.videoTypes.indirect}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-medium mb-4">{t.order.summary}</h3>
            <div className="space-y-3">
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
              <div className="flex justify-between text-white font-bold text-xl pt-3 border-t border-white/10">
                <span>{t.cart.total}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-stretch gap-4 mt-8 w-full">
          <button
            onClick={onBack}
            className="flex-1 bg-[#5b9fd8] text-white px-4 py-2 rounded-lg hover:bg-[#4a8fc8] transition-colors font-medium flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.order.backButton}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 bg-[#7b7ef4] text-white px-4 py-2 rounded-lg hover:bg-[#6a6de3] transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            {t.order.downloadButton}
          </button>

          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  disabled
                  className="flex-1 bg-[#b1c752] text-white px-4 py-2 rounded-lg hover:bg-[#a0b641] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {t.order.payButton}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="relative z-50 bg-black/90 text-white px-3 py-2 rounded-lg text-sm"
                  sideOffset={5}>
                  {t.order.paymentNotAvailable}
                  <Tooltip.Arrow className="fill-black/90" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;