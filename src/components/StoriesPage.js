import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useParams } from 'react-router-dom';

const StoriesPage = ({ isDarkMode, stories = [] }) => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shouldSkipTap, setShouldSkipTap] = useState(false);

  const progressInterval = useRef(null);
  const lastProgress = useRef(0);
  const touchTimeoutRef = useRef(null);
  const isLongPressRef = useRef(false);

  const STORY_DURATION = 15000;
  const UPDATE_INTERVAL = 100;
  const LONG_PRESS_DURATION = 200;

  const currentGallery = stories[currentStoryIndex]?.meta?.gallery_images || [];


  const startProgress = (startFrom = 0) => {
    setProgress(startFrom);
    clearInterval(progressInterval.current);

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          const currentGallery = stories[currentStoryIndex]?.meta?.gallery_images || [];
          if (currentImageIndex < currentGallery.length - 1) {
            // برو به عکس بعدی در همین استوری
            setCurrentImageIndex((prev) => prev + 1);
            return 0;
          } else {
            // همه عکس‌های این استوری تمام شده، از صفحه خارج شو
            navigate(-1);
            return 100;
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
    if (stories.length > 0) {
      startProgress();
    }
    return () => {
      clearInterval(progressInterval.current);
      clearTimeout(touchTimeoutRef.current);
    };
  }, [currentStoryIndex, currentImageIndex, stories.length]);

  const handleTouchStart = (e) => {
    e.preventDefault();
    lastProgress.current = progress;
    clearInterval(progressInterval.current);
    setIsPaused(true);
    isLongPressRef.current = false;
    setShouldSkipTap(false);

    touchTimeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setShouldSkipTap(true);
    }, LONG_PRESS_DURATION);
  };

  const handleTouchEnd = (direction) => {
    clearTimeout(touchTimeoutRef.current);
    setIsPaused(false);

    if (isLongPressRef.current) {
      startProgress(lastProgress.current);
      return;
    }

    if (shouldSkipTap) {
      startProgress(lastProgress.current);
      return;
    }

    const currentGallery = stories[currentStoryIndex]?.meta?.gallery_images || [];
    
    if (direction === 'next') {
      if (currentImageIndex < currentGallery.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
        startProgress(0);
      } else {
        navigate(-1);
      }
    } else if (direction === 'prev') {
      if (currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
        startProgress(0);
      } else {
        navigate(-1);
      }
    }
  };

  if (!stories || stories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black select-none"
      style={{
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
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
      <div className="h-full w-full flex">
        <div
          className="w-1/2 h-full z-20"
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={() => handleTouchEnd('prev')}
        />
        <div
          className="w-1/2 h-full z-20"
          style={{ touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={() => handleTouchEnd('next')}
        />

        <div className="absolute inset-0 z-10">
          {stories[currentStoryIndex]?.meta?.gallery_images?.length > 0 ? (
            <img
              src={stories[currentStoryIndex].meta.gallery_images[currentImageIndex]}
              alt={stories[currentStoryIndex].title?.rendered || 'Story image'}
              className="h-full w-full object-cover"
            />
          ) : (
            stories[currentStoryIndex]?._embedded?.['wp:featuredmedia'] && (
              <img
                src={stories[currentStoryIndex]._embedded['wp:featuredmedia'][0].source_url}
                alt={stories[currentStoryIndex].title?.rendered || 'Story image'}
                className="h-full w-full object-cover"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default StoriesPage;