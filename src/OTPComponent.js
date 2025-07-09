import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Shield, Clock, RotateCcw } from 'lucide-react';

const OTPComponent = ({ isDarkMode, isOpen, onClose, phoneNumber, onSuccess }) => {
  const [step, setStep] = useState('send'); // 'send' | 'verify'
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const inputRefs = useRef([]);

  // تایمر برای شمارش معکوس
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

  // شبیه‌سازی ارسال SMS
const sendSMS = async (code, phoneNumber) => {
  try {
    const response = await fetch('https://p30s.com/wp-json/sms/v1/send-otp', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken') || sessionStorage.getItem('userToken')}`
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
    throw new Error('خطا در ارسال پیامک');
  }
};

  // ارسال کد OTP
  const handleSendOTP = async () => {
    if (!phoneNumber) {
      setError('شماره تلفن وارد نشده است');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const code = generateOTP();
      setGeneratedCode(code);
      
      const result = await sendSMS(code, phoneNumber);
      
      if (result.success) {
        setStep('verify');
        setCountdown(120); // 2 دقیقه
        // فوکوس روی اولین input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError('خطا در ارسال پیامک. لطفا دوباره تلاش کنید.');
      }
    } catch (err) {
      setError('خطا در ارسال پیامک: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // هندل کردن ورود OTP
  const handleOTPChange = (index, value) => {
    // فقط عدد قبول می‌کنیم
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...otpCode];
    newOTP[index] = value;
    setOtpCode(newOTP);

    // اگر مقدار وارد شده باشد، به input بعدی برو
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // هندل کردن backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // تأیید کد OTP
  const handleVerifyOTP = () => {
    const enteredCode = otpCode.join('');
    
    if (enteredCode.length !== 6) {
      setError('لطفا کد 6 رقمی را کامل وارد کنید');
      return;
    }

    if (enteredCode === generatedCode) {
      onSuccess?.(enteredCode);
      onClose();
    } else {
      setError('کد وارد شده اشتباه است. لطفا دوباره تلاش کنید.');
      // پاک کردن کدهای وارد شده
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  // ارسال مجدد کد
  const handleResendOTP = () => {
    setOtpCode(['', '', '', '', '', '']);
    setError('');
    setStep('send');
    setCountdown(0);
  };

  // فرمت زمان
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            تأیید شماره موبایل
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6" dir="rtl">
          {step === 'send' ? (
            // مرحله ارسال کد
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="space-y-2">
                <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ارسال کد تأیید
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  کد تأیید به شماره {phoneNumber} ارسال خواهد شد
                </p>
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>در حال ارسال...</span>
                  </div>
                ) : (
                  'ارسال کد تأیید'
                )}
              </button>
            </div>
          ) : (
            // مرحله تأیید کد
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="space-y-2">
                <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  وارد کردن کد تأیید
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  کد 6 رقمی ارسال شده به {phoneNumber} را وارد کنید
                </p>
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
                    className={`w-12 h-12 text-center text-xl font-bold rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Timer */}
              {countdown > 0 && (
                <div className={`flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Clock size={16} />
                  <span>زمان باقی‌مانده: {formatTime(countdown)}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                >
                  تأیید کد
                </button>

                {countdown === 0 && (
                  <button
                    onClick={handleResendOTP}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                      <RotateCcw size={16} />
                      <span>ارسال مجدد کد</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default OTPComponent;