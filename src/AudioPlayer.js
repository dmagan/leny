import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const AudioPlayer = ({ audioUrl, isDarkMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(new Audio(audioUrl));
  const progressRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e) => {
    const time = (e.nativeEvent.offsetX / progressRef.current.offsetWidth) * duration;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center space-x-4 mt-2 p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <button
        onClick={togglePlay}
        className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-200'}`}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      
      <div className="flex-1 space-y-1">
        <div 
          ref={progressRef}
          className="h-1 bg-gray-300 rounded-full cursor-pointer"
          onClick={handleProgressChange}
        >
          <div 
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <Volume2 size={20} className="text-gray-500" />
    </div>
  );
};

export default AudioPlayer;