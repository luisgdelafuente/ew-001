import React from 'react';
import { translations } from '../translations';

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
    content += `${t.order.title}\n`;
    content += '='.repeat(t.order.title.length) + '\n\n';
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
    content += `${t.order.summary}\n`;
    content += '-'.repeat(t.order.summary.length) + '\n\n';
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
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">{t.order.title}</h2>

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

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onBack}
            className="bg-white/5 text-white py-3 px-8 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors border border-white/10 font-medium"
          >
            {t.order.backButton}
          </button>
          <button
            onClick={handleDownload}
            className="bg-[#7B7EF4] text-white py-3 px-8 rounded-xl hover:bg-[#6B6EE4] transition-colors font-medium"
          >
            {t.order.downloadButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;