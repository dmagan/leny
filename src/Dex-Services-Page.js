import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Play } from 'lucide-react';

const DexServicesPage = ({ isDarkMode, isOpen, onClose }) => {
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
            کلاس حرفه‌ای دکس تریدینگ
          </h2>
        </div>

  {/* Main Content Area */}
<div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">
  {/* Dex Trading Card (Fixed at top) */}
  <div className="p-4">
    <div className="bg-[#141e35] rounded-3xl relative overflow-hidden border border-gray-500" style={{ minHeight: "180px" }}>
      {/* تصویر کاور */}
      <img 
        src="/cover-dex.jpg" 
        alt="Dex Trading Cover" 
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
      {/* Dex Services List */}
      <div className="mb-6 p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
        <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">محتوای دوره دکس تریدینگ:</h3>
        
        <div className="text-sm text-right mb-4">
          <h3 className="text-white-400 font-bold mb-2">مهم: جهت جلوگیری از هرگونه کپی ناقص نام سرفصل ها و استراتژی های مهم در سرفصل ها ذکر نمیشود. محتوا های اصلی را داخل دوره مشاهده میکنید.</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-yellow-400">فصل اول</h4>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
              <li>دکس تریدینگ چیست</li>
              <li>ورود به دکس تریدینگ</li>
              <li>فلسفه میم کوین ها و دکس</li>
              <li>روش تشخیص جم ها</li>
              <li>پلتفرم شکار جم ها</li>
              <li>بررسی ونچر کپیتال ها</li>
              <li>نحوه ترید در دکس</li>
              <li>مفاهیم و اصطلاحات دکس تریدینگ</li>
              <li>نحوه ایجاد واچلیست</li>
              <li>روانشناسی دکس تریدینگ</li>
              <li>مدیریت سرمایه در دکس</li>
              <li>لوپ مالی</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-yellow-400">فصل دوم</h4>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
              <li>امنیت توکن</li>
              <li>شناخت مفاهیم امنیتی</li>
              <li>بررسی امنیت پلتفرم</li>
              <li>بررسی سلامت توکن و سوشال</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-yellow-400">فصل سوم</h4>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
              <li>آموزش پلتفرم های مورد نیاز</li>
              <li>دکس تولز</li>
              <li>دکس اسکرینر</li>
              <li>توییت اسکات</li>
              <li>راک چک</li>
              <li>اوردر بوک های انچین</li>
              <li>کریپتو متر</li>
              <li>کوین گکو</li>
              <li>کوین مارکت کپ</li>
              <li>اکسپلورر</li>
              <li>و ۱۵ پلتفرم تخصصی</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-yellow-400">فصل چهارم</h4>
            <ul className="list-disc list-inside space-y-1 pr-4 mt-1">
              <li>فیلترینگ میم کوین ها</li>
              <li>بررسی میم کوین پامپی</li>
              <li>تشخیص میم کوین های پامپی</li>
              <li>ستاپ های معاملاتی</li>
              <li>ریسک به ریوارد در میم کوین ها</li>
              <li>آموزش ۳ استراتژی تخصصی میم کوین ها</li>
              <li>ستاپ های ورود</li>
              <li>ستاپ خروج از میم کوین</li>
              <li>تکنیکال در میم کوین ها</li>
              <li>داده های انچین</li>
              <li>ولت ترکینگ</li>
            </ul>
          </div>
        </div>
        
        <p className="mt-4 text-gray-300 text-right italic">و مفاهیم و استراتژی های اختصاصی که برای جلوگیری از افشای ناقص آن محرمانه می‌باشد</p>
      </div>
    </div>
  </div>
  
  {/* Fixed Button at Bottom */}
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

export default DexServicesPage;