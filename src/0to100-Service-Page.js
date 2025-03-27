import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Play } from 'lucide-react';

const ZeroTo100ServicePage = ({ isDarkMode, isOpen, onClose }) => {
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
            آموزش ۰ تا ۱۰۰ کریپتو
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">
          {/* Course Cover Card (Fixed at top) */}
          <div className="p-4">
            <div className="bg-[#141e35] rounded-3xl relative overflow-hidden border border-gray-500" style={{ minHeight: "180px" }}>
              {/* تصویر کاور */}
              <img 
                src="/0ta100.png" 
                alt="Zero to 100 Cover" 
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
              {/* Course Content List */}
              <div className="mb-6 p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">سر فصل های دوره صفر تا صد</h3>
                
                <div className="text-sm text-right mb-4">
                  <h3 className="text-white-400 font-bold mb-2">مهم: جهت جلوگیری از هرگونه کپی ناقص نام سرفصل ها و استراتژی های مهم در سرفصل ها ذکر نمیشود. محتوا های اصلی را داخل دوره مشاهده میکنید.</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-yellow-400">مقدمه:</h4>
                    <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
                      <li>کریپتو و فلسفه آن چیست ؟</li>
                      <li>توکن و کوین چیست ؟</li>
                      <li>بلاکچین چیست ؟</li>
                      <li>تریدر کیست و چرا ترید ؟</li>
                      <li>مفاهیم و اصطلاحات تریدینگ</li>
                      <li>روش های درآمد زایی در کریپتو</li>
                      <li>عوامل موفقیت در کریپتو</li>
                      <li>روش های کلاهبرداری</li>
                      <li>امنیت در کریپتو</li>
                      <li>اصطلاحات بازار</li>
                      <li>اصطلاحات معامله گری و اصطلاحات بلاکچین</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-yellow-400">نقشه راه:</h4>
                    <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
                      <li>نصب صرافی و آموزش کامل ( ۲ صرافی متفاوت )</li>
                      <li>نصب و آموزش تمامی ولت ها</li>
                      <li>آموزش کامل تریدینگ ویو</li>
                      <li>آموزش دیبانک</li>
                      <li>آموزش سایت های مانیتورینگ</li>
                      <li>آموزش سایت های انچین</li>
                      <li>بررسی و آموزش سایت های فاندامنتال</li>
                      <li>و...</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-yellow-400">مفاهیم تکنیکال:</h4>
                    <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
                      <li>آموزش ...</li>
                      <li>پرایس اکشن</li>
                      <li>اصطلاحات تکنیکال</li>
                      <li>کندل شناسی</li>
                      <li>مفهوم پولبک</li>
                      <li>فشار خرید و فروش ( مومنتوم )</li>
                      <li>استراتژی کانال</li>
                      <li>بریم اوت</li>
                      <li>تریدینگ رنج</li>
                      <li>استراتژی اینتری پرایس</li>
                      <li>موج شماری</li>
                      <li>انواع فیبوناچی</li>
                      <li>والیوم پروفایل</li>
                      <li>واگرایی</li>
                      <li>مووینگ اورج</li>
                      <li>و...</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-yellow-400">سر فصل های روانشناسی:</h4>
                    <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
                      <li>عوامل شکست در تریدینگ</li>
                      <li>عوامل موفقیت در کریپتو</li>
                      <li>از بین بردن ترس</li>
                      <li>شکست طمع</li>
                      <li>دید بیزنس به کریپتو</li>
                      <li>صبر عامل موفقیت</li>
                      <li>و...</li>
                    </ul>
                  </div>
                </div>
                
                <p className="mt-4 text-gray-300 text-right italic">برای آموزش کامل‌تر و جزئیات بیشتر در دوره با ما همراه باشید</p>
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
              ثبت نام در دوره
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZeroTo100ServicePage;