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

  const image = message._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const audioUrl = message.meta?.audio_url;
  const getFormattedDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const dateStr = message.date ? getFormattedDate(message.date) : getFormattedDate(new Date());
  const timeStr = message.date ? getFormattedTime(message.date) : getFormattedTime(new Date());
  const content = message.content || message.excerpt?.rendered || '';

  return (
    <div className="flex w-full justify-start mb-4 select-none" dir="rtl">
      <div className="message-bubble">
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
        {message.title && (
          <h3 className="font-bold mb-2" dangerouslySetInnerHTML={{ __html: message.title.rendered }} />
        )}
        {typeof content === 'string' && content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          typeof content === 'object' && React.isValidElement(content) ? content : null
        )}
        {audioUrl && (
          <AudioPlayer audioUrl={audioUrl} isDarkMode={isDarkMode} />
        )}
        <div className="timestamps">
          <span className="date">{dateStr}</span>
          <span className="time">{timeStr}</span>
        </div>
      </div>
    </div>
  );
};

const Chat = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const loadingMoreRef = useRef(null);

  // Welcome messages
  const welcomeMessages = [
    {
      id: 'welcome-1',
      content: 'سلام! به کانال ویژه خوش اومدید 👋',
      date: new Date()
    },
    {
      id: 'welcome-2',
      content: (
        <div className="text-right">
          <p className="font-bold mb-2">مزایای عضویت در کانال:</p>
          <ul className="list-disc pr-6 space-y-1">
            <li>تحلیل‌های تکنیکال روزانه</li>
            <li>سیگنال‌های معاملاتی ویژه</li>
            <li>آموزش‌های اختصاصی</li>
            <li>پشتیبانی مستقیم</li>
          </ul>
        </div>
      ),
      date: new Date()
    }
  ];

  // Fetch posts function
  const fetchPosts = async (pageNumber) => {
    try {
      setLoading(true);
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      const response = await fetch(
        `https://alicomputer.com/wp-json/wp/v2/posts?_embed&order=desc&orderby=date&per_page=10&page=${pageNumber}`,
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
    <div className={`relative min-h-screen select-none ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} font-iransans`}>
      <div 
        className={`fixed top-0 left-0 right-0 z-40 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} h-[70px] shadow-md select-none`}
      >
        <div className="h-full flex items-center px-4">
          <div className="flex-grow flex justify-center">
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              کانال ویژه
            </h1>
          </div>
        </div>
      </div>

      <button 
        onClick={() => navigate(-1)} 
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

        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Chat;