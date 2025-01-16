import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, ChevronDownCircle, ChevronUpCircle } from 'lucide-react';
import VideoPlayer from './VideoPlayer'; // اضافه کردن import



// اول این کامپوننت رو بالای فایل اضافه کنید
const PlayButton = ({ isActive }) => (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="cursor-pointer transition-colors"
    >
      <circle 
        cx="16" 
        cy="16" 
        r="15" 
        stroke={isActive ? "#F7D55D" : "#4B5563"} 
        strokeWidth="2"
      />
      <path 
        d="M20.5 15.134C21.1667 15.5189 21.1667 16.4811 20.5 16.866L14.5 20.3301C13.8333 20.715 13 20.2339 13 19.4641L13 12.5359C13 11.7661 13.8333 11.285 14.5 11.6699L20.5 15.134Z" 
        fill={isActive ? "#F7D55D" : "#4B5563"}
      />
    </svg>
  );

const episodes = [
  { id: 1, title: "قسمت اول: مقدمه و آشنایی با مفاهیم دکس", duration: "45 دقیقه" },
  { id: 2, title: "قسمت دوم: تنظیمات اولیه و راه‌اندازی", duration: "50 دقیقه" },
  { id: 3, title: "قسمت سوم: نحوه معامله در دکس", duration: "60 دقیقه" },
  { id: 4, title: "قسمت چهارم: مدیریت ریسک", duration: "45 دقیقه" },
  { id: 5, title: "قسمت پنجم: استراتژی‌های معاملاتی", duration: "55 دقیقه" },
  { id: 6, title: "قسمت ششم: تحلیل فاندامنتال", duration: "40 دقیقه" },
  { id: 7, title: "قسمت هفتم: تحلیل تکنیکال", duration: "65 دقیقه" },
  { id: 8, title: "قسمت هشتم: ابزارهای معاملاتی", duration: "50 دقیقه" },
  { id: 9, title: "قسمت نهم: ربات‌های معاملاتی", duration: "45 دقیقه" },
  { id: 10, title: "قسمت دهم: امنیت و نکات مهم", duration: "40 دقیقه" },
  { id: 11, title: "قسمت یازدهم: استراتژی‌های پیشرفته", duration: "55 دقیقه" },
  { id: 12, title: "قسمت دوازدهم: نکات و ترفندها", duration: "45 دقیقه" },
  { id: 13, title: "قسمت سیزدهم: جمع‌بندی دوره", duration: "35 دقیقه" },
];

const DexPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState(null);

  const handlePlayClick = (episodeId, event) => {
    event.stopPropagation();
    setActiveEpisode(episodeId);
    console.log(`Playing episode ${episodeId}`);
  };

  const handleToggle = () => {
    const card = cardRef.current;
    if (!card) return;

    setIsExpanded(prev => !prev);
    card.style.transition = 'transform 0.3s cubic-bezier(0.17, 0.84, 0.44, 1)';
    
    if (!isExpanded) {
      card.style.transform = 'translateY(20vh)';
    } else {
      card.style.transform = 'translateY(77vh)';
    }
  };

  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="relative h-16 flex items-center px-4">
          <button 
            onClick={() => navigate(-1)} 
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h1 className={`w-full text-center text-lg font-bold ${
      isDarkMode ? 'text-gray-100' : 'text-gray-800'
    }`}>
      دوره دکس تریدینگ
    </h1>
        </div>
      </div>

      {/* Video Section - Fixed */}
      <div className="absolute top-16 left-0 right-0 z-20 px-4">
        <VideoPlayer 
          isDarkMode={isDarkMode} 
          videoUrl="https://asanclip.ir/wp-content/uploads/2022/08/Ex-Promotion-1-1.m4v" // Replace with actual video URL
        />
      </div>

      {/* Episodes List - Scrollable */}
      <div className="absolute top-[calc(4rem+56.25vw)] bottom-0 left-0 right-0 overflow-y-auto z-10">
        <div className="p-4 pb-32">
          <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            قسمت‌های دوره
          </h2>
          <div className="space-y-3">
          {episodes.map((episode) => (
  <div
    key={episode.id}
    className={`p-4 rounded-xl border ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="font-medium text-right">
        {episode.title}
      </div>
      <div 
        onClick={(e) => handlePlayClick(episode.id, e)}
        className="ml-2 flex items-center justify-center"
      >
        <PlayButton isActive={activeEpisode === episode.id} />
      </div>
    </div>
  </div>
))}
          </div>
        </div>
      </div>

      {/* Bottom Card - Fixed -- کارت پایین یه صورت موقف غیر فعال کردم */}
{/*<div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 ${
          isDarkMode ? 'bg-[#1a2134]' : 'bg-white'
        } rounded-t-3xl shadow-lg h-[85vh] transform translate-y-[77vh] transition-transform duration-300 ease-out z-30`}
      >
        <button
          onClick={handleToggle}
          className="w-full pt-4 pb-2 flex justify-center items-center"
        >
          {isExpanded ? (
            <ChevronDownCircle className="w-8 h-8 text-gray-400" />
          ) : (
            <ChevronUpCircle className="w-8 h-8 text-gray-400" />
          )}
        </button>
        
        <div className="overflow-y-auto h-[calc(100%-3rem)]">
          <div className="p-6 space-y-4 text-right">
            <h2 className={`text-xl md:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } font-iransans`}>
              توضیحات دوره
            </h2>
            <p className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } font-iransans text-sm md:text-base`}>
              در این دوره شما با مفاهیم پایه تا پیشرفته دکس تریدینگ آشنا خواهید شد
            </p>
            
            <div className="space-y-4">
              <p className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              } font-iransans text-sm md:text-base`}>
                سرفصل‌های دوره:
              </p>
              <ul className={`${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              } font-iransans text-sm md:text-base list-disc space-y-2 text-right mr-6`}>
                <li>آشنایی با مفهوم دکس و صرافی‌های غیرمتمرکز</li>
                <li>نحوه انجام معاملات در دکس‌ها</li>
                <li>استراتژی‌های معاملاتی در دکس</li>
                <li>مدیریت ریسک در معاملات دکس</li>
                <li>تحلیل تکنیکال و فاندامنتال در دکس</li>
                <li>آشنایی با ابزارهای معاملاتی دکس</li>
                <li>نکات امنیتی در معاملات دکس</li>
                <li>استراتژی‌های آربیتراژ در دکس</li>
              </ul>
            </div>
          </div>
        </div>
      </div>*/}
    </div>
  );
};

export default DexPage;