// SupportPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, Send } from 'lucide-react';
import { Store } from 'react-notifications-component';
import MessageSkeleton from './MessageSkeleton';

const SupportPage = ({ isDarkMode }) => {
  const navigate = useNavigate();

  // لیست پیام‌های فعلی در چت
  const [messages, setMessages] = useState([]);
  // وضعیت بارگذاری
  const [loading, setLoading] = useState(true);
  // متن پیام جدید
  const [message, setMessage] = useState('');
  // شناسه تیکت فعال
  const [activeTicketId, setActiveTicketId] = useState(null);
  // اطلاعات کاربر
  const [userInfo, setUserInfo] = useState(null);

  // رفرنس برای اسکرول به انتهای لیست
  const messagesEndRef = useRef(null);
  
  




  // هنگام بارگذاری کامپوننت، اطلاعات کاربر را می‌خوانیم
  useEffect(() => {
    const storedInfo =
      localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (storedInfo) {
      setUserInfo(JSON.parse(storedInfo));
    }
  }, []);

  // پس از آماده‌شدن userInfo، فرایند پشتیبانی را شروع می‌کنیم
  useEffect(() => {
    if (userInfo) {
      initializeChat();
    }
  }, [userInfo]);

  // مرحلهٔ اصلی: بررسی تیکت‌های موجود یا ایجاد تیکت جدید
  const initializeChat = async () => {
    try {
      setLoading(true);

      // گرفتن توکن کاربر
      const token =
        localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        throw new Error('توکن یافت نشد');
      }

      // گرفتن لیست تیکت‌های موجود برای این کاربر
      const response = await fetch(
        'https://alicomputer.com/wp-json/wpas-api/v1/tickets',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('خطا در دریافت تیکت‌ها');
      }

      const tickets = await response.json();
      console.log('Tickets data:', tickets);

      // اگر تیکتی موجود باشد، از اولین تیکت استفاده می‌کنیم
      if (tickets && tickets.length > 0) {
        const firstTicket = tickets[0];
        setActiveTicketId(firstTicket.id);
        await loadMessages(firstTicket.id);
      } else {
        // در غیر این صورت، یک تیکت جدید می‌سازیم
        await createNewTicket();
      }
    } catch (error) {
      console.error('Error in initializeChat:', error);
      Store.addNotification({
        title: 'خطا',
        message: error.message || 'مشکلی پیش آمد',
        type: 'danger',
        insert: 'top',
        container: 'center',
        dismiss: { duration: 3000 }
      });
    } finally {
      setLoading(false);
    }
  };

  // ساخت تیکت جدید با عنوانی شامل نام کاربر
  const createNewTicket = async () => {
    try {
      // گرفتن توکن کاربر
      const token =
        localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        throw new Error('توکن یافت نشد');
      }

      // نام کاربر برای نمایش در عنوان تیکت
      const displayName =
        userInfo?.user_display_name ||
        userInfo?.name ||
        userInfo?.user_nicename ||
        userInfo?.email ||
        userInfo?.user_email ||
        'کاربر';

      // ایجاد تیکت جدید
      const response = await fetch(
        'https://alicomputer.com/wp-json/wpas-api/v1/tickets',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: `گفتگو با: کاربر (${displayName})`,
            content: 'شروع گفتگو',
            department: 'پشتیبانی',
            priority: 'High'
          })
        }
      );

      if (!response.ok) {
        throw new Error('خطا در ایجاد تیکت');
      }

      const newTicket = await response.json();
      console.log('New Ticket:', newTicket);

      setActiveTicketId(newTicket.id);
      // پیام‌های اولیه خالی هستند
      setMessages([]);
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  };

  // دریافت پیام‌های یک تیکت
  const loadMessages = async (ticketId) => {
    try {
      // گرفتن توکن کاربر
      const token =
        localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        throw new Error('توکن یافت نشد');
      }

      // گرفتن اطلاعات تیکت
      const ticketResponse = await fetch(
        `https://alicomputer.com/wp-json/wpas-api/v1/tickets/${ticketId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      if (!ticketResponse.ok) {
        throw new Error('خطا در دریافت اطلاعات تیکت');
      }
      const ticketData = await ticketResponse.json();

      // گرفتن پاسخ‌های تیکت (replies)
      const repliesResponse = await fetch(
        `https://alicomputer.com/wp-json/wpas-api/v1/tickets/${ticketId}/replies`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );
      if (!repliesResponse.ok) {
        throw new Error('خطا در دریافت پیام‌ها');
      }
      const repliesData = await repliesResponse.json();

      // پیام اولیه تیکت
      const initialMessage = {
        id: ticketData.id,
        content: ticketData.content?.rendered || ticketData.content,
        date: ticketData.date,
        isAdmin: false,
        isPending: false
      };

      // فرمت‌بندی پاسخ‌ها
      const formattedReplies = repliesData.map((reply) => ({
        id: reply.id,
        content: reply.content.rendered || reply.content,
        date: reply.date,
        // فرض بر این که اگر author برابر با 1 یا "support" باشد، از طرف پشتیبانی است
        isAdmin:
          reply.author === 1 ||
          !reply.author ||
          reply.author === 'support',
        isPending: false
      }));

      // ترکیب پیام اولیه و پاسخ‌ها
      const allMessages = [initialMessage, ...formattedReplies].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  };

  // ارسال پیام کاربر
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeTicketId) return;

    const tempMessage = {
      id: Date.now(),
      content: message,
      date: new Date().toISOString(),
      isAdmin: false,
      isPending: true
    };

    // افزودن موقت پیام به لیست
    setMessages((prev) => [...prev, tempMessage]);
    setMessage('');
    scrollToBottom();

    try {
      // گرفتن توکن کاربر
      const token =
        localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        throw new Error('توکن یافت نشد');
      }

      // ارسال پیام به تیکت فعال
      const response = await fetch(
        `https://alicomputer.com/wp-json/wpas-api/v1/tickets/${activeTicketId}/replies`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: tempMessage.content
          })
        }
      );

      if (!response.ok) {
        throw new Error('خطا در ارسال پیام');
      }

      const data = await response.json();

      // به‌روزرسانی پیام پس از تایید سرور
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? {
                id: data.id,
                content: data.content.rendered || data.content,
                date: data.date,
                isAdmin: false,
                isPending: false
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // حذف پیام موقت در صورت خطا
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      Store.addNotification({
        title: 'خطا',
        message: 'خطا در ارسال پیام',
        type: 'danger',
        insert: 'top',
        container: 'center',
        dismiss: { duration: 3000 }
      });
    }
  };

  // اسکرول به انتهای لیست پیام‌ها
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // کامپوننت نمایش هر پیام
  const ChatMessage = ({ message }) => {
    const formattedDate = new Date(message.date).toLocaleDateString('fa-IR');
    const formattedTime = new Date(message.date).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div
        className={`flex w-full ${
          message.isAdmin ? 'justify-start' : 'justify-end'
        } mb-4`}
      >
        <div
          className={`max-w-[80%] rounded-2xl p-4 relative ${
            message.isAdmin
              ? isDarkMode
                ? 'bg-gray-100'
                : 'bg-gray-200'
              : 'bg-[#f7d55d]'
          }`}
        >
          <div
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
          <div className="flex justify-end items-center gap-2 mt-2">
            <span className="text-xs">{formattedTime}</span>
            <span className="text-xs">{formattedDate}</span>
            {!message.isAdmin && (
              <div className="flex items-center">
                {message.isPending ? (
                  <svg
                    className="w-3 h-3"
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
                    className="w-3 h-3"
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
      </div>

      {/* Messages Area */}
      <div className="absolute top-16 bottom-20 left-0 right-0 overflow-y-auto p-4">
      {loading ? (
  <>
    <MessageSkeleton isDarkMode={isDarkMode} />
    <MessageSkeleton isDarkMode={isDarkMode} />
    <MessageSkeleton isDarkMode={isDarkMode} />
  </>
) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} className="mb-9"/>
          </>
        )}
      </div>



      <div className="absolute bottom-20 left-4 right-4 flex justify-center p-1">
  <button
    onClick={() => navigate('/faq')}
    className="w-full max-w-md bg-gray-700/50 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-500/50 transition-colors"
  >
    سوالات پر تکرار
  </button>
</div>


ٕ
      {/* Input Area */}
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
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="پیام خود را بنویسید..."
              className={`flex-1 p-2 bg-transparent focus:outline-none ${
                isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'
              }`}
              style={{ direction: 'rtl' }}
            />
            <button
              type="submit"
              className={`p-2 rounded-full transition-colors ${
                message.trim()
                  ? 'text-[#f7d55d]'
                  : isDarkMode
                  ? 'text-gray-600'
                  : 'text-gray-400'
              } ${
                message.trim() &&
                (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
              disabled={!message.trim()}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
