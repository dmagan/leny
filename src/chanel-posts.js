import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

// کامپوننت مودال تصویر
const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 select-none" onClick={onClose}>
      <button 
        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
        onClick={onClose}
      >
        <X size={24} />
      </button>
      <img 
        src={imageUrl} 
        alt="Full size" 
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// کامپوننت پیام چت
const ChatMessage = ({ message, isDarkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState(''); // 'image' یا 'video'
  const messageRef = useRef(null);
  
  const content = message.content?.rendered || '';
  const audioUrl = message.meta?.audio_url;

  // پردازش محتوا برای اصلاح ویدیو و تصاویر
  useEffect(() => {
    if (!content || !messageRef.current) return;
    
    // استفاده از DOMParser برای تبدیل HTML به DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // پردازش ویدیوها
    const videos = doc.querySelectorAll('video');
    videos.forEach((video, index) => {
      video.removeAttribute('autoplay');
      video.autoplay = false;
      // افزودن کلاس به ویدیو
      video.classList.add('message-video');
      video.setAttribute('controlsList', 'nodownload');
      video.controls = true;
      video.playsInline = true;
      // اضافه کردن lazy loading و preload none برای جلوگیری از دانلود خودکار
      video.setAttribute('loading', 'lazy');
      video.setAttribute('preload', 'none');
      
      // تشخیص نوع ویدیو (افقی یا عمودی) بر اساس ابعاد
      video.addEventListener('loadedmetadata', () => {
        if (video.videoWidth && video.videoHeight) {
          const aspectRatio = video.videoWidth / video.videoHeight;
          if (aspectRatio > 1) {
            // ویدیوی افقی
            video.classList.add('landscape-video');
            video.closest('.video-container')?.classList.add('landscape-container');
          } else {
            // ویدیوی عمودی
            video.classList.add('portrait-video');
            video.closest('.video-container')?.classList.add('portrait-container');
          }
        }
      });
      
      // ایجاد یک wrapper برای ویدیو
      const wrapper = document.createElement('div');
      wrapper.className = 'video-container';
      
      // ایجاد دکمه پخش
      const playButton = document.createElement('div');
      playButton.className = 'video-play-button';
      
      // اضافه کردن شمارنده برای ویدیوهای چندگانه
      if (videos.length > 1) {
        wrapper.classList.add('multiple-videos');
        wrapper.dataset.videoIndex = index.toString();
      }
      
      // جایگزینی ویدیو با wrapper
      if (video.parentNode) {
        video.parentNode.insertBefore(wrapper, video);
        wrapper.appendChild(video);
        wrapper.appendChild(playButton); // اضافه کردن دکمه پخش
      }
      
      // افزودن قابلیت کلیک برای بزرگنمایی
      video.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (video.src) {
          setMediaUrl(video.src);
          setMediaType('video');
          setIsModalOpen(true);
        }
      };
      
      // اضافه کردن رویداد کلیک به دکمه پخش
      playButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (video.paused) {
          video.play();
          wrapper.classList.add('playing');
        } else {
          video.pause();
          wrapper.classList.remove('playing');
        }
      };
      
      // رویداد پخش و توقف برای مدیریت دکمه
      video.addEventListener('play', () => {
        wrapper.classList.add('playing');
      });
      
      video.addEventListener('pause', () => {
        wrapper.classList.remove('playing');
      });
      
      video.addEventListener('ended', () => {
        wrapper.classList.remove('playing');
      });
    });
    
    // پردازش آیفریم‌ها (مثلاً برای ویدیوهای YouTube)
    const iframes = doc.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const wrapper = document.createElement('div');
      wrapper.className = 'iframe-container';
      
      if (iframe.parentNode) {
        iframe.parentNode.insertBefore(wrapper, iframe);
        wrapper.appendChild(iframe);
      }
    });
    
    // پردازش تصاویر
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      img.classList.add('message-image');
      
      // افزودن قابلیت کلیک برای بزرگنمایی
      img.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (img.src) {
          setMediaUrl(img.src);
          setMediaType('image');
          setIsModalOpen(true);
        }
      };
      
      // اضافه کردن کلاس برای محدود کردن سایز تصاویر
      img.classList.add('max-w-full', 'h-auto', 'rounded-xl');
    });
    
    // به‌روزرسانی محتوا
    if (messageRef.current) {
      // پاک کردن محتوای قبلی
      messageRef.current.innerHTML = '';
      // افزودن محتوای جدید
      Array.from(doc.body.childNodes).forEach(node => {
        messageRef.current.appendChild(node);
      });
    }
  }, [content]);

  const getFormattedDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getFormattedTime = (date) => {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const dateStr = message.date ? getFormattedDate(message.date) : getFormattedDate(new Date());
  const timeStr = message.date ? getFormattedTime(message.date) : getFormattedTime(new Date());

  return (
    <div className="flex w-full justify-start mb-4 select-none" dir="rtl">
      <div className="message-bubble">
        {content && (
          <div 
            ref={messageRef}
            className="message-content" 
          />
        )}

        {audioUrl && (
          <AudioPlayer audioUrl={audioUrl} isDarkMode={isDarkMode} />
        )}

        <div className="timestamps">
          <span className="date">{dateStr}</span>
          <span className="time">{timeStr}</span>
        </div>
      </div>
      
      {/* مودال مدیا */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" 
          onClick={() => setIsModalOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={() => setIsModalOpen(false)}
          >
            <X size={24} />
          </button>
          
          {mediaType === 'image' && (
            <img 
              src={mediaUrl} 
              alt="تصویر کامل" 
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          {mediaType === 'video' && (
            <video 
              src={mediaUrl} 
              controls
              preload="none"
              loading="lazy"
              className="max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
};

const PostsChannel = ({ isDarkMode, isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const loadingMoreRef = useRef(null);
  
  // اضافه کردن انیمیشن
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // پیام خوش‌آمدگویی
  const welcomeMessages = [
    {
      id: 'welcome-1',
      content: {
        rendered: 'به بخش پست‌ها خوش آمدید 👋'
      },
      date: new Date()
    },
  ];

  // انیمیشن ورود کارت
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowCard(true);
      }, 100);
    }
  }, [isOpen]);

  // مدیریت دکمه برگشت و انیمیشن
  useEffect(() => {
    // Handle back button behavior - simplified approach
    const handleBackButton = () => {
      if (isOpen) {
        closeCard();
      }
    };
  
    // Listen for the popstate event (back button)
    window.addEventListener('popstate', handleBackButton);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen]);

  // بستن کارت با انیمیشن
  const closeCard = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      
      // اگر onClose به عنوان prop منتقل شده باشد، از آن استفاده کن
      if (onClose) {
        onClose();
      } else {
        // در غیر این صورت، از navigate استفاده کن
        navigate(-1);
      }
    }, 300);
  };

  // تابع دریافت پست‌ها
  const fetchPosts = async (pageNumber) => {
    try {
      setLoading(true);
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      
      // اینجا عدد دسته‌بندی "posts" را باید وارد کنید - فعلاً عدد 111 گذاشتم، شما باید آن را تغییر دهید
      const categoryId = 112; // شماره دسته‌بندی پست‌ها
      
      const response = await fetch(
        `https://p30s.com/wp-json/wp/v2/posts?_embed&order=desc&orderby=date&per_page=10&page=${pageNumber}&categories=${categoryId}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Error fetching posts');
      
      const data = await response.json();
      const totalPages = response.headers.get('X-WP-TotalPages');
      setHasMore(pageNumber < parseInt(totalPages));
      
      setPosts(prevPosts => pageNumber === 1 ? [...data].reverse() : [...prevPosts, ...[...data].reverse()]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && page === 1) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [posts, page]);

  useEffect(() => {
    if (!loadingMoreRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          setPage(prev => prev + 1);
          fetchPosts(page + 1);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadingMoreRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: isExiting ? 0 : (showCard ? 1 : 0),
        pointerEvents: showCard ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: isExiting 
            ? 'translateX(100%)' 
            : `translateX(${showCard ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
        }}
      >
        {/* هدر */}
        <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={closeCard} 
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h2 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            پست‌ ها
          </h2>
        </div>

        {/* بخش محتوای اصلی */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">
          {/* بخش قابل اسکرول */}
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="px-4">
              {(loading && page > 1) && (
                <div ref={loadingMoreRef} className="flex justify-center items-center p-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <div className="flex-grow pt-2">
                {[...welcomeMessages].reverse().map((msg) => (
                  <ChatMessage 
                    key={msg.id}
                    message={msg}
                    isDarkMode={isDarkMode}
                  />
                ))}

                {[...posts].map((post) => (
                  <ChatMessage 
                    key={post.id}
                    message={post}
                    isDarkMode={isDarkMode}
                  />
                ))}

                {loading && page === 1 && (
                  <div className="flex justify-center items-center p-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {!loading && !hasMore && posts.length > 0 && (
                <div className="text-center text-gray-500 py-4">
                  پست دیگری وجود ندارد
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .message-bubble {
          background-color: transparent;
          color: ${isDarkMode ? '#fff' : '#1f2937'};
          border: 2px solid rgba(247, 213, 93, 0.5);
          border-radius: 24px;
          border-top-right-radius: 4px;
          padding: 1rem;
          max-width: 80%;
          direction: rtl;
          text-align: right;
          position: relative;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        /* استایل برای لیست‌ها */
        .message-bubble ul {
          padding-right: 20px;
          list-style-position: inside;
          user-select: none;  
        }

        /* استایل برای تاریخ و زمان */
        .message-bubble .timestamps {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
          color: ${isDarkMode ? '#9CA3AF' : '#6B7280'};
          font-size: 0.75rem;
          user-select: none;
        }

        .message-bubble .time {
          direction: ltr;
          user-select: none;
        }

        .message-bubble .date {
          direction: ltr;
          user-select: none;
        }

        /* استایل برای کانتینر ویدیو */
        .video-container {
          width: auto !important;
          max-width: 350px;
          margin: 10px -7px 12px 1px; /* بالا 10px، راست 0، پایین 12px، چپ auto */
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          background-color: #000;
          display: flex;
          align-items: center;
        }
                
        /* استایل برای دکمه پخش */
        .video-play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          z-index: 2;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        /* مثلث پخش داخل دکمه */
        .video-play-button:before {
          content: '';
          width: 0;
          height: 0;
          border-top: 15px solid transparent;
          border-bottom: 15px solid transparent;
          border-left: 25px solid rgba(255, 255, 255, 0.8);
          margin-left: 5px;
        }

        /* تغییر حالت هنگام هاور */
        .video-play-button:hover {
          background-color: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%) scale(1.1);
        }

        /* حالت پنهان شدن دکمه بعد از پخش ویدیو */
        .video-container.playing .video-play-button {
          opacity: 0;
          pointer-events: none;
        }
        
        /* کانتینر برای ویدیوهای افقی */
        .landscape-container {
          max-width: 350px;
          max-height: 220px;
        }
        
        /* کانتینر برای ویدیوهای عمودی */
        .portrait-container {
          max-width: 220px;
          max-height: 350px;
        }

        /* استایل برای ویدیوها */
        .message-video {
          width: auto !important;
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain;
          display: block;
          border-radius: 12px;
          background-color: #000;
          cursor: pointer;
          margin: 0 auto;
        }
        
        /* ویدیوهای افقی */
        .landscape-video {
          max-height: 200px !important;
          max-width: 350px !important;
        }
        
        /* ویدیوهای عمودی */
        .portrait-video {
          max-height: 350px !important;
          max-width: 220px !important;
        }
        
        /* ویدیوهای چندگانه */
        .multiple-videos {
          margin-top: 16px;
          margin-bottom: 16px;
        }
        
        .multiple-videos:not(:first-child) {
          margin-top: 20px;
        }

        /* استایل برای آیفریم‌ها */
        .iframe-container {
          position: relative;
          width: 100%;
          max-width: 350px;
          padding-bottom: 56.25%; /* نسبت 16:9 */
          height: 0;
          overflow: hidden;
          border-radius: 12px;
          margin: 12px auto;
          background-color: #000;
        }

        .iframe-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
          border: none;
        }

        /* استایل برای تصاویر */
        .message-image {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 8px 0;
          cursor: pointer;
        }

        /* استایل برای لینک‌ها */
        .message-bubble a {
          color: #f7d55d;
          text-decoration: none;
        }
        
        .message-bubble a:hover {
          text-decoration: underline;
        }
        
        /* حذف پدینگ اضافی برای پاراگراف‌ها */
        .message-bubble p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        /* حذف هایلایت برای المان‌های تعاملی */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* فیکس برای ویدیوهای با کنترل‌ها */
        video::-webkit-media-controls-panel {
          background-color: rgba(0,0,0,0.5);
        }
        
        /* اصلاح ویدیوهای پلیر دوم */
        .message-bubble > video + video,
        .message-bubble > div:has(video) + div:has(video) {
          margin-top: 16px !important;
        }
        
        /* بهبود کنترل‌های ویدیو */
        video::-webkit-media-controls {
          background-color: rgba(0, 0, 0, 0.4);
        }
        
        video::-webkit-media-controls-play-button,
        video::-webkit-media-controls-fullscreen-button {
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
        }
        
        /* بهبود نمایش در موبایل */
        @media (max-width: 480px) {
          .message-bubble {
            max-width: 90%;
          }
          
          .video-container {
            max-width: 300px;
          }
          
          .landscape-container {
            max-width: 300px;
            max-height: 190px;
          }
          
          .portrait-container {
            max-width: 190px;
            max-height: 300px;
          }
          
          .landscape-video {
            max-height: 180px !important;
            max-width: 300px !important;
          }
          
          .portrait-video {
            max-height: 300px !important;
            max-width: 190px !important;
          }
          
          .video-play-button {
            width: 50px;
            height: 50px;
          }
          
          .video-play-button:before {
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            border-left: 20px solid rgba(255, 255, 255, 0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default PostsChannel;
