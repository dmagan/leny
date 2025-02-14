// TicketDetailsModal.js
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip, Smile } from 'lucide-react';

// کامپوننت پیام
const TicketMessage = ({ message, isDarkMode }) => {
  const formattedDate = new Date(message.date).toLocaleDateString('fa-IR');
  const formattedTime = new Date(message.date).toLocaleTimeString('fa-IR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex w-full ${message.isAdmin ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[80%] rounded-2xl p-4 ${
        message.isAdmin 
          ? isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          : 'bg-[#f7d55d]'
      }`}>
        <div className={`text-sm ${
          message.isAdmin 
            ? isDarkMode ? 'text-white' : 'text-gray-800'
            : 'text-gray-900'
        }`}>
          {message.content}
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <span className={`text-xs ${
            message.isAdmin 
              ? isDarkMode ? 'text-gray-400' : 'text-gray-500'
              : 'text-gray-700'
          }`}>
            {formattedTime}
          </span>
          <span className={`text-xs ${
            message.isAdmin 
              ? isDarkMode ? 'text-gray-400' : 'text-gray-500'
              : 'text-gray-700'
          }`}>
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
};

// کامپوننت ورودی پیام
const MessageInput = ({ isDarkMode, onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className={`mx-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
        <button 
          type="button"
          className={`p-2 rounded-full transition-colors ${
            isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Paperclip size={20} />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          className={`flex-1 p-2 text-sm bg-transparent focus:outline-none ${
            isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'
          }`}
          style={{ direction: 'rtl' }}
        />
        
        <button 
          type="button"
          className={`p-2 rounded-full transition-colors ${
            isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Smile size={20} />
        </button>
        
        <button 
          type="submit"
          className={`p-2 rounded-full transition-colors ${
            message.trim() 
              ? 'text-[#f7d55d]'
              : isDarkMode ? 'text-gray-600' : 'text-gray-400'
          } ${
            message.trim() && (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
          }`}
          disabled={!message.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

const TicketDetailsModal = ({ isOpen, onClose, ticketId, isDarkMode }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchMessages();
    }
  }, [isOpen, ticketId]);

  const fetchMessages = async () => {
    try {
      const auth = btoa('test:test');
      const response = await fetch(`https://alicomputer.com/wp-json/wpas-api/v1/tickets/${ticketId}/replies`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('خطا در دریافت پیام‌ها');
      
      const data = await response.json();
      // تبدیل پاسخ‌ها به فرمت پیام
      const formattedMessages = data.map(reply => ({
        id: reply.id,
        content: reply.content.rendered,
        date: new Date(reply.date),
        isAdmin: reply.author === 1 // فرض می‌کنیم آیدی 1 برای ادمین است
      }));
      
      setMessages(formattedMessages);
      setLoading(false);
      
      // اسکرول به آخرین پیام
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    try {
      const auth = btoa('test:test');
      // ابتدا پیام را به صورت موقت نمایش می‌دهیم
      const tempMessage = {
        id: Date.now(),
        content,
        date: new Date(),
        isAdmin: false
      };
      setMessages(prev => [...prev, tempMessage]);

      // ارسال پیام به سرور
      const response = await fetch(`https://alicomputer.com/wp-json/wpas-api/v1/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          ticket_id: ticketId
        })
      });

      if (!response.ok) throw new Error('خطا در ارسال پیام');
      // بعد از موفقیت، پیام‌ها را مجدداً دریافت می‌کنیم
      await fetchMessages();

    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className={`absolute inset-4 sm:inset-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-2xl overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative`}>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <X size={24} />
          </button>
          <h2 className={`text-lg font-bold absolute left-1/2 -translate-x-1/2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            جزئیات تیکت
          </h2>
        </div>

        {/* Messages */}
        <div className="absolute top-16 bottom-20 left-0 right-0 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <TicketMessage 
                  key={message.id}
                  message={message}
                  isDarkMode={isDarkMode}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <MessageInput 
            isDarkMode={isDarkMode}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;