import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

// Image Modal Component
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

// Chat Message Component
const ChatMessage = ({ message, isDarkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // YouTube URL helper function
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube URL patterns
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return url; // Return original URL if not a YouTube URL
  };
  
  // Function to find and extract media URLs from content and clean HTML
  const extractMediaContent = (htmlContent) => {
    if (!htmlContent) return { audioUrls: [], videoUrls: [], youtubeUrls: [], cleanedHTML: "" };
    
    const audioUrls = [];
    const videoUrls = [];
    const youtubeUrls = [];
    let cleanedHTML = htmlContent;
    
    try {
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Find and process audio elements
      const audioElements = tempDiv.querySelectorAll('audio');
      audioElements.forEach(audio => {
        const source = audio.querySelector('source');
        const url = source ? source.getAttribute('src') : audio.getAttribute('src');
        if (url) audioUrls.push(url);
        
        // Remove the audio element from content to avoid duplication
        if (audio.parentNode) {
          audio.parentNode.removeChild(audio);
        }
      });
      
      // Find and process video elements
      const videoElements = tempDiv.querySelectorAll('video');
      videoElements.forEach(video => {
        const source = video.querySelector('source');
        const url = source ? source.getAttribute('src') : video.getAttribute('src');
        if (url) videoUrls.push(url);
        
        // Remove the video element from content to avoid duplication
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
      });
      
      // Find and process iframes (for YouTube, etc.)
      const iframeElements = tempDiv.querySelectorAll('iframe');
      iframeElements.forEach(iframe => {
        const src = iframe.getAttribute('src');
        if (src && (src.includes('youtube.com') || src.includes('youtu.be'))) {
          youtubeUrls.push(src);
          
          // Remove the iframe from content
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }
      });
      
      // Find links to media files and YouTube
      const links = tempDiv.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          if (/\.(mp3|wav|ogg)$/i.test(href)) {
            audioUrls.push(href);
          } else if (/\.(mp4|webm|ogv|mov)$/i.test(href)) {
            videoUrls.push(href);
          } else if (href.includes('youtube.com/watch') || href.includes('youtu.be/')) {
            const embedUrl = getYouTubeEmbedUrl(href);
            if (embedUrl) youtubeUrls.push(embedUrl);
          }
        }
      });
      
      // Update cleanedHTML with content after removing media elements
      cleanedHTML = tempDiv.innerHTML;
    } catch (error) {
      console.error('Error extracting media from HTML:', error);
    }
    
    return { audioUrls, videoUrls, youtubeUrls, cleanedHTML };
  };
  
  // Get featured image if available
  const image = message._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
  // Check if we have audio or video URL in meta
  const metaAudioUrl = message.meta?.audio_url;
  const metaVideoUrl = message.meta?.video_url;
  
  // Extract media URLs from content and get cleaned HTML
  const { audioUrls: contentAudioUrls, videoUrls: contentVideoUrls, youtubeUrls: contentYoutubeUrls, cleanedHTML } = 
    message.content?.rendered 
      ? extractMediaContent(message.content.rendered) 
      : { audioUrls: [], videoUrls: [], youtubeUrls: [], cleanedHTML: "" };
  
  // Combine all audio URLs (meta + content)
  const allAudioUrls = metaAudioUrl 
    ? [metaAudioUrl, ...contentAudioUrls] 
    : contentAudioUrls;
    
  // Combine all video URLs (meta + content)
  const allVideoUrls = metaVideoUrl
    ? [metaVideoUrl, ...contentVideoUrls]
    : contentVideoUrls;
    
  // Get all YouTube URLs
  const allYoutubeUrls = [...contentYoutubeUrls];
  
  // Format date for display
  const getFormattedDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time for display
  const getFormattedTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const dateStr = message.date ? getFormattedDate(message.date) : getFormattedDate(new Date());
  const timeStr = message.date ? getFormattedTime(message.date) : getFormattedTime(new Date());

  return (
    <div className="flex w-full justify-start mb-4 select-none" dir="rtl">
      <div className="message-bubble">
        {/* Title */}
        {message.title && message.title.rendered && (
          <h3 className="font-bold mb-2" dangerouslySetInnerHTML={{ __html: message.title.rendered }} />
        )}
        
        {/* Main Image */}
        {image && (
          <>
            <img 
              src={image} 
              alt="Post featured" 
              className="w-full h-48 object-cover rounded-xl mb-4 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              loading="lazy"
            />
            <ImageModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              imageUrl={image}
            />
          </>
        )}
        
        {/* Content */}
        {message.content && message.content.rendered && (
          <div className="message-content" dangerouslySetInnerHTML={{ __html: cleanedHTML }} />
        )}
        
        {/* Video Players - Regular videos */}
        {allVideoUrls.map((videoUrl, index) => (
          <div key={`video-${index}`} className="video-container mb-4">
            <video 
              src={videoUrl}
              controls
              preload="metadata"
              poster={message?.meta?.video_thumbnail}
              className="rounded-xl w-full max-h-96"
              controlsList="nodownload"
              playsInline
            />
          </div>
        ))}
        
        {/* YouTube Videos */}
        {allYoutubeUrls.map((youtubeUrl, index) => (
          <div key={`youtube-${index}`} className="youtube-container mb-4">
            <iframe 
              src={youtubeUrl}
              className="rounded-xl w-full h-64"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ))}
        
        {/* Audio Players */}
        {allAudioUrls.map((audioUrl, index) => (
          <AudioPlayer key={`audio-${index}`} audioUrl={audioUrl} isDarkMode={isDarkMode} />
        ))}
        
        {/* Timestamps */}
        <div className="timestamps">
          <span className="date">{dateStr}</span>
          <span className="time">{timeStr}</span>
        </div>
      </div>
    </div>
  );
};

