import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, Package, ShoppingCart, User } from 'lucide-react';
import ProductSkeleton from './ProductSkeleton';





const ProfilePage = ({ isDarkMode, setIsLoggedIn }) => {
  const [isLoading, setIsLoading] = useState(true);
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
  
  // اضافه کردن یک useEffect جدید
  useEffect(() => {
    if (userInfo?.user_email) {
      loadPurchasedProducts();
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
  
  setIsLoggedIn(false);
  navigate('/');
};

  const [purchasedProducts, setPurchasedProducts] = useState([]);

  
  
  
  
  
  
  
  
  
  const loadPurchasedProducts = async () => {
    try {
      setIsLoading(true);
      
      // بررسی وجود اطلاعات کاربر
      if (!userInfo?.user_email) {
        setPurchasedProducts([]);
        setIsLoading(false);
        return;
      }
  
      // دریافت محصولات خریداری شده از API جدید
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        setPurchasedProducts([]);
        setIsLoading(false);
        return;
      }
      
      try {
        // ابتدا از API جدید برای دریافت خریدها استفاده می‌کنیم
        const response = await fetch('https://p30s.com/wp-json/pcs/v1/user-purchases', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && Array.isArray(data.purchases) && data.purchases.length > 0) {
            // تبدیل داده‌های API به فرمت مورد نیاز
            const products = data.purchases.map(purchase => {
              // ساخت آبجکت محصول
              const productData = {
                id: purchase.id,
                title: purchase.title,
                date: new Date(purchase.date),
                status: purchase.status,
                remainingDays: purchase.remainingDays,
                isVIP: purchase.isVIP
              };
    
              // اضافه کردن آیکون برای نمایش
              return {
                ...productData,
                icon: productData.isVIP ? <ShoppingCart className="w-6 h-6" /> : <Package className="w-6 h-6" />
              };
            });
            
            // ذخیره در localStorage برای استفاده‌های بعدی
            const productsForCache = products.map(({ icon, ...rest }) => rest);
            localStorage.setItem('purchasedProducts', JSON.stringify(productsForCache));
            localStorage.setItem('lastProductCheck', new Date().getTime().toString());
            
            // بروزرسانی state
            setPurchasedProducts(products);
            setIsLoading(false);
            return;
          }
        }
        
        // اگر API جدید پاسخ مناسب نداد، از روش قبلی استفاده می‌کنیم
        throw new Error('API جدید پاسخ مناسب نداد');
        
      } catch (apiError) {
        console.warn('خطا در استفاده از API جدید، استفاده از روش قبلی...', apiError);
        
        // استفاده از روش قبلی برای دریافت سفارشات
        const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
        
        // دریافت سفارشات از API
        const response = await fetch(
          'https://p30s.com/wp-json/wc/v3/orders?status=completed',
          {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Accept': 'application/json'
            }
          }
        );
    
        // بررسی خطای API
        if (!response.ok) {
          throw new Error('خطا در دریافت سفارشات');
        }
        
        // تبدیل پاسخ به JSON
        const orders = await response.json();
        
        // فیلتر کردن سفارشات کاربر فعلی
        const userOrders = orders.filter(order => 
          order.billing?.email?.toLowerCase() === userInfo.user_email.toLowerCase()
        );
    
        // تبدیل سفارشات به محصولات
        const products = userOrders.flatMap(order => {
          const orderDate = new Date(order.date_created_gmt);
          
          return order.line_items.map(item => {
            // پیدا کردن مدت اشتراک از متادیتا
            let subscriptionMonths = 1; // مقدار پیش‌فرض یک ماه
            
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
  
    
            // ساخت آبجکت محصول
            const productData = {
              id: item.id,
              title: item.name,
              date: orderDate,
              status: remainingDays > 0 ? 'active' : 'expired',
              remainingDays: remainingDays,
              isVIP: item.name.includes('VIP')
            };
    
            // اضافه کردن آیکون برای نمایش
            return {
              ...productData,
              icon: productData.isVIP ? <ShoppingCart className="w-6 h-6" /> : <Package className="w-6 h-6" />
            };
          });
        });
    
        // ذخیره در localStorage
        const productsForCache = products.map(({ icon, ...rest }) => rest);
        localStorage.setItem('purchasedProducts', JSON.stringify(productsForCache));
        localStorage.setItem('lastProductCheck', new Date().getTime().toString());
        
        // بروزرسانی state
        setPurchasedProducts(products);
      }
  
    } catch (error) {
      console.error('Error loading purchased products:', error);
      
      // در صورت خطا، بررسی کنیم آیا اطلاعات در localStorage وجود دارد
      const cachedData = localStorage.getItem('purchasedProducts');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          const productsWithIcons = parsedData.map(product => ({
            ...product,
            icon: product.isVIP ? <ShoppingCart className="w-6 h-6" /> : <Package className="w-6 h-6" />
          }));
          setPurchasedProducts(productsWithIcons);
        } catch (cacheError) {
          console.error('Error parsing cached data:', cacheError);
          setPurchasedProducts([]);
        }
      } else {
        setPurchasedProducts([]);
      }
      
      console.log("محصولات خریداری شده در پروفایل:", purchasedProducts);
      const productsForCache = purchasedProducts.map(({ icon, ...rest }) => rest);
      localStorage.setItem('purchasedProducts', JSON.stringify(productsForCache));
      
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 bg-black/75 overflow-hidden transition-opacity duration-300"
    onClick={(e) => {
      // اگر کلیک روی خود overlay بود (نه روی کارت)، کارت رو ببند
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
  
            <div className="space-y-4 text-right" dir="rtl">
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 `}>
                محصولات خریداری شده
              </h2>
              
              {isLoading ? (
                <>
                  <ProductSkeleton isDarkMode={isDarkMode} />
                  <ProductSkeleton isDarkMode={isDarkMode} />
                  <ProductSkeleton isDarkMode={isDarkMode} />
                </>
              ) : purchasedProducts.length > 0 ? (
                purchasedProducts.map(product => (
                  <div key={product.id} className={`p-4 rounded-xl border ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
 <div className="flex flex-col gap-4">
   <div className="flex items-center justify-between">
     <div className="flex-1">
       <h3 className="font-medium text-base">{product.title}</h3>
       <div className="flex items-center justify-between mt-1">
         <div className="flex flex-col">
           <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
             {new Date(product.date).toLocaleDateString('fa-IR')}
           </p>
           {product.status === 'active' && (
             <p className="text-sm text-yellow-500">
               روزهای باقیمانده: {product.remainingDays}
             </p>
           )}
         </div>
         <span className={`text-sm ${product.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
           {product.status === 'active' ? 'فعال' : 'منقضی شده'}
         </span>
       </div>
     </div>
     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
       product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
     }`}>
       {product.icon}
     </div>
   </div>
   {product.status !== 'active' && (
     <button onClick={() => navigate('/products')} className="w-full bg-[#f7d55d] text-gray-900 py-3 rounded-xl text-sm">
       تمدید اشتراک
     </button>
   )}
 </div>
</div>

))
              ) : (
                <div className={`text-center p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  محصولی یافت نشد
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
  );
};

export default ProfilePage;