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
    title: "مقدمه فصل اول",
    duration: "15 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Introduction1_Chapter1.mp4"
  },
  { 
    id: 1, 
    title: "روش های کلاه برداری فصل اول",
    duration: "30 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Methods_of_Fraud_Chapter1.mp4"
  },
  { 
    id: 2, 
    title: "بلاک و بیتکوین و کوین و توکن فصل اول",
    duration: "35 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Blockchain_Bitcoin_Coins_and_Tokens_Chapter1.mp4"
  },
  { 
    id: 3, 
    title: "روش های درامد زایی فصل اول",
    duration: "40 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Methods_of_Income_Generation_Chapter1.mp4"
  },
  { 
    id: 4, 
    title: "آموزش سایت کوین گکو فصل 2",
    duration: "40 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/CoinGecko_Site_Tutorial_Chapter2.mp4"
  },
  { 
    id: 5, 
    title: "آموزش سایت تریدینگ ویو",
    duration: "40 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/TradingView_Site_Tutorial.mp4"
  },
  { 
    id: 6, 
    title: "مقدمه فصل دوم",
    duration: "40 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Introduction2_Chapter1.mp4"
  },
  { 
    id: 7, 
    title: "ولت فانتوم و تونکیپر",
    duration: "40 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Phantom_and_Tonkeeper_Wallet.mp4"
  },
  { 
    id: 8, 
    title: "آموزش سایت دیبانک",
    duration: "40 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Dibank_Site_Tutorial.mp4"
  },
  { 
    id: 9, 
    title: "آموزش ولت متامسک",
    duration: "40 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Metamask_Wallet_Tutorial.mp4"
  },
  { 
    id: 10, 
    title: "آموزش سایت های مانیتورینگ",
    duration: "40 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Monitoring_Sites_Tutorial.mp4"
  },
  { 
    id: 11, 
    title: "آموزش صرافی البانک",
    duration: "40 دقیقه",
    videoUrl: "https://iamvakilet.ir/0to100/Albank_Exchange_Tutorial.mp4"
  },

  // Add more episodes here
];

const ZeroTo100ServicePage = ({ isDarkMode, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  const [showZeroTo100Page, setShowZeroTo100Page] = useState(false);
  const [zeroTo100PageExiting, setZeroTo100PageExiting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ zeroTo100Page: true }, '');
      setTimeout(() => {
        setShowZeroTo100Page(true);
      }, 100);
    }
  }, [isOpen]);

  const closeZeroTo100Page = useCallback(() => {
    setZeroTo100PageExiting(true);
    setTimeout(() => {
      setShowZeroTo100Page(false);
      setZeroTo100PageExiting(false);
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
        opacity: zeroTo100PageExiting ? 0 : (showZeroTo100Page ? 1 : 0),
        pointerEvents: showZeroTo100Page ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: zeroTo100PageExiting 
            ? 'translateX(100%)' 
            : `translateX(${showZeroTo100Page ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
        }}
        dir="rtl"
      >
        <div className="absolute top-0 left-0 right-0 z-30">
          <div className="relative h-16 flex items-center px-4">
            {!showVideo && (
              <>
                <button 
                  onClick={closeZeroTo100Page}
                  className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
                >
                  <ArrowLeftCircle className="w-8 h-8" />
                </button>
                <h1 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  دوره صفر تا صد کریپتو
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

export default ZeroTo100ServicePage;
