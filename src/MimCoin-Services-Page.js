import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Play, ShoppingCart, DoorOpen, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentCard from './PaymentCard'; 
import { PRODUCT_PRICES } from './config';
import VideoPlayer from './VideoPlayer';

const MimCoinServicesPage = ({ isDarkMode, isOpen, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showPaymentCard, setShowPaymentCard] = useState(false);
  const [addedToHistory, setAddedToHistory] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isRenewal, setIsRenewal] = useState(false);
  const [renewingProduct, setRenewingProduct] = useState(null);
  const [hasMimCoinSubscription, setHasMimCoinSubscription] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl] = useState('https://iamvakilet.ir/learn/mimcoin.mp4');

  useEffect(() => {
    // بررسی آیا کاربر در حال تمدید اشتراک است یا خیر
    const renewalInfo = sessionStorage.getItem('renewProduct');
    if (renewalInfo) {
      try {
        const productInfo = JSON.parse(renewalInfo);
        setRenewingProduct(productInfo);
        setIsRenewal(true);
        
        // پاک کردن اطلاعات بعد از استفاده
        sessionStorage.removeItem('renewProduct');
      } catch (e) {
        console.error('خطا در پردازش اطلاعات تمدید:', e);
      }
    }
  }, []);

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
      window.history.pushState({ mimCoinPage: true }, '', location.pathname);
      setAddedToHistory(true);
    }
  
    // افزودن event listener برای popstate
    window.addEventListener('popstate', handleBackButton);
    
    // تمیزکاری event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, addedToHistory, location.pathname]);

  // این useEffect را اضافه کنید
  useEffect(() => {
    const checkMimCoinStatus = () => {
      const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (userToken) {
        const purchasedProductsStr = localStorage.getItem('purchasedProducts');
        
        if (purchasedProductsStr) {
          try {
            const purchasedProducts = JSON.parse(purchasedProductsStr);
            const mimCoinSubscription = purchasedProducts.find(p => 
              p.title && p.title.includes(' میم کوین باز') && p.status === 'active'
            );
            
            setHasMimCoinSubscription(!!mimCoinSubscription);
          } catch (error) {
            console.error('خطا در پردازش اطلاعات محصولات:', error);
          }
        }
      }
    };
    
    checkMimCoinStatus();
  }, []);

  const closeCard = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      setAddedToHistory(false);
      onClose();
    }, 300);
  };

  // تابع جدید برای باز کردن کارت پرداخت
  const handlePurchase = () => {
    // بررسی وضعیت لاگین کاربر
    const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    
    if (!userToken) {
      // اگر کاربر لاگین نیست، به صفحه لاگین هدایت می‌شود
      navigate('/login');
      return;
    }
    
    // اگر کاربر لاگین است، کارت پرداخت را نمایش می‌دهیم
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
             کانال میم کوین باز
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">
          {/* Header area with MimCoin Card (Fixed) */}
          <div className="relative header-area">
            {/* MimCoin Card */}
            <div className="p-4">
              <div className="bg-[#141e35] rounded-3xl relative overflow-hidden border border-gray-500" style={{ minHeight: "180px" }}>
                {/* تصویر کاور */}
                <img 
                  src="/Services/mimCoin.jpg" 
                  alt="MimCoin Cover" 
                  className="w-full h-full object-cover absolute inset-0"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    onClick={() => setShowVideo(true)}
                    className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center z-10 hover:bg-white/90 transition-colors"
                  >
                    <Play size={36} className="text-black-500 ml-1" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Gradient transition overlay */}
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
            
             {/* کادر اول */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">چرا میم کوین؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      در دو سال اخیر با توجه به دستکاری های بزرگی که در بازار کریپتو انجام میشد فرصت از مردم عادی در بازار گرفته شد و عملا ونچر کپیتال ها و سازمان های بزرگ از این بازار بیشترین سود رو گرفتند.
    </p>
    <p>
      این عامل باعث ایجاد نا عدالتی و شانس کم برای رشد سرمایه برای ریتیل شد . به همین علت حوزه میم کوین ها رونق پیدا کرد .
    </p>
    <p>
      میم کوین ها این شانس رو برای افراد ایجاد کردند تا بتوانند سود های بزرگی رو کسب کنند .
    </p>
  </div>
</div>

{/* کادر دوم */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">نتایج عملکرد ما</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      در دو سال گذشته موقعیت های بسیار بزرگی رو در حوزه میم کوین ها شکار کردیم که سود های بسیار بزرگی برای ما و مخاطبان ما ایجاد کرد
    </p>
    <p>
      موقعیت هایی با سود های <span className="text-green-400 font-bold">۲۵۰ برابری</span> و حتی <span className="text-green-400 font-bold">بالای صد برابر</span>
    </p>
    <p>
      بیش از <span className="text-yellow-400 font-bold">۳۵ موقعیتی</span> داشتیم که سود <span className="text-green-400 font-bold">بالا ۸ برابر</span> به ما داد
    </p>
    <p>
      از این رو تصمیم گرفتیم تا این خدمات را در کانالی جداگانه با هزینه اندک برای مخاطبان خود داشته باشیم .
    </p>
  </div>
</div>

{/* کادر سوم */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">این کانال مناسب چه کسانی است؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      این کانال مناسب افرادی است که سرمایه و صبر کمتری دارند و دنبال این هستند که فقط روی میم کوین ها ترید کنند . برآیند این کانال به نسبت مبلغ پرداختی بسیار ارزنده هستش.
    </p>
    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mt-3">
      <p className="text-red-300 font-medium">
        ⚠️ دقت داشته باشید بازار میم کوین ها بازار ریسکی هستش و پامپ و دامپ زیاد اتفاق می افتد و نیاز مند ایجاد لوپ مالی برای رشد حساب است
      </p>
    </div>
  </div>
</div>

{/* خدمات ارائه شده */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">خدمات ارائه شده در کانال</h3>
  <ul className="list-disc list-inside space-y-2 pr-4 text-right text-sm">
    <li>معرفی و سیگنال دقیق میم کوین</li>
    <li>معرفی واچلیست</li>
    <li>معرفی میم کوین های جدید بازار</li>
    <li>آموزش ابتدایی تا متوسط</li>
    <li>مدیریت سرمایه</li>
  </ul>
</div>
              
              {/* Course Price */}
              {!hasMimCoinSubscription && (
                <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-yellow-400 text-right">قیمت دوره:</h3>
                      <p className="text-2xl font-bold text-green-500">{PRODUCT_PRICES.MEM_COIN} دلار</p>
                    </div>
                    <div className="bg-yellow-500/20 text-yellow-400 rounded-xl p-2 text-sm">
                      <p>دسترسی نامحدود</p>
                      <p>آپدیت دائمی</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]" style={{
            height: '90px',
            background: 'linear-gradient(to top, rgba(0,0,0,100), rgba(0,0,0,0))'
          }}></div>
          
          {isRenewal && (
            <div className="absolute bottom-20 left-4 right-4 p-4 rounded-xl bg-[#141e35] text-white mt-2 mb-4" dir="rtl">
              <p className="text-sm">
                شما در حال تمدید <span className="text-yellow-500 font-bold">{renewingProduct?.title}</span> هستید.
                این تمدید به مدت زمان باقی‌مانده اشتراک فعلی شما اضافه خواهد شد.
              </p>
            </div>
          )}

          {/* Fixed Button at Bottom */}
          <div className="absolute bottom-6 left-4 right-4 z-10">
            <button 
              onClick={hasMimCoinSubscription 
                ? () => navigate('/mimcoin')
                : () => handlePurchase({ 
                    title: "کانال میم کوین", 
                    price: PRODUCT_PRICES.MEM_COIN, 
                    months: 6 
                  })
              }
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center"
              dir="rtl"
            >
              <span>
                {hasMimCoinSubscription ? 'ورود به کانال میم کوین باز' : (isRenewal ? 'تمدید اشتراک' : 'خرید کانال میم کوین باز')}
              </span>
              {/* نمایش آیکون متفاوت بر اساس وضعیت اشتراک */}
              {hasMimCoinSubscription 
                ? <DoorOpen size={24} className="mr-2" /> 
                : <ShoppingCart size={24} className="mr-2" />
              }
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Card Component */}
      {showPaymentCard && (
        <PaymentCard
          isDarkMode={isDarkMode}
          onClose={() => setShowPaymentCard(false)}
          productTitle="کانال میم کوین"
          price={PRODUCT_PRICES.MEM_COIN}
        />
      )}

      {/* Video Player */}
      {showVideo && (
        <VideoPlayer
          videoUrl={videoUrl}
          title="ویدیو معرفی آموزش میم کوین"
          isDarkMode={isDarkMode}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );
};

export default MimCoinServicesPage;