import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerHeight <= 667);
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [saveLogin, setSaveLogin] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const currentTranslate = useRef(50);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase();
    setIsIOS(platform.includes('iphone') || platform.includes('ipad') || platform.includes('ipod'));
    if (cardRef.current) {
      requestAnimationFrame(() => {
        cardRef.current.style.transform = 'translateY(0)';
      });
    }
  }, []);


  //// برای گوشی های کمتر از ۶۶۷ پیکسل ارتفاع
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerHeight <= 667);
    };
  
    window.addEventListener('resize', handleResize);
    handleResize(); // اجرای اولیه
  
    return () => window.removeEventListener('resize', handleResize);
  }, []);




  // Drag functionality
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
      
      // فقط اجازه اسکرول به پایین می‌دهیم
      if (diff < 0) return;
      
      e.preventDefault(); // جلوگیری از اسکرول صفحه پشت
      
      card.style.transform = `translateY(${diff}px)`;
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
    
      const currentTransform = card.style.transform;
      const match = currentTransform.match(/translateY\(([0-9.]+)px\)/);
      
      card.style.transition = 'transform 0.3s ease-out';
      
      if (match) {
        const currentValue = parseFloat(match[1]);
        if (currentValue > 150) {
          card.style.transform = 'translateY(100%)';
          setTimeout(() => navigate(-1), 300);
        } else {
          card.style.transform = 'translateY(0)';
        }
      }
    
      setTimeout(() => {
        card.style.transition = '';
      }, 300);
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

  const handleSubmit = () => {
    // Your submit logic here
    console.log('Form submitted:', formData);
  };

  const renderInput = (name, placeholder, type = 'text', showPasswordToggle = false, setShowPasswordState) => {
    const isPassword = type === 'password';
    const showCurrentPassword = isPassword ? (name === 'password' ? showPassword : showConfirmPassword) : false;

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
    <div className="fixed inset-0 z-50 bg-transparent overflow-hidden" style={{ pointerEvents: 'none' }}>
      <div 
        ref={cardRef}
        style={{ 
          transform: 'translateY(100%)',
          touchAction: 'none',
          pointerEvents: 'auto'
        }}
        className={`fixed bottom-0 left-0 right-0 w-full ${
          isDarkMode ? 'bg-[#141e35]' : 'bg-white'
        } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
      >
        {/* Handle Bar */}
        <div className="pt-2">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        {/* Close Button */}
        <div className="absolute top-4 right-4">
       
        </div>

        {/* Scrollable Content */}  
        <div className="scrollable-content overflow-y-auto h-full pb-safe"> 
          <div className="px-6 pb-8">
            {/* Avatar and Title */}
{!isSmallScreen ? (
  // نمایش کامل در صفحات بزرگ
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
) : (
  // فضای خالی برای صفحات کوچک
  <div className="h-4"></div>
)}

            {/* Toggle Buttons */}
            <div className={`p-[3px] rounded-full flex mb-6 relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div
                className={`absolute inset-[3px] w-[calc(50%-3px)] rounded-full transition-transform duration-300 ease-out ${
                  isDarkMode ? 'bg-gray-700' : 'bg-white'
                } ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
              ></div>
              
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
            <div className="space-y-3 sm:space-y-4 px-1">
              {isLogin ? (
                // Login Form
                <>
                  {renderInput('email', 'ایمیل خود را وارد کنید', 'email')}
                  {renderInput('password', 'رمز عبور', 'password', true, setShowPassword)}
                  
                  {/* Save Login & Forgot Password */}
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
                // Register Form
                <>
                  {renderInput('mobile', 'شماره موبایل', 'tel')}
                  {renderInput('email', 'ایمیل خود را وارد کنید', 'email')}
                  {renderInput('password', 'رمز عبور', 'password', true, setShowPassword)}
                  {renderInput('confirmPassword', 'تکرار رمز عبور', 'password', true, setShowConfirmPassword)}
                </>
              )}
            </div>

            {/* Or Divider */}
            <div className="relative py-2 mt-1">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center">
                <span className={`px-2 text-sm ${
                  isDarkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'
                }`}>
                  یا
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex justify-center gap-3 sm:gap-4 mb-4">
              {isIOS && (
                <button className="w-10 sm:w-12 h-10 sm:h-12 bg-black rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 sm:w-6 h-5 sm:h-6" fill="white">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                </button>
              )}
              <button className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center border ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <svg className="w-5sm:w-6 h-5 sm:h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button className="w-10 sm:w-12 h-10 sm:h-12 bg-[#1877F2] rounded-full flex items-center justify-center">
                <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>

            {/* Submit Button */}
            <div className="mt-4">
              <button 
                onClick={handleSubmit}
                className="w-full bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium hover:bg-[#e5c44c] transition-colors"
              >
                {isLogin ? 'ورود' : 'ثبت‌نام'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;