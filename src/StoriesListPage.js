import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Pause, Volume2, SkipBack, SkipForward, RotateCcw, RotateCw, Loader, Clock, Rewind, FastForward, Gauge } from 'lucide-react';
import { STORIES_CONFIG, PLAYER_CONFIG } from './storiesConfig';

const StoriesListPage = ({ isDarkMode, onClose }) => {
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [showCard, setShowCard] = useState(false);

  // پخش‌کننده صوتی
  const [currentStory, setCurrentStory] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const audioRef = useRef(null);

  // مدیریت مدت زمان‌ها
  const [storyDurations, setStoryDurations] = useState({});
  const [durationsLoading, setDurationsLoading] = useState(false);

  // لیست قصه‌ها از فایل config
  const stories = STORIES_CONFIG;

  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
    
    // محاسبه مدت زمان‌ها
    calculateDurations();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerHeight < window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // بستن منوی سرعت هنگام کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSpeedMenu && !event.target.closest('.speed-menu-container')) {
        setShowSpeedMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSpeedMenu]);

  // محاسبه مدت زمان‌های فایل‌های صوتی
  const calculateDurations = () => {
    setDurationsLoading(true);
    
    // بارگذاری از کش
    const cached = JSON.parse(localStorage.getItem('story_durations') || '{}');
    const now = Date.now();
    const expiry = PLAYER_CONFIG.cacheExpiry;
    
    const validCached = {};
    for (const [id, data] of Object.entries(cached)) {
      if (data.timestamp && (now - data.timestamp) < expiry) {
        validCached[id] = data.duration;
      }
    }
    
    setStoryDurations(validCached);
    
    // محاسبه مدت زمان‌های جدید
    const uncachedStories = stories.filter(story => !validCached[story.id]);
    
    if (uncachedStories.length === 0) {
      setDurationsLoading(false);
      return;
    }
    
    console.log(`🔄 محاسبه مدت زمان ${uncachedStories.length} قصه از ${stories.length} قصه کل`);
    
    let completed = 0;
    const newDurations = { ...validCached };

    
    uncachedStories.forEach((story, index) => {
      setTimeout(() => {
        console.log(`📊 در حال محاسبه: ${story.title}`);
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.volume = 0;
        
        const timeout = setTimeout(() => {
          console.log(`⏰ Timeout برای: ${story.title}`);
          audio.src = '';
          completed++;
          if (completed === uncachedStories.length) {
            setDurationsLoading(false);
            console.log(`✅ محاسبه مدت زمان‌ها تکمیل شد`);
          }
        }, 10000); // 10 ثانیه timeout
        
        audio.onloadedmetadata = () => {
          clearTimeout(timeout);
          const duration = audio.duration;
          
          if (duration && !isNaN(duration) && duration > 0) {
            const formatted = formatTime(duration);
            newDurations[story.id] = formatted;
            
            console.log(`✅ ${story.title}: ${formatted}`);
            
            // ذخیره در کش
            const cacheData = {
              ...JSON.parse(localStorage.getItem('story_durations') || '{}'),
              [story.id]: {
                duration: formatted,
                timestamp: Date.now()
              }
            };
            localStorage.setItem('story_durations', JSON.stringify(cacheData));
            
            setStoryDurations({ ...newDurations });
          } else {
            console.log(`❌ مدت زمان نامعتبر برای: ${story.title}`);
          }
          
          audio.src = '';
          completed++;
          if (completed === uncachedStories.length) {
            setDurationsLoading(false);
            console.log(`✅ محاسبه مدت زمان‌ها تکمیل شد`);
          }
        };
        
        audio.onerror = (e) => {
          clearTimeout(timeout);
          console.error(`❌ خطا در بارگذاری: ${story.title}`, e);
          audio.src = '';
          completed++;
          if (completed === uncachedStories.length) {
            setDurationsLoading(false);
            console.log(`✅ محاسبه مدت زمان‌ها تکمیل شد (با خطا)`);
          }
        };
        
        audio.src = story.audioUrl;
      }, index * 1000); // تاخیر 1 ثانیه بین هر درخواست
    });
  };

  // مدیریت پخش‌کننده صوتی
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [currentStory]);

  const closeCard = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setShowCard(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        navigate(-1);
      }
    }, 300);
  };

  const playStory = (story) => {
    if (currentStory?.id === story.id) {
      togglePlayPause();
    } else {
      setIsLoading(true);
      setCurrentStory(story);
      setCurrentTime(0);
      
      if (audioRef.current) {
        // متوقف کردن پخش قبلی
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // تنظیم فایل جدید
        audioRef.current.src = story.audioUrl;
        audioRef.current.playbackRate = playbackRate;
        
        const handleCanPlay = () => {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleError);
          
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(error => {
              console.error('خطا در پخش:', error);
              setIsLoading(false);
              alert('خطا در پخش فایل صوتی');
            });
        };
        
        const handleError = () => {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleError);
          setIsLoading(false);
          alert('خطا در بارگذاری فایل صوتی');
        };
        
        audioRef.current.addEventListener('canplay', handleCanPlay);
        audioRef.current.addEventListener('error', handleError);
        audioRef.current.load();
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentStory) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error('خطا در پخش:', error);
        });
    }
  };

  const skip15Backward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 15, 
        0
      );
    }
  };

  const skip30Forward = () => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 15, 
        duration
      );
    }
  };

 const skipForward = () => {
  if (audioRef.current && duration) {
    audioRef.current.currentTime = Math.min(
      audioRef.current.currentTime + 30, 
      duration
    );
  }
};

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - PLAYER_CONFIG.skipDuration, 
        0
      );
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const playbackRates = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' }
  ];

  const goToNextTrack = () => {
  const currentIndex = stories.findIndex(story => story.id === currentStory?.id);
  if (currentIndex !== -1 && currentIndex < stories.length - 1) {
    const nextStory = stories[currentIndex + 1];
    playStory(nextStory);
  }
};

