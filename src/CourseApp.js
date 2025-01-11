import React, { useState, useEffect, useRef } from 'react';
import { Menu, Play, Home, PlayCircle, Calendar, User, MoreHorizontal } from 'lucide-react';
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
  sliders
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
    const interval = setInterval(fetchPrices, 60000);
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
    <div 
      className="flex overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
    >
      {stories.map((story, index) => (
        <a 
        key={story.id}
        href={story.meta.story_link} // تغییر از story.meta?.story_link به story.meta.story_link
        className="flex-none snap-center"
        target="_blank" // اضافه کردن این خط
        rel="noopener noreferrer" // اضافه کردن این خط
        onClick={(e) => {
          console.log('Clicked story link:', story.meta.story_link); // برای دیباگ
        }}
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
        </a>
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
            
              <div className={`font-medium text-sm 
                ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {crypto.name}
              </div>
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
        Free Member of Futures Signal
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

    <div  onClick={() => navigate('')} className={`p-4 rounded-2xl flex items-center gap-3 border ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'  }`}>
      <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center">
        <div className="w-10 h-10 text-purple-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          </svg>
        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          آموزش ها‍ی اولیه رایگان
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Free basic training 
           </p>
      </div>
    </div>

    <div  onClick={() => navigate('/asad')} className={`p-4 rounded-2xl flex items-center gap-3 border ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'  }`}>
      <div className="w-16 h-16 bg-yellow-50 rounded-xl flex items-center justify-center">
        <div className="w-10 h-10 text-yellow-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
          </svg>
        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          آموزش اقتصاد کلان
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Macroeconomics training
          </p>
      </div>
    </div>

    <div className={`p-4 rounded-2xl flex items-center gap-3   ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="w-16 h-16 bg-yellow-50 rounded-xl flex items-center justify-center">
        <div className="w-10 h-10 text-yellow-900">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
          </svg>
        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          آموزش مشاوره مالی
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Financial consulting training
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
            <NavItem icon={<Calendar size={24} />} label="سفارش‌ها" active={false} isDarkMode={isDarkMode}/>
            <NavItem icon={<User size={24} />} label="پروفایل" active={false} isDarkMode={isDarkMode}/>
            <NavItem icon={<MoreHorizontal size={24} />} label="بیشتر" active={false} isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, isDarkMode }) => {
  return (
    <button className="flex flex-col items-center p-2">
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