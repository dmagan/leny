import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Play } from 'lucide-react';

const VIPPage = ({ isDarkMode, isOpen, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowCard(true);
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleBackButton = (event) => {
      if (isOpen) {
        event.preventDefault();
        closeCard();
        return false;
      }
    };

    window.addEventListener('popstate', handleBackButton);
    
    if (isOpen) {
      window.history.pushState(null, '', window.location.pathname);
    }

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, onClose]);

  const closeCard = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: isExiting ? 0 : (showCard ? 1 : 0),
        pointerEvents: showCard ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: isExiting 
            ? 'translateX(100%)' 
            : `translateX(${showCard ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={closeCard} 
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h2 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            خرید VIP
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">
          {/* VIP Card (Fixed at top) */}
          <div className="p-4">
            <div className="bg-[#141e35] rounded-3xl relative overflow-hidden border border-gray-500" style={{ minHeight: "180px" }}>
              {/* تصویر کاور */}
              <img 
                src="/cover-vip.jpg" 
                alt="VIP Cover" 
                className="w-full h-full object-cover absolute inset-0"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center z-10">
                  <Play size={36} className="text-black-500 ml-1" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="px-4">
              {/* VIP Services List */}
              <div className="mb-6 p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">خدمات VIP عبارتند از : </h3>
                
                <ol className="list-decimal list-inside space-y-2 text-right">
                  <li>معرفی میم کوین های پامپی</li>
                  <li>بستن سبد برای بولران (Alt کوین های انفجاری)</li>
                  <li>عرضه اولیه ( پیش از لانچ )</li>
                  <li>ایردراپ های که بدونه سرمایه به درامد عالی میرسند</li>
                  <li>تحلیل مارکت و اپدیت مارکت</li>
                  <li>مدیریت سرمایه</li>
                  <li>آموزش پایه</li>
                  <li>روانشناسی مارکت</li>
                </ol>
                
                <p className="mt-4 text-gray-300 text-right">و هر آن چیزی که در کریپتو موجب سود شما می شوند.</p>
              </div>
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]" style={{
            height: '90px',
            background: 'linear-gradient(to top, rgba(0,0,0,100), rgba(0,0,0,0))'
          }}></div>

          {/* Fixed Button at Bottom */}
          <div className="absolute bottom-6 left-4 right-4 z-10">
            <button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
            >
              خرید اشتراک
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VIPPage;