import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CustomLoading from '../CustomLoading';

const StoriesPage = ({ isDarkMode, stories = [] }) => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // برای مدیریت حرکت‌های لمسی و افکت‌ها
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null); // 'next', 'prev', or null

  const progressInterval = useRef(null);
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const touchTimeoutRef = useRef(null);

  const STORY_DURATION = 15000;
  const UPDATE_INTERVAL = 100;
  const SWIPE_THRESHOLD = 70; // آستانه برای تشخیص swipe (کمی بیشتر از قبل)
  const VERTICAL_SWIPE_THRESHOLD = 100; // آستانه بزرگتر برای کشیدن عمودی و خروج
  const DRAG_LIMIT_Y = 150; // حداکثر کشیدن عمودی
  const DRAG_LIMIT_X = 250; // حداکثر کشیدن افقی

  const currentGallery = stories[currentStoryIndex]?.meta?.gallery_images || [];
  const currentImageUrl = currentGallery[currentImageIndex] || 
                          stories[currentStoryIndex]?._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

  // پیش‌بارگذاری تصاویر
  useEffect(() => {
    const preloadImages = async () => {
      if (stories.length === 0) return;

      setIsLoading(true);

      // پیش‌بارگذاری تصویر فعلی
      const currentStory = stories[currentStoryIndex];
      if (!currentStory) return;

      const gallery = currentStory.meta?.gallery_images || [];
      
      // اگر گالری خالی است، تصویر اصلی استوری را بارگذاری کنیم
      if (gallery.length === 0 && currentStory._embedded?.['wp:featuredmedia']) {
        const featuredImageUrl = currentStory._embedded['wp:featuredmedia'][0]?.source_url;
        
        if (featuredImageUrl && !preloadedImages[featuredImageUrl]) {
          await preloadImage(featuredImageUrl);
          setPreloadedImages(prev => ({ ...prev, [featuredImageUrl]: true }));
        }
        
        setIsLoading(false);
        return;
      }

      // بارگذاری تصویر فعلی در گالری
      if (gallery[currentImageIndex] && !preloadedImages[gallery[currentImageIndex]]) {
        await preloadImage(gallery[currentImageIndex]);
        setPreloadedImages(prev => ({ ...prev, [gallery[currentImageIndex]]: true }));
      }

      // پیش‌بارگذاری تصاویر بعدی در گالری فعلی
      const nextImagesToPreload = gallery.slice(currentImageIndex + 1, currentImageIndex + 3);
      for (const imgUrl of nextImagesToPreload) {
        if (!preloadedImages[imgUrl]) {
          preloadImage(imgUrl).then(() => {
            setPreloadedImages(prev => ({ ...prev, [imgUrl]: true }));
          });
        }
      }

      // پیش‌بارگذاری استوری بعدی
      if (currentStoryIndex < stories.length - 1) {
        const nextStory = stories[currentStoryIndex + 1];
        const nextGallery = nextStory.meta?.gallery_images || [];
        
        if (nextGallery.length > 0 && !preloadedImages[nextGallery[0]]) {
          preloadImage(nextGallery[0]).then(() => {
            setPreloadedImages(prev => ({ ...prev, [nextGallery[0]]: true }));
          });
        } else if (nextStory._embedded?.['wp:featuredmedia']) {
          const nextFeaturedImage = nextStory._embedded['wp:featuredmedia'][0]?.source_url;
          if (nextFeaturedImage && !preloadedImages[nextFeaturedImage]) {
            preloadImage(nextFeaturedImage).then(() => {
              setPreloadedImages(prev => ({ ...prev, [nextFeaturedImage]: true }));
            });
          }
        }
      }

      // پیش‌بارگذاری استوری قبلی
      if (currentStoryIndex > 0) {
        const prevStory = stories[currentStoryIndex - 1];
        const prevGallery = prevStory.meta?.gallery_images || [];
        
        if (prevGallery.length > 0 && !preloadedImages[prevGallery[0]]) {
          preloadImage(prevGallery[0]).then(() => {
            setPreloadedImages(prev => ({ ...prev, [prevGallery[0]]: true }));
          });
        } else if (prevStory._embedded?.['wp:featuredmedia']) {
          const prevFeaturedImage = prevStory._embedded['wp:featuredmedia'][0]?.source_url;
          if (prevFeaturedImage && !preloadedImages[prevFeaturedImage]) {
            preloadImage(prevFeaturedImage).then(() => {
              setPreloadedImages(prev => ({ ...prev, [prevFeaturedImage]: true }));
            });
          }
        }
      }

      setIsLoading(false);
    };

    preloadImages();
  }, [currentStoryIndex, currentImageIndex, stories, preloadedImages]);

  // تابع کمکی برای پیش‌بارگذاری تصویر
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = reject;
    });
  };

  const startProgress = (startFrom = 0) => {
    setProgress(startFrom);
    clearInterval(progressInterval.current);

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          if (currentImageIndex < currentGallery.length - 1) {
            // برو به عکس بعدی در همین استوری
            setCurrentImageIndex((prev) => prev + 1);
            return 0;
          } else {
            // وقتی به آخرین تصویر رسیدیم، به استوری بعدی برو
            goToNextStory();
            return 0;
          }
        }
        
        return prev + 100 / (STORY_DURATION / UPDATE_INTERVAL);
      });
    }, UPDATE_INTERVAL);
  };

  useEffect(() => {
    const storyIndex = stories.findIndex(story => story.id === Number(storyId));
    if (storyIndex !== -1) {
      setCurrentStoryIndex(storyIndex);
    }
  }, [storyId, stories]);
  
  useEffect(() => {
    if (stories.length > 0 && !isLoading && !isDragging) {
      startProgress();
    }
    return () => {
      clearInterval(progressInterval.current);
      clearTimeout(touchTimeoutRef.current);
    };
  }, [currentStoryIndex, currentImageIndex, stories.length, isLoading, isDragging]);

  // تعیین استایل مبتنی بر حالت کشیدن
  const storyContainerStyle = {
    transform: isDragging 
      ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(${1 - Math.abs(dragOffset.y) / 800})` 
      : 'translate3d(0, 0, 0) scale(1)',
    opacity: isDragging ? 1 - Math.abs(dragOffset.y) / 400 : 1,
    transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // توقف موقت استوری با تاچ
  const handleTouchStart = (e) => {
    if (isLoading || transitionDirection) return;

    // ذخیره موقعیت اولیه تاچ
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
    setDragOffset({ x: 0, y: 0 });
    
    // ذخیره زمان شروع تاچ
    touchTimeoutRef.current = e.timeStamp;
    
    // توقف پیشرفت
    clearInterval(progressInterval.current);
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isLoading || transitionDirection) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
  
    // محاسبه میزان حرکت
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    
    // تشخیص حرکت عمودی به سمت پایین (برای خروج)
    if (deltaY > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      const boundedDeltaY = Math.max(0, Math.min(DRAG_LIMIT_Y, deltaY));
  
      setDragOffset({
        x: 0,  // فقط عمودی
        y: boundedDeltaY
      });
  
      if (boundedDeltaY > VERTICAL_SWIPE_THRESHOLD) {
        setIsExiting(true);
      } else {
        setIsExiting(false);
      }
    }
    // تشخیص حرکت افقی (برای تغییر استوری)
    else if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      const boundedDeltaX = Math.max(-DRAG_LIMIT_X, Math.min(DRAG_LIMIT_X, deltaX));
  
      setDragOffset({
        x: boundedDeltaX,
        y: 0, // حرکت عمودی دیگر انجام نشود
      });
  
      setIsExiting(false);
    }
  };
    
  const handleTouchEnd = (e) => {
    if (!isDragging || isLoading || transitionDirection) return;
    
    setIsDragging(false);
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const swipeSpeed = Math.abs(deltaX) / (e.timeStamp - touchTimeoutRef.current);
    
    // اگر در حال خروج هستیم و به اندازه کافی کشیده شده
    if (isExiting && deltaY > VERTICAL_SWIPE_THRESHOLD) {
      setDragOffset({ x: 0, y: window.innerHeight });
      setTimeout(() => {
        navigate(-1);
      }, 300);
      return;
    }
    
    // اگر حرکت افقی وجود دارد و بیشتر از آستانه تعیین شده است
    // اضافه کردن محدودیت سرعت برای جلوگیری از پرش چند صفحه‌ای
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD && swipeSpeed < 2.5) {
      if (deltaX < 0) {
        // کشیدن به سمت چپ - استوری بعدی
        setTransitionDirection('next');
        setTimeout(() => {
          goToNextStory();
          setTimeout(() => setTransitionDirection(null), 150);
        }, 25);
      } else {
        // کشیدن به سمت راست - استوری قبلی
        setTransitionDirection('prev');
        setTimeout(() => {
          goToPrevStory();
          setTimeout(() => setTransitionDirection(null), 150);
        }, 25);
      }
    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      // کلیک ساده، بخش بعدی یا قبلی استوری
      const halfWidth = window.innerWidth / 2;
      if (touchEndX < halfWidth) {
        // کلیک سمت چپ - بخش قبلی
        goToPrevImage();
      } else {
        // کلیک سمت راست - بخش بعدی
        goToNextImage();
      }
      resetPosition();
    } else {
      // کشیدن کمتر از آستانه، برگشت به حالت اولیه
      resetPosition();
    }

    // ادامه پیشرفت از همان نقطه
    setIsPaused(false);
    startProgress(progress);
  };

  // برگرداندن موقعیت محتوا به حالت اولیه
  const resetPosition = () => {
    setDragOffset({ x: 0, y: 0 });
    setIsExiting(false);
    // شروع مجدد پیشرفت
    startProgress(progress);
    setIsPaused(false);
  };

  // رفتن به تصویر بعدی در استوری فعلی
  const goToNextImage = () => {
    if (currentImageIndex < currentGallery.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      startProgress(0);
    } else {
      // وقتی همه تصاویر استوری تمام شد، به استوری بعدی برو
      goToNextStory();
    }
  };

  // رفتن به تصویر قبلی در استوری فعلی
  const goToPrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      startProgress(0);
    } else {
      // وقتی در تصویر اول هستیم، همان تصویر را از ابتدا نمایش بده
      setCurrentImageIndex(0);
      startProgress(0);
    }
  };

  // رفتن به استوری بعدی
  const goToNextStory = () => {
    // اگر در آخرین استوری هستیم، به اولین استوری برگردیم
    if (currentStoryIndex === stories.length - 1) {
      setCurrentStoryIndex(0);
    } else {
      setCurrentStoryIndex(prev => prev + 1);
    }
    setCurrentImageIndex(0);
    startProgress(0);
  };

  // رفتن به استوری قبلی
  const goToPrevStory = () => {
    // اگر در اولین استوری هستیم، به آخرین استوری برویم
    if (currentStoryIndex === 0) {
      setCurrentStoryIndex(stories.length - 1);
    } else {
      setCurrentStoryIndex(prev => prev - 1);
    }
    setCurrentImageIndex(0);
    startProgress(0);
  };

  if (!stories || stories.length === 0) {
    return <CustomLoading />;
  }

  // تعیین استایل انیمیشن تغییر استوری 3D
  const getTransitionStyle = () => {
    if (!transitionDirection) return {};
    
    if (transitionDirection === 'next') {
      return {
        transform: 'translate3d(100%, 0, 0) scale(0.95)',
        opacity: 0,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    } else if (transitionDirection === 'prev') {
      return {
        transform: 'translate3d(-100%, 0, 0) scale(0.95)',
        opacity: 0,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }
    
    return {};
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black select-none overflow-hidden perspective"
      style={{
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        perspective: '1200px',
      }}
    >
      {/* دکمه بستن استوری */}
      <div className="absolute top-0 right-0 z-50 p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* نوار پیشرفت */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4">
        <div className="flex gap-1">
          {currentGallery.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 bg-gray-500/50 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                style={{
                  width:
                    idx < currentImageIndex
                      ? '100%'
                      : idx === currentImageIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* محتوای اصلی */}
      <div
        ref={contentRef}
        className={`h-full w-full ${isExiting ? 'exiting' : ''}`}
        style={{
          ...storyContainerStyle,
          ...getTransitionStyle(),
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 z-10">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center bg-black">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <img
              src={currentImageUrl}
              alt={stories[currentStoryIndex]?.title?.rendered || 'Story image'}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </div>

      {/* ایجاد استایل‌های لازم برای افکت‌ها */}
      <style jsx>{`
        .perspective {
          perspective: 1200px;
        }
        
        .exiting {
          filter: brightness(0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default StoriesPage;