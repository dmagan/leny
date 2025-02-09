import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, Package, ShoppingCart, User } from 'lucide-react';



const ProfilePage = ({ isDarkMode, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);

  useEffect(() => {
    const storedInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (storedInfo) {
      const parsedInfo = JSON.parse(storedInfo);
      console.log('Parsed User Info:', parsedInfo);
      setUserInfo(JSON.parse(storedInfo));
      loadPurchasedProducts();
      
    }
    
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
  }, [isLandscape]);

  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    navigate('/');
  };

  const [purchasedProducts, setPurchasedProducts] = useState([]);

  
  
  
  
  
  
  
  
  
  const loadPurchasedProducts = async () => {
    try {
      const storedInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (!storedInfo) {
        console.log('No user info found');
        return;
      }
  
      const userInfo = JSON.parse(storedInfo);
      const userEmail = userInfo.user_email;
  
      if (!userEmail) {
        console.log('No user email found');
        return;
      }
  
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      
      const response = await fetch(
        'https://alicomputer.com/wp-json/wc/v3/orders?status=completed',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          }
        }
      );
  
      if (!response.ok) throw new Error('خطا در دریافت سفارشات');
      
      const orders = await response.json();
      
      const userOrders = orders.filter(order => 
        order.billing && order.billing.email && 
        order.billing.email.toLowerCase() === userEmail.toLowerCase()
      );
  
      console.log('User Orders:', userOrders);
  
      const products = userOrders.flatMap(order => {
        const orderDate = new Date(order.date_created_gmt);
        
        return order.line_items.map(item => {
          // بررسی همه متادیتاها برای پیدا کردن مدت اشتراک
          console.log('Meta Data for item:', item.meta_data); // برای دیباگ
          
          let subscriptionMonths = 1; // مقدار پیش‌فرض 1 ماه
          
          // جستجو در همه متادیتاها برای پیدا کردن مدت اشتراک
          item.meta_data.forEach(meta => {
            if (typeof meta.value === 'string' && 
                (meta.value.includes('ماه') || meta.value.includes('month'))) {
              const match = meta.value.match(/(\d+)/);
              if (match) {
                subscriptionMonths = parseInt(match[1]);
              }
            }
          });
  
          // محاسبه روزهای باقی‌مانده
          const subscriptionDays = subscriptionMonths * 30;
          const endDate = new Date(orderDate.getTime() + (subscriptionDays * 24 * 60 * 60 * 1000));
          const remainingDays = Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)));
  
          console.log(`Product ${item.name}:`, {
            subscriptionMonths,
            orderDate: orderDate.toISOString(),
            endDate: endDate.toISOString(),
            remainingDays
          }); // برای دیباگ
  
          return {
            id: item.id,
            title: item.name,
            date: orderDate,
            status: remainingDays > 0 ? 'active' : 'expired',
            remainingDays: remainingDays,
            icon: item.name.includes('VIP') ? <ShoppingCart className="w-6 h-6" /> : <Package className="w-6 h-6" />
          };
        });
      });
  
      setPurchasedProducts(products);
  
    } catch (error) {
      console.error('Error loading purchased products:', error);
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
        <div className="pt-2">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        <div className="scrollable-content h-full overflow-y-auto pb-safe">
          <div className="px-6 pb-8 pt-4">
            <div className="mb-8 text-center pt-4">
              <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-6 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {userInfo?.user_display_name || 'کاربر'}
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {userInfo?.user_email}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                محصولات خریداری شده
              </h2>
              
              {purchasedProducts.map(product => (
                <div
                  key={product.id}
                  className={`p-4 rounded-xl border ${
                    isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {product.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-base">{product.title}</h3>
                      <div className="flex items-center justify-between mt-1">
  <div className="flex flex-col">
  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-right`} dir="rtl">
  {product.status === 'active' ? (
        <span>
          <span className="text-yellow-500">{product.remainingDays}</span>
          {' '}روز باقی‌مانده
        </span>
      ) : (
        'منقضی شده'
      )}
    </div>
  </div>
  <span className={`text-sm ${
    product.status === 'active' ? 'text-green-500' : 'text-red-500'
  }`}>
    {product.status === 'active' ? 'فعال' : 'منقضی شده'}
  </span>
</div>
                    </div>
                  </div>
                </div>
              ))}

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
  );
};

export default ProfilePage;