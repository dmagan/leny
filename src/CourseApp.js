import React, { useState, useEffect, useRef } from 'react';
import { Menu, Play, Home, PlayCircle, Calendar, UserX,UserCheck, MoreHorizontal } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';



const CoinIcon = ({ symbol }) => {
  // SVG icons for cryptocurrencies...
  const icons = {
    BTC: (
      <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor">
        <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.745-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538z" fill="#f7931a"/>
      </svg>
    ),
    BNB: (
      <svg viewBox="0 0 32 32" width="18" height="18">
        <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
        <path d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z" fill="#fff"/>
      </svg>
    ),
    ETH: (
      <svg viewBox="0 0 32 32" width="16" height="16">
        <g fill="none" fillRule="evenodd">
          <circle cx="16" cy="16" r="16" fill="#627EEA"/>
          <g fill="#FFF" fillRule="nonzero">
            <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z"/>
            <path d="M16.498 4L9 16.22l7.498-3.35z"/>
            <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z"/>
            <path d="M16.498 27.995v-6.028L9 17.616z"/>
            <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"/>
            <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z"/>
          </g>
        </g>
      </svg>
    ),
    SOL: (
      <svg viewBox="0 0 32 32" width="16" height="16">
        <defs>
          <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="sol-grad">
            <stop stopColor="#9945FF" offset="0%"/>
            <stop stopColor="#14F195" offset="100%"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#sol-grad)"/>
        <path d="M9 10.29h9.72c.18 0 .36.07.48.21l2.44 2.97c.24.29.24.72 0 1.01l-2.44 2.97c-.12.14-.3.21-.48.21H9c-.18 0-.36-.07-.48-.21L6.08 14.7c-.24-.29-.24-.72 0-1.01l2.44-2.97c.12-.14.3-.21.48-.21z" fill="#FFF"/>
      </svg>
    ),

    XRP: (
      <svg viewBox="0 0 32 32" width="16" height="16">
        <g fill="none">
          <circle cx="16" cy="16" r="16" fill="#23292F"/>
          <path d="M23.07 8h2.89l-6.015 5.957a5.621 5.621 0 01-7.89 0L6.035 8H8.93l4.57 4.523a3.556 3.556 0 004.996 0L23.07 8zM8.895 24.563H6l6.055-5.993a5.621 5.621 0 017.89 0L26 24.562h-2.895L18.5 20a3.556 3.556 0 00-4.996 0l-4.61 4.563z" fill="#FFF"/>
        </g>
      </svg>
    ),
    DOGE: <img src="/dogecoin.svg" alt="Dogecoin" width="22" height="22" />,
    ADA: <img src="/cardano-ada-logo.svg" alt="Dogecoin" width="32" height="32" />,
  };

  
  return icons[symbol] || <span className="text-lg font-bold">{symbol}</span>;
};

