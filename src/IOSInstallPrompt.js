import React, { useState, useEffect } from 'react';
import { Share, SquarePlus, ChevronsDown, X, Smartphone, Monitor } from 'lucide-react';

// توابع تشخیص دستگاه
const detectDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // تشخیص iOS (آیفون و آیپد)
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  
  // تشخیص دستگاه موبایل یا تبلت به صورت کلی
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return {
    isIOS,
    isMobile,
    isDesktop: !isMobile
  };
};

// برای ذخیره وضعیت نمایش پیام در localStorage
export const setPromptAsSeen = () => {
  localStorage.setItem('iosPromptSeen', 'true');
};

export const hasSeenPrompt = () => {
  return localStorage.getItem('iosPromptSeen') === 'true';
};

// کامپوننت هشدار برای دسکتاپ
const DesktopWarning = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-black bg-opacity-85 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto">
        <button
          className="absolute top-4 right-7 w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-full"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="p-6 bg-gray-900 bg-opacity-90 rounded-md mx-4">
          <div className="flex justify-center mb-8 mt-4">
            <Monitor size={64} className="text-red-500" />
          </div>

          <div className="space-y-6 text-center" dir="rtl">
            <h2 className="text-white text-xl font-bold">توجه!</h2>
            <p className="text-white">
              این برنامه فقط برای استفاده در گوشی‌های هوشمند و تبلت طراحی شده است.
            </p>
            <p className="text-white">
              لطفاً با گوشی یا تبلت خود به این سایت مراجعه کنید.
            </p>
            <div className="flex justify-center mt-4">
              <Smartphone size={48} className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// کامپوننت اصلی IOSInstallPrompt
const IOSInstallPrompt = ({ isDarkMode, onClose }) => {
  const handleClose = () => {
    setPromptAsSeen();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black bg-opacity-85 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto">
        {/* دکمه بستن */}
        <button className="absolute top-4 right-7 w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-full" onClick={handleClose}>
          <X size={20} />
        </button>

        {/* محتوای اصلی */}
        <div className="p-6 bg-gray-900 bg-opacity-90 rounded-md mx-4">
          {/* لوگو */}
          <div className="flex justify-center mb-8 mt-4">
            <img src="/Logo-App2.png" alt="PCS Logo" className="w-24 h-24" />
          </div>

          {/* مراحل نصب */}
          <div className="space-y-6 text-right" dir="rtl">
            <p className="text-white">
              ۱- در نوار پایین گوشی روی کلید{' '}
              <span className="inline-flex items-center justify-center bg-gray-300 w-8 h-8 rounded text-blue-500">
                <Share size={24} />
              </span>{' '}
              کلیک کنید.
            </p>

            <p className="text-white">
              ۲- منوی باز شده را به بالا اسکرول کنید و روی کلید{' '}
              <span className="inline-flex items-center justify-center bg-gray-200 text-black text-xs px-2 py-1 rounded mx-1">
                <SquarePlus size={16} /> Add to Home Screen
              </span>{' '}
              کلیک کنید.
            </p>

            <p className="text-white">
              ۳- در پایان در بالای صفحه سمت راست روی کلید{' '}
              <span className="inline-flex items-center justify-center bg-gray-300 w-16 h-6 rounded text-blue-500 ml-2">
                <strong className="font-black">Add</strong>
              </span>{' '}
              کلیک کنید.
            </p>

            <p className="text-white">
             توجه : می بایست از مروگر سافاری استفاده کنید{' '}
            </p>
          </div>
        </div>

        {/* فلش پایین — انیمیشن بالا/پایین */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center animate-bounce z-50">
          <ChevronsDown size={64} className="text-white" />
        </div>
      </div>
    </div>
  );
};

// کامپوننت اصلی که بر اساس نوع دستگاه، پیام مناسب را نمایش می‌دهد
const DeviceDetectionWrapper = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    // تشخیص دستگاه بعد از لود شدن کامپوننت
    const device = detectDevice();
    setDeviceInfo(device);
    
    // نمایش پیام اگر دستگاه iOS باشد و قبلاً پیام را ندیده باشد
    // یا اگر دستگاه دسکتاپ باشد
    if ((device.isIOS && !hasSeenPrompt()) || device.isDesktop) {
      setShowPrompt(true);
    }
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deviceInfo) return null;

  // نمایش پیام مناسب بر اساس نوع دستگاه
  return deviceInfo.isDesktop ? (
    <DesktopWarning onClose={handleClose} />
  ) : deviceInfo.isIOS ? (
    <IOSInstallPrompt onClose={handleClose} />
  ) : null;
};

export default DeviceDetectionWrapper;