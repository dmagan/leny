import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Play, ExternalLink } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentCard from './PaymentCard'; // کامپوننت کارت پرداخت را import می‌کنیم

const SignalStreamServicePage = ({ isDarkMode, isOpen, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showPaymentCard, setShowPaymentCard] = useState(false); // state جدید برای نمایش کارت پرداخت
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
    // Handle back button behavior for both browser and Android
    const handleBackButton = (event) => {
      if (showPaymentCard) {
        // اگر کارت پرداخت باز است، ابتدا آن را ببندیم
        event.preventDefault();
        setShowPaymentCard(false);
        return false;
      }
      
      if (isOpen) {
        event.preventDefault();
        closeCard();
        return false;
      }
    };
  
    // Listen for the popstate event (back button)
    window.addEventListener('popstate', handleBackButton);
    
    // Push a new history state to capture Android back button
    if (isOpen) {
      window.history.pushState(null, '', window.location.pathname);
    }
    
    // Push another history state if payment card is shown
    if (showPaymentCard) {
      window.history.pushState(null, '', window.location.pathname);
    }
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, onClose, showPaymentCard]);

  const closeCard = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      
      // Always call onClose to inform parent component
      onClose();
      
      // Force URL to be '/' when returning to home if needed
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }, 300);
  };

  // تابع جدید برای باز کردن کارت پرداخت
  const handlePurchase = () => {
    setShowPaymentCard(true);
  };

  // تابع برای باز کردن لینک رفرال ال‌بانک
  const openReferralLink = () => {
    window.open('https://www.lbank.com/en-US/login/?icode=PCSVIP', '_blank');
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
          {/* Signal Stream Cover Card (Fixed at top) */}
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
            <div className="px-4 space-y-4">
              {/* What is Signal Stream section */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">سیگنال استریم چیست؟</h3>
                <p className="text-right text-gray-100">
                  سیگنال استریم کانال اختصاصی و رایگان مجموعه PCS است که شما می‌توانید به صورت رایگان از معاملات فیوچرز و اسپات بهره ببرید.
                </p>
              </div>
              
              {/* How to join section */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">نحوه عضویت در این کانال</h3>
                <ol className="list-decimal list-inside space-y-3 text-right">
                  <li>
                    ابتدا بر روی لینک زیر کلیک کنید و حساب خودتون رو در صرافی البانک با رفرال ما ایجاد کنید:
                    <div className="mt-2 mb-2">
                      <a 
                        href="https://www.lbank.com/en-US/login/?icode=PCSVIP" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        https://www.lbank.com/en-US/login/?icode=PCSVIP
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </li>
                  <li>بعد از افتتاح حساب، اپلیکیشن البانک را نصب و به حساب خود وارد شوید.</li>
                  <li>حساب خود را حداقل ۵۰ دلار شارژ کنید تا بتوانید از موقعیت‌های ارائه شده استفاده کنید.</li>
                  <li>از منو پروفایل در بالای صفحه سمت راست، UID یا شناسه حساب خود را کپی کنید.</li>
                  <li>سپس بر روی دکمه زرد رنگ پایین صفحه (اشتراک در کانال سیگنال) کلیک کنید و UID خودتون رو وارد کنید.</li>
                  <li>درصورتی که حساب شما با لینک ما ثبت‌نام شده باشد و موجودی شما حداقل ۵۰ دلار باشد، دسترسی کانال برای شما باز می‌شود و می‌توانید از خدمات ما استفاده کنید.</li>
                </ol>
              </div>
              
              {/* Benefits section */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">مزایای سیگنال استریم</h3>
                <ul className="list-disc list-inside space-y-2 text-right">
                  <li>دریافت سیگنال فیوچرز و اسپات با دقت بالا</li>
                  <li>آپدیت شدن از وضعیت مارکت</li>
                  <li>معرفی ارز‌های پر پتانسیل</li>
                  <li>آموزش کوتاه و کاربردی از معامله‌گری</li>
                  <li>مدیریت سرمایه در ترید</li>
                  <li>و...</li>
                </ul>
              </div>
              
              {/* Additional information section */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">توضیحات</h3>
                <p className="text-right text-gray-100 leading-relaxed">
                  شما با ثبت‌نام کردن با لینک ما، علاوه بر دریافت بونوس‌های متفاوت، از خدمات ما به رایگان استفاده می‌کنید و این هزینه را صرافی در قالب کمیسیون به ما پرداخت می‌کند. یک بازی دو سر برد برای کسانی که تمایل به معامله‌گری حرفه‌ای دارند.
                </p>
                <p className="text-right text-gray-100 mt-3 leading-relaxed">
                  دقت کنید که تیم ما هیچگونه دسترسی به حساب شما نخواهد داشت. درصورتی که فعالیت انجام ندهید، از این کانال حذف خواهید شد.
                </p>
              </div>
              
              {/* Pricing Options */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-yellow-400 text-right">عضویت در کانال:</h3>
                    <p className="text-2xl font-bold text-green-500">رایگان</p>
                  </div>
                  <div className="bg-yellow-500/20 text-yellow-400 rounded-xl p-2 text-sm">
                    <p>با افتتاح حساب از طریق رفرال</p>
                    <p>شارژ حداقل ۵۰ دلار</p>
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

          {/* Fixed Button at Bottom - Two Buttons */}
          <div className="absolute bottom-6 left-4 right-4 z-10 grid grid-cols-2 gap-3">
            <button 
              onClick={handlePurchase}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
            >
              خرید UID
            </button>
            <button 
              onClick={openReferralLink} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
            >
              ثبت‌نام ال‌بانک
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Card Component */}
      {showPaymentCard && (
        <PaymentCard
          isDarkMode={isDarkMode}
          onClose={() => setShowPaymentCard(false)}
          productTitle="خرید UID کانال سیگنال استریم"
          price="50"
        />
      )}
    </div>
  );
};

export default SignalStreamServicePage;