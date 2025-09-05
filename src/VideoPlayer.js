// components/VideoPlayer.js - نسخه بهبود یافته با پشتیبانی کامل MKV
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const VideoPlayer = ({ videoUrl, title, isDarkMode, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [buffered, setBuffered] = useState([]);
  const [videoError, setVideoError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const controlsTimeoutRef = useRef(null);

  // تشخیص فرمت ویدیو و تنظیم codec مناسب
  const getVideoMimeType = (url) => {
    const extension = url.split('.').pop().toLowerCase().split('?')[0];
    const mimeTypes = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      'mkv': 'video/x-matroska',
      'm4v': 'video/x-m4v'
    };
    return mimeTypes[extension] || 'video/mp4';
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setLoadingProgress((video.currentTime / video.duration) * 100 || 0);
    };
    
    const handleLoadMetadata = () => {
      setDuration(video.duration);
      setVideoError(false);
    };
    
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setVideoError(false);
    };
    
    const handleSeeked = () => setIsBuffering(false);
    
    const handleProgress = () => {
      const buffered = video.buffered;
      const bufferedRanges = [];
      for (let i = 0; i < buffered.length; i++) {
        bufferedRanges.push({
          start: buffered.start(i),
          end: buffered.end(i),
        });
      }
      setBuffered(bufferedRanges);
    };

    const handleError = (e) => {
      console.error('Video error:', e);
      setVideoError(true);
      setIsBuffering(false);
      
      // تلاش برای بارگذاری مجدد
      setTimeout(() => {
        if (video.error && video.error.code !== video.error.MEDIA_ERR_ABORTED) {
          console.log('Attempting to reload video...');
          video.load();
        }
      }, 2000);
    };

    const handleCanPlay = () => {
      setVideoError(false);
      setIsBuffering(false);
    };

    const handleLoadStart = () => {
      setIsBuffering(true);
      setVideoError(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  useEffect(() => {
    const hideControls = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(hideControls, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      // برای فرمت‌های خاص مثل MKV، ابتدا بی‌صدا پخش می‌کنیم
      const originalMuted = video.muted;
      video.muted = true;
      
      video.play()
        .then(() => {
          setIsPlaying(true);
          setVideoError(false);
          
          // بازگرداندن تنظیمات صدا
          setTimeout(() => {
            video.muted = originalMuted;
            if (!isMuted) {
              video.muted = false;
            }
          }, 500);
        })
        .catch((error) => {
          console.error('Error playing video:', error);
          setVideoError(true);
          
          // تلاش مجدد با تنظیمات مختلف
          setTimeout(() => {
            video.muted = true;
            video.play().catch(e => {
              console.error('Second attempt failed:', e);
              setVideoError(true);
            });
          }, 1000);
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const time = e.target.value;
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSpeedOptions(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    const video = videoRef.current;
    if (video) {
      setVideoError(false);
      setIsBuffering(true);
      video.load();
    }
  };

  // مدیریت دکمه بک
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      onClose();
    };

    window.postMessage(JSON.stringify({
      type: 'VIDEO_PLAYER_OPENED'
    }), '*');
    
    window.history.pushState({ videoPlayer: true }, '');
    window.addEventListener('popstate', handleBackButton);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
      window.postMessage(JSON.stringify({
        type: 'VIDEO_PLAYER_CLOSED'
      }), '*');
    };
  }, [onClose]);

  // بارگذاری ویدیو با تنظیمات بهینه
  useEffect(() => {
    const video = videoRef.current;
    if (video && videoUrl) {
      setVideoError(false);
      setIsBuffering(true);
      
      // تنظیم source با MIME type مناسب
      const mimeType = getVideoMimeType(videoUrl);
      video.src = videoUrl;
      
      // تنظیمات اضافی برای بهبود پخش
      video.crossOrigin = 'anonymous';
      video.setAttribute('type', mimeType);
      
      video.load();
    }
  }, [videoUrl]);

  return (
    <div
      className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-black' : 'bg-white'}`}
      onMouseMove={handleMouseMove}
      dir="ltr"
      style={{ direction: 'ltr' }}
    >
      <div className="relative h-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-14 left-7 z-[9999] flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600"
        >
          <X size={20} className="text-black" />
        </button>

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
          controls={false}
          preload="auto"
          disablePictureInPicture
          style={{
            backgroundColor: '#000',
            zIndex: 1
          }}
        />

        {/* Error Message */}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="text-center text-white p-6">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <p className="text-lg mb-4">خطا در بارگذاری ویدیو</p>
              <p className="text-sm text-gray-300 mb-4">
                فرمت: {getVideoMimeType(videoUrl)}
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        )}

        {/* Buffering Indicator */}
        {isBuffering && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mx-auto mb-4" />
              <p className="text-sm">در حال بارگذاری...</p>
              {loadingProgress > 0 && (
                <div className="w-48 bg-gray-600 rounded-full h-2 mt-2 mx-auto">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Controls */}
        {showControls && !videoError && (
          <>
            {/* Title */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-30">
              <h2 className="text-white text-lg font-medium text-left ml-12">{title}</h2>
            </div>

            {/* Play/Pause Center Button */}
            <button
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 hover:text-white z-30"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent z-30">
              {/* Progress Bar */}
              <div className="px-4 py-1">
                <div className="relative w-full h-1 bg-white/30 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-1 bg-yellow-500 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  {buffered.map((range, index) => (
                    <div
                      key={index}
                      className="absolute top-0 h-1 bg-white/50 rounded-full"
                      style={{
                        left: `${(range.start / duration) * 100}%`,
                        width: `${((range.end - range.start) / duration) * 100}%`,
                      }}
                    />
                  ))}
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button onClick={togglePlay} className="text-white hover:text-yellow-500">
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Volume */}
                  <div className="relative group">
                    {isMobile ? (
                      <button onClick={toggleMute} className="text-white hover:text-yellow-500">
                        {isMuted ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-white hover:text-yellow-500">
                          {isMuted ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Playback Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedOptions(!showSpeedOptions)}
                    className="text-white hover:text-yellow-500 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {playbackRate}x
                  </button>

                  {showSpeedOptions && (
                    <div className="absolute bottom-full right-0 mb-2 py-2 bg-black/90 rounded">
                      {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`block w-full px-4 py-1 text-sm text-left ${
                            playbackRate === speed ? 'text-yellow-500' : 'text-white'
                          } hover:bg-white/10`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;