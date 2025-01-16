import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize } from 'lucide-react';

const VideoPlayer = ({ isDarkMode, videoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef(null);
  const controlTimeoutRef = useRef(null);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
        setShowPlayButton(false);
      } else {
        video.pause();
        setIsPlaying(false);
        setShowPlayButton(true);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const toggleFullScreen = () => {
    const video = videoRef.current;
    if (video) {
      if (!isFullScreen) {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.mozRequestFullScreen) { // Firefox
          video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) { // Chrome, Safari and Opera
          video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) { // IE/Edge
          video.msRequestFullscreen();
        }
        setIsFullScreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
          document.msExitFullscreen();
        }
        setIsFullScreen(false);
      }
    }
  };

  const handleMouseMove = () => {
    // نمایش کنترل‌ها با حرکت موس
    setShowPlayButton(true);
    
    // پاک کردن تایمر قبلی
    if (controlTimeoutRef.current) {
      clearTimeout(controlTimeoutRef.current);
    }
    
    // پنهان کردن کنترل‌ها بعد از 3 ثانیه
    controlTimeoutRef.current = setTimeout(() => {
      if (!isPlaying) return;
      setShowPlayButton(false);
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    
    // اضافه کردن event listener برای پایان ویدیو
    const handleVideoEnd = () => {
      setIsPlaying(false);
      setShowPlayButton(true);
    };

    if (video) {
      video.addEventListener('ended', handleVideoEnd);
    }

    return () => {
      // پاک کردن event listener
      if (video) {
        video.removeEventListener('ended', handleVideoEnd);
      }
      
      // پاک کردن تایمر
      if (controlTimeoutRef.current) {
        clearTimeout(controlTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`relative w-full aspect-video rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Placeholder or Actual Video */}
      <video 
        ref={videoRef}
        src={videoUrl || '/sample-video.mp4'} // Replace with actual video URL or use a fallback
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Video Controls Overlay */}
      {showPlayButton && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-all duration-300"
          onClick={togglePlay}
        >
          <Play 
            className="w-16 h-16 text-white drop-shadow-lg cursor-pointer" 
            fill="currentColor" 
          />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;