import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import CourseApp from './CourseApp-Leny.js';
import AsadPage from './AsadPage';
import Chat from './vipChanel';
import StoriesPage from './components/StoriesPage';
import ProfilePage from './ProfilePage';
import LoginPage from './LoginPage';
import OrientationLock from './OrientationLock';
import MentorPage from './MentorPage';
import SupportPage from './SupportPage';
import DexPage from './dex'; 
import CustomLoading from './CustomLoading';
import FaqPage from './faq'; 
import VIPPage from './VIP-Service-Page';  
import ZeroTo100ServicePage from './0to100-Service-Page';
import DexServicesPage from './Dex-Services-Page';
import SignalStreamServicePage from './SignalStream-Service-Page';
import ProductsPage from './ProductsPage';
import PageTransition from './components/PageTransition';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import 'react-notifications-component/dist/theme.css'
import 'animate.css/animate.min.css'
import { Navigate } from 'react-router-dom';
import SignalStreamChannel from './chanel-signal-stream';
import PublicChannel from './chanel-public';
import PostsChannel from './chanel-posts';
import { Toaster } from 'react-hot-toast';
import IOSInstallPrompt from './IOSInstallPrompt';
import { shouldShowInstallPrompt } from './detectIOS';
import DesktopWarning from './DesktopWarning';
import ZeroTo100 from './0to100';
import supportNotificationService from './SupportNotificationService';
import TradeProPage from './TradePro-Service-Page';
import TradeProCoursePage from './tradepro';
import CryptoTermsPage from './CryptoTermsPage';
import ErrorBoundary from './ErrorBoundary';
import NewSupportPage from './NewSupportPage';
import newSupportNotificationService from './NewSupportNotificationService';
import MimCoinChannel from './MimCoinChannel';
import SimpleSmsLogin from './SimpleSmsLogin';
import ProfileFormPage from './ProfileFormPage';










// بازنویسی کامل متد چک کردن پیام‌های جدید
supportNotificationService.checkForNewMessages = async function() {
  try {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) return;
    
    // استفاده از API صحیح wpas-api به جای awesome-support
    const ticketsResponse = await fetch('https://lenytoys.ir/wp-json/wpas-api/v1/tickets', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!ticketsResponse.ok) {
      // اگر API اصلی کار نکرد، ادامه نده
      console.log('Tickets API failed with status:', ticketsResponse.status);
      return;
    }
    
    const tickets = await ticketsResponse.json();
    
    // بررسی تیکت‌ها برای پیام‌های ادمین
    let adminMessages = [];
    
    // چک کردن هر تیکت و پاسخ‌های آن
    for (const ticket of tickets) {
      try {
        // دریافت پاسخ‌های هر تیکت
        const repliesResponse = await fetch(`https://lenytoys.ir/wp-json/wpas-api/v1/tickets/${ticket.id}/replies`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (repliesResponse.ok) {
          const replies = await repliesResponse.json();
          // فیلتر کردن پاسخ‌های ادمین
          const agentReplies = replies.filter(reply => 
            reply.author === 1 || 
            reply.author_name === 'admin' || 
            reply.author_name === 'support'
          );
          
          adminMessages = [...adminMessages, ...agentReplies];
        }
      } catch (err) {
        // خطای یک تیکت را نادیده بگیر و به بقیه ادامه بده
        continue;
      }
    }
    
    if (adminMessages.length === 0) return;
    
    // مرتب‌سازی بر اساس تاریخ
    adminMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // آخرین پیام ادمین
    const latestAdminMessage = adminMessages[0];
    
    // بررسی آیا پیام‌های خوانده نشده داریم
    if (!this.lastReadMessageId || parseInt(this.lastReadMessageId) < parseInt(latestAdminMessage.id)) {
      // محاسبه تعداد پیام‌های خوانده نشده
      const unreadMessages = adminMessages.filter(msg => 
        !this.lastReadMessageId || parseInt(msg.id) > parseInt(this.lastReadMessageId)
      );
      
      this.unreadCount = unreadMessages.length;
      
      // اطلاع‌رسانی به listeners
      this.notifyListeners();
    }
  } catch (error) {
    console.error('Error checking for new support messages:', error);
  }
};

