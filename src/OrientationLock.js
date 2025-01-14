import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const OrientationLock = ({ children, isDarkMode }) => {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  if (isLandscape) {
    return (
      <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center ${
        isDarkMode ? 'bg-[#141e35] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="animate-bounce mb-4">
          <RotateCcw className="w-16 h-16 text-[#f7d55d]" />
        </div>
        <p className="text-lg font-medium text-center">
          لطفا گوشی خود را به حالت عمودی بچرخانید
        </p>
        <p className="text-sm text-center mt-2 text-gray-500">
          این برنامه فقط در حالت عمودی قابل استفاده است
        </p>
      </div>
    );
  }

  return children;
};

export default OrientationLock;