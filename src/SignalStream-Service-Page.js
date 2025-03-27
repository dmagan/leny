import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Play } from 'lucide-react';

const SignalStreamServicePage = ({ isDarkMode, isOpen, onClose }) => {
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
            سیگنال استریم
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">
          {/* Cover Image */}
          <div className="p-4">
            <div className="bg-[#141e35] rounded-3xl relative overflow-hidden border border-gray-500" style={{ minHeight: "180px" }}>
              {/* تصویر کاور */}
              <img 
                src="/Signal-Stream.jpg" 
                alt="Signal Stream Cover" 
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
              {/* Signal Stream Content */}
              <div className="mb-6 p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">سیگنال استریم چیست؟</h3>
                
                <p className="text-right mb-4">
                  سیگنال استریم یک کانال ویژه برای ارائه سیگنال‌های معاملاتی و تحلیل‌های لحظه‌ای بازار کریپتو است. در این کانال تیم ما به صورت زنده و لحظه‌ای بهترین موقعیت‌های بازار را رصد کرده و به شما اطلاع می‌دهند.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-yellow-400">مزایای سیگنال استریم:</h4>
                    <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
                      <li>دریافت سیگنال‌های به‌روز و دقیق</li>
                      <li>تحلیل‌های لحظه‌ای بازار</li>
                      <li>اطلاع از اخبار مهم بازار پیش از دیگران</li>
                      <li>دسترسی مستقیم به تیم متخصصان</li>
                      <li>آموزش‌های کوتاه و کاربردی</li>
                      <li>گزارش‌های منظم از وضعیت بازار</li>
                      <li>استراتژی‌های ویژه برای شرایط مختلف بازار</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-yellow-400">ویژگی‌های سیگنال استریم:</h4>
                    <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
                      <li>ارائه سیگنال‌های کوتاه‌مدت و بلندمدت</li>
                      <li>تحلیل ارزهای دیجیتال مختلف</li>
                      <li>اطلاع‌رسانی از ترندهای جدید بازار</li>
                      <li>مشاوره در مدیریت سرمایه</li>
                      <li>پشتیبانی از معامله‌گران در همه سطوح</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-yellow-400">نحوه ارائه سیگنال‌ها:</h4>
                    <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
                      <li>نام ارز دیجیتال</li>
                      <li>قیمت ورود دقیق</li>
                      <li>اهداف قیمتی (TP1, TP2, TP3)</li>
                      <li>حد ضرر (Stop Loss)</li>
                      <li>اهرم پیشنهادی (در صورت نیاز)</li>
                      <li>تحلیل‌های پشتیبان تصمیم</li>
                      <li>مدت زمان تقریبی رسیدن به هدف</li>
                    </ul>
                  </div>
                </div>
                
                <p className="mt-4 text-gray-300 text-right">
                  با اشتراک در کانال سیگنال استریم، شما به جمع معامله‌گران حرفه‌ای می‌پیوندید که همواره از فرصت‌های بازار آگاه هستند و تصمیمات آگاهانه‌تری می‌گیرند.
                </p>
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
              اشتراک در کانال سیگنال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalStreamServicePage;