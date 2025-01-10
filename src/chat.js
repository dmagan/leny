import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';


// کامپوننت مودال تصویر
const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={onClose}>
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

// کامپوننت پیام
// کامپوننت پیام
const ChatMessage = ({ children, timestamp, isDarkMode, image, audioUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // اضافه کردن این خط

  return (
    <div className="flex w-full justify-start" dir="rtl">
      <div className="message-bubble">
        {image && (
          <>
            <img 
              src={image} 
              alt="Post featured" 
              className="w-full h-48 object-cover rounded-xl mb-4 cursor-pointer"
              onClick={() => setIsModalOpen(true)} // اضافه کردن click handler
            />
            <ImageModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              imageUrl={image}
            />
          </>
        )}
        {children}
        {audioUrl && (
          <AudioPlayer audioUrl={audioUrl} isDarkMode={isDarkMode} />
        )}
        <span className={`text-xs block mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {timestamp}
        </span>
      </div>
    </div>
  );
};

const Chat = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // پیام‌های خوش‌آمدگویی
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

  // دریافت پست‌ها از وردپرس
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
        const response = await fetch('https://alicomputer.com/wp-json/wp/v2/posts?_embed', {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
        
        if (!response.ok) throw new Error('Error fetching posts');
        
        const data = await response.json();
        console.log('Raw API response:', data); // اضافه شده
    
        const sortedPosts = data.sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(post => {
            console.log('Post featured media:', post._embedded?.['wp:featuredmedia']); // اضافه شده
            return post;
          });
        
        setPosts(sortedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };
  
    fetchPosts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} font-iransans`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} h-[70px] relative shadow-sm`}>
        <button 
          onClick={() => navigate(-1)} 
          className={`absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full px-4 py-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          <ArrowLeftCircle className="w-8 h-8 md:w-9 md:h-9" />
        </button>
        
        <div className="flex items-center justify-center h-full">
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>کانال ویژه</h1>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-70px)]">
        <div className="flex flex-col space-y-4" dir="rtl">
          {/* پیام‌های خوش‌آمدگویی */}
          {welcomeMessages.map((msg) => (
            <ChatMessage 
              key={msg.id}
              timestamp={msg.date.toLocaleDateString('fa-IR')}
              isDarkMode={isDarkMode}
            >
              {msg.content}
            </ChatMessage>
          ))}

          {/* نمایش پست‌های وردپرس */}
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            posts.map((post) => (
              <ChatMessage 
  key={post.id}
  timestamp={new Date(post.date).toLocaleDateString('fa-IR')}
  isDarkMode={isDarkMode}
  image={post._embedded?.['wp:featuredmedia']?.[0]?.source_url}
  audioUrl={post.meta?.audio_url}
>
  <h3 className="font-bold mb-2" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
  <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
</ChatMessage>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Add global styles */}
      <style jsx global>{`
        .message-bubble {
          background-color: transparent;
          color: ${isDarkMode ? '#fff' : '#1f2937'};
          border: 2px solid #f7d55d;
          border-radius: 24px;
          border-top-right-radius: 4px;
          padding: 1rem;
          max-width: 80%;
          direction: rtl;
          text-align: right;
        }
        
        .message-bubble ul {
          padding-right: 20px;
          list-style-position: inside;
        }
      `}</style>
    </div>
  );
};

export default Chat;