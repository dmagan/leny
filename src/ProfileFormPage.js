import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Save } from 'lucide-react';
import { Store } from 'react-notifications-component';

const ProfileFormPage = ({ isDarkMode, onClose, onProfileComplete, userInfo }) => {
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [showCard, setShowCard] = useState(false);

  // State های فرم - تغییر از age به تاریخ تولد
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: ''
  });

  const [errors, setErrors] = useState({});

  // آرایه ماه‌های شمسی
  const months = [
    { value: '01', label: 'فروردین' },
    { value: '02', label: 'اردیبهشت' },
    { value: '03', label: 'خرداد' },
    { value: '04', label: 'تیر' },
    { value: '05', label: 'مرداد' },
    { value: '06', label: 'شهریور' },
    { value: '07', label: 'مهر' },
    { value: '08', label: 'آبان' },
    { value: '09', label: 'آذر' },
    { value: '10', label: 'دی' },
    { value: '11', label: 'بهمن' },
    { value: '12', label: 'اسفند' }
  ];

  // محاسبه سن از تاریخ تولد شمسی
  const calculateAge = (birthYear) => {
    const currentYear = 1403; // سال جاری شمسی
    return currentYear - parseInt(birthYear);
  };

  useEffect(() => {
    // پر کردن فیلدها اگر اطلاعات موجود باشد
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        firstName: userInfo.first_name || '',
        lastName: userInfo.last_name || '',
        gender: userInfo.gender || ''
      }));
      
      // تجزیه تاریخ تولد اگر موجود باشد
      if (userInfo.birth_date) {
        const [year, month, day] = userInfo.birth_date.split('-');
        setFormData(prev => ({
          ...prev,
          birthYear: year,
          birthMonth: month,
          birthDay: day
        }));
      } else if (userInfo.age) {
        // اگر فقط سن موجود باشد، سال تولد تقریبی محاسبه کنیم
        const currentYear = 1403;
        setFormData(prev => ({
          ...prev,
          birthYear: (currentYear - parseInt(userInfo.age)).toString()
        }));
      }
    }

    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, [userInfo]);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // پاک کردن خطا برای فیلد فعلی
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'نام الزامی است';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'نام خانوادگی الزامی است';
    }

    // اعتبارسنجی تاریخ تولد
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      newErrors.birthDate = 'تاریخ تولد کامل الزامی است';
    } else {
      const age = calculateAge(formData.birthYear);
      if (age < 1 || age > 120) {
        newErrors.birthDate = 'سن محاسبه شده باید بین 1 تا 120 سال باشد';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'انتخاب جنسیت الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        throw new Error('توکن احراز هویت یافت نشد');
      }

      // محاسبه سن برای ارسال به سرور
      const age = calculateAge(formData.birthYear);
      const birthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;

      const response = await fetch('https://lenytoys.ir/wp-json/profile/v1/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: age, // سن محاسبه شده
          birth_date: birthDate, // تاریخ تولد کامل
          gender: formData.gender
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // به‌روزرسانی اطلاعات کاربر در localStorage
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        const updatedUserInfo = {
          ...currentUserInfo,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: age,
          birth_date: birthDate,
          gender: formData.gender,
          profile_completed: true
        };

        if (localStorage.getItem('userInfo')) {
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        } else {
          sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        }

        Store.addNotification({
          title: "موفق! 🎉",
          message: "اطلاعات پروفایل شما با موفقیت ذخیره شد",
          type: "success",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });

        // فراخوانی callback و بستن فرم
        if (onProfileComplete) {
          onProfileComplete(updatedUserInfo);
        }
        closeCard();
      } else {
        throw new Error(data.message || 'خطا در ذخیره اطلاعات');
      }
    } catch (error) {
      console.error('خطا در ذخیره پروفایل:', error);
      Store.addNotification({
        title: "خطا",
        message: error.message || "خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید",
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
        className={`fixed bottom-0 left-0 right-0 w-full ${
          isDarkMode ? 'bg-[#0d1822]' : 'bg-white'
        } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out ${
          isLandscape ? 'h-screen overflow-y-auto' : 'max-h-[92vh] overflow-hidden'
        }`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: isLandscape ? 'auto' : 'none',
        }}
      >
        <div className="pt-2 relative">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
          
          <button 
            onClick={closeCard}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="scrollable-content h-full overflow-y-auto pb-safe">
          <div className="px-6 pb-8 pt-4">
            <div className="mb-6 text-center pt-4">
              <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                تکمیل پروفایل
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                لطفاً اطلاعات خود را کامل کنید
              </p>
            </div>

            <div className="space-y-4" dir="rtl">
              {/* نام */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  نام *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  } ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#f7d55d]`}
                  placeholder="نام خود را وارد کنید"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* نام خانوادگی */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  نام خانوادگی *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  } ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white placeholder-gray-500' 
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#f7d55d]`}
                  placeholder="نام خانوادگی خود را وارد کنید"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* تاریخ تولد - 3 باکس جداگانه */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  تاریخ تولد *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* روز */}
                  <select
                    value={formData.birthDay}
                    onChange={(e) => handleInputChange('birthDay', e.target.value)}
                    className={`px-3 py-3 rounded-xl border ${
                      errors.birthDate ? 'border-red-500' : 'border-gray-300'
                    } ${
                      isDarkMode 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#f7d55d]`}
                  >
                    <option value="">روز</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day.toString().padStart(2, '0')}>
                        {day}
                      </option>
                    ))}
                  </select>

                  {/* ماه */}
                  <select
                    value={formData.birthMonth}
                    onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                    className={`px-3 py-3 rounded-xl border ${
                      errors.birthDate ? 'border-red-500' : 'border-gray-300'
                    } ${
                      isDarkMode 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#f7d55d]`}
                  >
                    <option value="">ماه</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>

                  {/* سال */}
                  <select
                    value={formData.birthYear}
                    onChange={(e) => handleInputChange('birthYear', e.target.value)}
                    className={`px-3 py-3 rounded-xl border ${
                      errors.birthDate ? 'border-red-500' : 'border-gray-300'
                    } ${
                      isDarkMode 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-white text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#f7d55d]`}
                  >
                    <option value="">سال</option>
                    {Array.from({ length: 80 }, (_, i) => 1403 - i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.birthDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                )}
                {/* نمایش سن محاسبه شده */}
                {formData.birthYear && (
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    سن محاسبه شده: {calculateAge(formData.birthYear)} سال
                  </p>
                )}
              </div>

              {/* جنسیت */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  جنسیت *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'male')}
                    className={`py-3 px-4 rounded-xl border-2 transition-colors ${
                      formData.gender === 'male'
                        ? 'border-[#f7d55d] bg-[#f7d55d]/10'
                        : errors.gender 
                          ? 'border-red-500'
                          : 'border-gray-300'
                    } ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    👦 پسر
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'female')}
                    className={`py-3 px-4 rounded-xl border-2 transition-colors ${
                      formData.gender === 'female'
                        ? 'border-[#f7d55d] bg-[#f7d55d]/10'
                        : errors.gender 
                          ? 'border-red-500'
                          : 'border-gray-300'
                    } ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    👧 دختر
                  </button>
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full mt-8 bg-[#f7d55d] text-gray-900 rounded-xl py-4 text-lg font-medium transition-colors relative ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e5c44c]'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">ذخیره اطلاعات</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Save size={20} />
                  ذخیره اطلاعات
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileFormPage;