import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'react-notifications-component';
import { X, CirclePlus, Check, AlertCircle } from 'lucide-react';

const BallRegistrationPage = ({ isDarkMode, onClose, onBallRegistered }) => {
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [showCard, setShowCard] = useState(false);

  const [ballCode, setBallCode] = useState('');
  const [ballType, setBallType] = useState('physical'); // physical یا digital
  const [userStats, setUserStats] = useState(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeStatus, setCodeStatus] = useState(null); // null, 'valid', 'invalid', 'used'

  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
    
    // دریافت آمار کاربر هنگام لود
    fetchUserStats();
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

  // دریافت آمار کاربر
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('https://lenytoys.ir/wp-json/ball-codes/v1/user-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserStats(data);
        }
      }
    } catch (error) {
      console.error('خطا در دریافت آمار کاربر:', error);
    }
  };

  // بررسی وضعیت کد هنگام تایپ
  useEffect(() => {
if (ballCode.length >= 9) { // حداقل 9 رقم
      const timeoutId = setTimeout(() => {
        checkCodeStatus(ballCode);
      }, 500); // 500ms تاخیر برای جلوگیری از درخواست‌های زیاد

      return () => clearTimeout(timeoutId);
    } else {
      setCodeStatus(null);
    }
  }, [ballCode]);

  // بررسی وضعیت کد
  const checkCodeStatus = async (code) => {
if (!code || code.length < 9) return;

    setIsCheckingCode(true);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch('https://lenytoys.ir/wp-json/ball-codes/v1/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ball_code: code
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.exists) {
          if (data.is_used) {
            setCodeStatus('used');
          } else {
            setCodeStatus('valid');
          }
        } else {
          setCodeStatus('invalid');
        }
      }
    } catch (error) {
      console.error('خطا در بررسی کد:', error);
    } finally {
      setIsCheckingCode(false);
    }
  };

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
if (value.length <= 9) { // حداکثر 9 رقم
      setBallCode(value);
    }
  };

  const handleSubmit = async () => {
    // بررسی ورود کاربر
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) {
      Store.addNotification({
        title: "خطا",
        message: "برای ثبت کد باید وارد حساب کاربری خود شوید",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 4000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
      navigate('/login');
      return;
    }

    // بررسی طول کد
if (ballCode.length < 9) {
      Store.addNotification({
        title: "خطا",
message: "لطفاً کد 9 رقمی توپ را وارد کنید",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
      return;
    }

    // بررسی وضعیت کد
    if (codeStatus === 'invalid') {
      Store.addNotification({
        title: "خطا",
        message: "کد وارد شده معتبر نیست",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
      return;
    }

    if (codeStatus === 'used') {
      Store.addNotification({
        title: "خطا",
        message: "این کد قبلاً توسط کاربر دیگری ثبت شده است",
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
      const response = await fetch('https://lenytoys.ir/wp-json/ball-codes/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ball_code: ballCode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Store.addNotification({
          title: "موفق! 🎉",
          message: `کد توپ ${ballCode} با موفقیت ثبت شد`,
          type: "success",
          insert: "top",
          container: "center",
          dismiss: { duration: 4000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
        
        // به‌روزرسانی آمار کاربر
        // به‌روزرسانی آمار کاربر
setTimeout(() => {
  fetchUserStats();
  // آپدیت تعداد توپ‌ها در صفحه اصلی
  if (onBallRegistered) {
    onBallRegistered();
  }
}, 1000);

        // پاک کردن فرم
        setBallCode('');
        setCodeStatus(null);
        
        // بستن صفحه بعد از 2 ثانیه
        setTimeout(() => {
          closeCard();
        }, 2000);
      } else {
        const errorMessage = data.message || 'خطا در ثبت کد توپ';
        Store.addNotification({
          title: "خطا",
          message: errorMessage,
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 4000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
      }
    } catch (error) {
      console.error('خطا در ثبت کد:', error);
      Store.addNotification({
        title: "خطا",
        message: "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 4000, showIcon: true, pauseOnHover: true },
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
              />              
              <h1 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ثبت کد توپ جدید
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                کد توپ خود را وارد کنید
              </p>
            </div>

            <div className="space-y-4 px-1">
              <div className="relative">
                <input
                  type="text"
                  value={ballCode}
                  onChange={handleBallCodeChange}
placeholder="کد 9 رقمی توپ (مثال: 123456789)"
                  className={`w-full px-4 py-3 sm:py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] text-center pr-12 ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  } ${
                    codeStatus === 'valid' ? 'border-green-500' :
                    codeStatus === 'invalid' ? 'border-red-500' :
                    codeStatus === 'used' ? 'border-orange-500' : ''
                  }`}
                  style={{ fontSize: '18px', letterSpacing: '2px' }}
maxLength="9"
                />
                
                {/* آیکون وضعیت */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  {isCheckingCode ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : codeStatus === 'valid' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : codeStatus === 'invalid' ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : codeStatus === 'used' ? (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  ) : null}
                </div>
              </div>

              {/* پیام وضعیت */}
              {codeStatus && !isCheckingCode && (
                <div className={`text-sm text-center p-2 rounded-lg ${
                  codeStatus === 'valid' ? 'text-green-600 bg-green-50' :
                  codeStatus === 'invalid' ? 'text-red-600 bg-red-50' :
                  codeStatus === 'used' ? 'text-orange-600 bg-orange-50' : ''
                }`}>
                  {codeStatus === 'valid' && '✅ کد معتبر است'}
                  {codeStatus === 'invalid' && '❌ کد معتبر نیست'}
                  {codeStatus === 'used' && '⚠️ این کد قبلاً استفاده شده'}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !ballCode || codeStatus === 'invalid' || codeStatus === 'used'}
              className={`w-full mt-6 bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-lg font-medium transition-colors relative ${
                isLoading || !ballCode || codeStatus === 'invalid' || codeStatus === 'used'
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-[#e5c44c]'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">ثبت کد توپ</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  </div>
                </>
              ) : (
                'ثبت کد توپ'
              )}
            </button>

     
          </div>
        </div>
      </div>
    </div>
  );
};

export default BallRegistrationPage;