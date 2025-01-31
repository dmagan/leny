import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'react-notifications-component';


const LoginPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [showCard, setShowCard] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [saveLogin, setSaveLogin] = useState(false);

  // انیمیشن ورود در لود اولیه
  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  // تنظیم اسکرول و درگ
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

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
      navigate(-1);
    }, 300);
  };

  const validateLogin = async (username, password) => {
    try {
      const response = await fetch('https://alicomputer.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return {
          success: true,
          message: 'با موفقیت وارد شدید'
        };
      }
      return {
        success: false,
        message: data.message || 'نام کاربری یا رمز عبور اشتباه است'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'خطا در برقراری ارتباط با سرور'
      };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearInput = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Store.addNotification({
        title: "خطا",
        message: "لطفا نام کاربری و رمز عبور را وارد کنید",
        type: "danger",
        insert: "top",
        container: "center",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animated", "animate__flipOutX"],
        dismiss: {
          duration: 2000,
          onScreen: true,
          showIcon: true
        }
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await validateLogin(formData.email, formData.password);
      
      if (result.success) {
        Store.addNotification({
          title: "موفق",
          message: "با موفقیت وارد شدید",
          type: "success",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: {
            duration: 2000,
            onScreen: true,
            showIcon: true
          }
        });
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        Store.addNotification({
          title: "خطا",
          message: result.message,
          type: "danger",
          insert: "top",
          container: "top-right",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: {
            duration: 2000,
            onScreen: true,
            showIcon: true
          }
        });
      }
    } catch (error) {
      Store.addNotification({
        title: "خطا",
        message: "خطا در برقراری ارتباط با سرور",
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animated", "animate__flipOutX"],
        dismiss: {
          duration: 2000,
          onScreen: true,
          showIcon: true
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (name, placeholder, type = 'text', showPasswordToggle = false, setShowPasswordState) => {
    const isPassword = type === 'password';
    const showCurrentPassword = isPassword ? (name === 'password' ? showPassword : false) : false;

    return (
      <div className="relative">
        <input
          type={showCurrentPassword ? 'text' : type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-3 sm:py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] ${
            isDarkMode 
              ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
              : 'bg-gray-100 text-gray-900 placeholder-gray-500'
          }`}
          placeholder={placeholder}
          dir="rtl"
          style={{ fontSize: '16px' }}
        />
        {formData[name] && !isPassword && (
          <button
            onClick={() => clearInput(name)}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <X size={16} />
          </button>
        )}
        {showPasswordToggle && (
          <button
            onClick={() => setShowPasswordState(prev => !prev)}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {showCurrentPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden transition-opacity duration-300"
         style={{ 
           opacity: showCard ? 1 : 0,
           pointerEvents: showCard ? 'auto' : 'none'
         }}>
      <div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 w-full ${
          isDarkMode ? 'bg-[#141e35]' : 'bg-white'
        } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: 'none',
        }}
      >
        {/* دکمه بستن */}
        <button 
          onClick={closeCard}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Handle Bar */}
        <div className="pt-2">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        {/* محتوای اصلی */}
        <div className="scrollable-content h-full overflow-y-auto pb-safe">
          <div className="px-6 pb-8 pt-4">
            {/* Avatar and Title */}
            <div className="mb-8 text-center pt-4">
              <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ورود یا ثبت‌نام
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                به اپلیکیشن ما خوش آمدید
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className={`p-[3px] rounded-full flex mb-6 relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div
                className={`absolute inset-[3px] w-[calc(50%-3px)] rounded-full transition-transform duration-300 ease-out ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                } ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
              />
              
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 sm:py-3 rounded-full text-sm z-10 transition-colors relative ${
                  isLogin 
                    ? isDarkMode ? 'text-white' : 'text-gray-900'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                ورود
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 sm:py-3 rounded-full text-sm z-10 transition-colors relative ${
                  !isLogin 
                    ? isDarkMode ? 'text-white' : 'text-gray-900'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                ثبت‌نام
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4 px-1">
              {isLogin ? (
                <>
                  {renderInput('email', 'ایمیل خود را وارد کنید', 'email')}
                  {renderInput('password', 'رمز عبور', 'password', true, setShowPassword)}
                  
                  <div className="flex items-center justify-between pt-2">
                    <label className={`flex items-center gap-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <input
                        type="checkbox"
                        checked={saveLogin}
                        onChange={(e) => setSaveLogin(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      ذخیره اطلاعات ورود
                    </label>
                    <button className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      فراموشی رمز عبور؟
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {renderInput('mobile', 'شماره موبایل', 'tel')}
                  {renderInput('email', 'ایمیل خود را وارد کنید', 'email')}
                  {renderInput('password', 'رمز عبور', 'password', true, setShowPassword)}
                  {renderInput('confirmPassword', 'تکرار رمز عبور', 'password', true, setShowPassword)}
                </>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full mt-6 bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium transition-colors relative
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e5c44c]'}`}
              >
                {isLoading ? (
                  <>
                    <span className="opacity-0">ورود</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </>
                ) : (
                  isLogin ? 'ورود' : 'ثبت‌نام'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
