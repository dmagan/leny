// src/utils.js
export const cleanMediaUrl = (url) => {
    if (!url) return url;
    // حذف هر پارامتر پرس‌وجو که با ?_= شروع می‌شود
    return url.replace(/\?_=\d+$/g, '');
  };