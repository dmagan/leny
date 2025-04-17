import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Play } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentCard from './PaymentCard'; // کامپوننت کارت پرداخت را import می‌کنیم

const VIPPage = ({ isDarkMode, isOpen, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showPaymentCard, setShowPaymentCard] = useState(false); // state جدید برای نمایش کارت پرداخت
  const [selectedSubscription, setSelectedSubscription] = useState(null); // state برای اشتراک انتخاب شده
  const [addedToHistory, setAddedToHistory] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowCard(true);
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // بهبود مدیریت دکمه بک
    const handleBackButton = (event) => {
      if (isOpen) {
        event.preventDefault();
        closeCard();
        return;
      }
    };
  
    // افزودن یک entry به history stack برای بهبود کارکرد دکمه بک اندروید
    if (isOpen && !addedToHistory) {
      window.history.pushState({ vipPage: true }, '', location.pathname);
      setAddedToHistory(true);
    }
  
    // افزودن event listener برای popstate
    window.addEventListener('popstate', handleBackButton);
    
    // تمیزکاری event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, addedToHistory, location.pathname]);

  const closeCard = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      
      // اینجا باید URL را به حالت قبل برگردانیم
      if (location.pathname !== '/') {
        // اگر از آدرس مستقیم آمده‌ایم، تاریخچه را جایگزین می‌کنیم
        onClose(); // این تابع باید navigate('/', { replace: true }) را فراخوانی کند
      } else {
        // اگر از داخل برنامه آمده‌ایم، فقط کامپوننت را می‌بندیم
        onClose();
      }
    }, 300);
  };

  // تابع جدید برای باز کردن کارت پرداخت با اشتراک انتخاب شده
  const handlePurchase = (subscription) => {
    setSelectedSubscription(subscription);
    setShowPaymentCard(true);
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
      {/* Header area with VIP Card (Fixed) */}
<div className="relative header-area">
  {/* VIP Card */}
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
  
  {/* Gradient transition overlay - گرادینت جدید */}
  <div className="absolute bottom-[-30px] left-0 right-0 pointer-events-none z-[5]" style={{
    height: '30px',
    background: isDarkMode 
      ? 'linear-gradient(to bottom, rgba(17,24,39,1), rgba(17,24,39,0))'
      : 'linear-gradient(to bottom, rgba(243,244,246,1), rgba(243,244,246,0))'
  }}></div>
</div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pb-24 scrollable-content">
          <div className="px-4 space-y-4">
              {/* Trading Signals */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">خدمات VIP عبارتند از :</h3>

                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">سیگنال‌های معاملاتی</h3>
                <ul className="list-disc list-inside space-y-2 text-right">
                  <li>معرفی میم کوین های پامپی</li>
                  <li>بستن سبد برای بولران (Alt کوین های انفجاری)</li>
                </ul>
              </div>
              
              {/* Investment Opportunities */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">فرصت‌های سرمایه‌گذاری</h3>
                <ul className="list-disc list-inside space-y-2 text-right">
                  <li>عرضه اولیه (پیش از لانچ)</li>
                  <li>ایردراپ‌هایی که بدون سرمایه به درآمد عالی می‌رسند</li>
                </ul>
              </div>
              
              {/* Market Analysis */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">تحلیل و آموزش</h3>
                <ul className="list-disc list-inside space-y-2 text-right">
                  <li>تحلیل مارکت و آپدیت مارکت</li>
                  <li>مدیریت سرمایه</li>
                  <li>آموزش پایه</li>
                  <li>روانشناسی مارکت</li>
                </ul>
                <p className="text-gray-300 text-right mt-2">و هر آن چیزی که در کریپتو موجب سود شما می‌شوند.</p>
              </div>
              
              {/* Pricing Options */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">گزینه‌های اشتراک</h3>
                <div className="space-y-4">
                  <div 
                    className="border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => handlePurchase({ title: "اشتراک شش ماهه", price: "199" })}
                  >
                    <h4 className="font-bold text-lg">اشتراک شش ماهه</h4>
                    <p className="text-yellow-500 text-lg mt-1">۱۹۹ دلار</p>
                    <p className="text-gray-400 text-sm mt-1">مناسب برای آشنایی با خدمات VIP</p>
                  </div>
                  
                  <div 
                    className="border border-gray-700 rounded-lg p-3 bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handlePurchase({ title: "اشتراک یکساله", price: "299" })}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-lg">اشتراک یکساله </h4>
                      <span className="bg-yellow-500 text-gray-900 text-xs rounded-full px-2 py-1">پیشنهاد ویژه</span>
                    </div>
                    <p className="text-yellow-500 text-lg mt-1">۲۹۹ دلار</p>
                    <p className="text-gray-400 text-sm mt-1">صرفه‌جویی ۲۵٪ نسبت به خرید ماهانه</p>
                  </div>
                  
                  <div 
                    className="border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => handlePurchase({ title: "اشتراک دوساله", price: "399" })}
                  >
                    <h4 className="font-bold text-lg">اشتراک دوساله</h4>
                    <p className="text-yellow-500 text-lg mt-1">۳۹۹ دلار</p>
                    <p className="text-gray-400 text-sm mt-1">صرفه‌جویی ۵۰٪ نسبت به خرید ماهانه</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]" style={{
            height: '90px',
            background: 'linear-gradient(to top, rgba(0,0,0,100), rgba(0,0,0,0))'
          }}></div>

          {/* Fixed Button at Bottom - اختیاری، می‌توانید نگه دارید یا حذف کنید */}
          <div className="absolute bottom-6 left-4 right-4 z-10">
          <button 
  onClick={() => handlePurchase({ title: "اشتراک شش ماهه", price: "199" })} // تغییر به اشتراک شش ماهه
  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
>
  خرید اشتراک
</button>
          </div>
        </div>
      </div>
      
      {/* Payment Card Component */}
      {showPaymentCard && selectedSubscription && (
        <PaymentCard
          isDarkMode={isDarkMode}
          onClose={() => setShowPaymentCard(false)}
          productTitle={selectedSubscription.title}
          price={selectedSubscription.price}
        />
      )}
    </div>
  );
};

export default VIPPage;