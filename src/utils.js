// src/utils.js
export const cleanMediaUrl = (url) => {
    if (!url) return url;
    // حذف هر پارامتر پرس‌وجو که با ?_= شروع می‌شود
    return url.replace(/\?_=\d+$/g, '');
  };


  // این تابع را در فایل مناسب (مثلاً utils.js) اضافه کنید و در جاهای مختلف از آن استفاده کنید

/**
 * بررسی وضعیت خریدهای محلی و به‌روزرسانی آنها
 * @param {string} productType - نوع محصول برای بررسی (مثلاً 'VIP', 'DEX', etc.)
 * @returns {Object} - اطلاعات خرید
 */
const checkLocalPurchases = (productType) => {
  try {
    // دریافت خریدهای ذخیره شده
    const purchasedProductsStr = localStorage.getItem('purchasedProducts');
    if (!purchasedProductsStr) {
      return { hasProduct: false, product: null };
    }
    
    const purchasedProducts = JSON.parse(purchasedProductsStr);
    if (!Array.isArray(purchasedProducts) || purchasedProducts.length === 0) {
      return { hasProduct: false, product: null };
    }
    
    // جستجوی محصول مورد نظر
    let product = null;
    
    if (productType === 'VIP') {
      product = purchasedProducts.find(p => p.isVIP && p.status === 'active');
    } else if (productType === 'DEX') {
      product = purchasedProducts.find(p => 
        p.title && p.title.includes('دکس') && p.status === 'active'
      );
    } else if (productType === 'ZeroTo100') {
      product = purchasedProducts.find(p => 
        p.title && (p.title.includes('صفر تا صد') || p.title.includes('0 تا 100')) && p.status === 'active'
      );
    } else {
      // جستجوی کلی بر اساس عنوان
      product = purchasedProducts.find(p => 
        p.title && p.title.toLowerCase().includes(productType.toLowerCase()) && p.status === 'active'
      );
    }
    
    // بررسی تاریخ انقضا برای محصولات فعال
    if (product && product.status === 'active') {
      const now = new Date();
      
      // اگر تاریخ خرید وجود دارد
      if (product.date) {
        const purchaseDate = new Date(product.date);
        const expiryDate = new Date(purchaseDate);
        
        // محاسبه تاریخ انقضا بر اساس روزهای باقیمانده
        if (product.remainingDays) {
          expiryDate.setDate(expiryDate.getDate() + product.remainingDays);
          
          // بررسی منقضی شدن
          if (now > expiryDate) {
            product.status = 'expired';
            product.remainingDays = 0;
            
            // به‌روزرسانی در localStorage
            const updatedProducts = purchasedProducts.map(p => {
              if (p.id === product.id) {
                return { ...p, status: 'expired', remainingDays: 0 };
              }
              return p;
            });
            
            localStorage.setItem('purchasedProducts', JSON.stringify(updatedProducts));
            
            return { hasProduct: false, product: product };
          }
          
          // محاسبه روزهای باقیمانده
          const diff = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
          if (diff !== product.remainingDays) {
            product.remainingDays = diff;
            
            // به‌روزرسانی در localStorage
            const updatedProducts = purchasedProducts.map(p => {
              if (p.id === product.id) {
                return { ...p, remainingDays: diff };
              }
              return p;
            });
            
            localStorage.setItem('purchasedProducts', JSON.stringify(updatedProducts));
          }
        }
      }
      
      return { hasProduct: true, product: product };
    }
    
    return { hasProduct: false, product: product };
  } catch (error) {
    console.error('Error checking local purchases:', error);
    return { hasProduct: false, product: null, error: error.message };
  }
};

export default checkLocalPurchases;