const PublicChat = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const loadingMoreRef = useRef(null);
  const [showPage, setShowPage] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animation effect
  useEffect(() => {
    // Entrance animation
    setTimeout(() => {
      setShowPage(true);
    }, 100);
  }, []);

  // Handle back navigation
  const handleGoBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  // Welcome messages
  const welcomeMessages = [
    {
      id: 'welcome-1',
      content: { rendered: '<p>سلام! به کانال عمومی خوش اومدید 👋</p>' },
      date: new Date()
    }
  ];

  // Fetch posts function
  const fetchPosts = async (pageNumber) => {
    try {
      setLoading(true);
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      const response = await fetch(
        `https://alicomputer.com/wp-json/wp/v2/posts?_embed&order=desc&orderby=date&per_page=10&page=${pageNumber}&categories=111`,
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

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: isExiting ? 0 : (showPage ? 1 : 0),
        pointerEvents: showPage ? 'auto' : 'none'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out font-iransans`}
        style={{ 
          transform: isExiting 
            ? 'translateX(100%)' 
            : `translateX(${showPage ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div 
          className={`fixed top-0 left-0 right-0 z-40 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} h-[70px] shadow-md select-none`}
        >
          <div className="h-full flex items-center px-4">
            <div className="flex-grow flex justify-center">
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                کانال عمومی
              </h1>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGoBack} 
          className={`fixed top-4 left-4 z-50 flex items-center gap-1 rounded-full px-4 py-2 ${
            isDarkMode ? 'text-[#f7d55d]' : 'text-gray-200'
          }`}
        >
          <ArrowLeftCircle className="w-8 h-8 md:w-9 md:h-9" />
        </button>

        <div className="relative pt-[70px] h-[calc(100vh-10px)] overflow-hidden select-none">
          <div 
            ref={containerRef}
            className="h-full overflow-y-auto px-4 pb-4 select-none"
          >
            {(loading && page > 1) && (
              <div ref={loadingMoreRef} className="flex justify-center items-center p-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="flex-grow">
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
                پیام دیگری وجود ندارد
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100%);
          }
        }
        
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
        
        .message-bubble ul {
          padding-right: 20px;
          list-style-position: inside;
          user-select: none;
        }

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

        .message-content {
          width: 100%;
          overflow: hidden;
        }

        .message-content img,
        .message-content video,
        .message-content iframe {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 0.5rem 0;
          object-fit: contain;
        }

        .message-content video {
          width: 100%;
          max-height: 450px;
          display: block;
          margin: 1rem auto;
        }
        
        .video-container,
        .youtube-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 0.75rem;
        }
        
        .video-container video,
        .youtube-container iframe {
          display: block;
          width: 100%;
          object-fit: contain;
        }
        
        .youtube-container {
          aspect-ratio: 16/9;
        }
        
        .youtube-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .message-bubble audio {
          width: 100%;
          margin: 0.5rem 0;
        }

        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default PublicChat;