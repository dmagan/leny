// useStoryDurations.js
// Hook سفارشی برای مدیریت مدت زمان‌های قصه‌ها

import { useState, useEffect, useCallback } from 'react';
import audioCacheService from './audioCacheService';

export const useStoryDurations = (stories) => {
  const [storyDurations, setStoryDurations] = useState({});
  const [durationsLoading, setDurationsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ completed: 0, total: 0 });

  // محاسبه مدت زمان‌های قصه‌ها
  const calculateStoriesDurations = useCallback(async () => {
    if (!stories || stories.length === 0) {
      setDurationsLoading(false);
      return;
    }

    setDurationsLoading(true);
    
    try {
      const durations = {};
      let cachedCount = 0;
      
      // ابتدا مدت زمان‌های کش شده را بارگذاری کنیم
      for (const story of stories) {
        const cachedDuration = audioCacheService.getDuration(story.audioUrl);
        if (cachedDuration) {
          durations[story.id] = audioCacheService.formatTime(cachedDuration);
          cachedCount++;
        }
      }
      
      console.log(`✅ ${cachedCount} قصه از کش بارگذاری شد`);
      setStoryDurations(durations);
      
      // سپس مدت زمان‌های باقی‌مانده را محاسبه کنیم
      const uncachedStories = stories.filter(story => !durations[story.id]);
      
      if (uncachedStories.length > 0) {
        console.log(`🔄 محاسبه مدت زمان ${uncachedStories.length} قصه...`);
        
        setLoadingProgress({ completed: 0, total: uncachedStories.length });
        
        const uncachedUrls = uncachedStories.map(story => story.audioUrl);
        const results = await audioCacheService.calculateMultipleDurations(
          uncachedUrls,
          (progress) => {
            setLoadingProgress(progress);
            console.log(`📊 پیشرفت: ${progress.completed}/${progress.total} - ${progress.current}`);
            
            // به‌روزرسانی realtime برای قصه‌هایی که محاسبه شده‌اند
            if (progress.duration && !progress.error) {
              const storyId = uncachedStories.find(s => s.audioUrl === progress.current)?.id;
              if (storyId) {
                setStoryDurations(prev => ({
                  ...prev,
                  [storyId]: progress.duration
                }));
              }
            }
          }
        );
        
        // به‌روزرسانی نهایی state با نتایج
        const finalDurations = { ...durations };
        for (const story of uncachedStories) {
          const duration = results[story.audioUrl];
          if (duration) {
            finalDurations[story.id] = audioCacheService.formatTime(duration);
          } else {
            finalDurations[story.id] = 'نامعلوم';
          }
        }
        
        setStoryDurations(finalDurations);
        console.log(`✅ محاسبه مدت زمان‌ها تکمیل شد`);
      } else {
        console.log(`✅ همه قصه‌ها از کش بارگذاری شدند`);
      }
      
    } catch (error) {
      console.error('خطا در محاسبه مدت زمان‌ها:', error);
      
      // در صورت خطا، حداقل مقادیر کش شده را نگه داریم
      const cachedDurations = {};
      for (const story of stories) {
        const cachedDuration = audioCacheService.getDuration(story.audioUrl);
        if (cachedDuration) {
          cachedDurations[story.id] = audioCacheService.formatTime(cachedDuration);
        } else {
          cachedDurations[story.id] = 'خطا';
        }
      }
      setStoryDurations(cachedDurations);
      
    } finally {
      setDurationsLoading(false);
      setLoadingProgress({ completed: 0, total: 0 });
    }
  }, [stories]);

  // اجرا در اولین بار
  useEffect(() => {
    calculateStoriesDurations();
  }, [calculateStoriesDurations]);

  // تابع برای به‌روزرسانی مدت زمان یک قصه خاص
  const updateStoryDuration = useCallback((storyId, audioUrl, duration) => {
    if (duration && !isNaN(duration) && duration > 0) {
      // ذخیره در کش
      audioCacheService.setDuration(audioUrl, duration);
      
      // به‌روزرسانی state
      setStoryDurations(prev => ({
        ...prev,
        [storyId]: audioCacheService.formatTime(duration)
      }));
    }
  }, []);

  // تابع برای پاک کردن کش و محاسبه مجدد
  const refreshDurations = useCallback(async () => {
    audioCacheService.clearCache();
    await calculateStoriesDurations();
  }, [calculateStoriesDurations]);

  // دریافت اطلاعات کش
  const getCacheInfo = useCallback(() => {
    return audioCacheService.getCacheInfo();
  }, []);

  return {
    storyDurations,
    durationsLoading,
    loadingProgress,
    updateStoryDuration,
    refreshDurations,
    getCacheInfo
  };
};