import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, Plus, ChevronDown, AlertCircle, MessageCircle, CheckCircle } from 'lucide-react';
import { Store } from 'react-notifications-component';
import TicketDetailsModal from './TicketDetailsModal';

const SupportPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorId, setAuthorId] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const statusMap = {
    'pending': { text: 'در انتظار بررسی', color: 'bg-yellow-500/10 text-yellow-500' },
    'processing': { text: 'در حال بررسی', color: 'bg-blue-500/10 text-blue-500' },
    'read': { text: 'خوانده شده', color: 'bg-blue-500/10 text-blue-500' },
    'unread': { text: 'خوانده نشده', color: 'bg-yellow-500/10 text-yellow-500' },
    'resolved': { text: 'حل شده', color: 'bg-green-500/10 text-green-500' },
    'closed': { text: 'بسته شده', color: 'bg-green-500/10 text-green-500' }
  };

  useEffect(() => {
    const loadUserAndTickets = async () => {
      try {
        const auth = btoa('test:test');
        
        const ticketsResponse = await fetch('https://alicomputer.com/wp-json/wpas-api/v1/tickets', {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          }
        });
  
        if (!ticketsResponse.ok) {
          throw new Error('خطا در دریافت تیکت‌ها');
        }
  
        const ticketsData = await ticketsResponse.json();
        console.log('Tickets Data:', ticketsData);
        
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
  
      } catch (error) {
        console.error('Error:', error);
        Store.addNotification({
          title: "خطا",
          message: error.message,
          type: "danger",
          insert: "top",
          container: "top-right",
          dismiss: { duration: 5000 }
        });
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    loadUserAndTickets();
  }, []);

  const handleCreateTicket = async () => {
    try {
      const auth = btoa('test:test');
      
      const response = await fetch('https://alicomputer.com/wp-json/wpas-api/v1/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'تیکت جدید',
          message: 'محتوای تیکت جدید',
          status: 'pending'
        })
      });
  
    } catch (error) {
      // ... کد error handling
    }
  };

  // Rest of the component remains the same...
  return (
    <div dir="rtl" className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="relative h-16 flex items-center px-4">
          <button 
            onClick={() => navigate(-1)}
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h1 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            پشتیبانی
          </h1>
        </div>
      </div>

      <div className="absolute top-16 bottom-0 left-0 right-0 overflow-y-auto">
        <div className="p-4">
          {authorId && (
            <div className={`mb-4 p-4 rounded-xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <p>شناسه کاربری: {authorId}</p>
            </div>
          )}
          
          <button
            onClick={handleCreateTicket}
            className={`w-full p-4 rounded-xl mb-4 flex items-center justify-center gap-2 ${
              isDarkMode ? 'bg-blue-500' : 'bg-blue-500'
            } text-white font-medium`}
          >
            <Plus className="w-5 h-5" />
            تیکت جدید
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                در حال دریافت اطلاعات...
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              تیکتی موجود نیست
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(tickets) && tickets.map((ticket) => (
                                <div 
                                key={ticket.id} 
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className={`p-4 rounded-xl border ${
                                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                } cursor-pointer hover:shadow-md transition-shadow`}
                              >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {ticket.title?.rendered || ticket.subject || 'بدون عنوان'}
                      </h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(ticket.date || ticket.created).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${statusMap[ticket.status]?.color || 'bg-gray-500/10 text-gray-500'}`}>
  {statusMap[ticket.status]?.text || 'نامشخص'}
</span>
                  </div>
                  <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {ticket.content?.rendered || ticket.message?.rendered || 'بدون محتوا'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <TicketDetailsModal 
  isOpen={selectedTicketId !== null}
  onClose={() => setSelectedTicketId(null)}
  ticketId={selectedTicketId}
  isDarkMode={isDarkMode}
/>

<TicketDetailsModal 
  isOpen={selectedTicketId !== null}
  onClose={() => setSelectedTicketId(null)}
  ticketId={selectedTicketId}
  isDarkMode={isDarkMode}
/>

    </div>
  );
};

export default SupportPage;