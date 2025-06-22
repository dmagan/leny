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
const [days, setDays] = useState(3);
const [hours, setHours] = useState(0);
const [minutes, setMinutes] = useState(0);
const [seconds, setSeconds] = useState(0);
const [countdownEnded, setCountdownEnded] = useState(false);


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
          }
        }
      }
    };
    
    checkMimCoinStatus();
  }, []);


// useEffect برای شمارنده 4 روزه
useEffect(() => {
  // تاریخ پایان: 4 روز از امروز
  const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 3);
  targetDate.setHours(23, 59, 59, 999); // پایان روز
  
  const interval = setInterval(() => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();
    
    if (difference <= 0) {
      // زمان به پایان رسیده
      setDays(0);
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      setCountdownEnded(true);
      clearInterval(interval);
    } else {
      // محاسبه زمان باقیمانده
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      
      setDays(d);
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    }
  }, 1000);
  
  // پاکسازی interval در زمان unmount
  return () => clearInterval(interval);
}, []);

// اضافه کردن CSS برای انیمیشن countdown
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = `
    .countdown {
      line-height: 1;
      display: inline-flex;
    }
    .countdown > * {
      height: 1em;
      overflow-y: hidden;
    }
    .countdown > *:before {
      content: "00\\A 01\\A 02\\A 03\\A 04\\A 05\\A 06\\A 07\\A 08\\A 09\\A 10\\A 11\\A 12\\A 13\\A 14\\A 15\\A 16\\A 17\\A 18\\A 19\\A 20\\A 21\\A 22\\A 23\\A 24\\A 25\\A 26\\A 27\\A 28\\A 29\\A 30\\A 31\\A 32\\A 33\\A 34\\A 35\\A 36\\A 37\\A 38\\A 39\\A 40\\A 41\\A 42\\A 43\\A 44\\A 45\\A 46\\A 47\\A 48\\A 49\\A 50\\A 51\\A 52\\A 53\\A 54\\A 55\\A 56\\A 57\\A 58\\A 59\\A 60\\A 61\\A 62\\A 63\\A 64\\A 65\\A 66\\A 67\\A 68\\A 69\\A 70\\A 71\\A 72\\A 73\\A 74\\A 75\\A 76\\A 77\\A 78\\A 79\\A 80\\A 81\\A 82\\A 83\\A 84\\A 85\\A 86\\A 87\\A 88\\A 89\\A 90\\A 91\\A 92\\A 93\\A 94\\A 95\\A 96\\A 97\\A 98\\A 99\\A";
      white-space: pre;
      position: relative;
      top: calc(var(--value) * -1em);
      text-align: center;
      transition: top 1s cubic-bezier(1, 0, 0, 1);
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
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
    {/* Gradient background */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#141e35]"></div>
    </div>
    
{/* Content */}
<div className="relative z-10 flex flex-col items-center justify-center text-white text-center h-full">
  {countdownEnded ? (
    <div className="text-center">
      <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif" }}>
        پایان
      </div>
      <p className="text-red-500 font-bold text-lg mt-2">مهلت به پایان رسیده است</p>
    </div>
  ) : (
<div className="text-center pt-12">
  <div className="grid grid-flow-col gap-2 text-center auto-cols-max justify-center">
    <div className="flex flex-col p-2 bg-black/40 rounded-lg text-white min-w-[70px]">
      <span className="countdown font-mono text-4xl font-bold">
        <span style={{"--value": days}} />
      </span>
      <span className="text-xs mt-1">روز</span>
    </div>
    <div className="flex flex-col p-2 bg-black/40 rounded-lg text-white min-w-[70px]">
      <span className="countdown font-mono text-4xl font-bold">
        <span style={{"--value": hours}} />
      </span>
      <span className="text-xs mt-1">ساعت</span>
    </div>
    <div className="flex flex-col p-2 bg-black/40 rounded-lg text-white min-w-[70px]">
      <span className="countdown font-mono text-4xl font-bold">
        <span style={{"--value": minutes}} />
      </span>
      <span className="text-xs mt-1">دقیقه</span>
    </div>
    <div className="flex flex-col p-2 bg-black/40 rounded-lg text-white min-w-[70px]">
      <span className="countdown font-mono text-4xl font-bold">
        <span style={{"--value": seconds}} />
      </span>
      <span className="text-xs mt-1">ثانیه</span>
    </div>
  </div>
  <p className="text-yellow-500 font-bold text-lg mt-3">تعداد محدود</p>
</div>
  )}
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
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">📌 چرا این کانال راه‌اندازی شد؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      در دو سال اخیر، بازار کریپتو پر از دستکاری‌های سازمان‌یافته بود. سرمایه‌گذاران بزرگ (مثل ونچر کپیتال‌ها) سودهای اصلی را بردند، و فرصت از دست مردم عادی گرفته شد.
    </p>
    <p>
      اما در همین شرایط، میم‌کوین‌ها تبدیل به تنها شانسی شدند که افراد عادی می‌توانند رشد سرمایه‌ای واقعی داشته باشند.
    </p>
  </div>
</div>

{/* کادر دوم */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">✅ ما چه کردیم؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      ما در این مدت بیش از <span className="text-yellow-400 font-bold">۳۵ موقعیت قوی</span> شکار کردیم،
    </p>
    <p>
      📈 با سودهایی تا <span className="text-green-400 font-bold">۲۵۰ برابر</span>
    </p>
    <p>
      📈 و چندین موقعیت با سود <span className="text-green-400 font-bold">۸ تا ۱۰۰ برابر</span>
    </p>
    <p>
      این تجربه باعث شد تصمیم بگیریم کانالی جدا با هزینه‌ای بسیار کم برای ارائه این خدمات راه‌اندازی کنیم — مخصوص کسانی که می‌خواهند فقط روی میم‌کوین‌ها تمرکز کنند.
    </p>
  </div>
</div>

{/* کادر سوم */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">🎯 این کانال برای کیست؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>مناسب کسانی که:</p>
    <ul className="list-disc list-inside space-y-2 pr-4 text-right text-sm">
      <li>سرمایه و صبر زیادی ندارند</li>
      <li>فقط دنبال سود از میم‌کوین‌ها هستند</li>
      <li>می‌خواهند با ریسک کنترل‌شده، سود بالا بگیرند</li>
    </ul>
    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mt-3">
      <p className="text-red-300 font-medium">
        ولی مهمه بدونی: بازار میم‌کوین پر از پامپ و دامپ هست. ما هیچ موقعیت شانسی یا بدون تحلیل نمی‌ذاریم.
        هر میم کوین قبل از معرفی، باید از فیلتر دقیق ما رد بشه.
      </p>
    </div>
  </div>
</div>

{/* خدمات ارائه شده */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">💼 خدماتی که دریافت می‌کنید:</h3>
  <ul className="list-disc list-inside space-y-2 pr-4 text-right text-sm">
    <li>سیگنال دقیق میم‌کوین‌ها</li>
    <li>معرفی واچ‌لیست‌ها</li>
    <li>معرفی میم کوین‌های تازه بازار</li>
    <li>آموزش ابتدایی تا متوسط</li>
    <li>مدیریت سرمایه و ساخت لوپ مالی و رشد حساب</li>
  </ul>
</div>


{/* چرا قیمت ارزون */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">💰 چرا قیمت اینقدر ارزونه؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      چون می‌دونیم خیلی‌ها مخصوصاً در افغانستان و ایران توان اشتراک در گروه VIP ما رو ندارن.
    </p>
    <p>ما این پلن رو راه انداختیم تا:</p>
    <ol className="list-decimal list-inside space-y-2 pr-4 text-right text-sm">
      <li>شما هم سود کنید</li>
      <li>صادقانه از کار ما سود میکنی، بعداً خدمات بیشتر از ما میخری وگرنه ۱۵ دلار پولی نیست.</li>
      <li>اگر دلت خواست، از سودهایی که گرفتی، یه درصد دلخواه هم برامون بفرستی (کاملاً اختیاری) به ما انرژی میدین تا با قدرت موقعیت ناب دیگر پیدا کنیم.</li>
    </ol>
  </div>
</div>

{/* مشورت آخر */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">✍️ مشورت آخر</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      حداقل سه ماه کنار ما باش تا نتیجه واقعی ببینی.
    </p>
    <p>
      چون همیشه بازار فرصت نمی‌ده، ولی وقتی بده… باید داخل بازی باشی!
    </p>
  </div>
</div>
              
              {/* Course Price */}
              {!hasMimCoinSubscription && (
                <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-yellow-400 text-right">قیمت کانال:</h3>
                      <p className="text-2xl font-bold text-green-500">{PRODUCT_PRICES.MEM_COIN} دلار</p>
                    </div>
                    <div className="bg-yellow-500/20 text-yellow-400 rounded-xl p-2 text-sm">
                      <p>اشتراک ماهانه</p>
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