const ThemeSwitcher = ({ isDarkMode, setIsDarkMode }) => {
  const handleCheckboxChange = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <label className='themeSwitcherThree relative inline-flex cursor-pointer select-none items-center'>
      <input
        type='checkbox'
        checked={isDarkMode}
        onChange={handleCheckboxChange}
        className='sr-only'
      />
      <div className={`shadow-sm flex h-8 w-16 items-center justify-center rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
            !isDarkMode ? 'bg-blue-500 text-white' : 'text-gray-500'
          }`}
        >
          <svg
            width='14'
            height='14'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <g clipPath='url(#clip0_3128_692)'>
            <path
  fillRule='evenodd'
  clipRule='evenodd'
  d='M8 0C8.36819 0 8.66667 0.298477 8.66667 0.666667V2C8.66667 2.36819 8.36819 2.66667 8 2.66667C7.63181 2.66667 7.33333 2.36819 7.33333 2V0.666667C7.33333 0.298477 7.63181 0 8 0ZM8 5.33333C6.52724 5.33333 5.33333 6.52724 5.33333 8C5.33333 9.47276 6.52724 10.6667 8 10.6667C9.47276 10.6667 10.6667 9.47276 10.6667 8C10.6667 6.52724 9.47276 5.33333 8 5.33333ZM4 8C4 5.79086 5.79086 4 8 4C10.2091 4 12 5.79086 12 8C12 10.2091 10.2091 12 8 12C5.79086 12 4 10.2091 4 8ZM8.66667 14C8.66667 13.6318 8.36819 13.3333 8 13.3333C7.63181 13.3333 7.33333 13.6318 7.33333 14V15.3333C7.33333 15.7015 7.63181 16 8 16C8.36819 16 8.66667 15.7015 8.66667 15.3333V14ZM2.3411 2.3424C2.60145 2.08205 3.02356 2.08205 3.28391 2.3424L4.23057 3.28906C4.49092 3.54941 4.49092 3.97152 4.23057 4.23187C3.97022 4.49222 3.54811 4.49222 3.28776 4.23187L2.3411 3.28521C2.08075 3.02486 2.08075 2.60275 2.3411 2.3424ZM12.711 11.7682C12.4506 11.5078 12.0285 11.5078 11.7682 11.7682C11.5078 12.0285 11.5078 12.4506 11.7682 12.711L12.7148 13.6577C12.9752 13.918 13.3973 13.918 13.6577 13.6577C13.918 13.3973 13.918 12.9752 13.6577 12.7148L12.711 11.7682ZM0 8C0 7.63181 0.298477 7.33333 0.666667 7.33333H2C2.36819 7.33333 2.66667 7.63181 2.66667 8C2.66667 8.36819 2.36819 8.66667 2 8.66667H0.666667C0.298477 8.66667 0 8.36819 0 8ZM14 7.33333C13.6318 7.33333 13.3333 7.63181 13.3333 8C13.3333 8.36819 13.6318 8.66667 14 8.66667H15.3333C15.7015 8.66667 16 8.36819 16 8C16 7.63181 15.7015 7.33333 15.3333 7.33333H14ZM4.23057 11.7682C4.49092 12.0285 4.49092 12.4506 4.23057 12.711L3.28391 13.6577C3.02356 13.918 2.60145 13.918 2.3411 13.6577C2.08075 13.3973 2.08075 12.9752 2.3411 12.7148L3.28776 11.7682C3.54811 11.5078 3.97022 11.5078 4.23057 11.7682ZM13.6577 3.28521C13.918 3.02486 13.918 2.60275 13.6577 2.3424C13.3973 2.08205 12.9752 2.08205 12.7148 2.3424L11.7682 3.28906C11.5078 3.54941 11.5078 3.97152 11.7682 4.23187C12.0285 4.49222 12.4506 4.49222 12.711 4.23187L13.6577 3.28521Z'
  fill='currentColor'
/>
            </g>
          </svg>
        </span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
            isDarkMode ? 'bg-blue-500 text-white' : 'text-gray-500'
          }`}
        >
          <svg
            width='14'
            height='14'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M8.0547 1.67334C8.18372 1.90227 8.16622 2.18562 8.01003 2.39693C7.44055 3.16737 7.16651 4.11662 7.23776 5.07203C7.30901 6.02744 7.72081 6.92554 8.39826 7.60299C8.07571 8.28044 9.97381 8.69224 10.9292 8.76349C11.8846 8.83473 12.8339 8.5607 13.6043 7.99122C13.8156 7.83502 14.099 7.81753 14.3279 7.94655C14.5568 8.07556 14.6886 8.32702 14.6644 8.58868C14.5479 9.84957 14.0747 11.0512 13.3002 12.053C12.5256 13.0547 11.4818 13.8152 10.2909 14.2454C9.09992 14.6756 7.81108 14.7577 6.57516 14.4821C5.33925 14.2065 4.20738 13.5846 3.312 12.6892C2.41661 11.7939 1.79475 10.662 1.51917 9.42608C1.24359 8.19017 1.32569 6.90133 1.75588 5.71038C2.18606 4.51942 2.94652 3.47561 3.94828 2.70109C4.95005 1.92656 6.15168 1.45335 7.41257 1.33682C7.67423 1.31264 7.92568 1.44442 8.0547 1.67334Z'
                fill='currentColor'
              ></path>
          </svg>
        </span>
      </div>
    </label>
  );
};


const CourseApp = ({  // این قسمت رو جایگزین کنید
  isDarkMode,
  setIsDarkMode,
  products,
  cryptoPrices,
  stories,
  loading,
  sliders,
  isLoggedIn,
  onLogout
}) => {

  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const cryptoSliderRef = useRef(null);
  const slidersRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0); // برای ردیابی اسلاید فعلی


  // دریافت قیمت‌های ارز دیجیتال
  useEffect(() => {
    // داده‌های استاتیک برای تست
    const staticData = [
      { 
        id: 'bitcoin', 
        symbol: 'BTC',
        name: 'Bitcoin',
        color: 'bg-[#f7931a]',
        price: 0,
        change: 2.5
      },
      { 
        id: 'ethereum', 
        symbol: 'ETH',
        name: 'Ethereum',
        color: 'bg-[#627eea]',
        price: 0,
        change: 1.8
      },
      { 
        id: 'binancecoin', 
        symbol: 'BNB',
        name: 'BNB',
        color: 'bg-[#F3BA2F]',
        price: 0,
        change: -0.5
      },
      { 
        id: 'solana', 
        symbol: 'SOL',
        name: 'Solana',
        color: 'bg-[#9945ff]',
        price: 0,
        change: 3.2
      },
      { 
        id: 'ripple', 
        symbol: 'XRP',
        name: 'Ripple',
        color: 'bg-[#23292F]',
        price:0,
        change: 1.1
      },
      { 
        id: 'dogecoin', 
        symbol: 'DOGE',
        name: 'Dogecoin',
        color: 'bg-[#C2A633]',
        price: 0,
        change: -1.2
      },
      { 
        id: 'cardano', 
        symbol: 'ADA',
        name: 'Cardano',
        color: 'bg-[#0033AD]',
        price: 0,
        change: 0.9
      }
    ];

   
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
        console.log('API Response:', data);
        
        const updatedData = staticData.map(crypto => ({
          ...crypto,
          price: data[crypto.id]?.usd || crypto.price,
          change: data[crypto.id]?.usd_24h_change || crypto.change
        }));

        console.log('Updated Data:', updatedData);

      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices,14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);







  /////////////////////

  // اضافه کردن یک useEffect جدید برای هندل کردن اسکرول دستی
  useEffect(() => {
    if (!slidersRef.current) return;
    
    const slider = slidersRef.current;
    
    const handleScroll = () => {
      const index = Math.round(slider.scrollLeft / slider.offsetWidth);
      setCurrentSlide(index);
    };
  
    slider.addEventListener('scroll', handleScroll);
    
    return () => {
      slider.removeEventListener('scroll', handleScroll);
    };
  }, []);
  ////////////////////

// اضافه کردن اتوچنج به اسلایدر
useEffect(() => {
  if (sliders.length === 0) return;
  
  const interval = setInterval(() => {
    if (slidersRef.current) {
      if (currentSlide >= sliders.length - 1) {
        setCurrentSlide(0);
        slidersRef.current.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        setCurrentSlide(prev => prev + 1);
        slidersRef.current.scrollTo({
          left: slidersRef.current.offsetWidth * (currentSlide + 1),
          behavior: 'smooth'
        });
      }
    }
  }, 3000);  // هر 3 ثانیه

  return () => clearInterval(interval);
}, [currentSlide, sliders.length]);
  /////////////////////////////////------------------------------------------


  /////////////////////////////////------------------------------------------
  const scrollToIndex = (index) => {
    setCurrentIndex(index);
    if (sliderRef.current) {
      const scrollPosition = index * (280 + 16);
      sliderRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className={`min-h-screen scrollbar-hide ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} font-iransans`}>
        <Toaster
  position="top-center"
  reverseOrder={false}
  toastOptions={{
    duration: 4000,
    style: {
      background: isDarkMode ? '#1F2937' : '#363636',
      color: '#fff',
      fontFamily: 'IranSans'
    },
    success: {
      duration: 3000,
      icon: '',
    },
    error: {
      duration: 3000,
      icon: '❌',
    }
  }}
/>

      {/* Header */}
      <div className={`px-6 py-4 flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
  <Menu size={24} className={`${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
  <span className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>خانه</span>
  <ThemeSwitcher isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
</div>


{/* ------------------------------------------------------- */}

{/* Crypto Prices */}
<div className="p-4">
  <div 
    ref={cryptoSliderRef}
    className="flex overflow-x-auto gap-2 pb-1 -mx-2 px-1 scrollbar-hide snap-x snap-mandatory touch-pan-x"
    style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}
  >
    {cryptoPrices.map((crypto) => (
      <div
        key={crypto.id}
        className={`flex-shrink-0 w-[150px] h-[85px] p-1.5 rounded-xl border ${
          isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
        }`}
      >
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 mr-2">
            <CoinIcon symbol={crypto.symbol} />
          </div>
          <span className={`text-sm  ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {crypto.symbol}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
        <div 
  className={`text- font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}  style={{ WebkitTextStroke: '0.4px currentColor' }}  >
            $&nbsp;{crypto.price?.toLocaleString()}
          </div>
          <div className={`text-xs font-medium ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {crypto.change >= 0 ? '+' : ''}{crypto.change?.toFixed(2)}%
          </div>
        </div>
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          $&nbsp;{crypto.price?.toLocaleString()} USD
        </div>
      </div>
    ))}
  </div>
