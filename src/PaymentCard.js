import React, { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Store } from 'react-notifications-component';

const notify = (title, message, type = 'danger', duration = 7000) => {
  Store.addNotification({
    title,
    message,
    type,
    insert: "top",
    container: "center",
    animationIn: ["animate__animated", "animate__flipInX"],
    animationOut: ["animate__animated", "animate__flipOutX"],
    dismiss: {
      duration,
      showIcon: true,
      pauseOnHover: true,
    },
    style: { direction: 'rtl', textAlign: 'right' },
  });
};

const verifyTransaction = async (hash) => {
  try {
    const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${hash}`, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_TRONSCAN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data) {
      const isUSDTContract = data.toAddress === 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
      const receiverAddress = isUSDTContract 
        ? data.trc20TransferInfo?.[0]?.to_address
        : data.toAddress;
      
      console.log('اطلاعات تراکنش:', {
        هش: data.hash,
        وضعیت: data.confirmed ? 'تایید شده' : 'در انتظار تایید',
        'آدرس گیرنده': receiverAddress,
        'مقدار تراکنش': data.trc20TransferInfo?.[0]?.amount_str || data.amount,
        'نوع تراکنش': isUSDTContract ? 'USDT' : 'TRX'
      });

      return { success: data.confirmed, data };
    }
    return { success: false, message: 'تراکنش یافت نشد' };
    
  } catch (error) {
    console.error('خطای API:', error);
    return { success: false, message: 'خطا در بررسی تراکنش' };
  }
};

const analyzeImage = async (base64Image) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract transaction hash from this image. Return ONLY the hash with no additional characters, spaces, or text. If no valid hash is found, return INVALID_IMAGE"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 100
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0].message.content) {
      const hash = data.choices[0].message.content.trim();
      
      console.log('هش استخراج شده:', hash);
      
      if (hash === 'INVALID_IMAGE') {
        notify("خطا", "لطفا تصویر معتبر رسید تراکنش را آپلود کنید", "danger");
        return null;
      }

      if (hash.length < 64) {
        notify("خطا", "هش تراکنش معتبر در تصویر یافت نشد", "danger");
        return null;
      }

      const verificationResult = await verifyTransaction(hash);
      if (!verificationResult.success) {
        notify("خطا", verificationResult.message, "danger");
        return null;
      }

      // بررسی می‌کنیم که آیا تراکنش قبلاً ثبت شده است یا خیر
      const saved = await saveTransaction(hash, verificationResult.data);
      if (!saved) {
        notify("خطا", "این تراکنش قبلاً ثبت شده است", "danger");
        return null;
      }

      notify("موفق", "تراکنش با موفقیت تایید شد", "success");
      return hash;
    }
    
    notify("خطا", "خطا در پردازش تصویر", "danger");
    return null;

  } catch (error) {
    console.error('خطای آنالیز:', error);
    notify("خطا", "خطا در پردازش تصویر", "danger");
    return null;
  }
};

const saveTransaction = async (hash, data) => {
  try {
    const isUSDTContract = data.toAddress === 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    const receiverAddress = isUSDTContract 
      ? data.trc20TransferInfo?.[0]?.to_address
      : data.toAddress;
    
    const response = await fetch('https://alicomputer.com/wp-json/transaction/v1/verify',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hash: hash,
        amount: data.trc20TransferInfo?.[0]?.amount_str || data.amount,
        wallet_address: receiverAddress,
        type: isUSDTContract ? 'USDT' : 'TRX'
      })
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('خطای ذخیره تراکنش:', error);
    return false;
  }
};

const PaymentCard = ({ isDarkMode, onClose, productTitle, price }) => {
  const [transactionHash, setTransactionHash] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // برای انیمیشن کشویی از پایین به بالا
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);

  // انیمیشن ورود کارت
  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  // مدیریت تعامل کاربر با کارت (امکان کشیدن به پایین)
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchStart = (e) => {
      if (e.target.closest('.scrollable-content') && 
          e.target.closest('.scrollable-content').scrollTop !== 0) {
        return;
      }
      isDragging.current = true;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff < 0) return;
      e.preventDefault();
      card.style.transform = `translateY(${diff}px)`;
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const currentTransform = card.style.transform;
      const match = currentTransform.match(/translateY\(([0-9.]+)px\)/);
      if (match) {
        const currentValue = parseFloat(match[1]);
        if (currentValue > 150) {
          closeCard();
        } else {
          card.style.transform = 'translateY(0)';
        }
      }
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: false });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notify("خطا", "حجم فایل نباید بیشتر از 5 مگابایت باشد", "danger");
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      setUploadProgress(50);
      const hash = await analyzeImage(base64);
      if (hash) {
        setTransactionHash(hash);
      }
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      notify("خطا", "خطا در آپلود فایل", "danger");
      setSelectedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!transactionHash) {
      notify("خطا", "لطفا هش تراکنش را وارد کنید", "danger");
      return;
    }
  
    const result = await verifyTransaction(transactionHash);
    if (result.success) {
      const saved = await saveTransaction(transactionHash, result.data);
      if (!saved) {
        notify("خطا", "این تراکنش قبلاً ثبت شده است", "danger");
        return;
      }
      notify("موفق", "تراکنش با موفقیت تایید شد", "success", 3000);
      setTimeout(() => closeCard(), 1000);
    } else {
      notify("خطا", result.message || "تراکنش معتبر نیست", "danger");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 overflow-hidden transition-opacity duration-300"
      onClick={(e) => {
        // اگر کلیک روی خود overlay بود (نه روی کارت)، کارت رو ببند
        if (e.target === e.currentTarget) {
          closeCard();
        }
      }}
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}>
      <div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 w-full ${
          isDarkMode ? 'bg-[#0d1822]' : 'bg-white'
        } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: 'none',
        }}
      >
        <div className="pt-2">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        <button 
          onClick={closeCard}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="scrollable-content overflow-y-auto h-full pb-safe">
          <div className="p-6 pb-8">
            <div className="mb-8 text-center">
              <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                پرداخت
              </h1>
              <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {productTitle}
              </p>
              <p className="text-[#f7d55d] font-bold mt-2 text-lg">
                {price} دلار
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white placeholder-gray-500'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="هش تراکنش را وارد کنید"
                  dir="rtl"
                />
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className={`px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  یا
                </div>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-4 rounded-xl border-2 border-dashed text-center cursor-pointer ${
                  isDarkMode 
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*"
                />
                <Upload className={`w-6 h-6 mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedFile ? selectedFile.name : 'آپلود تصویر رسید'}
                </p>
              </div>

              {isUploading && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div 
                      className="h-full bg-[#f7d55d] rounded transition-all duration-200" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-center mt-1">
                    {uploadProgress}%
                  </p>
                </div>
              )}

              <button 
                onClick={handleSubmit}
                className="w-full bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium hover:bg-[#e5c44c] transition-colors mt-4"
              >
                ارسال
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;