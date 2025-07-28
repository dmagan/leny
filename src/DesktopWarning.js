import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

// تابع تشخیص دستگاه ساده‌شده
const detectDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const userAgentLower = userAgent.toLowerCase();
  
  // بررسی ابعاد صفحه
  const screenWidth = window.screen?.width || window.innerWidth;
  const screenHeight = window.screen?.height || window.innerHeight;
  
  // اگر اندروید در User Agent هست، موبایل محسوب می‌شود
  const isAndroid = userAgentLower.includes('android');
  
  // اگر iOS در User Agent هست، موبایل محسوب می‌شود  
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  
  // اگر عرض کمتر از 1200 پیکسل است، موبایل محسوب می‌شود
  const isSmallScreen = screenWidth < 1200;
  
  // اگر touch support دارد، موبایل محسوب می‌شود
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // فقط اگر هیچ کدام از شرایط بالا برقرار نباشد، دسکتاپ است
  const isRealDesktop = !isAndroid && !isIOS && !isSmallScreen && !hasTouchSupport;
  
  return {
    isMobile: !isRealDesktop,
    isDesktop: isRealDesktop,
    userAgent: userAgentLower,
    screenWidth,
    isAndroid,
    isIOS
  };
};

const DesktopWarning = ({ isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);

  // غیرفعال کردن کلیک راست
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // اضافه کردن event listener برای غیرفعال کردن کلیک راست
    document.addEventListener('contextmenu', handleContextMenu);
    
    // پاکسازی event listener
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    // تشخیص دستگاه بعد از لود شدن کامپوننت
    const device = detectDevice();
    setDeviceInfo(device);
    
    console.log('Device detection result:', device); // برای دیباگ
    
    // فقط برای دسکتاپ واقعی هشدار نمایش داده شود
    if (device.isDesktop && !device.isMobile && !device.isAndroidWebView) {
      // تاخیر کوتاه برای اطمینان از لود شدن صفحه
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // اگر موبایل یا WebView یا تبلت باشد، هیچ چیز نمایش نده
  if (!deviceInfo || !deviceInfo.isDesktop || deviceInfo.isMobile || deviceInfo.isAndroidWebView || !isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[1000] bg-black flex items-center justify-center"
      // جلوگیری از انتخاب متن
      style={{ userSelect: 'none' }}
    >
      <div className="relative w-full max-w-md mx-auto">
        <div className={`p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl mx-4 shadow-lg`}>
          <div className="flex justify-center mb-8 mt-4">
            <Monitor size={64} className="text-red-500" />
          </div>  

          <div className="space-y-6 text-center" dir="rtl">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>توجه!</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              این برنامه فقط برای استفاده در گوشی‌های هوشمند و تبلت طراحی شده است.
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              لطفاً با گوشی یا تبلت خود به این سایت مراجعه کنید.
            </p>
            <div className="flex justify-center mt-4">
              <Smartphone size={48} className="text-blue-400" />
            </div>
          </div>

          {/* دکمه بستن برای تست */}
          <button
            onClick={() => setIsVisible(false)}
            className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            ادامه با دسکتاپ (فقط برای تست)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopWarning;