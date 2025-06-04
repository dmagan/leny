class NewSupportService {
  constructor() {
    this.listeners = [];
    this.isActive = false;
    this.tickets = [];
    this.currentTicket = null;
    this.messages = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncInterval = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // شروع سرویس
  async start() {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        console.error('No user token found');
        return false;
      }

      this.isActive = true;
      this.retryCount = 0;
      
      // بارگذاری اولیه تیکت‌ها
      const success = await this.loadTickets();
      
      if (success) {
        // تنظیم همگام‌سازی دوره‌ای
        this.setupPeriodicSync();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error starting NewSupportService:', error);
      return false;
    }
  }

  // توقف سرویس
  stop() {
    this.isActive = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    // پاک کردن داده‌ها
    this.tickets = [];
    this.currentTicket = null;
    this.messages = [];
    this.retryCount = 0;
    
    this.notifyListeners();
  }

  // بارگذاری لیست تیکت‌ها
  async loadTickets() {
    try {
      console.log('Loading tickets...');
      
      const response = await window.authenticatedFetch('https://p30s.com/wp-json/custom-support/v1/tickets');
      
      if (!response || !response.ok) {
        console.error('Failed to fetch tickets, status:', response?.status);
        
        // اگر 401 یا 403 بود، یعنی مشکل authentication است
        if (response?.status === 401 || response?.status === 403) {
          console.error('Authentication failed, stopping service');
          this.stop();
          return false;
        }
        
        throw new Error(`Failed to fetch tickets (${response?.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.tickets = data.data || [];
        this.retryCount = 0; // ریست کردن شمارشگر retry در صورت موفقیت
        
        console.log('Loaded tickets:', this.tickets.length);
        
        // اگر تیکت فعالی داریم، بررسی کنیم هنوز وجود داره
        if (this.currentTicket) {
          const existingTicket = this.tickets.find(ticket => ticket.id === this.currentTicket.id);
          if (existingTicket) {
            this.currentTicket = existingTicket;
            await this.loadMessages(this.currentTicket.id);
          } else {
            // تیکت فعلی دیگه وجود نداره، اولین تیکت رو انتخاب کن
            console.log('Current ticket no longer exists, selecting first available');
            this.currentTicket = this.tickets.length > 0 ? this.tickets[0] : null;
            if (this.currentTicket) {
              await this.loadMessages(this.currentTicket.id);
            } else {
              this.messages = [];
            }
          }
        } else if (this.tickets.length > 0) {
          // اگر تیکت فعالی نداریم، آخرین تیکت را انتخاب کنیم
          console.log('No active ticket, selecting first available');
          this.currentTicket = this.tickets[0];
          await this.loadMessages(this.currentTicket.id);
        } else {
          // هیچ تیکتی وجود ندارد
          console.log('No tickets found');
          this.messages = [];
        }
        
        this.notifyListeners();
        return true;
      } else {
        console.error('API returned unsuccessful response:', data);
        return false;
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      
      // مدیریت retry
      this.retryCount++;
      if (this.retryCount < this.maxRetries) {
        console.log(`Retrying loadTickets (${this.retryCount}/${this.maxRetries})`);
        // تاخیر قبل از retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await this.loadTickets();
      }
      
      // در صورت شکست نهایی، پاک کردن داده‌ها
      this.tickets = [];
      this.currentTicket = null;
      this.messages = [];
      this.notifyListeners();
      
      return false;
    }
  }

  // بارگذاری پیام‌های یک تیکت
  async loadMessages(ticketId) {
    try {
      console.log('Loading messages for ticket:', ticketId);
      
      const response = await window.authenticatedFetch(
        `https://p30s.com/wp-json/custom-support/v1/tickets/${ticketId}/messages`
      );
      
      if (!response || !response.ok) {
        console.error('Failed to fetch messages, status:', response?.status);
        
        // اگر 403 یا 404 بود، یعنی تیکت متعلق به کاربر نیست یا وجود نداره
        if (response?.status === 403 || response?.status === 404) {
          console.log('Access denied to ticket', ticketId, ', finding alternative');
          
          // تیکت فعلی رو پاک کن
          this.currentTicket = null;
          this.messages = [];
          
          // پیدا کردن اولین تیکت معتبر
          for (const ticket of this.tickets) {
            if (ticket.id !== ticketId) { // تیکت فعلی رو skip کن
              try {
                console.log('Trying ticket:', ticket.id);
                const testResponse = await window.authenticatedFetch(
                  `https://p30s.com/wp-json/custom-support/v1/tickets/${ticket.id}/messages`
                );
                if (testResponse && testResponse.ok) {
                  console.log('Found accessible ticket:', ticket.id);
                  this.currentTicket = ticket;
                  return await this.loadMessages(ticket.id);
                }
              } catch (testError) {
                console.log('Ticket', ticket.id, 'is not accessible');
              }
            }
          }
          
          // اگر هیچ تیکت قابل دسترسی پیدا نشد
          console.log('No accessible tickets found');
          this.notifyListeners();
          return false;
        }
        
        throw new Error(`Failed to fetch messages (${response?.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.messages = data.data || [];
        console.log('Loaded messages:', this.messages.length);
        
        // علامت‌گذاری پیام‌ها به عنوان خوانده شده
        await this.markMessagesAsRead(ticketId);
        
        this.notifyListeners();
        return true;
      } else {
        console.error('API returned unsuccessful response for messages:', data);
        return false;
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      
      // در صورت خطا، پیام‌ها را پاک کن
      this.messages = [];
      this.notifyListeners();
      
      return false;
    }
  }

  // ارسال پیام جدید
  async sendMessage(message, title = null) {
    try {
      console.log('Sending message:', { hasCurrentTicket: !!this.currentTicket, title });
      
      let url = '';
      let payload = {};

      if (this.currentTicket) {
        // پیام به تیکت موجود
        url = `https://p30s.com/wp-json/custom-support/v1/tickets/${this.currentTicket.id}/messages`;
        payload = { message };
      } else {
        // ایجاد تیکت جدید
        if (!title) {
          title = 'درخواست پشتیبانی جدید';
        }
        url = 'https://p30s.com/wp-json/custom-support/v1/tickets';
        payload = { title, message };
      }

      const response = await window.authenticatedFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response || !response.ok) {
        console.error('Failed to send message, status:', response?.status);
        throw new Error(`Failed to send message (${response?.status})`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Message sent successfully');
        
        // اگر تیکت جدید ایجاد شد
        if (data.data.ticket_id && !this.currentTicket) {
          console.log('New ticket created:', data.data.ticket_id);
          await this.loadTickets(); // بارگذاری مجدد لیست تیکت‌ها
        } else if (this.currentTicket) {
          // بارگذاری مجدد پیام‌ها
          await this.loadMessages(this.currentTicket.id);
        }
        
        return true;
      } else {
        console.error('API returned unsuccessful response for send message:', data);
        return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // علامت‌گذاری پیام‌ها به عنوان خوانده شده
  async markMessagesAsRead(ticketId) {
    try {
      const response = await window.authenticatedFetch(
        `https://p30s.com/wp-json/custom-support/v1/tickets/${ticketId}/mark-read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const success = response && response.ok;
      if (success) {
        console.log('Messages marked as read for ticket:', ticketId);
      }
      
      return success;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // همگام‌سازی دستی
  async syncMessages() {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping');
      return false;
    }
    
    console.log('Starting manual sync');
    this.isSyncing = true;
    this.notifyListeners();
    
    try {
      // بارگذاری مجدد تیکت‌ها
      const success = await this.loadTickets();
      
      this.lastSyncTime = new Date().toISOString();
      console.log('Sync completed:', success ? 'successfully' : 'with errors');
      
      return success;
    } catch (error) {
      console.error('Error syncing messages:', error);
      return false;
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  // تنظیم همگام‌سازی دوره‌ای
  setupPeriodicSync() {
    // پاک کردن interval قبلی در صورت وجود
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // همگام‌سازی هر 30 ثانیه
    this.syncInterval = setInterval(() => {
      if (this.isActive && !this.isSyncing) {
        console.log('Running periodic sync');
        this.syncMessages();
      }
    }, 30000);
    
    console.log('Periodic sync setup completed');
  }

  // انتخاب تیکت فعال
  async setActiveTicket(ticket) {
    console.log('Setting active ticket:', ticket?.id);
    
    this.currentTicket = ticket;
    if (ticket) {
      await this.loadMessages(ticket.id);
    } else {
      this.messages = [];
      this.notifyListeners();
    }
  }

  // دریافت تیکت‌ها
  getTickets() {
    return this.tickets;
  }

  // دریافت تیکت فعال
  getActiveTicket() {
    return this.currentTicket;
  }

  // دریافت پیام‌ها
  getMessages() {
    return this.messages;
  }

  // دریافت وضعیت همگام‌سازی
  getIsSyncing() {
    return this.isSyncing;
  }

  // دریافت زمان آخرین همگام‌سازی
  getLastSyncTime() {
    return this.lastSyncTime;
  }

  // چک کردن وضعیت سرویس
  isServiceActive() {
    return this.isActive;
  }

  // افزودن listener
  addListener(callback) {
    if (typeof callback !== 'function') {
      console.error('Listener must be a function');
      return;
    }
    
    this.listeners.push(callback);
    
    // ارسال فوری داده‌های فعلی
    this.notifyListener(callback);
  }

  // حذف listener
  removeListener(callback) {
    const initialLength = this.listeners.length;
    this.listeners = this.listeners.filter(listener => listener !== callback);
    
    if (this.listeners.length < initialLength) {
      console.log('Listener removed successfully');
    }
  }

  // اطلاع‌رسانی به یک listener خاص
  notifyListener(callback) {
    try {
      callback({
        tickets: this.tickets,
        currentTicket: this.currentTicket,
        messages: this.messages,
        isSyncing: this.isSyncing,
        lastSyncTime: this.lastSyncTime,
        isActive: this.isActive
      });
    } catch (error) {
      console.error('Error in specific listener:', error);
    }
  }

  // اطلاع‌رسانی به همه listener ها
  notifyListeners() {
    const data = {
      tickets: this.tickets,
      currentTicket: this.currentTicket,
      messages: this.messages,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      isActive: this.isActive
    };

    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in listener:', error);
      }
    });
  }

  // دریافت آمار
  getStats() {
    const openTickets = this.tickets.filter(ticket => ticket.status === 'open').length;
    const totalMessages = this.messages.length;
    const unreadCount = this.tickets.reduce((sum, ticket) => sum + (ticket.unread_user_count || 0), 0);

    return {
      totalTickets: this.tickets.length,
      openTickets,
      totalMessages,
      unreadCount,
      isActive: this.isActive,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      listenersCount: this.listeners.length
    };
  }

  // متد کمکی برای دیباگ
  debug() {
    console.log('NewSupportService Debug Info:', {
      isActive: this.isActive,
      tickets: this.tickets.map(t => ({ id: t.id, title: t.title, status: t.status })),
      currentTicket: this.currentTicket ? { id: this.currentTicket.id, title: this.currentTicket.title } : null,
      messagesCount: this.messages.length,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      listenersCount: this.listeners.length,
      retryCount: this.retryCount
    });
  }

  // پاک کردن کامل داده‌ها
  clearData() {
    console.log('Clearing all service data');
    
    this.tickets = [];
    this.currentTicket = null;
    this.messages = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.retryCount = 0;
    
    this.notifyListeners();
  }

  // راه‌اندازی مجدد سرویس
  async restart() {
    console.log('Restarting service');
    
    this.stop();
    await new Promise(resolve => setTimeout(resolve, 1000)); // تاخیر کوتاه
    return await this.start();
  }
}

// ایجاد نمونه واحد از سرویس
const newSupportService = new NewSupportService();

export default newSupportService;