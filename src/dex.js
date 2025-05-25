// src/dex.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';

const PlayButton = ({ isActive }) => (
  <svg 
    width="32" height="32" viewBox="0 0 32 32" 
    fill="none" xmlns="http://www.w3.org/2000/svg" 
    className="cursor-pointer transition-colors"
  >
    <circle cx="16" cy="16" r="15" 
      stroke={isActive ? "#F7D55D" : "#4B5563"} strokeWidth="2"/>
    <path 
      d="M20.5 15.134C21.1667 15.5189 21.1667 16.4811 20.5 16.866L14.5 20.3301C13.8333 20.715 13 20.2339 13 19.4641L13 12.5359C13 11.7661 13.8333 11.285 14.5 11.6699L20.5 15.134Z" 
      fill={isActive ? "#F7D55D" : "#4B5563"}
    />
  </svg>
);

const episodes = [
  { 
    id: 0,
    title: "مقدمه", 
    duration: "10 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/intro.mp4"
  },
  { 
    id: 1, 
    title: "قسمت اول: مقدمه و آشنایی با مفاهیم DEX", 
    duration: "37 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/01.mp4"
  },
  { 
    id: 2, 
    title: "قسمت دوم: نحوه ثبت نام در DEX و انتقال ارز", 
    duration: "29 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/02.mp4"  },
  { 
    id: 3, 
    title: "قسمت سوم: آشنایی با کیف پول‌های DEX", 
    duration: "19 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/03.mp4"  },
  { 
    id: 4, 
    title: "قسمت چهارم: نحوه خرید و فروش در DEX", 
    duration: "31 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/04.mp4"  },
  { 
    id: 5, 
    title: "قسمت پنجم: مدیریت ریسک در معاملات DEX", 
    duration: "34 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/05.mp4"  },
  { 
    id: 6, 
    title: "قسمت ششم: استراتژی‌های معاملاتی در DEX", 
    duration: "22 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/06.mp4"  },
  { 
    id: 7, 
    title: "قسمت هفتم: تحلیل تکنیکال در DEX", 
    duration: "24 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/07.mp4"  },
  { 
    id: 8, 
    title: "قسمت هشتم: تحلیل فاندامنتال در DEX", 
    duration: "02 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/08.mp4"  },
  { 
    id: 9, 
    title: "قسمت نهم: مدیریت سرمایه در DEX", 
    duration: "15 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/09.mp4"  },
  { 
    id: 10, 
    title: "قسمت دهم: شناسایی فرصت‌های معاملاتی", 
    duration: "09 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/10.mp4"  },
  { 
    id: 11, 
    title: "قسمت یازدهم: اتوماسیون معاملات در DEX", 
    duration: "22 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/11.mp4"  },
  { 
    id: 12, 
    title: "قسمت دوازدهم: مدیریت پورتفولیو در DEX", 
    duration: "34 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/12.mp4"  },
  { 
    id: 13, 
    title: "قسمت سیزدهم: استراتژی‌های پیشرفته معاملاتی", 
    duration: "47 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/13.mp4"  },
  { 
    id: 14, 
    title: "قسمت آخر: توضیح مسیر از زمان روشن کردن کامپیوتر تا انتها به علاوه یک سوپرایز واچ لیست میم کوین\n\nکاربرانی که vip هستند نیازی به واچ لیست ندارند و مستقیم به آنها اعلام خواهد شد", 
    duration: "30 دقیقه",
    videoUrl: "https://iamvakilet.ir/dex/14.mp4"  }
];

const DexPage = ({ isDarkMode, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  
  // انیمیشن
  const [showDexPage, setShowDexPage] = useState(false);
  const [dexPageExiting, setDexPageExiting] = useState(false);

  // مدیریت دکمه بازگشت و انیمیشن
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      closeDexPage();
    };

    // اگر صفحه باز است، یک state به تاریخچه اضافه کنیم
    if (isOpen) {
      window.history.pushState({ dexPage: true }, '');
      
      // انیمیشن ورود
      setTimeout(() => {
        setShowDexPage(true);
      }, 100);
    }
    
    // شنونده برای رویداد popstate (فشردن دکمه برگشت)
    window.addEventListener('popstate', handleBackButton);
    
    // پاکسازی event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen]);

  // بستن صفحه
  const closeDexPage = useCallback(() => {
    setDexPageExiting(true);
    setTimeout(() => {
      setShowDexPage(false);
      setDexPageExiting(false);
      onClose ? onClose() : navigate(-1);
    }, 300);
  }, [onClose, navigate]);

  const handleEpisodeClick = (episode) => {
    setActiveEpisode(episode);
    setShowVideo(true);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
    setActiveEpisode(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: dexPageExiting ? 0 : (showDexPage ? 1 : 0),
        pointerEvents: showDexPage ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: dexPageExiting 
            ? 'translateX(100%)' 
            : `translateX(${showDexPage ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
        }}
        dir="rtl"
      >
        <div className="absolute top-0 left-0 right-0 z-30">
          <div className="relative h-16 flex items-center px-4">
            {!showVideo && (
              <>
                <button 
                  onClick={closeDexPage}
                  className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
                >
                  <ArrowLeftCircle className="w-8 h-8" />
                </button>
                <h1 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  آموزش دکس تریدینگ
                </h1>
              </>
            )}
          </div>
        </div>

        {showVideo && activeEpisode && (
          <div className="absolute top-16 left-0 right-0 z-20">
            <VideoPlayer
              videoUrl={activeEpisode.videoUrl}
              title={activeEpisode.title}
              isDarkMode={isDarkMode}
              onClose={handleCloseVideo}
            />
          </div>
        )}

        <div className={`absolute ${showVideo ? 'top-[calc(4rem+56.25vw)]' : 'top-16'} bottom-0 left-0 right-0 overflow-y-auto`}>
          <div className="p-4 pb-4">
            <div className="space-y-3">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => handleEpisodeClick(episode)}
                  className={`p-4 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-700 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-center">
                      <PlayButton isActive={activeEpisode?.id === episode.id} />
                    </div>
                    <div className="flex-1 mr-4">
                      <h3 className="font-medium whitespace-pre-line text-right">
                        <bdi>{episode.title}</bdi>
                      </h3>
                      <p className={`text-sm mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {episode.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DexPage;