// audioCacheService.js
// سرویس مدیریت کش برای مدت زمان فایل‌های صوتی

import { PLAYER_CONFIG } from './storiesConfig';

class AudioCacheService {
  constructor() {
    this.cacheKey = 'stories_audio_durations';
    this.cache = this.loadCache();
  }

  // بارگذاری کش از localStorage
  loadCache() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        
        // بررسی انقضای کش
        const now = Date.now();
        const validCache = {};
        
        for (const [url, data] of Object.entries(parsedCache)) {
          if (data.timestamp && (now - data.timestamp) < PLAYER_CONFIG.cacheExpiry) {
            validCache[url] = data;
          }
        }
        
        // ذخیره کش تمیز شده
        this.saveCache(validCache);
        return validCache;
      }
    } catch (error) {
      console.error('خطا در بارگذاری کش:', error);
    }
    return {};
  }

  // ذخیره کش در localStorage
  saveCache(cache = this.cache) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error('خطا در ذخیره کش:', error);
    }
  }

  // دریافت مدت زمان از کش
  getDuration(audioUrl) {
    const cached = this.cache[audioUrl];
    if (cached && cached.duration) {
      console.log(`✅ مدت زمان از کش: ${audioUrl} -> ${this.formatTime(cached.duration)}`);
      return cached.duration;
    }
    return null;
  }

  // ذخیره مدت زمان در کش
  setDuration(audioUrl, duration) {
    if (duration && duration > 0) {
      this.cache[audioUrl] = {
        duration: duration,
        timestamp: Date.now(),
        formatted: this.formatTime(duration)
      };
      this.saveCache();
      console.log(`💾 مدت زمان ذخیره شد: ${audioUrl} -> ${this.formatTime(duration)}`);
    }
  }

  // محاسبه مدت زمان فایل صوتی
  async calculateDuration(audioUrl) {
    // ابتدا از کش چک کنیم
    const cachedDuration = this.getDuration(audioUrl);
    if (cachedDuration) {
      return cachedDuration;
    }

    // اگر در کش نبود، محاسبه کنیم
    console.log(`🔄 محاسبه مدت زمان: ${audioUrl}`);
    
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const timeout = setTimeout(() => {
        audio.src = '';
        reject(new Error('Timeout calculating duration'));
      }, 10000); // 10 ثانیه timeout

      audio.onloadedmetadata = () => {
        clearTimeout(timeout);
        const duration = audio.duration;
        
        if (duration && !isNaN(duration) && duration > 0) {
          // ذخیره در کش
          this.setDuration(audioUrl, duration);
          resolve(duration);
        } else {
          reject(new Error('Invalid duration'));
        }
        
        // پاک کردن فایل از حافظه
        audio.src = '';
      };

      audio.onerror = (e) => {
        clearTimeout(timeout);
        console.error('خطا در محاسبه مدت زمان:', e);
        audio.src = '';
        reject(new Error('Failed to load audio for duration calculation'));
      };

      // تنظیمات برای کاهش مصرف bandwidth
      audio.preload = 'metadata';
      audio.volume = 0; // بی‌صدا
      audio.src = audioUrl;
    });
  }

  // فرمت کردن زمان به دقیقه:ثانیه
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // پاک کردن کش
  clearCache() {
    this.cache = {};
    localStorage.removeItem(this.cacheKey);
    console.log('🗑️ کش پاک شد');
  }

  // دریافت اطلاعات کش
  getCacheInfo() {
    const entries = Object.keys(this.cache).length;
    const totalSize = JSON.stringify(this.cache).length;
    const oldestEntry = Math.min(...Object.values(this.cache).map(item => item.timestamp || Date.now()));
    
    return {
      entries,
      totalSize,
      oldestEntry: new Date(oldestEntry).toLocaleDateString('fa-IR'),
      cacheExpiry: PLAYER_CONFIG.cacheExpiry / (24 * 60 * 60 * 1000) + ' روز'
    };
  }

  // محاسبه مدت زمان چندین فایل به صورت batch
  async calculateMultipleDurations(audioUrls, onProgress = null) {
    const results = {};
    
    for (let i = 0; i < audioUrls.length; i++) {
      const url = audioUrls[i];
      
      try {
        const duration = await this.calculateDuration(url);
        results[url] = duration;
        
        if (onProgress) {
          onProgress({
            completed: i + 1,
            total: audioUrls.length,
            current: url,
            duration: this.formatTime(duration)
          });
        }
        
        // کمی تاخیر برای جلوگیری از فشار زیاد به سرور
        if (i < audioUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`خطا در محاسبه مدت زمان ${url}:`, error);
        results[url] = null;
        
        if (onProgress) {
          onProgress({
            completed: i + 1,
            total: audioUrls.length,
            current: url,
            error: error.message
          });
        }
      }
    }
    
    return results;
  }
}

// ایجاد instance واحد
const audioCacheService = new AudioCacheService();

export default audioCacheService;