const goToPreviousTrack = () => {
  const currentIndex = stories.findIndex(story => story.id === currentStory?.id);
  if (currentIndex !== -1 && currentIndex > 0) {
    const previousStory = stories[currentIndex - 1];
    playStory(previousStory);
  }
};

const restart = () => {
  if (audioRef.current) {
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  }
};

  const handleProgressChange = (e) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden transition-opacity duration-300"
        style={{ 
          opacity: showCard ? 1 : 0,
          pointerEvents: showCard ? 'auto' : 'none'
        }}>
        <div 
          ref={cardRef}
          className={`fixed bottom-0 left-0 right-0 w-full ${isDarkMode ? 'bg-[#0d1822]' : 'bg-white'} rounded-t-3xl shadow-lg transition-transform duration-300 ease-out flex flex-col`}
          style={{ 
            transform: `translateY(${showCard ? '0' : '100%'})`,
            height: isLandscape ? '100vh' : '92vh',
            maxHeight: isLandscape ? '100vh' : '92vh'
          }}
        >
          {/* Header */}
          <div className="pt-2 relative flex-shrink-0">
            <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
            
            <button 
              onClick={closeCard}
              className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content with proper scroll */}
          <div className="flex-1 min-h-0">
            <div 
              className="h-full overflow-y-auto overscroll-contain"
              style={{ 
                paddingBottom: currentStory ? '180px' : '20px',
                scrollBehavior: 'smooth'
              }}
            >
              <div className="px-6 pt-4">
                
                <div className="mb-6 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Play size={48} className="text-white" />
                  </div>
                  <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    قصه‌های کودکانه
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    قصه مورد علاقه خود را انتخاب کنید
                  </p>
                  
                  {durationsLoading && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-yellow-600">
                      <Loader size={16} className="animate-spin" />
                      <span>در حال محاسبه مدت زمان قصه‌ها...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {stories.map((story) => (
                    <div 
                      key={story.id}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        currentStory?.id === story.id 
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                          : isDarkMode 
                            ? 'border-gray-700 bg-gray-800 hover:bg-gray-750' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => playStory(story)}
                    >
                      <div className="flex items-center gap-4">
                       <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                          {story.image ? (
                            <img 
                              src={story.image} 
                              alt={story.title}
                              className="w-full h-full rounded-lg object-cover"
                              onError={(e) => {
                                // اگر تصویر لود نشد، آیکون Play نمایش داده شود
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <Play 
                            size={24} 
                            className="text-white" 
                            style={{ display: story.image ? 'none' : 'block' }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {story.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {storyDurations[story.id] || 'محاسبه...'}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {isLoading && currentStory?.id === story.id ? (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <Loader size={20} className="text-gray-600 animate-spin" />
                            </div>
                          ) : currentStory?.id === story.id && isPlaying ? (
                            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                              <Pause size={20} className="text-white" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                              <Play size={20} className="text-white mr-0.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Player at Bottom - Positioned Absolutely */}
         {currentStory && (
  <div 
    className={`absolute bottom-0 left-0 right-0 border-t backdrop-blur-sm bg-opacity-95 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`} 
    style={{ zIndex: 100 }}
  >
    <div className="p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-3">
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentStory.title}
          </p>
        </div>

        <div className="mb-1">
          <div 
            className="w-full h-2 bg-gray-300 rounded-full cursor-pointer"
            onClick={handleProgressChange}
          >
            <div 
              className="h-full bg-yellow-500 rounded-full transition-all duration-100"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {/* دکمه 15 ثانیه عقب */}
          <button 
            onClick={skip15Backward}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="15 ثانیه عقب"
          >
            <RotateCcw size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          
          {/* دکمه ترک قبلی */}
          <button 
            onClick={goToPreviousTrack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="ترک قبلی"
            disabled={stories.findIndex(story => story.id === currentStory?.id) === 0}
          >
            <SkipBack size={24} className={`${
              stories.findIndex(story => story.id === currentStory?.id) === 0 
                ? 'text-gray-400' 
                : isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </button>
          
          {/* دکمه پخش/توقف */}
          <button 
            onClick={togglePlayPause}
            className="p-3 rounded-full bg-yellow-500 hover:bg-yellow-600"
            title={isPlaying ? 'توقف' : 'پخش'}
          >
            {isPlaying ? (
              <Pause size={28} className="text-white" />
            ) : (
              <Play size={28} className="text-white mr-0.5" />
            )}
          </button>
          
          {/* دکمه ترک بعدی */}
          <button 
            onClick={goToNextTrack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="ترک بعدی"
            disabled={stories.findIndex(story => story.id === currentStory?.id) === stories.length - 1}
          >
            <SkipForward size={24} className={`${
              stories.findIndex(story => story.id === currentStory?.id) === stories.length - 1 
                ? 'text-gray-400' 
                : isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
          </button>

           {/* دکمه 15 ثانیه جلو */}
          <button 
            onClick={skipForward}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="شروع از اول"
          >
            <RotateCw size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>

          {/* دکمه سرعت پخش */}
          <div className="relative speed-menu-container">
            <button 
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="سرعت پخش"
            >
              <Gauge size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
            </button>
            
            {/* منوی سرعت */}
            {showSpeedMenu && (
              <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 rounded-lg shadow-lg border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`} style={{ zIndex: 200 }}>
                {playbackRates.map((rate) => (
                  <button
                    key={rate.value}
                    onClick={() => changePlaybackRate(rate.value)}
                    className={`block w-full px-4 py-2 text-sm text-center hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                      playbackRate === rate.value 
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                        : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {rate.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        </div>
      </div>

      <audio 
        ref={audioRef} 
        preload="none"
        onVolumeChange={() => setVolume(audioRef.current?.volume || 1)}
      />
    </>
  );
};

export default StoriesListPage;