import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'react-notifications-component';

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateRegister = async (userData) => {
  try {
    const response = await fetch('https://alicomputer.com/wp-json/wp/v2/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: userData.email.split('@')[0],
        email: userData.email,
        password: userData.password,
        phone_number: userData.mobile,
        name: userData.fullName
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: 'ثبت نام با موفقیت انجام شد'
      };
    }

    return {
      success: false,
      message: data.message || 'خطا در ثبت نام',
      type: 'register_error'
    };

  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: 'خطا در ارتباط با سرور',
      type: 'network_error'
    };
  }
};

const LoginPage = ({ isDarkMode }) => {
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
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
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [saveLogin, setSaveLogin] = useState(false);

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
  
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return {
          success: true,
          message: 'با موفقیت وارد شدید'
        };
      }
  
      if (data.code === '[jwt_auth] invalid_username' || 
          data.code === '[jwt_auth] incorrect_password' || 
          data.code === 'invalid_login') {
        return {
          success: false,
          message: 'نام کاربری یا رمز عبور اشتباه است',
          type: 'auth_error'
        };
      }
  
      return {
        success: false,
        message: data.message || 'خطای سرور',
        type: 'server_error'
      };
  
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        message: 'خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
        type: 'network_error'
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
  
  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email)) {
      Store.addNotification({
        style: { direction: 'rtl', textAlign: 'right' },
        title: "خطا",
        message: "لطفاً یک ایمیل معتبر وارد کنید",
        type: "danger",
        insert: "top",
        container: "center",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animated", "animate__flipOutX"],
        dismiss: { duration: 2000 },
        direction: 'rtl'
      });
    }
  };

  const clearInput = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleSubmit = async () => {
    if (!isLogin) {
      // کد ثبت‌نام
      if (!formData.fullName || !formData.email || !formData.password || !formData.mobile) {
        Store.addNotification({
          title: "خطا",
          message: "لطفاً تمام فیلدهای مورد نیاز را پر کنید",
          type: "danger",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 3000 },
          style: { direction: 'rtl', textAlign: 'right' }
        });
        return;
      }
  
      // کد ثبت‌نام در اینجا
      setIsLoading(true);
      try {
        // فرض کنید که تابع ثبت‌نام شما در اینجا وجود دارد
        const result = await validateRegister(formData);
  
        if (result.success) {
          Store.addNotification({
            title: "موفق",
            message: result.message,
            type: "success",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 2000 },
            style: { direction: 'rtl', textAlign: 'right' }
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
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 3000 },
            style: { direction: 'rtl', textAlign: 'right' }
          });
        }
      } catch (error) {
        Store.addNotification({
          title: "خطای سیستم",
          message: "خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.",
          type: "danger",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 3000 },
          style: { direction: 'rtl', textAlign: 'right' }
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // کد ورود (همان کد قبلی)
      if (!formData.email || !formData.password) {
        Store.addNotification({
          title: "خطا",
          message: "لطفا نام کاربری و رمز عبور را وارد کنید",
          type: "danger",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 3000 },
          style: { direction: 'rtl', textAlign: 'right' }
        });
        return;
      }
  
      setIsLoading(true);
      try {
        const result = await validateLogin(formData.email, formData.password);
  
        if (result.success) {
          Store.addNotification({
            title: "موفق",
            message: result.message,
            type: "success",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 2000 },
            style: { direction: 'rtl', textAlign: 'right' }
          });
  
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          let title = "خطا";
          let message = result.message;
  
          if (result.type === 'auth_error') {
            title = "خطای ورود";
          } else if (result.type === 'network_error') {
            title = "خطای شبکه";
          } else if (result.type === 'server_error') {
            title = "خطای سرور";
          }
  
          Store.addNotification({
            title: title,
            message: message,
            type: "danger",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 3000 },
            style: { direction: 'rtl', textAlign: 'right' }
          });
        }
      } catch (error) {
        Store.addNotification({
          title: "خطای سیستم",
          message: "خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.",
          type: "danger",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 3000 },
          style: { direction: 'rtl', textAlign: 'right' }
        });
      } finally {
        setIsLoading(false);
      }
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
          onBlur={name === 'email' ? handleEmailBlur : undefined}
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
  } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out ${
    isLandscape ? 'h-screen overflow-y-auto' : 'max-h-[92vh] overflow-hidden'
  }`}
  style={{ 
    transform: `translateY(${showCard ? '0' : '100%'})`,
    touchAction: isLandscape ? 'auto' : 'none',
  }}
>
        <button 
          onClick={closeCard}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="pt-2">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        <div className="scrollable-content h-full overflow-y-auto pb-safe">
          <div className="px-6 pb-8 pt-4">
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
                  {renderInput('fullName', 'نام و نام خانوادگی')}
                  {renderInput('mobile', 'شماره موبایل', 'tel')}
                  {renderInput('email', 'ایمیل خود را وارد کنید', 'email')}
                  {renderInput('password', 'رمز عبور', 'password', true, setShowPassword)}
                  {renderInput('confirmPassword', 'تکرار رمز عبور', 'password', true, setShowPassword)}
                </>
              )}

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