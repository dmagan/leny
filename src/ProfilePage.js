import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, User, Edit, UserCheck } from 'lucide-react';
import ProfileFormPage from './ProfileFormPage';

const formatDate = (date) => 
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

const ProfilePage = ({ isDarkMode, setIsLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const [userBallCount, setUserBallCount] = useState(0);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // دریافت تعداد توپ‌های کاربر
  const fetchUserBallCount = async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        setUserBallCount(0);
        return;
      }

      const response = await fetch('https://lenytoys.ir/wp-json/ball-codes/v1/user-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserBallCount(data.total_count || 0);
        } else {
          setUserBallCount(0);
        }
      } else {
        setUserBallCount(0);
      }
    } catch (error) {
      console.error('خطا در دریافت تعداد توپ‌ها:', error);
      setUserBallCount(0);
    }
  };

  // بررسی اینکه آیا پروفایل کامل شده یا نه
  const isProfileComplete = () => {
    return userInfo?.first_name && userInfo?.last_name && userInfo?.age && userInfo?.gender;
  };

  // نمایش نام کامل
  const getDisplayName = () => {
    if (isProfileComplete()) {
      return `${userInfo.first_name} ${userInfo.last_name}`;
    }
    return userInfo?.user_display_name || userInfo?.user_email || 'کاربر';
  };

  // نمایش جنسیت
  const getGenderDisplay = () => {
    if (!userInfo?.gender) return '';
    return userInfo.gender === 'male' ? '👦 پسر' : '👧 دختر';
  };

  const handleProfileComplete = (updatedUserInfo) => {
    setUserInfo(updatedUserInfo);
    setShowProfileForm(false);
  };

  useEffect(() => {
    const storedInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (storedInfo) {
      try {
        const parsedInfo = JSON.parse(storedInfo);
        setUserInfo(parsedInfo);
      } catch (error) {
        console.error('خطا در پردازش اطلاعات کاربر:', error);
      }
    }
    
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  useEffect(() => {
    if (userInfo?.user_email) {
      fetchUserBallCount();
    }
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
  }, [isLandscape]);

  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handleLogout = () => {
    // پاک کردن اطلاعات کاربر
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userInfo');
    // پاک کردن کش محصولات
    localStorage.removeItem('purchasedProducts');
    localStorage.removeItem('purchasedProductsTime');
    localStorage.removeItem('lastProductCheck');
    sessionStorage.removeItem('purchasedProducts');
    sessionStorage.removeItem('lastProductCheck');
    
    setIsLoggedIn(false);
    onLogout?.();
    navigate('/');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 overflow-hidden transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeCard();
        }
      }}
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
              <div className="mb-2 text-center pt-4">
                <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-2 flex items-center justify-center">
                  {isProfileComplete() ? (
                    <UserCheck className="w-8 h-8 text-white" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getDisplayName()}
                </h1>
                
                {/* نمایش اطلاعات بر اساس تکمیل پروفایل */}
                {isProfileComplete() ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {userInfo.age} ساله
                      </span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {getGenderDisplay()}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {userInfo.user_email}
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-2`}>
                      تعداد توپ‌های ثبت شده: {userBallCount}
                    </p>
                    <button
                      onClick={() => setShowProfileForm(true)}
                      className={`mt-2 px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      <Edit size={16} />
                      ویرایش پروفایل
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {userInfo?.user_email}
                    </p>
                    {userInfo?.user_registered && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(userInfo.user_registered).toLocaleDateString('fa-IR')} — {formatDate(new Date(userInfo.user_registered))}
                      </p>
                    )}
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-2`}>
                      تعداد توپ‌های ثبت شده: {userBallCount}
                    </p>
                    <button
                      onClick={() => setShowProfileForm(true)}
                      className="mt-3 px-6 py-2 bg-[#f7d55d] text-gray-900 rounded-lg text-sm font-medium hover:bg-[#e5c44c] transition-colors flex items-center gap-2 mx-auto"
                    >
                      <User size={16} />
                      تکمیل پروفایل
                    </button>
                  </div>
                )}
    
                <button
                  onClick={handleLogout}
                  className="w-full mt-6 bg-red-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  خروج از حساب کاربری
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ProfileFormPage */}
      {showProfileForm && (
        <ProfileFormPage
          isDarkMode={isDarkMode}
          userInfo={userInfo}
          onClose={() => setShowProfileForm(false)}
          onProfileComplete={handleProfileComplete}
        />
      )}
    </>
  );
};

export default ProfilePage;