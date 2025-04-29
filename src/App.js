import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import CourseApp from './CourseApp';
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
  setIsLoggedIn
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
        />
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
  const [showDesktopWarning, setShowDesktopWarning] = useState(true);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [products, setProducts] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sliders, setSliders] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  

  useEffect(() => {
    // فقط یک بار در لود اولیه چک می‌کنیم
    if (shouldShowInstallPrompt()) {
      // یک تاخیر کوتاه برای اطمینان از لود شدن صفحه قبل از نمایش راهنما
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);


  useEffect(() => {
    //console.log('Login state changed:', isLoggedIn);
  }, [isLoggedIn]);


  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userInfo');  
    setIsLoggedIn(false);
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
        
        const response = await fetch('https://p30s.com/wp-json/pcs/v1/user-purchases', {
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
        color: 'bg-[#6§27eea]',
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
        const response = await fetch('https://p30s.com/wp-json/wp/v2/slider?_embed', {
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
        const response = await fetch('https://p30s.com/wp-json/wc/v3/products?per_page=10', {
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
        const response = await fetch('https://p30s.com/wp-json/wp/v2/story_highlights?_embed', {
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
    <div>
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
            />
          )}
        </OrientationLock>
      </BrowserRouter>
    </div>
  );
  
};

export default App;