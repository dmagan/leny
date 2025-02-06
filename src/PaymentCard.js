import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Store } from 'react-notifications-component';
// اگر لازم است استایل‌های react-notifications-component را وارد کنید
// import 'react-notifications-component/dist/theme.css';

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
      duration: duration,
      showIcon: true,
      pauseOnHover: true,
    },
    style: { direction: 'rtl', textAlign: 'right' },
  });
};

const PaymentCard = ({ isDarkMode, onClose, productTitle, price }) => {
  const [transactionHash, setTransactionHash] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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
                  text: `Please analyze this image and extract the following information:
1. Transaction status (Completed/Processing/Failed)
2. TXID/Hash (usually a long string of letters and numbers)
3. Amount in USDT
4. Wallet address (starting with TR or TU)

اگر تصویر ارسال شده مربوط به ارز دیجیتال نباشد، به‌طور بسیار بسیار کوتاه توضیح دهید که عکس ارسال شده درباره چه موضوعی است.`
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
          max_tokens: 200
        })
      });

      const data = await response.json();
      const analysisResult = data.choices[0].message.content;

      // نمایش اعلان بر اساس نوع پیام دریافتی
      if (analysisResult.toLowerCase().includes('fail') || analysisResult.toLowerCase().includes('error')) {
        notify("خطا", analysisResult, "danger");
      } else if (analysisResult.toLowerCase().includes('complete') || analysisResult.toLowerCase().includes('success')) {
        notify("موفق", analysisResult, "success");
      } else {
        notify("اطلاع", analysisResult, "danger");
      }

      return analysisResult;

    } catch (error) {
      notify("خطا", "خطا در تحلیل تصویر", "danger");
      throw error;
    }
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
      await analyzeImage(base64);
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
    if (!selectedFile && !transactionHash) {
      notify("خطا", "لطفا رسید یا هش تراکنش را وارد کنید", "danger");
      return;
    }

    notify("موفق", "اطلاعات با موفقیت ثبت شد", "success", 3000);

    // کمی تاخیر قبل از بستن مودال
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden transition-opacity duration-300">
      <div className={`fixed bottom-0 left-0 right-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}>
        <div className="pt-2">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="p-6 pb-8">
          <div className="mb-8 text-center">
            <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              VIP
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
  );
};

export default PaymentCard;
