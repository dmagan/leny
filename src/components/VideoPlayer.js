import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ videoUrl, title, isDarkMode, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadMetadata = () => setDuration(video.duration);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleSeeked = () => setIsBuffering(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('seeked', handleSeeked);
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
      video.muted = false; // فعال کردن صدا پس از تعامل کاربر
      video.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing video:", error);
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const time = e.target.value;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false; // فعال کردن صدا
      setIsMuted(false);
    } else {
      video.muted = true; // قطع کردن صدا
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedOptions(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-black' : 'bg-white'}`}
      onMouseMove={handleMouseMove}
    >
      <div className="relative h-full">
        {/* دکمه بستن (X) - انتقال به بالای سمت چپ */}
        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.pause();
            }
            onClose();
          }}
          className="absolute top-14 left-7 z-[9999] flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-black"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* ویدیو */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          playsInline
          webkit-playsinline="true"
          controls={false}
          disablePictureInPicture
        />

        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          </div>
        )}

        {showControls && (
          <>
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
              <h2 className="text-white text-lg font-medium text-right mr-12">{title}</h2>
            </div>

            <button 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              onClick={togglePlay}
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-6xl`} />
            </button>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent">
              <div className="px-4 py-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500"
                />
              </div>

              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-yellow-500">
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`} />
                  </button>

                  <div className="relative group">
                    {isMobile ? (
                      <button 
                        onClick={toggleMute}
                        className="text-white hover:text-yellow-500"
                      >
                        <i className={`fas fa-volume-${isMuted ? 'mute' : 'up'} text-xl`} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={toggleMute}
                          className="text-white hover:text-yellow-500"
                        >
                          <i className={`fas fa-volume-${isMuted ? 'mute' : volume > 0.5 ? 'up' : 'down'} text-xl`} />
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

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* دکمه تنظیم سرعت پخش */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedOptions(!showSpeedOptions)}
                    className="text-white hover:text-yellow-500 text-sm flex items-center gap-1"
                  >
                    <i className="fas fa-tachometer-alt" />
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