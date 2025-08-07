import React, { useState, useRef, useEffect } from 'react';
import { Phone, Shield, ArrowRight, X } from 'lucide-react';

const SimpleSmsLogin = ({ isDarkMode, onSuccess }) => {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  // تایمر شمارش معکوس
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // تولید کد 6 رقمی
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // ارسال SMS
  const sendSMS = async (code, phoneNumber) => {
    try {
      const response = await fetch('https://lenytoys.ir/wp-json/sms/v1/send-otp-public', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          code: code
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        return { success: true, messageId: result.messageId };
      } else {
        throw new Error(result.message || 'خطا در ارسال پیامک');
      }
    } catch (error) {
      console.error('SMS send error:', error);
      // حتی اگر خطا باشد، بگذار ادامه پیدا کند (برای تست)
      return { success: true, messageId: 'TEST_MODE' };
    }
  };

  // مرحله 1: وارد کردن شماره موبایل
  const handlePhoneSubmit = async () => {
    if (!phoneNumber) {
      setError('لطفاً شماره موبایل خود را وارد کنید');
      return;
    }

    // بررسی فرمت شماره موبایل ایران
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('شماره موبایل معتبر نیست. مثال: 09123456789');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const code = generateOTP();
      setGeneratedCode(code);
  const result = await sendSMS(code, phoneNumber);

if (result.success) {
  setStep('otp');
  setCountdown(120); // 2 دقیقه
  
  // راه‌اندازی خواندن خودکار SMS
  setupAutoOTPDetection();
  
  // فوکوس روی اولین input
  setTimeout(() => {
    inputRefs.current[0]?.focus();
  }, 100);
}else {
        setError('خطا در ارسال پیامک. لطفا دوباره تلاش کنید.');
      }
    } catch (err) {
      setError('خطا در ارسال پیامک: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // راه‌اندازی خواندن خودکار OTP از SMS
const setupAutoOTPDetection = () => {
  if ('OTPCredential' in window) {
    navigator.credentials.get({
      otp: { transport: ['sms'] }
    }).then(otp => {
      if (otp && otp.code) {
        console.log('Auto OTP detected:', otp.code);
        // خودکار وارد کردن کد
        const otpDigits = otp.code.split('');
        setOtpCode(otpDigits);
        // خودکار تأیید
        setTimeout(() => {
          handleOTPSubmit(otp.code);
        }, 500);
      }
    }).catch(err => {
      console.log('Auto OTP detection failed:', err);
    });
  }
};

  // مرحله 2: وارد کردن کد OTP
  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...otpCode];
    newOTP[index] = value;
    setOtpCode(newOTP);

    // به input بعدی برو
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // اگر آخرین رقم وارد شد، خودکار ارسال کن
 // اگر آخرین رقم وارد شد، خودکار ارسال کن
if (value && index === 5) {
  const completeCode = newOTP.join('');
  if (completeCode.length === 6) {
    // فوراً loading را فعال کن
    setIsLoading(true);
    setError(''); // پاک کردن خطاهای قبلی
    
    // کمی تأخیر برای نمایش رقم آخر و loading
    setTimeout(() => {
      handleOTPSubmit(completeCode);
    }, 100);
  }
}
  };

  // پردازش backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // پردازش paste
const handlePaste = (e) => {
  e.preventDefault();
  const pastedData = e.clipboardData.getData('text');
  
  if (/^\d{6}$/.test(pastedData)) {
    const otpDigits = pastedData.split('');
    setOtpCode(otpDigits);
    
    // فوراً loading را فعال کن
    setIsLoading(true);
    setError('');
    
    // خودکار تأیید
    setTimeout(() => {
      handleOTPSubmit(pastedData);
    }, 100);
  }
};

  // تأیید کد OTP
  const handleOTPSubmit = async (codeToCheck = null) => {
  const enteredCode = codeToCheck || otpCode.join('');
  
  if (enteredCode.length !== 6) {
    setIsLoading(false);
    setError('لطفا کد 6 رقمی را کامل وارد کنید');
    return;
  }

  if (enteredCode === generatedCode) {
    setIsLoading(true);
    try {
      // ثبت‌نام/لاگین خودکار
      const response = await fetch('https://lenytoys.ir/wp-json/sms/v1/register-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber })
      });
      
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        onSuccess(phoneNumber, enteredCode, data);
      } else {
        setError('خطا در ثبت‌نام. لطفا دوباره تلاش کنید.');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور.');
    } finally {
      setIsLoading(false);
    }
  } else {
    setError('کد وارد شده اشتباه است. لطفا دوباره تلاش کنید.');
    setOtpCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  }
};

  // ارسال مجدد کد
  const handleResendOTP = () => {
    setOtpCode(['', '', '', '', '', '']);
    setError('');
    setCountdown(0);
    handlePhoneSubmit();
  };

  // برگشت به مرحله قبل
  const handleBack = () => {
    setStep('phone');
    setOtpCode(['', '', '', '', '', '']);
    setError('');
    setCountdown(0);
  };

  // فرمت زمان
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        
        {step === 'phone' ? (
          // مرحله وارد کردن شماره موبایل
          <div className="text-center ">
            <div className="mx-auto w-72 h-72 flex items-center justify-center">
  <img 
    src="/otp1.png" 
    alt="OTP Step 1" 
    className="w-full h-full object-contain"
  />
</div>

            <div className="space-y-4">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setPhoneNumber(value);
                  setError('');
                }}
                placeholder="09123456789"
                className={`w-full px-4 py-4 rounded-xl text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                maxLength="11"
              />

              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePhoneSubmit}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-colors ${
                  isLoading
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>در حال ارسال...</span>
                  </div>
                ) : (
                  <>
                    <span>ارسال کد تأیید</span>
                    <ArrowRight className="inline w-5 h-5 mr-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // مرحله وارد کردن کد OTP
          <div className="text-center space-y-6">
            <div className="mx-auto w-72 h-72 flex items-center justify-center">
  <img 
    src="/otp2.png" 
    alt="OTP Step 2" 
    className="w-full h-full object-contain"
  />
</div>

            {/* OTP Input */}
            <div className="flex justify-center space-x-3 rtl:space-x-reverse">
              {otpCode.map((digit, index) => (
                <input
  key={index}
  ref={el => inputRefs.current[index] = el}
  type="text"
  inputMode="numeric"
  maxLength="1"
  value={digit}
  onChange={(e) => handleOTPChange(index, e.target.value)}
  onKeyDown={(e) => handleKeyDown(index, e)}
  onPaste={handlePaste}
  className={`w-12 h-12 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  }`}
/>
              ))}
            </div>

            {/* نمایش loading بعد از وارد کردن کد کامل */}
{isLoading && otpCode.every(digit => digit !== '') && (
  <div className="flex items-center justify-center gap-2 py-4">
    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      در حال تأیید کد...
    </span>
  </div>
)}


            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Timer */}
            {countdown > 0 && (
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                زمان باقی‌مانده: {formatTime(countdown)}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* حذف دکمه تأیید کد چون خودکار ارسال می‌شود */}
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={handleBack}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  بازگشت
                </button>

                {countdown === 0 && (
                  <button
                    onClick={handleResendOTP}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    ارسال مجدد
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleSmsLogin;