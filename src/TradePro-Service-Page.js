import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, X, Copy } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './components/VideoPlayer';
import channelNotificationService from './ChannelNotificationService';
import PaymentCard from './PaymentCard';
import { PRODUCT_PRICES } from './config';
import './MimCoinChannel.css';

// تابع بهبود یافته برای استخراج لینک ویدیو
const extractVideoLink = (content) => {
  if (!content) return null;
  
  const videoPatterns = [
    /https?:\/\/[^\s<>"']*\.mkv(?:\?[^\s<>"']*)?/gi,
    /https?:\/\/[^\s<>"']*\.mp4(?:\?[^\s<>"']*)?/gi,
    /https?:\/\/[^\s<>"']*\.webm(?:\?[^\s<>"']*)?/gi,
    /https?:\/\/[^\s<>"']*\.avi(?:\?[^\s<>"']*)?/gi,
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/gi,
    /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/gi,
    /(?:https?:\/\/)?(?:www\.)?aparat\.com\/v\/([a-zA-Z0-9_-]+)/gi
  ];
  
  for (const pattern of videoPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      let videoUrl = matches[0];
      
      // حذف پارامترهای cache busting که مشکل ساز هستند
      videoUrl = cleanVideoUrl(videoUrl);
      
      return videoUrl;
    }
  }
  
  return null;
};

// تابع جدید برای تمیز کردن URL ویدیو
const cleanVideoUrl = (url) => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    
    // حذف پارامترهای مشکل ساز
    const problemParams = ['_', '__', 'cache', 'bust', 'timestamp', 'v', 'version'];
    
    problemParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    // اگر هیچ پارامتری باقی نمانده، query string را حذف کن
    if (urlObj.searchParams.toString() === '') {
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    }
    
    return urlObj.toString();
  } catch (error) {
    // اگر URL معتبر نیست، همان URL اصلی را برگردان
    console.warn('Invalid URL format:', url);
    return url;
  }
};



const ChatMessage = React.memo(({ message, isDarkMode, onVideoClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // متغیرهای اصلی
  const title = message.title?.rendered || '';
  const content = message.content?.rendered || '';
  
  // دریافت تصویر شاخص
  const getFeaturedImage = () => {
    if (message._embedded && message._embedded['wp:featuredmedia']) {
      const featuredMedia = message._embedded['wp:featuredmedia'][0];
      if (featuredMedia && featuredMedia.source_url) {
        return featuredMedia.source_url;
      }
    }
    return null;
  };

  const featuredImageUrl = getFeaturedImage();
  const videoLink = extractVideoLink(content);
  
const handleImageClick = (customLink = null, customTitle = null) => {
  let linkToPlay = customLink || videoLink;
  const titleToShow = customTitle || title || 'ویدیو میم کوین';

  if (!linkToPlay) return;

  // تمیز کردن URL قبل از پخش
  linkToPlay = cleanVideoUrl(linkToPlay);

  if (onVideoClick) {
    onVideoClick(linkToPlay, titleToShow);
  }
};

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
    <div className="flex w-full justify-start mb-6 select-none" dir="rtl">
      <div className={`mim-coin-card ${isDarkMode ? 'dark' : 'light'}`}>
        {/* نمایش تصویر شاخص */}
        {featuredImageUrl && (
          <div 
            className="image-container"
            onClick={handleImageClick}
            style={{ cursor: videoLink ? 'pointer' : 'default' }}
          >
            {!imageLoaded && (
              <div className="image-skeleton">
                <div className="animate-pulse bg-gray-300 w-full h-full rounded-xl"></div>
              </div>
            )}
            
            <img 
              src={featuredImageUrl}
              alt={title || 'میم کوین'}
              className={`featured-image ${imageLoaded ? 'loaded' : 'loading'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
            
            {/* آیکون پلی اگر ویدیو موجود باشد */}
            {videoLink && (
              <div className="play-overlay">
                <div className="play-button">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* عنوان پست */}
        {title && (
          <h3 className="mim-coin-title" dangerouslySetInnerHTML={{ __html: title }} />
        )}

        {/* محتوای پست */}
        {content && (
          <div className="mim-coin-content">
            <PostContent 
              content={content} 
              onVideoClick={handleImageClick}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

   {/* timestamps */}
<div className="timestamps">
  <span className="date">{dateStr}</span>
  <span className="time">{timeStr}</span>
</div>

{/* نمایش لینک ویدیو اگر موجود باشد */}
{videoLink && (
  <div className="video-link-section mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
      لینک ویدیو:
    </div>
    <div 
      onClick={() => handleImageClick(videoLink, title)}
      className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
    >
      <div className="text-sm text-blue-600 dark:text-blue-400 break-all font-mono">
        {videoLink.length > 60 ? `${videoLink.substring(0, 60)}...` : videoLink}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        برای پخش کلیک کنید
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
});



// کامپوننت برای نمایش محتوای پست با لینک‌های قابل کلیک
const PostContent = React.memo(({ content, onVideoClick, isDarkMode }) => {
  const renderContentWithClickableLinks = (text) => {
    if (!text) return null;
    
    // الگو برای شناسایی لینک‌ها
    const linkPattern = /(https?:\/\/[^\s<>"'\)]+)/gi;
    const parts = text.split(linkPattern);
    
    return parts.map((part, index) => {
      if (part.match(linkPattern)) {
        // بررسی اینکه آیا لینک ویدیو است
        const isVideoLink = /\.(mkv|mp4|avi|mov|wmv|flv|webm|m4v)(\?.*)?$/i.test(part) ||
                           /youtube\.com|youtu\.be|vimeo\.com|aparat\.com/i.test(part);
        
        // تشخیص فرمت ویدیو
        let videoFormat = '';
        if (isVideoLink) {
          const extension = part.split('.').pop().toLowerCase().split('?')[0];
          videoFormat = extension.toUpperCase();
        }
        
        return (
          <button
            key={index}
            onClick={() => onVideoClick(part, `ویدیو ${videoFormat || 'از لینک'}`)}
            className={`inline-block px-3 py-1 mx-1 rounded-full text-sm font-medium transition-colors ${
              isVideoLink 
                ? `${videoFormat === 'MKV' ? 'bg-purple-500' : 'bg-red-500'} text-white hover:opacity-80` 
                : isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isVideoLink ? `▶ ${videoFormat || 'ویدیو'}` : '🔗 لینک'}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };
  
  // پاک کردن HTML tags برای نمایش متن ساده
  const cleanText = content.replace(/<[^>]*>/g, ' ').trim();
  
  return (
    <div className="post-content">
      {renderContentWithClickableLinks(cleanText)}
    </div>
  );
});






const MimCoinChannel = ({ isDarkMode, isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const loadingMoreRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const previousPostsCountRef = useRef(0);
  const [lastLoadedPostId, setLastLoadedPostId] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({ url: '', title: '' });
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [addedToHistory, setAddedToHistory] = useState(false);
  const [subscriptionWarning, setSubscriptionWarning] = useState(null);
  const [showPaymentCard, setShowPaymentCard] = useState(false);
  const [videoError, setVideoError] = useState(false);
const [userInteracted, setUserInteracted] = useState(false);
const videoRef = useRef(null);

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);



  // انیمیشن ورود کارت
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowCard(true);
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleBackButton = () => {
      if (isOpen) {
        closeCard();
      }
    };

    window.addEventListener('popstate', handleBackButton);


    
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
          
      if (onClose) {
        onClose();
      } else {
        navigate(-1);
      }
    }, 300);
  };

  // تابع اسکرول به آخرین پیام
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchPosts = async (pageNumber) => {
  try {
    setLoading(true);
    const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
    
    const response = await fetch(
      `/wp-json/wp/v2/posts?_embed&order=desc&orderby=date&per_page=10&page=${pageNumber}&categories=114`,
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
    
    previousPostsCountRef.current = posts.length;
    
    if (pageNumber > 1 && posts.length > 0) {
      setLastLoadedPostId(posts[0]?.id);
    } else {
      setLastLoadedPostId(null);
    }
    
    if (pageNumber === 1) {
      setPosts([...data].reverse());
      
      if (data.length > 0) {
        channelNotificationService.markAllAsRead();
      }
    } else {
      setPosts(prevPosts => [...data].reverse().concat(prevPosts));
    }
    
    setLoading(false);
  } catch (error) {
    console.error('Fetch error:', error);
    setLoading(false);
    setHasMore(false);
  }
};


useEffect(() => {
    fetchPosts(1);
  }, []); 

  useEffect(() => {
    if (!loading && posts.length > 0) {
      channelNotificationService.markAllAsRead();
    }
  }, [loading]);

  useEffect(() => {
    if (isOpen) {
      channelNotificationService.markAllAsRead();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      channelNotificationService.markAllAsRead();
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && page === 1 && posts.length > 0) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }, 300);
    }
  }, [posts, page]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleScroll = () => {
      if (container.scrollTop < -100 || container.scrollHeight - container.scrollTop - container.clientHeight > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!loading && lastLoadedPostId && page > 1) {
      setTimeout(() => {
        const divider = document.getElementById('new-content-divider');
        if (divider && containerRef.current) {
          const viewportHeight = containerRef.current.clientHeight;
          const dividerPosition = divider.offsetTop;
          
          containerRef.current.scrollTo({
            top: dividerPosition - (viewportHeight / 2) + (divider.clientHeight / 2),
            behavior: 'smooth'
          });
          
          divider.style.transition = 'background-color 0.5s ease';
          const originalBg = isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(243, 244, 246, 0.8)';
          const highlightBg = isDarkMode ? 'rgba(55, 65, 81, 0.95)' : 'rgba(229, 231, 235, 0.95)';
          
          divider.style.backgroundColor = highlightBg;
          setTimeout(() => {
            divider.style.backgroundColor = originalBg;
          }, 800);
        }
      }, 1000);
    }
  }, [loading, lastLoadedPostId, page, isDarkMode]);

  useEffect(() => {
    return () => {
      if (posts.length > 0) {
        const latestPostId = posts[0]?.id;
        channelNotificationService.markAllAsRead(latestPostId);
      } else {
        channelNotificationService.markAllAsRead();
      }
    };
  }, [posts]);

  // بررسی وضعیت اشتراک و نمایش هشدار
  useEffect(() => {
    const checkSubscriptionExpiry = async () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        
        if (token) {
          try {
            const response = await fetch('https://siwoxelo.myhostpoint.ch/wp-json/pcs/v1/user-purchases', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success && Array.isArray(data.purchases)) {
                const mimCoinSubscription = data.purchases.find(p => 
                  p.title && p.title.includes('میم کوین') && p.status === 'active'
                );
                
                if (mimCoinSubscription) {
                  const remainingDays = mimCoinSubscription.remainingDays;
                  
                  if (typeof remainingDays === 'number' && remainingDays <= 7) {
                    if (remainingDays <= 0) {
                      setSubscriptionWarning({
                        days: 0,
                        type: 'expired'
                      });
                    } else {
                      setSubscriptionWarning({
                        days: remainingDays,
                        type: remainingDays <= 3 ? 'critical' : 'warning'
                      });
                    }
                  } else {
                    setSubscriptionWarning(null);
                  }
                  return;
                }
              }
            }
          } catch (apiError) {
          }
        }
        
        const purchasedProductsStr = localStorage.getItem('purchasedProducts');
        
        if (!purchasedProductsStr) return;

        const purchasedProducts = JSON.parse(purchasedProductsStr);
        const mimCoinSubscription = purchasedProducts.find(p => 
          p.title && p.title.includes('میم کوین') && p.status === 'active'
        );

        if (mimCoinSubscription) {
          const remainingDays = mimCoinSubscription.remainingDays;
          
          if (typeof remainingDays === 'number' && remainingDays <= 7) {
            if (remainingDays <= 0) {
              setSubscriptionWarning({
                days: 0,
                type: 'expired'
              });
            } else {
              setSubscriptionWarning({
                days: remainingDays,
                type: remainingDays <= 3 ? 'critical' : 'warning'
              });
            }
          } else {
            setSubscriptionWarning(null);
          }
        }
      } catch (error) {
      }
    };

    checkSubscriptionExpiry();
  }, []);

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
        {/* Header */}
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
           کانال میم کوین باز
          </h2>
        </div>

        {/* Subscription Warning Bar */}
        {subscriptionWarning && (
          <div 
            className={`px-4 py-3 text-white text-sm font-medium ${
              subscriptionWarning.type === 'expired' ? 'bg-red-500' : 
              subscriptionWarning.type === 'critical' ? 'bg-red-500' : 'bg-orange-500'
            }`}
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 text-right">
                {subscriptionWarning.days === 0 ? 
                  'اشتراک شما منقضی شده است' : 
                  `${subscriptionWarning.days} روز تا پایان اشتراک باقی مانده`
                }
              </div>
              <button
                onClick={() => setShowPaymentCard(true)}
                className="bg-white text-gray-800 px-8 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors min-w-[120px]"
              >
                تمدید
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div 
          className="absolute bottom-0 left-0 right-0 flex flex-col overflow-hidden"
          style={{
            top: subscriptionWarning ? '124px' : '65px'
          }}
        >
          {/* Scrollable Content Area */}
          <div ref={containerRef} className="flex-1 overflow-y-auto pb-4">
            <div className="px-4">

              {(loading && page > 1) && (
                <div className="flex justify-center items-center p-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    در حال بارگذاری پست‌های بیشتر...
                  </span>
                </div>
              )}

              <div className="flex-grow pt-2">
                {hasMore && !loading && posts.length > 0 && (
                  <div className="text-center py-4">
                    <button
                      onClick={() => {
                        setPage(prev => prev + 1);
                        fetchPosts(page + 1);
                      }}
                      className={`px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                        isDarkMode 
                          ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-gray-900' 
                          : 'border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white'
                      }`}
                    >
                      برای مشاهده پست‌های قبلی اینجا کلیک کنید
                    </button>
                  </div>
                )}
                
                {posts.map((post, index) => (
                  <React.Fragment key={`post-${post.id}-${post.date}`}>
                    {lastLoadedPostId === post.id && (
                      <div 
                        dir="rtl"
                        id="new-content-divider"
                        className={`w-full py-3 my-4 text-center border-t-2 border-dashed ${
                          isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                        }`}
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(243, 244, 246, 0.8)',
                          backdropFilter: 'blur(2px)'
                        }}
                      >
                        <div className="font-bold">پست‌های جدید ↑   پست‌های قدیمی ↓</div>
                      </div>
                    )}
                    <ChatMessage 
                      message={post}
                      isDarkMode={isDarkMode}
                      onVideoClick={(url, title) => {
                        setCurrentVideo({ url, title });
                        setShowVideoPlayer(true);
                      }}
                    />
                  </React.Fragment>
                ))}

                {loading && page === 1 && (
                  <div className="flex justify-center items-center p-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {!loading && !hasMore && posts.length > 0 && (
                <div className="text-center text-gray-500 py-4">
                  پیام دیگری وجود ندارد
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* دکمه اسکرول به پایین */}
        {showScrollButton && (
          <div className="fixed bottom-7 left-0 right-0 flex justify-center z-20 pointer-events-none">
            <button
              onClick={scrollToBottom}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg pointer-events-auto 
              bg-[#f7d55d] text-gray-800
              border border-yellow-400`}
              style={{
                animation: 'fadeIn 0.3s ease-out',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        )}

        {/* Payment Card Component */}
        {showPaymentCard && (
          <PaymentCard
            isDarkMode={isDarkMode}
            onClose={() => setShowPaymentCard(false)}
            productTitle="تمدید کانال میم کوین باز"
            price={PRODUCT_PRICES.MEM_COIN}
            isRenewal={true}
          />
        )}
      </div>

{/* Improved Video Player Modal */}
{showVideoPlayer && (
  <div 
    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
    style={{ touchAction: 'manipulation' }}
  >
    <div className={`relative w-full max-w-4xl mx-4 rounded-lg overflow-hidden ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h3 className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {currentVideo.title}
        </h3>
        <button
          onClick={() => {
            setShowVideoPlayer(false);
            setCurrentVideo({ url: '', title: '' });
            setVideoError(false);
          }}
          className={`p-2 rounded-full hover:bg-gray-100 touch-manipulation ${
            isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600'
          }`}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Video Container */}
      <div className="relative p-4">
        {videoError ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
            <h4 className="text-lg font-bold text-gray-700 mb-2">خطا در پخش ویدیو</h4>
            <p className="text-gray-600 text-center mb-4 px-4">
              امکان پخش این ویدیو در مرورگر وجود ندارد.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={() => {
                  if (isMobile) {
                    window.location.href = currentVideo.url;
                  } else {
                    window.open(currentVideo.url, '_blank');
                  }
                }}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors"
              >
                باز کردن در برنامه خارجی
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentVideo.url);
                  alert('لینک کپی شد!');
                }}
                className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg font-bold text-sm hover:bg-gray-600 transition-colors"
              >
                کپی لینک
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Native Video Element */}
            <video 
              ref={videoRef}
              controls 
              playsInline
              webkit-playsinline="true"
              muted={false}
              preload="metadata"
              className="w-full rounded-lg"
              style={{ 
                maxHeight: '70vh',
                backgroundColor: '#000',
                outline: 'none'
              }}
              onError={(e) => {
                console.error('Video error:', e);
                setVideoError(true);
              }}
              onCanPlay={() => {
                console.log('Video can play');
                setVideoError(false);
              }}
              onLoadedMetadata={() => {
                console.log('Video metadata loaded');
              }}
              autoPlay={false}
            >
              <source src={currentVideo.url} type="video/mp4" />
              <source src={currentVideo.url} type="video/webm" />
              <source src={currentVideo.url} type="video/x-matroska" />
              مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
            </video>
            
            {/* Fallback Play Button برای موبایل */}
            
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => {
            if (isMobile) {
              window.location.href = currentVideo.url;
            } else {
              window.open(currentVideo.url, '_blank');
            }
          }}
          className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors"
        >
          باز کردن در برنامه خارجی
        </button>
        
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(currentVideo.url);
              alert('لینک کپی شد!');
            } catch (err) {
              // Fallback for older browsers
              const textArea = document.createElement('textarea');
              textArea.value = currentVideo.url;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              alert('لینک کپی شد!');
            }
          }}
          className="px-4 py-3 bg-gray-500 text-white rounded-lg font-bold text-sm hover:bg-gray-600 transition-colors"
        >
          <Copy size={16} />
        </button>
      </div>
      
      {/* Mobile Instructions */}
      {isMobile && !videoError && (
        <div className="px-4 pb-4">
          <div className={`text-xs text-center p-2 rounded ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            💡 اگر ویدیو پخش نشد، از دکمه "باز کردن در برنامه خارجی" استفاده کنید
          </div>
        </div>
      )}
    </div>
  </div>
)}

 
    </div>
  );
};

export default MimCoinChannel;