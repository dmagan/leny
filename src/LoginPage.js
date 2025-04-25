import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'react-notifications-component';
import { countries } from './countryList';

const validateMobile = (mobile) => {
  // حذف هر کاراکتری به جز اعداد
  const numericMobile = mobile.replace(/\D/g, '');
  // چک کردن طول شماره بین 8 تا 13 رقم
  return numericMobile.length >= 8 && numericMobile.length <= 13;
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateRegister = async (userData, selectedCountry) => {
  try {
    const fullPhoneNumber = (selectedCountry.code.replace('+', '00') + userData.mobile).replace(/\s+/g, '');
    const response = await fetch('https://p30s.com/wp-json/wp/v2/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: userData.email.split('@')[0],
        email: userData.email,
        password: userData.password,
        phone_number: fullPhoneNumber,
        name: userData.fullName,
        phone: fullPhoneNumber
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
    //console.error('Register error:', error);
    return {
      success: false,
      message: 'خطا در ارتباط با سرور',
      type: 'network_error'
    };
  }
};

const LoginPage = ({ isDarkMode, setIsLoggedIn, onClose }) => {
  const [selectedCountry, setSelectedCountry] = useState({ code: '+98', flag: '🇮🇷', name: 'Iran' });
  const [showCountries, setShowCountries] = useState(false);
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

  // state برای حالت بازیابی رمز عبور
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountries && !event.target.closest('.country-selector')) {
        setShowCountries(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountries]);

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
      if (e.target.closest('.country-selector')) return;
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
      // اگر onClose به عنوان prop منتقل شده باشد، از آن استفاده کن
      if (onClose) {
        onClose();
      } else {
        // در غیر این صورت، از navigate استفاده کن (برای حالت‌های مستقل)
        navigate(-1);
      }
    }, 300);
  };




  const handleLoginSuccess = async (result) => {
    setIsLoggedIn(true);
    try {
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      const response = await fetch(
        'https://p30s.com/wp-json/wc/v3/orders?status=completed',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          }
        }
      );
      const orders = await response.json();
      const userOrders = orders.filter(order => 
        order.billing?.email?.toLowerCase() === result.user_email.toLowerCase()
      );
      const products = userOrders.flatMap(order => {
        const orderDate = new Date(order.date_created_gmt);
        return order.line_items.map(item => {
          let subscriptionMonths = 1;
          item.meta_data.forEach(meta => {
            if (typeof meta.value === 'string' && 
                (meta.value.includes('ماه') || meta.value.includes('month'))) {
              const match = meta.value.match(/(\d+)/);
              if (match) {
                subscriptionMonths = parseInt(match[1]);
              }
            }
          });
          const subscriptionDays = subscriptionMonths * 30;
          const endDate = new Date(orderDate.getTime() + (subscriptionDays * 24 * 60 * 60 * 1000));
          const remainingDays = Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)));
          return {
            id: item.id,
            title: item.name,
            date: orderDate,
            status: remainingDays > 0 ? 'active' : 'expired',
            remainingDays: remainingDays,
            isVIP: item.name.includes('VIP')
          };
        });
      });
      localStorage.setItem('purchasedProducts', JSON.stringify(products));
      localStorage.setItem('lastProductCheck', new Date().getTime());
    } catch (error) {
      //console.error('Error loading products:', error);
    }
    navigate('/');
  };





  const validateLogin = async (username, password, rememberMe) => {
    try {
      const response = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
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
        if (rememberMe) {
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userInfo', JSON.stringify(data));
        } else {
          sessionStorage.setItem('userToken', data.token);
          sessionStorage.setItem('userInfo', JSON.stringify(data));
        }
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
      //console.error('Network error:', error);
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
        title: "خطا",
        message: "لطفاً یک ایمیل معتبر وارد کنید",
        type: "danger",
        insert: "top",
        container: "center",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animated", "animate__flipOutX"],
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
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
      // ثبت‌نام
      if (!formData.fullName || !formData.email || !formData.password || !formData.mobile) {
        Store.addNotification({
          title: "خطا",
          message: "لطفا تمام فیلدها را پر کنید",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        });
        return;
      }
  
      if (!validateEmail(formData.email)) {
        Store.addNotification({
          title: "خطا",
          message: "لطفا یک ایمیل معتبر وارد کنید",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        });
        return;
      }
  
      if (!validateMobile(formData.mobile)) {
        Store.addNotification({
          title: "خطا",
          message: "شماره موبایل باید بین 8 تا 13 رقم باشد",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        });
        return;
      }
  
      if (formData.password !== formData.confirmPassword) {
        Store.addNotification({
          title: "خطا",
          message: "رمز عبور و تکرار آن مطابقت ندارند",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        });
        return;
      }
  
      setIsLoading(true);
      try {
        const result = await validateRegister(formData, selectedCountry);
  
        if (result.success) {
          setIsLoggedIn(true);
          Store.addNotification({
            title: "موفق",
            message: result.message,
            type: "success",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 2000, showIcon: true, pauseOnHover: true },
            style: { direction: 'rtl', textAlign: 'right' }
          });
  
          await handleLoginSuccess(result);
        } else {
          Store.addNotification({
            title: "خطا",
            message: result.message,
            type: "danger",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
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
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // ورود
      if (!formData.email || !formData.password) {
        Store.addNotification({
          title: "خطا",
          message: "لطفا نام کاربری و رمز عبور را وارد کنید",
          type: "danger",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
        return;
      }
  
      setIsLoading(true);
      try {
        const result = await validateLogin(formData.email, formData.password, saveLogin);
  
        if (result.success) {
          setIsLoggedIn(true);
          Store.addNotification({
            title: "موفق",
            message: result.message,
            type: "success",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
            style: { direction: 'rtl', textAlign: 'right' }
          });
  
          setTimeout(() => {
            navigate('/');
          }, 0);
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
            dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
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
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // به‌روزرسانی تابع handleForgotPassword برای استفاده از دستور curl ارائه‌شده
  const handleForgotPassword = async () => {
    if (!formData.email) {
      Store.addNotification({
        title: "خطا",
        message: "لطفاً ایمیل خود را وارد کنید",
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
      // آماده‌سازی داده‌ها به صورت URL-encoded
      const params = new URLSearchParams();
      params.append('user_login', formData.email);
      params.append('redirect_to', '');
      params.append('wp-submit', 'دریافت رمز تازه');

      const response = await fetch('https://p30s.com/wp-login.php?action=lostpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://p30s.com/wp-login.php?action=lostpassword'
        },
        body: params.toString()
      });
      
      // دریافت پاسخ به صورت متنی (HTML)
      const responseText = await response.text();
      
      if (response.ok) {
        Store.addNotification({
          title: "موفق",
          message: "ایمیل بازیابی ارسال شد",
          type: "success",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
        // بازگشت به فرم ورود پس از موفقیت
        setIsForgotPassword(false);
      } else {
        Store.addNotification({
          title: "خطا",
          message: "خطا در ارسال درخواست بازیابی",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
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
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (name, placeholder, type = 'text', showPasswordToggle = false, setShowPasswordState, inputProps = {}) => {
    const isPassword = type === 'password';
    const showCurrentPassword = isPassword && showPassword;
    const isConfirmPassword = name === 'confirmPassword';
    const passwordsMatch = isConfirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword !== '';
    const isMobile = type === 'tel';

    return (
      <div className="relative">
        <div className="relative flex items-center">
          {isMobile && (
            <div
              dir="rtl"
              className="absolute right-4 flex flex-row-reverse items-center gap-2 cursor-pointer"
              onClick={() => setShowCountries(prev => !prev)}
            >
              <span className={`text-lg ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>|</span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedCountry.code}
              </span>
              <span className="text-sm">{selectedCountry.flag}</span>
            </div>
          )}

          <input
            {...inputProps}
            type={showCurrentPassword ? 'text' : type}
            name={name}
            value={formData[name]}
            onChange={inputProps.onChange || handleChange}
            className={`w-full px-4 py-3 sm:py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] rtl-placeholder text-right ${
              isDarkMode 
                ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            } ${isMobile ? 'pr-[97px]' : ''}`}
            placeholder={placeholder}
            style={{ fontSize: '16px', textAlign: 'right' }}
            dir="rtl"
            autoComplete="off"
            autoCorrect="off"
          />

          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isPassword && (
              <button
                onClick={() => setShowPassword(prev => !prev)}
                className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {showCurrentPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            )}

            {isConfirmPassword && formData.confirmPassword && (
              <div className={`transition-colors ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                {passwordsMatch ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>

        {isMobile && showCountries && (
          <div 
            className={`country-selector absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="py-2 max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountries(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100 ${
                    isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm">{country.code}</span>
                  <span className="text-sm text-gray-500">{country.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {formData[name] && !isPassword && !isMobile && (
          <button
            onClick={() => clearInput(name)}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {/* دکمه پاک کردن در صورت نیاز */}
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
        className={`fixed bottom-0 left-0 right-0 w-full ${isDarkMode ? 'bg-[#0d1822]' : 'bg-white'} rounded-t-3xl shadow-lg transition-transform duration-300 ease-out ${
          isLandscape ? 'h-screen overflow-y-auto' : 'max-h-[92vh] overflow-hidden'
        }`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: isLandscape ? 'auto' : 'none',
        }}
      >
        {isForgotPassword && (
          <button 
            onClick={() => setIsForgotPassword(false)}
            className="absolute top-4 left-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        )}

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
            {isForgotPassword ? (
              <>
                <div className="mb-8 text-center pt-4">
                  <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    بازیابی رمز عبور
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ایمیل خود را وارد کنید
                  </p>
                </div>
                <div className="space-y-4 px-1">
                  {renderInput('email', 'ایمیل خود را وارد کنید', 'email', false, null, {
                    onBlur: handleEmailBlur,
                    autoComplete: "off",
                    autoCorrect: "off"
                  })}
                  <button
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className={`w-full mt-6 bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium transition-colors relative ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e5c44c]'}`}
                  >
                    {isLoading ? (
                      <>
                        <span className="opacity-0">بازیابی</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        </div>
                      </>
                    ) : (
                      'بازیابی'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
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
                    className={`absolute inset-[3px] w-[calc(50%-3px)] rounded-full transition-transform duration-300 ease-out ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
                  />
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2.5 sm:py-3 rounded-full text-sm z-10 transition-colors relative ${isLogin ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}
                  >
                    ورود
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2.5 sm:py-3 rounded-full text-sm z-10 transition-colors relative ${!isLogin ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}
                  >
                    ثبت‌نام
                  </button>
                </div>

                <div className="space-y-4 px-1">
                  {isLogin ? (
                    <>
                      {renderInput('email', 'ایمیل خود را وارد کنید', 'email', false, null, {
                        onBlur: handleEmailBlur,
                        autoComplete: "off",
                        autoCorrect: "off"
                      })}
                      {renderInput('password', 'رمز عبور', 'password', true, setShowPassword)}
                      <div className="flex items-center justify-between pt-2">
                        <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <input
                            type="checkbox"
                            checked={saveLogin}
                            onChange={(e) => setSaveLogin(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          من رو به خاطر بسپار
                        </label>
                        <button
                          onClick={() => setIsForgotPassword(true)}
                          className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                          فراموشی رمز عبور؟
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {renderInput('fullName', 'نام و نام خانوادگی')}
                      {renderInput('mobile', 'شماره موبایل', 'tel', false, null, {
                        pattern: '[0-9]*',
                        inputMode: 'numeric',
                        onChange: (e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setFormData(prev => ({ ...prev, mobile: value }));
                        }
                      })}
                      {renderInput('email', 'ایمیل خود را وارد کنید', 'email', false, null, {
                        onBlur: handleEmailBlur,
                        autoComplete: "off",
                        autoCorrect: "off"
                      })}
                      {renderInput('password', 'رمز عبور', 'password', true, setShowPassword)}
                      {renderInput('confirmPassword', 'تکرار رمز عبور', 'password', true, setShowPassword)}
                    </>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-full mt-6 bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium transition-colors relative ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e5c44c]'}`}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
