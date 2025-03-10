import React from 'react';
import { jsPDF } from 'jspdf';
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
  const discount = selectedVideos.length >= 2 
    ? 20 + ((selectedVideos.length - 2) * (50 - 20) / (10 - 2))
    : 0;
  const subtotal = basePrice * selectedVideos.length;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handlePrint = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    
    // Title
    doc.setFontSize(20);
    doc.text(t.order.title, margin, y);
    y += 15;
    
    // Company Info
    doc.setFontSize(12);
    doc.text('Epica Works', margin, y);
    y += 7;
    doc.text('hello@epicaworks.com', margin, y);
    y += 15;
    
    // Selected Videos
    doc.setFontSize(14);
    doc.text(t.order.selectedVideos, margin, y);
    y += 10;
    
    selectedVideos.forEach((video, index) => {
      doc.setFontSize(12);
      // Title
      doc.text(`${index + 1}. ${video.title}`, margin, y);
      y += 7;
      
      // Description (with word wrap)
      const splitDesc = doc.splitTextToSize(video.description, 170);
      doc.setFontSize(10);
      doc.text(splitDesc, margin, y);
      y += splitDesc.length * 5 + 5;
      
      // Duration and Type
      doc.text(`${video.duration}s - ${video.type === 'direct' ? t.videoTypes.direct : t.videoTypes.indirect}`, margin, y);
      y += 10;
    });
    
    // Price Summary
    y += 5;
    doc.setFontSize(14);
    doc.text(t.order.summary, margin, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.text(`${t.cart.subtotal}: ${formatPrice(subtotal)}`, margin, y);
    y += 7;
    
    if (discount > 0) {
      doc.text(`${t.cart.discount} (${discount.toFixed(1)}%): -${formatPrice(discountAmount)}`, margin, y);
      y += 7;
    }
    
    doc.setFontSize(14);
    doc.text(`${t.cart.total}: ${formatPrice(total)}`, margin, y);
    
    // Save the PDF
    doc.save('epica-works-order.pdf');
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

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={onBack}
            className="w-full sm:w-auto bg-white/5 text-white py-3 px-8 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors border border-white/10 font-medium"
          >
            {t.order.backButton}
          </button>
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-[#7B7EF4] text-white py-3 px-8 rounded-xl hover:bg-[#6B6EE4] focus:outline-none focus:ring-2 focus:ring-[#7B7EF4] focus:ring-offset-2 focus:ring-offset-black transition-colors font-medium"
          >
            {t.order.printButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;