import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'react-notifications-component';
import { X, CirclePlus } from 'lucide-react';

const BallRegistrationPage = ({ isDarkMode, onClose }) => {
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [showCard, setShowCard] = useState(false);

  const [ballCode, setBallCode] = useState('');
  const [ballType, setBallType] = useState('physical'); // physical یا digital

  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerHeight < window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || isLandscape) return;

    const handleTouchStart = (e) => {
      if (e.target.closest('.scrollable-content') &&
          e.target.closest('.scrollable-content').scrollTop !== 0) {
        return;
      }
      isDragging.current = true;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff < 0) return;
      e.preventDefault();
      card.style.transform = `translateY(${diff}px)`;
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const currentTransform = card.style.transform;
      const match = currentTransform.match(/translateY\(([0-9.]+)px\)/);
      if (match) {
        const currentValue = parseFloat(match[1]);
        if (currentValue > 150) {
          closeCard();
        } else {
          card.style.transform = 'translateY(0)';
        }
      }
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: false });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        navigate(-1);
      }
    }, 300);
  };

  const handleBallCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // فقط اعداد
    if (value.length <= 9) {
      setBallCode(value);
    }
  };

  const handleSubmit = async () => {
    if (ballCode.length !== 9) {
      Store.addNotification({
        title: "خطا",
        message: "لطفا کد ۹ رقمی را کامل وارد کنید",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
      return;
    }

    setIsLoading(true);
    try {
      // اینجا API call برای ثبت توپ
      // فعلاً فقط پیام موفقیت نمایش می‌دهیم
      Store.addNotification({
        title: "موفق",
        message: `توپ ${ballType === 'physical' ? 'فیزیکی' : 'دیجیتال'} با کد ${ballCode} ثبت شد`,
        type: "success",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
      
      setTimeout(() => {
        closeCard();
      }, 1000);
    } catch (error) {
      Store.addNotification({
        title: "خطا",
        message: "خطا در ثبت توپ",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}>
      <div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 w-full ${isDarkMode ? 'bg-[#0d1822]' : 'bg-white'} rounded-t-3xl shadow-lg transition-transform duration-300 ease-out ${
          isLandscape ? 'h-screen overflow-y-auto' : 'max-h-[92vh] overflow-hidden'
        }`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: isLandscape ? 'auto' : 'none',
        }}
      >
        <div className="pt-2 relative">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
          
          {/* دکمه بستن (X) */}
          <button 
            onClick={closeCard}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="scrollable-content h-full overflow-y-auto pb-safe">
          <div className="px-6 pb-8 pt-4">
            <div className="mb-2 text-center">
<img 
  src="/Services/AddBall.png" 
  alt="Add Ball" 
  className="w-48 h-48 mx-auto mb-2 object-contain"
/>              <h1 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ثبت توپ جدید
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                کد ۹ رقمی توپ خود را وارد کنید
              </p>
            </div>

            <div className={`p-[3px] rounded-full flex mb-4 relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div
                className={`absolute inset-[3px] w-[calc(50%-3px)] rounded-full transition-transform duration-300 ease-out ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ${ballType === 'physical' ? 'translate-x-0' : 'translate-x-full'}`}
              />
              <button
                onClick={() => setBallType('physical')}
                className={`flex-1 py-2.5 sm:py-3 rounded-full text-sm z-10 transition-colors relative ${ballType === 'physical' ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}
              >
                توپ فیزیکی
              </button>
              <button
                onClick={() => setBallType('digital')}
                className={`flex-1 py-2.5 sm:py-3 rounded-full text-sm z-10 transition-colors relative ${ballType === 'digital' ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}
              >
                توپ دیجیتال
              </button>
            </div>

            <div className="space-y-4 px-1">
              <input
                type="text"
                value={ballCode}
                onChange={handleBallCodeChange}
                placeholder="کد ۹ رقمی توپ"
                className={`w-full px-4 py-3 sm:py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] text-center ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
                    : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                }`}
                style={{ fontSize: '18px', letterSpacing: '2px' }}
                maxLength="9"
                inputMode="numeric"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full mt-6 bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-lg font-medium transition-colors relative ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e5c44c]'}`}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">ثبت توپ</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  </div>
                </>
              ) : (
                'ثبت توپ'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BallRegistrationPage;