</div>

{/* ------------------------------------------------------- */}

{/* Story Highlights */}
<div className="px-4">
  <div className="relative">
  <div className="flex overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
  {stories.map((story, index) => (
        <div 
          key={story.id}
          className="flex-none snap-center cursor-pointer"
          onClick={() => navigate(`/stories/${story.id}`)}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 ">
              <div className={`w-full h-full rounded-full p-0.5 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                {story._embedded && story._embedded['wp:featuredmedia'] && (
                  <img
                    src={story._embedded['wp:featuredmedia'][0].source_url}
                    alt={story.title.rendered}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className={`text-sm font-medium text-center line-clamp-1 w-24 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {story.title.rendered}
              </span>
              <span className={`text-xs text-center line-clamp-1 w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {story.meta?.story_subtitle || ''}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>




     {/* Sliders Section */}
<div className="px-4">
  <div className="relative">
    <div 
      ref={slidersRef}
      className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
    >
      {sliders.map((slider, index) => (
        <div 
          key={slider.id}
          className="flex-none w-full snap-center"
          style={{
            width: '100%',
            minWidth: '100%'
          }}
        >
          {slider._embedded && 
           slider._embedded['wp:featuredmedia'] && 
           slider._embedded['wp:featuredmedia'][0] && (
            <img
              src={slider._embedded['wp:featuredmedia'][0].source_url}
              alt={slider.title.rendered}
              className="w-full h-18 object-cover rounded-xl"
              loading="eager"
            />
          )}
        </div>
      ))}
    </div>

    {/* Navigation Dots */}
    <div className="absolute bottom-4 left-0 right-0">
      <div className="flex justify-center gap-2">
        {/*sliders.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index ? 'bg-blue-500 w-4' : 'bg-white bg-opacity-50'
            }`}
          />
        ))*/}
      </div>
    </div>
  </div>
</div>



      {/* Products */}
      <div className=" p-4">
      <h2 className={`text-xl mb-2   ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
  محصولات فروشگاه
</h2>
        <div className="relative">
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto gap-3 -mx-2 px-2 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
            onScroll={(e) => {
              const index = Math.round(e.target.scrollLeft / (280 + 16));
              setCurrentIndex(index);
            }}
          >
            {products.map((product, index) => (
              <div key={product.id} 
              className={`flex-shrink-0 w-32 p-2 rounded-2xl shadow-sm  ${isDarkMode ? '' : ''}`}>
            
              
                <div className="flex flex-col items-center ">
                  <div className="rounded-2xl p-2 bg-gray-0 w-full aspect-square">
                  <a href={product.permalink} target="_blank" rel="noopener noreferrer"> 
                    <img
                      src={product.images[0]?.src || '/api/placeholder/100/100'}
                      alt={product.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </a>
                  </div>
                  <div className="w-full space-y-2">
                  <h3 className={`font-medium text-sm text-center line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>  {product.name}</h3>
                  <div className={`text-sm text-center font-bold ${isDarkMode ? 'text-white' : 'text-green-600'}`}>  {parseInt(product.price).toLocaleString()} تومان</div>
                  
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === index ? 'bg-yellow-500 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          {/* Courses */}
<div className="px-4">
  <h2 className="text-xl mb-4"></h2>
  <div className="grid grid-cols-1 gap-4" dir="rtl">
  <div  onClick={() => navigate('/asad')} className={`p-4 rounded-2xl flex items-center gap-3 border ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'  }`}>
      <div className="w-16 h-16 rounded-xl flex items-center justify-center">
      <div className="w-10 h-10 text-[#f7d55d]">
      <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.7917 15.4167H4.625V26.2084H10.7917V15.4167Z" stroke="#F7D55D" stroke-width="2" stroke-linejoin="round"/>
<path d="M21.5834 10.7917H15.4167V30.8334H21.5834V10.7917Z" stroke="#F7D55D" stroke-width="2" stroke-linejoin="round"/>
<path d="M18.5 33.9166V30.8333" stroke="#F7D55D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M32.375 9.25H26.2083V16.1875H32.375V9.25Z" stroke="#F7D55D" stroke-width="2" stroke-linejoin="round"/>
<path d="M7.70831 15.4166V7.70831" stroke="#F7D55D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M29.2917 26.2083V16.1875" stroke="#F7D55D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M29.2917 9.24998V3.08331" stroke="#F7D55D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

</div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          عضو رایگان سیگنال فیوچرز
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        درآمد ماهانه رایگان
        </p>
      </div>
    </div>

    <div  onClick={() => navigate('/chat')} className={`p-4 rounded-2xl flex items-center gap-3 border ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'  }`}>
      <div className="">
        <div className="w-10 h-10 text-blue-100">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.7526 5.92418C12.2059 6.28608 11.679 6.70574 11.1924 7.19239C10.4754 7.90932 10.4947 7.94822 9.85359 8.68204M12.7526 5.92418C16.178 3.65685 20.3848 3.65685 20.3848 3.65685C20.3848 3.65685 20.3848 7.86362 18.1174 11.289M12.7526 5.92418L18.1174 11.289M18.1174 11.289C17.7555 11.8358 17.3359 12.3626 16.8492 12.8492C16.1323 13.5662 16.0934 13.5469 15.3596 14.188M6.11523 13.429C5.74278 13.9526 5.53552 14.2635 5.53552 14.2635L9.77816 18.5061C9.77816 18.5061 10.0891 18.2988 10.6127 17.9264M6.11523 13.429L2.70709 10.0208L8.36394 7.19239L9.85359 8.68204M6.11523 13.429C6.83965 12.4105 8.18898 10.5874 9.85359 8.68204M10.6127 17.9264L14.0208 21.3345L16.8492 15.6777L15.3596 14.188M10.6127 17.9264C11.6311 17.202 13.4542 15.8526 15.3596 14.188" stroke="#f7d55d"/>
<path d="M5.00002 19C5.3503 17.5825 5.99994 17.0001 6.5 17.5C7.00002 18 6.4175 18.6497 5.00002 19Z" stroke="#f7d55d"/>
</svg>

        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          کانال VIP
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          کانال ویژه تیم PCS
          </p>
      </div>
    </div>

    <div  onClick={() => navigate('/dex')} className={`p-4 rounded-2xl flex items-center gap-3 border ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'  }`}>
      <div className="">
        <div className="w-10 h-10 text-purple-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 160">
  <g>
    <path d="m76.1194,62.98507a2,2 0 0 0 1.07,-3.69l-22,-14a2,2 0 0 0 -2.14,0l-22,14a2,2 0 0 0 1.07,3.69l4,0l0,20l-3,0a2,2 0 0 0 0,4l42,0a2,2 0 0 0 0,-4l-3,0l0,-20l4,0zm-24,20l-12,0l0,-20l12,0l0,20zm16,0l-12,0l0,-20l12,0l0,20zm-29.13,-24l15.13,-9.63l15.13,9.63l-30.26,0z" fill="#f7d55d"/>
    <path d="m24.9894,52.23507l4.13,2.46a1.94,1.94 0 0 0 1,0.29a2,2 0 0 0 1,-3.71l-3.83,-2.29a9.94,9.94 0 0 0 0.83,-4a9.65,9.65 0 0 0 -0.26,-2.23l34.81,-13.45a10,10 0 1 0 -1.55,-5.32a9.19,9.19 0 0 0 0.14,1.58l-35.06,13.55a10,10 0 1 0 -1.21,13.12zm46.13,-34.25a6,6 0 1 1 -6,6a6,6 0 0 1 6,-6zm-59,27a6,6 0 1 1 6,6a6,6 0 0 1 -6,-6z" fill="#f7d55d"/>
    <path d="m106.1194,42.98507a10,10 0 0 0 -10,10c0,0.15 0,0.3 0,0.46l-13.52,3.61a2,2 0 0 0 0.52,3.93a1.91,1.91 0 0 0 0.52,-0.07l13.48,-3.59a10.07,10.07 0 0 0 4.92,4.78l-6.54,29a10.43,10.43 0 0 0 -1.38,-0.12a12,12 0 0 0 -10.13,5.59l-8.87,-5.3a2,2 0 0 0 -2,3.42l9.34,5.61a11.84,11.84 0 0 0 -0.34,2.68a12,12 0 1 0 17.23,-10.78l6.6,-29.22l0.17,0a10,10 0 1 0 0,-20zm-4,60a8,8 0 1 1 -8,-8a8,8 0 0 1 8,8zm4,-44a6,6 0 1 1 6,-6a6,6 0 0 1 -6,6z" fill="#f7d55d"/>
    <path d="m38.7094,91.57507l-4.87,4.86a12.11,12.11 0 1 0 3.16,2.55l4.53,-4.54a2,2 0 0 0 -2.82,-2.82l0,-0.05zm-10.59,23.41a8,8 0 1 1 8,-8a8,8 0 0 1 -8,8z" fill="#f7d55d"/>
  </g>
</svg>
        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          کلاس حرفه ای دکس تریدینگ
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          نحوه پیدا کردن میم کوین های پامپی 
           </p>
      </div>
    </div>

    <div  onClick={() => navigate('')} className={`p-4 rounded-2xl flex items-center gap-3 border ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'  }`}>
      <div className="">
        <div className="w-10 h-10 text-yellow-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 98.94">
  <path fill="#f7d55d" fill-rule="evenodd" clip-rule="evenodd" d="M26.76,22.96c-4.81,0-10.08-0.78-14.56,1v-0.12c-1.04,0.46-2.06,1.09-3.04,1.86l-0.03,0.03 c-0.91,0.72-1.78,1.57-2.59,2.53l0,0.01c-0.09,0.11-0.18,0.22-0.27,0.33l0,0c-0.04,0.05-0.08,0.1-0.13,0.16l-0.01,0.02 C6.03,28.89,5.94,29,5.86,29.11l-0.01,0.01c-0.04,0.05-0.07,0.1-0.11,0.15l-0.02,0.02L5.72,29.3c-0.04,0.05-0.07,0.1-0.11,0.15 l-0.03,0.05l-0.1,0.14l-0.01,0.02c-0.04,0.05-0.08,0.11-0.12,0.16l-0.03,0.04l-0.09,0.12L5.2,30.02c-0.04,0.05-0.07,0.1-0.1,0.15 l-0.01,0.01l-0.02,0.03c-0.03,0.04-0.06,0.09-0.09,0.13L4.94,30.4c-0.04,0.05-0.07,0.11-0.11,0.16l0,0.01 c-0.04,0.05-0.07,0.11-0.11,0.17L4.7,30.78l-0.09,0.14l-0.02,0.04c-0.03,0.06-0.07,0.11-0.1,0.17l-0.03,0.05l-0.07,0.12l-0.04,0.07 c-0.03,0.05-0.06,0.11-0.1,0.16l-0.02,0.03L4.15,31.7l-0.03,0.06c-0.03,0.06-0.06,0.11-0.09,0.17l0,0.01l0,0 c-0.03,0.06-0.07,0.12-0.1,0.18l-0.02,0.04l-0.08,0.15l-0.02,0.04L3.7,32.52l-0.03,0.07l-0.07,0.14l-0.02,0.04 c-0.03,0.06-0.06,0.12-0.09,0.18L3.46,33l-0.07,0.14l-0.02,0.05c-0.03,0.06-0.06,0.13-0.09,0.19c-1.7,3.59-2.15,6.29-2.43,10.12 C0.28,47.36-0.02,51.19,0,54.96c0.01,0.09,0.03,0.18,0.05,0.27l0,0.01c0.02,0.08,0.04,0.17,0.06,0.25l0,0.01 c0.02,0.08,0.04,0.16,0.06,0.23l0.01,0.02c0.02,0.07,0.04,0.15,0.07,0.22l0.01,0.02c0.02,0.07,0.05,0.13,0.07,0.2l0.01,0.03 c0.02,0.06,0.05,0.12,0.08,0.18l0.02,0.04c0.03,0.06,0.05,0.11,0.08,0.17c1.69,3.32,6.41,2.42,8.01-0.28l0.01-0.02l0.01-0.02 c0.02-0.03,0.04-0.06,0.05-0.1c0.02-0.03,0.03-0.06,0.04-0.09c0.01-0.02,0.02-0.05,0.03-0.07c0.02-0.04,0.04-0.08,0.05-0.11 l0.02-0.05c0.02-0.05,0.04-0.09,0.06-0.14l0.01-0.03c0.02-0.05,0.04-0.1,0.05-0.16l0-0.01c0.02-0.06,0.04-0.12,0.05-0.18l0-0.01 c0.02-0.06,0.03-0.12,0.04-0.18l0,0c0.01-0.06,0.02-0.13,0.03-0.19l0.91-11.84c0.14-1.79,0.26-3,0.98-4.7 c0.34-0.8,0.75-1.49,1.23-2.05l0.07,3.17v0L12.58,58L6.64,93.54c0.07,6.96,9.44,6.92,10.46,1.18l5.38-31.7l5.26,31.21 c2.21,7.79,11.33,4.88,10.46-1.05l-1.56-11.92L32.54,57.8l0.32-18.62v0.36l0.01-0.5l4.04,5.58c0.8,1.11,1.98,1.79,3.23,2l9.51,1.83 v15.28h-8.24c-1.04,0-1.91,0.87-1.91,1.91c0,1.04,0.87,1.91,1.91,1.91h38.44v8.54c-0.23,0.07-0.44,0.23-0.64,0.4h-0.03L67.26,87.8 c-0.77,0.7-0.8,1.91-0.07,2.68c0.7,0.77,1.91,0.8,2.68,0.07l9.95-9.44v8.61c0,1.04,0.87,1.91,1.91,1.91c1.04,0,1.91-0.87,1.91-1.91 v-8.24l9.58,9.08c0.74,0.74,1.94,0.7,2.68-0.07c0.74-0.74,0.7-1.94-0.07-2.68L83.91,76.48c-0.1-0.07-0.17-0.13-0.27-0.2v-8.74 h37.33c1.04,0,1.91-0.87,1.91-1.91c0-1.04-0.87-1.91-1.91-1.91h-8.34V16.49h8.14c1.04,0,1.91-0.87,1.91-1.91 c0-1.04-0.87-1.91-1.91-1.91h-37.4V7.11c0-1.04-0.87-1.91-1.91-1.91s-1.91,0.87-1.91,1.91v5.56H41.42c-1.04,0-1.91,0.87-1.91,1.91 c0,1.04,0.87,1.91,1.91,1.91h8.24v21.74l-5.78-1.11l-8.1-11.19c-0.74-1.02-1.79-1.68-2.93-1.94C31.06,23.3,29.05,22.96,26.76,22.96 L26.76,22.96z M54.72,39.21L66.36,27c0.47-0.49,1.25-0.51,1.75-0.04c0.49,0.47,0.51,1.25,0.04,1.75L56.96,40.44 c1.2,1.14,1.81,2.84,1.48,4.59c-0.46,2.42-2.59,4.1-4.97,4.08v14.63h55.37V16.49H53.47v22.48l0.98,0.19 C54.54,39.17,54.63,39.19,54.72,39.21L54.72,39.21z M22.49,0c5.86,0,10.62,4.75,10.62,10.62c0,5.86-4.75,10.62-10.62,10.62 c-5.86,0-10.62-4.75-10.62-10.62C11.87,4.75,16.62,0,22.49,0L22.49,0z"/>
</svg>
        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          آموزش ۰ تا ۱۰۰ کریپتو
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          آشنایی با مفاهیم پایه تا حرفه ای
          </p>
      </div>
    </div>

    <div  onClick={() => navigate('/mentor')} className={`p-4 rounded-2xl flex items-center gap-3 border ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'  }`}>
      <div className="">
        <div className="w-10 h-10 text-yellow-500">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<g>
  <path fill="#f7d55d" d="M151,13.1c-6.5,3.3-7.7,11.6-2.6,16.6c5.2,5.1,13.3,3.8,16.6-2.6C169.7,17.9,160.2,8.4,151,13.1z"/>
  <path fill="#f7d55d" d="M177.3,23.2c-1.8,0.6-5.7,4.3-26,24.5c-19.5,19.5-24.1,24.2-25.1,26.3l-1.2,2.5l-0.1,21.9l-0.1,21.9l-9.2,9.3c-8.9,8.9-9.2,9.3-9.2,11.1c0,3.9,3.6,6.5,7.1,5.1c2.3-1,19.9-19,21-21.5c0.7-1.7,1-3.6,1.2-10.3l0.3-8.2h9.4h9.4V117c0,10.1,0.1,11.3,0.9,12.6c1.8,2.9,5.7,3.2,8.2,0.6l1.3-1.4l0.1-14.2c0.2-15.5,0-16.8-2.3-18.7c-1.4-1.2-1.4-1.2-10.1-1.2h-8.7V82V69.2l14.7-14.7L173.4,40l11.5,0.1l11.5,0.1l-6.8,7.1c-3.7,3.9-7.2,7.7-7.7,8.5c-0.6,0.9-0.9,2.2-0.9,3.6c0,1.9,0.2,2.5,1.5,3.8c1.1,1.1,2.1,1.6,3.6,1.8c1.1,0.1,8.8,0.2,17.1,0.1c14.4-0.1,15.1-0.2,16.4-1.1c2-1.5,2.7-3.2,2-5.3c-1-3.4-1.2-3.5-13.2-3.6c-5.9-0.1-10.8-0.3-10.8-0.5c0-0.2,3.3-3.6,7.3-7.6l7.3-7.3l12.4,12.4c10.1,10.2,12.7,12.5,14,12.7c2.2,0.4,4.7-0.9,5.8-3c1.8-3.3,1.6-3.5-16.4-21.4c-10.3-10.2-17-16.5-18.1-17.1c-1.7-0.8-3.1-0.9-16.1-1C181.7,22.5,179.1,22.6,177.3,23.2z"/>
  <path fill="#f7d55d" d="M118.3,45.9c-7.5,3.9-7.4,14.7,0.3,18.7c5.1,2.6,12,0,14.2-5.3c2.9-6.9-2.3-14.7-9.6-14.7C121.4,44.6,120.1,44.9,118.3,45.9z"/>
  <path fill="#f7d55d" d="M171.4,157.1l0.1,86.8l37.2,0.1l37.2,0.1v-86.9V70.4h-37.3h-37.3L171.4,157.1z"/>
  <path fill="#f7d55d" d="M90.7,198.5v45.6H128h37.3v-45.6v-45.6H128H90.7V198.5z"/>
  <path fill="#f7d55d" d="M10,226.9v17.3h37.3h37.3L84.6,227l-0.1-17.1l-37.2-0.1L10,209.6V226.9z"/>
</g>
</svg>
        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      کوچینگ شخصی ( منتور )
      </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          ارتباط مستقیم با اساتید
          </p>
      </div>
    </div>

  </div>
</div>
        </div>
      </div>
     
     {/*--------------------------- */}
     {/* Social Media Boxes */}
<div className="px-4  mb- pb-28 "> {/* mb-20 برای فاصله از bottom navigation */}
  <div className="grid grid-cols-4 gap-2">
    {/* Telegram */}
    <div className={`p-1 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="w-5 h-5 flex items-center justify-center text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M21.2 5L2.5 12.3c-1.3.5-1.3 1.8 0 2.3l4.1 1.3 1.6 4.8c.2.7 1.1.9 1.7.4l2.4-2.2 4.7 3.5c.7.5 1.7.1 1.9-.7l3.9-15.2c.3-1.1-.8-2-1.6-1.5zM6.8 13.9l9.4-5.8"></path>
        </svg>
      </div>
      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>تلگرام</span>
    </div>

    {/* Instagram */}
    <div className={`p-1 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="w-5 h-5 flex items-center justify-center text-pink-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
        </svg>
      </div>
      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>اینستاگرام</span>
    </div>

    {/* TikTok */}
    <div className={`p-1 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="w-5 h-5 flex items-center justify-center text-black">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
        </svg>
      </div>
      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>تیک تاک</span>
    </div>

    {/* About Us */}
    <div className={`p-1 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="w-5 h-5 flex items-center justify-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
      </div>
      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>درباره ما</span>
    </div>
  </div>
</div>
     
     
     
     
     
     
     
     
     
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <div className="mx-4 mb-4">
        <div className={`flex items-center justify-between rounded-full px-6 py-2 shadow-lg
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <NavItem icon={<Home size={24} />} label="خانه" active={true} isDarkMode={isDarkMode}/>
            <NavItem icon={<PlayCircle size={24} />} label="محصولات" active={false}isDarkMode={isDarkMode} />
            <NavItem icon={<Calendar size={24} />} label="سفارش‌ها" active={false} isDarkMode={isDarkMode} onLogout={onLogout} />
            <NavItem  
  icon={isLoggedIn ? <UserCheck size={24} /> : <UserX size={24} />}  
  label="پروفایل"  
  active={false}   
  isDarkMode={isDarkMode}   
  isProfile={true}
  isLoggedIn={isLoggedIn}
/>            <NavItem icon={<MoreHorizontal size={24} />} label="بیشتر" active={false} isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, isDarkMode, isProfile, onLogout, isLoggedIn }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isProfile) {
      navigate('/login');
    } else if (label === "محصولات") {
      navigate('/products');
    } else if (label === "سفارش‌ها") {
      if (isLoggedIn) {
        onLogout && onLogout();
        toast.error('از حساب کاربری خارج شدید', {
          style: {
            fontFamily: 'IranSans',
            direction: 'rtl',
            minWidth: '300px',
            background: '#ff4444',
          },
          duration: 2000,
          position: 'bottom-center',
        });
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <button 
      onClick={handleClick} 
      className="flex flex-col items-center p-2"
    >
      <div className={active ? "text-blue-500" : isDarkMode ? "text-gray-400" : "text-gray-500"}>
        {icon}
      </div>
      <span className={`text-xs mt-1 ${active ? "text-blue-500" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </span>
    </button>
  );
};
export default CourseApp;