// تعریف تابع درخواست با توکن
window.authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  
  if (!token) {
    // اگر توکن وجود نداشت، به صفحه لاگین هدایت کنیم
    window.location.href = '/login';
    return null;
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // اگر توکن منقضی شده باشد، تلاش برای تمدید خودکار
      if (localStorage.getItem('userPassword')) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        console.log('توکن نامعتبر است، در حال تمدید خودکار در authenticatedFetch...');
        
        const loginResponse = await fetch('https://lenytoys.ir/wp-json/jwt-auth/v1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: userInfo.user_email,
            password: localStorage.getItem('userPassword')
          })
        });
        
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          if (data.token) {
            // ذخیره توکن جدید
            if (localStorage.getItem('userToken')) {
              localStorage.setItem('userToken', data.token);
              localStorage.setItem('userInfo', JSON.stringify(data));
              localStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
              localStorage.setItem('tokenExpiration', (new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toString());
            } else {
              sessionStorage.setItem('userToken', data.token);
              sessionStorage.setItem('userInfo', JSON.stringify(data));
              sessionStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
            }
            
            console.log('توکن با موفقیت در authenticatedFetch تمدید شد');
            
            // تلاش مجدد درخواست با توکن جدید
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${data.token}`
              }
            });
          }
        }
      }
      
      // اگر تمدید توکن موفق نبود، کاربر را به صفحه لاگین هدایت کنیم
      window.location.href = '/login';
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('خطا در ارسال درخواست:', error);
    throw error;
  }
};

// این کامپوننت برای استفاده از useNavigate ایجاد شده است
function AppRoutes({
  isDarkMode, 
  setIsDarkMode,
  products,
  cryptoPrices,
  stories,
  loading,
  sliders,
  isLoggedIn,
  handleLogout,
  setIsLoggedIn,
  unreadSupportMessages
}) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={
        <CourseApp 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          products={products} 
          cryptoPrices={cryptoPrices} 
          stories={stories} 
          loading={loading} 
          sliders={sliders}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          unreadSupportMessages={unreadSupportMessages}
        />
      } />
      
<Route path="/new-support" element={
  isLoggedIn ? (
    <>
      <CourseApp 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        products={products} 
        cryptoPrices={cryptoPrices} 
        stories={stories} 
        loading={loading} 
        sliders={sliders}
        isLoggedIn={isLoggedIn}    
        onLogout={handleLogout}     
      />
      <NewSupportPage 
        isDarkMode={isDarkMode} 
      />
    </>
  ) : (
    <>
      <CourseApp 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        products={products} 
        cryptoPrices={cryptoPrices} 
        stories={stories} 
        loading={loading} 
        sliders={sliders}
        isLoggedIn={isLoggedIn}    
        onLogout={handleLogout}     
      />
      <LoginPage 
        isDarkMode={isDarkMode} 
        setIsLoggedIn={setIsLoggedIn} 
      />
    </>
  )
} />

<Route path="/mimcoin" element={<MimCoinChannel isDarkMode={isDarkMode} />} />







<Route path="/tradepro" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
    <TradeProPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />




<Route
  path="/dex-terms"
  element={<CryptoTermsPage isDarkMode={isDarkMode} onBack={() => navigate(-1)} />}
/>

<Route path="/tradepro-course" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
    <TradeProCoursePage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />

      <Route path="/asad" element={<AsadPage isDarkMode={isDarkMode} />} />

      <Route path="/chat" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
    <Chat
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />

<Route path="/chanel-posts" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
    <PostsChannel 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />



      <Route path="/chanel-signal-stream" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
    <SignalStreamChannel 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />

      <Route path="/chanel-public" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
    <PublicChannel 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />

      <Route path="/vip" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}    
      onLogout={handleLogout}     
    />
    <VIPPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />




      <Route path="/stories/:storyId" element={<StoriesPage isDarkMode={isDarkMode} stories={stories} />} />
      
      <Route path="/login" element={
        isLoggedIn ? (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}    
              onLogout={handleLogout}     
            />
            <ProfilePage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn}
              onLogout={handleLogout}
            />
          </>
        ) : (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}    
              onLogout={handleLogout}     
            />
            <LoginPage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn} 
            />
          </>
        )
      } />
      
      <Route path="/mentor" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}  
            onLogout={handleLogout}     
          />
          <MentorPage isDarkMode={isDarkMode} />
        </>
      } />
      
      <Route path="/products" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}    
            onLogout={handleLogout}     
          />
          <ProductsPage 
            isDarkMode={isDarkMode} 
          />
        </>
      } />
      
      <Route path="/faq" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}  
            onLogout={handleLogout}     
          />
          <PageTransition>
            <FaqPage isDarkMode={isDarkMode} />
          </PageTransition>
        </>
      } />
      
      

      <Route path="/dex" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
    <DexPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  </>
} />



      <Route path="/support" element={
        isLoggedIn ? (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}    
              onLogout={handleLogout}     
            />
            <SupportPage 
              isDarkMode={isDarkMode} 
            />
          </>
        ) : (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}    
              onLogout={handleLogout}     
            />
            <LoginPage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn} 
            />
          </>
        )
      } />
      
      <Route path="/profile" element={
        isLoggedIn ? (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
            <ProfilePage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn}
              onLogout={handleLogout}
            />
          </>
        ) : (
          <>
            <CourseApp 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              products={products} 
              cryptoPrices={cryptoPrices} 
              stories={stories} 
              loading={loading} 
              sliders={sliders}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
            <LoginPage 
              isDarkMode={isDarkMode} 
              setIsLoggedIn={setIsLoggedIn} 
            />
          </>
        )
      } />

      {/* مسیرهای جدید برای صفحات خدمات (برای لینک‌های اسلایدر) */}
      <Route path="/dex-services" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}    
      onLogout={handleLogout}     
    />
    <DexServicesPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => {
        navigate('/', { replace: true });
      }}
    />
  </>
} />

      <Route path="/0to100-services" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}    
            onLogout={handleLogout}     
          />
          <ZeroTo100ServicePage 
            isDarkMode={isDarkMode}
            isOpen={true}
            onClose={() => navigate(-1)}
          />
        </>
      } />

<Route path="/0to100" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
    <ZeroTo100
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => navigate('/')}
    />
  </>
} />
      

<Route path="/vip-services" element={
  <>
    <CourseApp 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
      products={products} 
      cryptoPrices={cryptoPrices} 
      stories={stories} 
      loading={loading} 
      sliders={sliders}
      isLoggedIn={isLoggedIn}    
      onLogout={handleLogout}     
    />
    <VIPPage 
      isDarkMode={isDarkMode}
      isOpen={true}
      onClose={() => {
        // به جای navigate(-1) باید به صفحه اصلی برگردیم و تاریخچه را جایگزین کنیم
        navigate('/', { replace: true });
      }}
    />
  </>
} />

      <Route path="/signal-stream" element={
        <>
          <CourseApp 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            products={products} 
            cryptoPrices={cryptoPrices} 
            stories={stories} 
            loading={loading} 
            sliders={sliders}
            isLoggedIn={isLoggedIn}    
            onLogout={handleLogout}     
          />
          <SignalStreamServicePage 
            isDarkMode={isDarkMode}
            isOpen={true}
            onClose={() => navigate(-1)}
          />
        </>
      } />
    </Routes>
  );
}

const App = () => {
  // All states
const [showDesktopWarning, setShowDesktopWarning] = useState(false);
const [showIOSPrompt, setShowIOSPrompt] = useState(false);
const [isDarkMode, setIsDarkMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sliders, setSliders] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadSupportMessages, setUnreadSupportMessages] = useState(0);
  const [unreadNewSupportMessages, setUnreadNewSupportMessages] = useState(0);
const [showSmsLogin, setShowSmsLogin] = useState(false);// شروع با  OTP

// 👈 دقیقاً اینجا useEffect جدید را اضافه کنید:
useEffect(() => {
  const checkInitialLoginStatus = () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    
    console.log('چک کردن وضعیت لاگین در ابتدای اپ:', { token: !!token, userInfo: !!userInfo });
    
    if (token && userInfo) {
      setIsLoggedIn(true);
      setShowSmsLogin(false);
      console.log('کاربر قبلاً لاگین کرده');
    } else {
      setIsLoggedIn(false);
      setShowSmsLogin(false);
      console.log('کاربر لاگین نیست، نمایش صفحه OTP');
    }
  };
  
  // تاخیر کوتاه برای اطمینان از لود شدن کامل اپ
  setTimeout(checkInitialLoginStatus, 1000);
}, []); // فقط یک بار در ابتدای اپ اجرا شود


useEffect(() => {
  // فقط چک کردن iOS prompt
  const checkIOSPrompt = () => {
    if (shouldShowInstallPrompt()) {
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
      }, 2000);
      return timer;
    }
    return null;
  };
  
  const timer = checkIOSPrompt();
  
  return () => {
    if (timer) clearTimeout(timer);
  };
}, []);


// این کد را در داخل useEffect اول فایل App.js قرار دهید
useEffect(() => {
  const checkTokenValidity = async () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    
    try {
      const response = await fetch('https://lenytoys.ir/wp-json/jwt-auth/v1/token/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        // توکن نامعتبر است، تلاش برای تمدید خودکار
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
        const userPassword = localStorage.getItem('userPassword');
        
        if (userInfo.user_email && userPassword) {
          // تلاش برای لاگین مجدد با اطلاعات ذخیره شده
          const loginResponse = await fetch('https://lenytoys.ir/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: userInfo.user_email,
              password: userPassword
            })
          });
          
          if (loginResponse.ok) {
            const data = await loginResponse.json();
            if (data.token) {
              // ذخیره توکن جدید
              if (localStorage.getItem('userToken')) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data));
                localStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
              } else {
                sessionStorage.setItem('userToken', data.token);
                sessionStorage.setItem('userInfo', JSON.stringify(data));
                sessionStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
              }
              setIsLoggedIn(true);
              return;
            }
          }
        }
        
        // اگر تمدید توکن موفق نبود، کاربر را خارج کنیم
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userInfo');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('خطا در بررسی اعتبار توکن:', error);
    }
  };
  
  checkTokenValidity();
}, []);


useEffect(() => {
  if (isLoggedIn) {
    // راه‌اندازی سرویس نوتیفیکیشن جدید
    newSupportNotificationService.start();
    newSupportNotificationService.addListener(count => {
      setUnreadNewSupportMessages(count);
    });
    
    return () => {
      newSupportNotificationService.removeListener(setUnreadNewSupportMessages);
      newSupportNotificationService.stop();
    };
  } else {
    setUnreadNewSupportMessages(0);
  }
}, [isLoggedIn]);




useEffect(() => {
  if (isLoggedIn) {
    supportNotificationService.start();
    supportNotificationService.addListener(count => {
      setUnreadSupportMessages(count);
    });
    
    return () => {
      supportNotificationService.removeListener(setUnreadSupportMessages);
      supportNotificationService.stop();
    };
  } else {
    setUnreadSupportMessages(0); // پاک کردن تعداد پیام‌های ناخوانده در صورت خروج کاربر
  }
}, [isLoggedIn]);


  useEffect(() => {
    //console.log('Login state changed:', isLoggedIn);
  }, [isLoggedIn]);

// بررسی و بارگیری مجدد اشتراک‌های کاربر پس از ورود
useEffect(() => {
  if (isLoggedIn) {
    // اضافه کردن کد تمدید توکن
    const setupTokenRefreshOnStartup = async () => {
      const token = localStorage.getItem('userToken');
      const tokenExpiration = parseInt(localStorage.getItem('tokenExpiration') || '0');
      const now = new Date().getTime();
      const userPassword = localStorage.getItem('userPassword');
      
      // اگر توکن وجود دارد و "مرا به خاطر بسپار" فعال بوده (پسورد ذخیره شده باشد)
      if (token && userPassword) {
        // بررسی اینکه آیا توکن نزدیک به انقضا است یا منقضی شده
        if (now > tokenExpiration - 7 * 24 * 60 * 60 * 1000) { // اگر کمتر از 7 روز مانده
          try {
            // ابتدا بررسی کنیم که آیا توکن فعلی هنوز معتبر است
            const validationResponse = await fetch('https://lenytoys.ir/wp-json/jwt-auth/v1/token/validate', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            // اگر توکن نامعتبر است یا کمتر از 1 روز به انقضای آن مانده، تمدید کنیم
            if (!validationResponse.ok || now > tokenExpiration - 1 * 24 * 60 * 60 * 1000) {
              const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
              
              // تمدید توکن با لاگین مجدد
              if (userInfo.user_email) {
                console.log('در حال تمدید خودکار توکن در استارت اپ...');
                const response = await fetch('https://lenytoys.ir/wp-json/jwt-auth/v1/token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    username: userInfo.user_email,
                    password: userPassword
                  })
                });
                
                if (response.ok) {
                  const data = await response.json();
                  if (data.token) {
                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    localStorage.setItem('lastTokenRefresh', now.toString());
                    localStorage.setItem('tokenExpiration', (now + 30 * 24 * 60 * 60 * 1000).toString());
                    console.log('توکن با موفقیت در استارت اپ تمدید شد');
                  }
                }
              }
            }
          } catch (error) {
            console.error('خطا در بررسی/تمدید توکن در استارت اپ:', error);
          }
        }
      }
    };

    // فراخوانی تابع تمدید توکن
    setupTokenRefreshOnStartup();
    
    // کد قبلی شما برای بارگیری اشتراک‌های کاربر
    const reloadUserSubscriptions = async () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) return;
        
        console.log("Reloading user subscriptions...");
        const response = await fetch('https://lenytoys.ir/wp-json/pcs/v1/user-purchases', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('خطا در دریافت اشتراک‌ها');
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.purchases)) {
          console.log("Retrieved subscriptions:", data.purchases);
          localStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          localStorage.setItem('lastProductCheck', new Date().getTime().toString());
          
          // همچنین در sessionStorage ذخیره می‌کنیم
          sessionStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          sessionStorage.setItem('lastProductCheck', new Date().getTime().toString());
          
          console.log("Subscriptions saved to localStorage and sessionStorage");
        }
      } catch (error) {
        console.error('Error reloading subscriptions:', error);
      }
    };
    
    reloadUserSubscriptions();
  }
}, [isLoggedIn]);

const handleLogout = () => {
  // پاک کردن همه اطلاعات ذخیره شده
  localStorage.removeItem('userToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userPassword');
  sessionStorage.removeItem('userToken');
  sessionStorage.removeItem('userInfo');
  
  // تنظیم state ها
  setIsLoggedIn(false);
  setShowSmsLogin(true);
  
  console.log('کاربر از سیستم خارج شد، نمایش صفحه OTP');
};

const handleSmsLoginSuccess = (phoneNumber, code, userData) => {
  console.log('SMS Login successful:', phoneNumber, code);
  
  // ذخیره اطلاعات در localStorage برای ماندگاری
  if (userData && userData.token) {
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userInfo', JSON.stringify(userData.user || userData));
    localStorage.setItem('userPhone', phoneNumber);
    
    console.log('اطلاعات کاربر در localStorage ذخیره شد');
  }
  
  // تنظیم state ها
  setIsLoggedIn(true);
  setShowSmsLogin(false);
  
  console.log('ورود موفقیت آمیز، پنهان کردن صفحه OTP');
};

  useEffect(() => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (token) {
      setIsLoggedIn(true);
     // console.log('User is logged in:', token); 
    } else {
      setIsLoggedIn(false);
     // console.log('User is not logged in'); 
    }
  }, []);
  
  // بررسی دوره‌ای خریدهای کاربر
useEffect(() => {
  // فقط زمانی که کاربر لاگین است اجرا شود
  if (!isLoggedIn) return;
  
  // بررسی زمان آخرین چک
  const lastCheck = localStorage.getItem('lastProductCheck');
  const now = new Date().getTime();
  
  // اگر آخرین چک بیش از یک ساعت پیش بوده یا اصلاً انجام نشده، دوباره چک کنیم
  if (!lastCheck || (now - parseInt(lastCheck)) > 3600000) { // 3600000 ms = 1 hour
    const checkPurchases = async () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) return;
        
        const response = await fetch('https://lenytoys.ir/wp-json/pcs/v1/user-purchases', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('خطا در دریافت خریدها');
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.purchases)) {
          localStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          localStorage.setItem('lastProductCheck', now.toString());
          //console.log('خریدها به روز شدند');
        }
      } catch (error) {
        console.error('Error checking purchases:', error);
      }
    };
    
    checkPurchases();
  }
}, [isLoggedIn]);
  
  // دریافت قیمت‌های ارز دیجیتال
  useEffect(() => {
    const staticData = [
      { 
        id: 'bitcoin', 
        symbol: 'BTC',
        name: 'Bitcoin',
        color: 'bg-[#f7931a]',
        price: 42000,
        change: 2.5
      },
      { 
        id: 'ethereum', 
        symbol: 'ETH',
        name: 'Ethereum',
        color: 'bg-[#627eea]',
        price: 2200,
        change: 1.8
      },
      { 
        id: 'binancecoin', 
        symbol: 'BNB',
        name: 'BNB',
        color: 'bg-[#F3BA2F]',
        price: 320,
        change: -0.5
      },
      { 
        id: 'solana', 
        symbol: 'SOL',
        name: 'Solana',
        color: 'bg-[#9945ff]',
        price: 98,
        change: 3.2
      },
      { 
        id: 'ripple', 
        symbol: 'XRP',
        name: 'Ripple',
        color: 'bg-[#23292F]',
        price: 0.62,
        change: 1.1
      },
      { 
        id: 'dogecoin', 
        symbol: 'DOGE',
        name: 'Dogecoin',
        color: 'bg-[#C2A633]',
        price: 0.08,
        change: -1.2
      },
      { 
        id: 'cardano', 
        symbol: 'ADA',
        name: 'Cardano',
        color: 'bg-[#0033AD]',
        price: 0.51,
        change: 0.9
      }
    ];

    setCryptoPrices(staticData);
  
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
      
        const updatedData = staticData.map(crypto => ({
          ...crypto,
          price: data[crypto.id]?.usd || crypto.price,
          change: data[crypto.id]?.usd_24h_change || crypto.change
        }));

        setCryptoPrices(updatedData);
      } catch (error) {
        //console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 1800000);
    return () => clearInterval(interval);
  }, []);

  // دریافت اسلایدرها
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
        const response = await fetch('https://lenytoys.ir/wp-json/wp/v2/slider?_embed', {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
      
        if (!response.ok) throw new Error('خطا در دریافت اسلایدرها');
      
        const data = await response.json();
        setSliders(data);
      } catch (error) {
        //console.error('Error fetching sliders:', error);
      }
    };

    fetchSliders();
  }, []);

  // دریافت محصولات
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
        const response = await fetch('https://lenytoys.ir/wp-json/wc/v3/products?per_page=10', {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
      
        if (!response.ok) throw new Error('خطا در دریافت محصولات');
      
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        //console.error('Error fetching products:', err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // دریافت stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
        const response = await fetch('https://lenytoys.ir/wp-json/wp/v2/story_highlights?_embed', {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
      
        if (!response.ok) throw new Error('خطا در دریافت استوری ها');
        const data = await response.json();
        setStories(data);
      } catch (error) {
        //console.error('خطا در دریافت استوری ها:', error);
      }
    };

    fetchStories();
  }, []);

 return (
<ErrorBoundary isDarkMode={isDarkMode}>
  <div>
    {showSmsLogin ? (
      <SimpleSmsLogin 
        isDarkMode={isDarkMode} 
        onSuccess={handleSmsLoginSuccess}
      />
    ) : (
      <>
        <ReactNotifications />
        {/** اضافه کردن Toaster در بالای BrowserRouter */}
        <Toaster 
          position="top-center" 
          containerStyle={{ zIndex: 11000 }} 
        />

        {/* اضافه کردن کامپوننت راهنمای iOS */}
        {showIOSPrompt && (
          <IOSInstallPrompt 
            isDarkMode={isDarkMode} 
            onClose={() => setShowIOSPrompt(false)} 
          />
        )}

        {/* اضافه کردن هشدار دسکتاپ */}
        {showDesktopWarning && (
          <DesktopWarning 
            isDarkMode={isDarkMode} 
          />
        )}

        <BrowserRouter>
          <OrientationLock isDarkMode={isDarkMode}>
            {loading ? (
              <CustomLoading />
            ) : (
              <AppRoutes 
                isDarkMode={isDarkMode} 
                setIsDarkMode={setIsDarkMode}
                products={products}
                cryptoPrices={cryptoPrices}
                stories={stories}
                loading={loading}
                sliders={sliders}
                isLoggedIn={isLoggedIn}
                handleLogout={handleLogout}
                setIsLoggedIn={setIsLoggedIn}
                unreadSupportMessages={unreadSupportMessages}
              />
            )}
          </OrientationLock>
        </BrowserRouter>
      </>
    )}
  </div>
</ErrorBoundary>
);

};

export default App;