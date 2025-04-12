import React, { useState, useRef, useEffect } from 'react';
import { X, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MentorPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);
  const touchStartY = useRef(0);

  // انیمیشن نمایش کارت
  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  // بستن کارت با انیمیشن
  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  // اضافه کردن رویداد کشیدن به کل کارت
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // شروع کشیدن
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    // بررسی کشیدن به پایین
    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const diffY = currentY - touchStartY.current;
      
      // کشیدن به سمت پایین
      if (diffY > 0) {
        // باید بررسی کنیم که آیا در ناحیه اسکرول هستیم
        const content = document.querySelector('.scrollable-content');
        
        // اگر در منطقه هدر هستیم، یا در بالای محتوا هستیم
        if (!content || !e.target.closest('.scrollable-content') || content.scrollTop <= 5) {
          e.preventDefault();
          card.style.transform = `translateY(${diffY}px)`;
        }
      }
    };

    // پایان کشیدن و تصمیم‌گیری
    const handleTouchEnd = (e) => {
      const currentTransform = card.style.transform;
      const match = currentTransform.match(/translateY\(([0-9.]+)px\)/);
      
      if (match) {
        const translateY = parseFloat(match[1]);
        // اگر به اندازه کافی کشیده شده، کارت را ببندیم
        if (translateY > 80) {
          closeCard();
        } else {
          // برگشت به حالت اولیه
          card.style.transform = 'translateY(0)';
        }
      }
    };

    // اضافه کردن رویدادها
    card.addEventListener('touchstart', handleTouchStart);
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}
      onClick={closeCard}
    >
      <div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 w-full ${
          isDarkMode ? 'bg-[#0d1822]' : 'bg-white'
        } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر ثابت */}
        <div className="relative header-area">
          {/* ناحیه دستگیره - مخصوص کشیدن */}
          <div className="h-10 flex items-center justify-center handle-area">
            <div className="w-24 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* دکمه بستن */}
          <button 
            onClick={closeCard}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>

          {/* قسمت ثابت هدر */}
          <div className="px-6 pt-2">
            <div className="mb-4 text-center">
              <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-4 flex items-center justify-center">
                <Gauge className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                کوچینگ شخصی (منتور)
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                نحوه پیدا کردن میم کوین های پامپی
              </p>

              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                مناسب افرادی است که سرمایه بیش از 20000 هزار دلار دارند.
                با مشاوره مستقیم استاد اسد و استاد عرفان برای سرمایه گذاری هوشیارانتر و موفق تر زیر نظر اساتید.
              </p>
            </div>
          </div>
          
          {/* گرادینت متقابل در پایین هدر ثابت برای نرم کردن انتقال */}
          <div className="absolute bottom-[-44px] left-0 right-0 pointer-events-none z-[5]" style={{
            height: '30px',
            background: isDarkMode 
              ? 'linear-gradient(to bottom, rgba(13,24,34,1), rgba(13,24,34,0))' 
              : 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))'
          }}></div>
        </div>

        {/* محتوای قابل اسکرول */}
        <div className="overflow-y-auto h-[calc(92vh-200px)] pb-32 scrollable-content">
          <div className="px-6">
            {/* محتوای اصلی */}
            <div className="space-y-4 text-right" dir="rtl">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <h2 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  محتوای دوره
                </h2>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>آشنایی با اصول معاملات ارز دیجیتال</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>تحلیل تکنیکال پیشرفته بازارهای مالی</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>استراتژی‌های معاملاتی اختصاصی</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>مدیریت ریسک و سرمایه حرفه‌ای</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>پشتیبانی ۲۴/۷ از طریق تلگرام</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>مدیریت استراتژیک سرمایه‌گذاری</span>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <h2 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  مزایای استفاده از منتور
                </h2>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>جلوگیری از ضررهای سنگین در بازار</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>دریافت سیگنال‌های معاملاتی اختصاصی</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>طراحی استراتژی‌های مخصوص برای شما</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>برنامه‌ریزی ماهانه و هفتگی معاملات</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>آموزش مدیریت هیجانات در معاملات</span>
                  </li>
                </ul>
              </div>
              
              {/* محتوای اضافی که می‌تواند زیر دکمه ثابت اسکرول شود */}
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} mb-4`}>
                <h2 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  نحوه همکاری با منتور
                </h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  پس از ثبت‌نام در دوره، یک جلسه اختصاصی با منتور خواهید داشت تا استراتژی‌های متناسب با سرمایه شما طراحی شود. همه چیز بر اساس شرایط خاص شما تنظیم می‌شود.
                </p>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  تمامی جلسات به صورت آنلاین و با هماهنگی قبلی برگزار می‌شود. همچنین امکان ارتباط مستقیم با منتور از طریق تلگرام فراهم است.
                </p>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  در طول دوره، به طور منظم گزارش‌های پیشرفت دریافت خواهید کرد و استراتژی‌ها متناسب با شرایط بازار تنظیم می‌شوند.
                </p>
              </div>
              
              {/* محتوای اضافی برای نمایش اسکرول */}
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} mb-4`}>
                <h2 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  نظرات کاربران
                </h2>
                <div className={`p-3 rounded-lg mb-2 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/70'}`}>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                    «با استفاده از راهنمایی‌های منتورم توانستم در یک ماه بازدهی 40 درصدی کسب کنم. بدون شک بهترین سرمایه‌گذاری زندگی‌ام بود.»
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-left`}>
                    - محمد رضایی
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg mb-2 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/70'}`}>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
                    «استراتژی‌های استاد اسد به من کمک کرد تا از ضررهای بزرگ جلوگیری کنم و با مدیریت سرمایه صحیح، رشد پایداری داشته باشم.»
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-left`}>
                    - علی محمدی
                  </p>
                </div>
              </div>
              
              {/* محتوای اضافی دیگر برای تست اسکرول */}
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} mb-4`}>
                <h2 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  سوالات متداول
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      آیا برای استفاده از خدمات منتورینگ نیاز به دانش قبلی دارم؟
                    </p>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      خیر، منتور شما را از سطح پایه تا پیشرفته راهنمایی خواهد کرد. با این حال، آشنایی اولیه با مفاهیم بازار ارز دیجیتال مفید خواهد بود.
                    </p>
                  </div>
                  
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      چه تضمینی برای سودآوری وجود دارد؟
                    </p>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      بازارهای مالی همواره با ریسک همراه هستند، اما منتور به شما کمک می‌کند تا با مدیریت ریسک صحیح، احتمال موفقیت خود را افزایش دهید.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* دکمه ثابت در پایین */}
        <div className="absolute bottom-6 left-4 right-4 z-10">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-bold hover:bg-[#e5c44c] transition-colors shadow-lg"
          >
            ثبت نام در دوره منتورینگ
          </button>
        </div>
        
        {/* گرادینت مشکی به شفاف از پایین به بالا */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]" style={{
          height: '90px',
          background: isDarkMode 
            ? 'linear-gradient(to top, rgba(13,24,34,1), rgba(13,24,34,0))' 
            : 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))'
        }}></div>
      </div>
    </div>
  );
};

export default MentorPage;