import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, Send, RefreshCw, Plus, Check, Clock } from 'lucide-react';
import { Store } from 'react-notifications-component';
import MessageSkeleton from './MessageSkeleton';
import newSupportService from './NewSupportService';
import newSupportNotificationService from './NewSupportNotificationService';

// کامپوننت نمایش هر پیام با حالت ارسال
const ChatMessage = ({ message, isDarkMode }) => {
  const formattedDate = new Date(message.date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const formattedTime = new Date(message.date).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className={`flex w-full ${message.isAdmin ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 relative ${
          message.isAdmin
            ? isDarkMode
              ? 'bg-gray-700'
              : 'bg-gray-100'
            : message.isPending
            ? isDarkMode
              ? 'bg-yellow-800'
              : 'bg-yellow-100'
            : message.isFailed
            ? isDarkMode
              ? 'bg-red-800'
              : 'bg-red-100'
            : 'bg-[#f7d55d]'
        }`}
      >
      <div
  className={`text-sm message-content break-words whitespace-pre-wrap ${
    message.isAdmin
      ? isDarkMode
        ? 'text-white'
        : 'text-gray-800'
      : 'text-gray-900'
  }`}
  dir="rtl"
  style={{ 
    textAlign: 'right', 
    direction: 'rtl',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap'
  }}
  dangerouslySetInnerHTML={{ __html: message.content }}
/>
        <div className="flex justify-end items-center gap-2 mt-2">
          <span
            className={`text-xs ${
              message.isAdmin
                ? isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-500'
                : message.isPending
                ? isDarkMode
                  ? 'text-yellow-300'
                  : 'text-yellow-600'
                : message.isFailed
                ? isDarkMode
                  ? 'text-red-300'
                  : 'text-red-600'
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
                : message.isPending
                ? isDarkMode
                  ? 'text-yellow-300'
                  : 'text-yellow-600'
                : message.isFailed
                ? isDarkMode
                  ? 'text-red-300'
                  : 'text-red-600'
                : 'text-gray-700'
            }`}
          >
            {formattedDate}
          </span>
          {!message.isAdmin && (
            <div className="flex items-center">
              {message.isPending ? (
                <Clock 
                  className={`w-3 h-3 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} animate-pulse`}
                />
              ) : message.isFailed ? (
                <svg
                  className={`w-3 h-3 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <Check className="w-3 h-3 text-green-600" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// کامپوننت لیست تیکت‌ها
const TicketsList = ({ tickets, currentTicket, onSelectTicket, isDarkMode, onNewTicket }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            تیکت‌های پشتیبانی
          </h3>
          <button
            onClick={onNewTicket}
            className={`p-2 rounded-full ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
            } hover:opacity-80`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {tickets.map(ticket => (
          <div
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className={`p-4 border-b cursor-pointer transition-colors ${
              currentTicket && currentTicket.id === ticket.id
                ? isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
            } ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className={`font-medium text-sm ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {ticket.title}
              </h4>
              {ticket.unread_user_count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {ticket.unread_user_count}
                </span>
              )}
            </div>
            
            <div className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {ticket.last_message && (
                <p className="truncate mb-1">{ticket.last_message.message}</p>
              )}
              <p>{new Date(ticket.updated_at).toLocaleDateString('fa-IR')}</p>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                ticket.status === 'open' 
                  ? 'bg-green-100 text-green-800'
                  : ticket.status === 'closed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {ticket.status === 'open' ? 'باز' : 
                 ticket.status === 'closed' ? 'بسته' : 'در حال بررسی'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NewSupportPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showTicketsList, setShowTicketsList] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [pendingMessages, setPendingMessages] = useState(new Map()); // نگهداری پیام‌های در حال ارسال
  
  const cardRef = useRef(null);
  const [showCard, setShowCard] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // انیمیشن ورود صفحه
  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  // راه‌اندازی سرویس
  useEffect(() => {
    const initializeService = async () => {
      try {
        const success = await newSupportService.start();
        if (!success) {
          Store.addNotification({
            title: "خطا",
            message: "مشکلی در بارگذاری پیام‌ها پیش آمد",
            type: "danger",
            insert: "top",
            container: "center",
            dismiss: { duration: 3000 }
          });
          navigate('/login');
          return;
        }
      } catch (error) {
        setLoading(false);
      }
    };

    initializeService();

    return () => {
      newSupportService.stop();
    };
  }, [navigate]);

  // گوش دادن به به‌روزرسانی‌های سرویس
  useEffect(() => {
    const handleServiceUpdate = (data) => {
      setTickets(data.tickets || []);
      setCurrentTicket(data.currentTicket);
      
      // ترکیب پیام‌های دریافتی از سرور با پیام‌های pending
      const serverMessages = data.messages || [];
      const combinedMessages = [...serverMessages];
      
      // اضافه کردن پیام‌های pending که هنوز از سرور نیامده‌اند
      pendingMessages.forEach((pendingMsg, tempId) => {
        const existsInServer = serverMessages.some(msg => 
          msg.content === pendingMsg.content && 
          Math.abs(new Date(msg.date) - new Date(pendingMsg.date)) < 5000 // 5 ثانیه تفاوت
        );
        
        if (!existsInServer) {
          combinedMessages.push(pendingMsg);
        }
      });
      
      // مرتب‌سازی بر اساس تاریخ
      combinedMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setMessages(combinedMessages);
      setIsSyncing(data.isSyncing);
      setLastSyncTime(data.lastSyncTime);
      
      if (data.tickets && data.tickets.length > 0 && loading) {
        setLoading(false);
      }
    };
    
    newSupportService.addListener(handleServiceUpdate);
    
    return () => {
      newSupportService.removeListener(handleServiceUpdate);
    };
  }, [loading, pendingMessages]);

  // اسکرول به انتهای پیام‌ها
  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end'
        });
      }
    }, 100);
  };

  // اسکرول خودکار بعد از تغییر پیام‌ها
  useEffect(() => {
    if (!loading) {
      scrollToBottom(false);
    }
  }, [messages, loading]);

  // همگام‌سازی دستی
  const handleManualSync = async () => {
    if (isSyncing) return;
    
    try {
      await newSupportService.syncMessages();
      
      Store.addNotification({
        title: "بروزرسانی",
        message: "پیام‌ها با موفقیت بروزرسانی شدند",
        type: "success",
        insert: "top",
        container: "center",
        dismiss: { duration: 2000 }
      });
    } catch (error) {
      
      Store.addNotification({
        title: "خطا",
        message: "خطا در بروزرسانی پیام‌ها",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    }
  };

  // ارسال پیام با نمایش فوری
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const messageText = message;
    const tempId = Date.now() + Math.random(); // ID موقت برای پیام
    setMessage('');
    
    // ایجاد پیام موقت
    const tempMessage = {
      id: tempId,
      content: messageText,
      date: new Date().toISOString(),
      isAdmin: false,
      isPending: true,
      isFailed: false
    };
    
    // اضافه کردن پیام موقت به لیست pending
    setPendingMessages(prev => new Map(prev.set(tempId, tempMessage)));
    
    // اسکرول به پایین
    scrollToBottom();
    
    try {
      const success = await newSupportService.sendMessage(messageText);
      
      if (success) {
        // حذف پیام از pending (سرور پیام جدید را ارسال خواهد کرد)
        setPendingMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(tempId);
          return newMap;
        });
      } else {
        // علامت‌گذاری پیام به عنوان ناموفق
        setPendingMessages(prev => {
          const newMap = new Map(prev);
          const failedMessage = { ...tempMessage, isPending: false, isFailed: true };
          newMap.set(tempId, failedMessage);
          return newMap;
        });
        
        Store.addNotification({
          title: "خطا",
          message: "خطا در ارسال پیام",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000 }
        });
      }
    } catch (error) {
      
      // علامت‌گذاری پیام به عنوان ناموفق
      setPendingMessages(prev => {
        const newMap = new Map(prev);
        const failedMessage = { ...tempMessage, isPending: false, isFailed: true };
        newMap.set(tempId, failedMessage);
        return newMap;
      });
      
      Store.addNotification({
        title: "خطا",
        message: "خطا در ارسال پیام",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    } finally {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // انتخاب تیکت
  const handleSelectTicket = (ticket) => {
    newSupportService.setActiveTicket(ticket);
    setShowTicketsList(false);
  };

  // ایجاد تیکت جدید
  const handleCreateNewTicket = async () => {
    if (!newTicketTitle.trim() || !newTicketMessage.trim()) {
      Store.addNotification({
        title: "خطا",
        message: "لطفاً عنوان و پیام را وارد کنید",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
      return;
    }

    try {
      const success = await newSupportService.sendMessage(newTicketMessage, newTicketTitle);
      
      if (success) {
        setNewTicketTitle('');
        setNewTicketMessage('');
        setShowNewTicketModal(false);
        
        Store.addNotification({
          title: "موفق",
          message: "تیکت جدید ایجاد شد",
          type: "success",
          insert: "top",
          container: "center",
          dismiss: { duration: 2000 }
        });
      } else {
        Store.addNotification({
          title: "خطا",
          message: "خطا در ایجاد تیکت",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000 }
        });
      }
    } catch (error) {
    }
  };

  // بستن صفحه
  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  // ریست کردن شمارشگر پیام‌های ناخوانده
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.id && !latestMessage.isPending) {
        newSupportNotificationService.markAllAsRead(latestMessage.id);
      }
    }
  }, [loading, messages]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}
    >
      <div 
        ref={cardRef}
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: `translateX(${showCard ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99)'
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
          
          <div className="flex items-center justify-center flex-1">
            <button
              onClick={() => setShowTicketsList(!showTicketsList)}
              className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} hover:opacity-80`}
            >
              {currentTicket ? currentTicket.title : 'پشتیبانی جدید'}
            </button>
          </div>
          
          <button 
            onClick={handleManualSync}
            className={`absolute right-4 flex items-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'}`}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex">
          {/* Tickets List Sidebar */}
          {showTicketsList && (
            <div className={`w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-r ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <TicketsList
                tickets={tickets}
                currentTicket={currentTicket}
                onSelectTicket={handleSelectTicket}
                isDarkMode={isDarkMode}
                onNewTicket={() => setShowNewTicketModal(true)}
              />
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <>
                  <MessageSkeleton isDarkMode={isDarkMode} />
                  <MessageSkeleton isDarkMode={isDarkMode} />
                  <MessageSkeleton isDarkMode={isDarkMode} />
                </>
              ) : messages.length === 0 ? (
  <div className="p-4">
    {/* پیام خوش‌آمدگویی Local */}
    <div className="flex w-full justify-start mb-4">
      <div className={`max-w-[80%] rounded-2xl p-4 ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <div className={`text-sm ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`} dir="rtl" style={{ textAlign: 'right', direction: 'rtl' }}>
          سلام و خوش آمدید! 👋<br/>
          این اولین تیکت پشتیبانی شما است. می‌توانید سوالات و درخواست‌های خود را اینجا مطرح کنید.<br/>
          تیم پشتیبانی ما در اسرع وقت پاسخ خواهد داد. 🙏
        </div>
        <div className="flex justify-end items-center gap-2 mt-2">
          <span className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          <span className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
    
    {/* متن راهنما */}
    <div className={`flex flex-col items-center justify-center mt-8 ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`}>
      <svg
        className="w-12 h-12 mb-3 opacity-50"
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
      <p className="text-center text-sm">
        پیام خود را در قسمت پایین بنویسید...
      </p>
    </div>
  </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id || msg.date} message={msg} isDarkMode={isDarkMode} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className={`
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                rounded-2xl shadow-lg border
                ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
              `}>
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className={`
                      flex-1 p-2 bg-transparent focus:outline-none
                      ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}
                    `}
                    style={{ 
                      direction: 'rtl',
                      fontSize: '16px',
                      WebkitAppearance: 'none',
                      borderRadius: '0'
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || isSyncing}
                    className={`
                      p-2 rounded-full transition-colors
                      ${
                        message.trim() && !isSyncing
                          ? 'text-[#f7d55d]'
                          : isDarkMode
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }
                      ${
                        message.trim() && !isSyncing &&
                        (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                      }
                    `}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* New Ticket Modal */}
        {showNewTicketModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-md mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                تیکت جدید
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  placeholder="عنوان تیکت..."
                  className={`w-full p-3 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#f7d55d]`}
                  style={{ 
                    direction: 'rtl',
                    fontSize: '16px',
                    WebkitAppearance: 'none',
                    borderRadius: '12px'
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />

                <textarea
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  placeholder="توضیحات..."
                  rows={4}
                  className={`w-full p-3 rounded-xl border resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#f7d55d]`}
                  style={{ 
                    direction: 'rtl',
                    fontSize: '16px',
                    WebkitAppearance: 'none',
                    borderRadius: '12px'
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateNewTicket}
                  disabled={!newTicketTitle.trim() || !newTicketMessage.trim()}
                  className="flex-1 bg-[#f7d55d] text-gray-900 py-3 rounded-xl font-medium hover:bg-[#e5c44c] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ایجاد تیکت
                </button>
                <button
                  onClick={() => setShowNewTicketModal(false)}
                  className={`flex-1 py-3 rounded-xl font-medium ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewSupportPage;