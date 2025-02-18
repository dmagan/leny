// ImprovedSupportPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, Send, RefreshCw } from 'lucide-react';
import { Store } from 'react-notifications-component';
import MessageSkeleton from './MessageSkeleton';
import messageService from './MessageService';

const SupportPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const messagesEndRef = useRef(null);
  const isInitializedRef = useRef(false);
  const firstLoadRef = useRef(true);
  const inputRef = useRef(null);
  const isSendingRef = useRef(false); // برای جلوگیری از بارگذاری مجدد هنگام ارسال
  // برای ردیابی پیام‌های در حال ارسال
  const pendingMessagesRef = useRef(new Map());

  // استایل‌های سراسری برای متن‌های دوزبانه
  const globalBidiCss = `
    .message-content {
      direction: rtl;
      text-align: right;
      unicode-bidi: plaintext;
    }
    
    .message-content p {
      direction: rtl;
      text-align: right;
      unicode-bidi: plaintext;
    }
    
    .message-content div {
      direction: rtl;
      text-align: right;
      unicode-bidi: plaintext;
    }
    
    /* پشتیبانی از متن‌های انگلیسی درون متن فارسی */
    .message-content * [lang="en"],
    .message-content .en,
    .message-content code,
    .message-content pre {
      direction: ltr;
      text-align: left;
      unicode-bidi: embed;
      display: inline-block;
    }
    
    /* اطمینان از نمایش درست اعداد انگلیسی در متن فارسی */
    .message-content span.number {
      direction: ltr;
      unicode-bidi: embed;
      display: inline-block;
    }
  `;

  // اطمینان از شروع سرویس پیام‌ها هنگام بارگذاری کامپوننت
  useEffect(() => {
    isInitializedRef.current = false;
    
    const initializeService = async () => {
      try {
        // شروع بارگذاری
        setLoading(true);
        
        // شروع سرویس - اولویت با کش
        const success = await messageService.start();
        
        if (!success) {
          Store.addNotification({
            title: "خطا",
            message: "مشکلی در بارگذاری پیام‌ها پیش آمد. لطفاً از ورود به حساب کاربری خود اطمینان حاصل کنید.",
            type: "danger",
            insert: "top",
            container: "center",
            dismiss: { duration: 3000 }
          });
          navigate('/login');
          return;
        }
        
        isInitializedRef.current = true;
        
        // اگر این اولین بارگذاری است و پیام‌ها از کش آمده‌اند
        if (firstLoadRef.current && messages.length > 0) {
          // لودینگ را سریع‌تر حذف می‌کنیم
          setTimeout(() => {
            setLoading(false);
            firstLoadRef.current = false;
          }, 300);
        } else {
          // در غیر این صورت، اسکلتون را کمی بیشتر نمایش می‌دهیم
          setTimeout(() => {
            setLoading(false);
            firstLoadRef.current = false;
          }, messages.length > 0 ? 500 : 800);
        }
      } catch (error) {
        console.error('Error initializing message service:', error);
        setLoading(false);
        firstLoadRef.current = false;
      }
    };

    initializeService();

    // پاکسازی هنگام خروج از کامپوننت
    return () => {
      messageService.stop();
    };
  }, [navigate, messages.length]);

  // گوش دادن به تغییرات در سرویس پیام‌ها - بهبود یافته برای به‌روزرسانی وضعیت پیام‌های در حال ارسال
  useEffect(() => {
    const handleServiceUpdate = (data) => {
      // اگر در حال ارسال پیام هستیم، وضعیت loading را تغییر ندهید
      if (isSendingRef.current) {
        setIsSyncing(data.isSyncing);
        setLastSyncTime(data.lastSyncTime);
        
        // فقط پیام‌های جدید را دریافت می‌کنیم، اما وضعیت لودینگ را تغییر نمی‌دهیم
        updateMessagesWithoutReloading(data.messages);
        setActiveTicketId(data.activeTicketId);
        return;
      }
      
      // بهبود: تحلیل پیام‌های جدید و به‌روزرسانی وضعیت پیام‌های در حال ارسال
      const newMessages = [...data.messages];
      
      // اگر پیام‌های در حال ارسال داریم
      if (pendingMessagesRef.current.size > 0) {
        // بررسی هر پیام در حال ارسال
        pendingMessagesRef.current.forEach((pendingMessage, tempId) => {
          // بررسی اینکه آیا پیام در سرور ثبت شده است
          const serverMessage = newMessages.find(msg => {
            // مقایسه محتوای پیام و زمان تقریبی
            return msg.content === pendingMessage.content && 
                   !msg.isAdmin && 
                   !msg.isPending &&
                   // بررسی زمان - اختلاف کمتر از 10 دقیقه
                   Math.abs(new Date(msg.date) - new Date(pendingMessage.date)) < 600000;
          });
          
          if (serverMessage) {
            // پیام در سرور ثبت شده، پس از لیست پیام‌های در حال ارسال حذف می‌کنیم
            pendingMessagesRef.current.delete(tempId);
          } else {
            // هنوز در سرور ثبت نشده، آن را به لیست پیام‌ها اضافه می‌کنیم
            // اگر قبلاً اضافه نشده باشد
            if (!newMessages.some(msg => msg.id === tempId)) {
              newMessages.push(pendingMessage);
            }
          }
        });
      }
      
      // مرتب‌سازی پیام‌ها بر اساس تاریخ
      newMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // به‌روزرسانی state‌ها
      setMessages(newMessages);
      setActiveTicketId(data.activeTicketId);
      setIsSyncing(data.isSyncing);
      setLastSyncTime(data.lastSyncTime);
      
      // اگر پیام‌ها از کش بارگیری شدند و تعداد آنها بیشتر از 0 است
      // loading را سریع‌تر false می‌کنیم
      if (newMessages.length > 0 && firstLoadRef.current && !data.isSyncing) {
        setLoading(false);
        firstLoadRef.current = false;
      }
    };

    messageService.addListener(handleServiceUpdate);

    return () => {
      messageService.removeListener(handleServiceUpdate);
    };
  }, []);
  
  // به‌روزرسانی پیام‌ها بدون تغییر وضعیت لودینگ
  const updateMessagesWithoutReloading = (newServerMessages) => {
    setMessages(prevMessages => {
      // ترکیب پیام‌های قبلی و جدید
      const allMessages = [...prevMessages];
      
      // بررسی پیام‌های سرور و به‌روزرسانی وضعیت پیام‌های در حال ارسال
      pendingMessagesRef.current.forEach((pendingMsg, tempId) => {
        const matchedServerMsg = newServerMessages.find(serverMsg => 
          serverMsg.content === pendingMsg.content && 
          !serverMsg.isAdmin &&
          Math.abs(new Date(serverMsg.date) - new Date(pendingMsg.date)) < 600000
        );
        
        if (matchedServerMsg) {
          // پیام در سرور ثبت شده، وضعیت آن را در UI به‌روز می‌کنیم
          const pendingMsgIndex = allMessages.findIndex(msg => msg.id === tempId);
          if (pendingMsgIndex !== -1) {
            allMessages[pendingMsgIndex] = {
              ...allMessages[pendingMsgIndex],
              isPending: false
            };
          }
          // از لیست در حال ارسال حذف می‌کنیم
          pendingMessagesRef.current.delete(tempId);
        }
      });
      
      // مرتب‌سازی و برگرداندن پیام‌ها
      return allMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
  };

  // اسکرول به انتهای لیست پیام‌ها - بهبود یافته
  useEffect(() => {
    // فقط وقتی لودینگ تمام شد و پیام‌ها وجود دارند
    if (!loading && messages.length > 0 && isInitializedRef.current) {
      scrollToBottom(false);
    }
  }, [loading, messages.length]);

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end'
        });
      }
    }, smooth ? 100 : 0);
  };

  // ارسال پیام جدید - اصلاح شده برای نمایش فوری پیام و مدیریت وضعیت ارسال
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeTicketId || loading) return;
    // فعال کردن وضعیت ارسال
    isSendingRef.current = true;
    
    // متن پیام را قبل از ارسال ذخیره می‌کنیم
    const messageText = message;
    // پاک کردن ورودی پیام 
    setMessage('');

    // ایجاد پیام موقت برای نمایش فوری
    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      content: messageText,
      date: new Date().toISOString(),
      isAdmin: false,
      isPending: true
    };

    // ذخیره در رفرنس برای ردیابی وضعیت
    pendingMessagesRef.current.set(tempId, tempMessage);
    
    // افزودن به state محلی برای نمایش فوری
    setMessages(prev => {
      const updatedMessages = [...prev, tempMessage];
      // مرتب‌سازی بر اساس تاریخ
      return updatedMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    // اسکرول به پایین صفحه - فوری
    scrollToBottom(false);

    try {
      // ارسال پیام از طریق سرویس - بدون وقفه در UI
      await messageService.sendMessage(messageText);
      
      // به‌روزرسانی دستی وضعیت پیام در UI
      setMessages(prev => prev.map(msg => {
        if (msg.id === tempId) {
          return {
            ...msg,
            isPending: false 
          };
        }
        return msg;
      }));
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // حذف پیام موقت در صورت خطا
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      Store.addNotification({
        title: "خطا",
        message: "خطا در ارسال پیام",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    } finally {
      // حذف از لیست پیام‌های در حال ارسال
      if (pendingMessagesRef.current.has(tempId)) {
        pendingMessagesRef.current.delete(tempId);  
      }
      
      // غیرفعال کردن وضعیت ارسال
      isSendingRef.current = false;
      
      // دوباره فوکوس روی ورودی متن در نهایت
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  // نمایش درخواست همگام‌سازی دستی
  const handleManualSync = async () => {
    if (isSyncing) return; // اگر در حال همگام‌سازی یا ارسال است، کاری انجام نده
    
    try {
      setIsSyncing(true); // نمایش وضعیت همگام‌سازی
      
      // همگام‌سازی پیام‌ها - بدون start مجدد سرویس
      await messageService.syncMessages();
      
      // نمایش اعلان موفقیت
      Store.addNotification({
        title: "بروزرسانی",
        message: "پیام‌ها با موفقیت بروزرسانی شدند",
        type: "success",
        insert: "top",
        container: "center",
        dismiss: { duration: 2000 }
      });
    } catch (error) {
      console.error('Error manual syncing:', error);
      Store.addNotification({
        title: "خطا",
        message: "خطا در بروزرسانی پیام‌ها",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    } finally {
      // بلافاصله وضعیت همگام‌سازی را به حالت عادی برگردان
      setIsSyncing(false);
    }
  };

  // کامپوننت نمایش هر پیام
  const ChatMessage = ({ message }) => {
    const formattedDate = new Date(message.date).toLocaleDateString('fa-IR');
    const formattedTime = new Date(message.date).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className={`flex w-full ${message.isAdmin ? 'justify-start' : 'justify-end'} mb-4`}>
        <div
          className={`max-w-[80%] rounded-2xl p-4 relative ${
            message.isAdmin
              ? isDarkMode
                ? 'bg-gray-700'
                : 'bg-gray-100'
              : 'bg-[#f7d55d]'
          }`}
        >
          <div
            className={`text-sm message-content ${
              message.isAdmin
                ? isDarkMode
                  ? 'text-white'
                  : 'text-gray-800'
                : 'text-gray-900'
            }`}
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
          <div className="flex justify-end items-center gap-2 mt-2">
            <span
              className={`text-xs ${
                message.isAdmin
                  ? isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'
                  : 'text-gray-700'
              }`}
            >
              {formattedTime}
            </span>
            <span
              className={`text-xs ${
                message.isAdmin
                  ? isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'
                  : 'text-gray-700'
              }`}
            >
              {formattedDate}
            </span>
            {!message.isAdmin && (
              <div className="flex items-center">
                {message.isPending ? (
                  <svg
                    className="w-3 h-3 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12l5 5L20 7"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div
        className={`h-16 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } flex items-center px-4 relative border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <button
          onClick={() => navigate(-1)}
          className={`absolute left-4 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}
        >
          <ArrowLeftCircle className="w-8 h-8" />
        </button>
        <h2
          className={`w-full text-center text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          پشتیبانی
        </h2>
        {lastSyncTime && (
          <button 
          onClick={handleManualSync}
          className={`absolute right-4 flex items-center ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          } ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'}`}
          disabled={isSyncing}
        >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="absolute top-16 bottom-20 left-0 right-0 overflow-y-auto p-4">
        {loading && !isSendingRef.current ? (
          <>
            <MessageSkeleton isDarkMode={isDarkMode} />
            <MessageSkeleton isDarkMode={isDarkMode} />
            <MessageSkeleton isDarkMode={isDarkMode} />
          </>
        ) : messages.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-full ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <svg
              className="w-16 h-16 mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-center">
              پیامی وجود ندارد. اولین پیام خود را ارسال کنید.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="absolute bottom-20 left-4 right-4 flex justify-center p-1">
        <button
          onClick={() => navigate('/faq')}
          className={`w-full max-w-md ${
            isDarkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-200/80 text-gray-800'
          } py-2 px-4 rounded-lg shadow-md hover:bg-opacity-80 transition-colors`}
          disabled={isSendingRef.current}
        >
          سوالات پر تکرار
        </button>
      </div>

      {/* Input Area - بهینه شده برای واکنش سریع‌تر */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div
          className={`${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-2xl shadow-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-2">
          <input
  ref={inputRef}
  type="text"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="پیام خود را بنویسید..."
              className={`flex-1 p-2 bg-transparent focus:outline-none ${
                isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'
              } ${(loading && !isSendingRef.current) ? 'opacity-75' : 'opacity-100'}`}
              style={{ direction: 'rtl' }}
              disabled={loading}


              />
            <button
              type="submit"
              disabled={!message.trim() || isSyncing || (loading && !isSendingRef.current) || isSendingRef.current}
              className={`p-2 rounded-full transition-colors ${
                message.trim() && !isSyncing && !(loading && !isSendingRef.current) && !isSendingRef.current
                  ? 'text-[#f7d55d]'
                  : isDarkMode
                  ? 'text-gray-600'
                  : 'text-gray-400'
              } ${
                message.trim() && !isSyncing && !(loading && !isSendingRef.current) && !isSendingRef.current &&
                (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* استایل‌های سراسری برای پشتیبانی از متن‌های دوزبانه */}
      <style jsx global>{globalBidiCss}</style>
    </div>
  );
};

export default SupportPage;