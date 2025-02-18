import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FaqPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "چگونه می‌توانم در سایت ثبت‌نام کنم؟",
      answer: "برای ثبت‌نام، روی دکمه پروفایل در منوی پایین کلیک کنید و گزینه ثبت‌نام را انتخاب کنید. سپس اطلاعات خواسته شده را تکمیل نمایید."
    },
    {
      id: 2,
      question: "نحوه خرید اشتراک VIP چگونه است؟",
      answer: "برای خرید اشتراک VIP، ابتدا وارد حساب کاربری خود شوید. سپس از صفحه محصولات، اشتراک مورد نظر خود را انتخاب کرده و مراحل پرداخت را تکمیل کنید."
    },
    {
      id: 3,
      question: "چگونه می‌توانم به سیگنال‌های VIP دسترسی داشته باشم؟",
      answer: "برای دسترسی به سیگنال‌های VIP نیاز به خرید اشتراک VIP دارید. پس از خرید اشتراک، بلافاصله به تمامی سیگنال‌ها دسترسی خواهید داشت."
    },
    {
      id: 4,
      question: "آیا امکان لغو اشتراک وجود دارد؟",
      answer: "بله، شما می‌توانید در هر زمان از طریق پنل کاربری خود اشتراک خود را لغو کنید. البته توجه داشته باشید که مبلغ پرداختی برای دوره جاری قابل برگشت نیست."
    },
    {
      id: 5,
      question: "تیم پشتیبانی چه ساعاتی پاسخگو است؟",
      answer: "تیم پشتیبانی ما در روزهای کاری از ساعت 9 صبح تا 6 عصر آماده پاسخگویی به سؤالات شما است. در ساعات غیرکاری می‌توانید پیام خود را ثبت کنید تا در اولین فرصت به آن رسیدگی شود."
    },
    {
      id: 6,
      question: "چگونه می‌توانم رمز عبور خود را تغییر دهم؟",
      answer: "برای تغییر رمز عبور، وارد پروفایل خود شوید و از بخش تنظیمات، گزینه تغییر رمز عبور را انتخاب کنید. سپس رمز فعلی و رمز جدید خود را وارد کنید."
    },
    {
      id: 7,
      question: "شرایط استرداد وجه چگونه است؟",
      answer: "در صورت عدم رضایت از خدمات، تا 24 ساعت پس از خرید می‌توانید درخواست استرداد وجه خود را ثبت کنید. درخواست شما بررسی و در صورت تأیید، مبلغ به حساب شما بازگردانده می‌شود."
    }
  ];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button 
          onClick={() => navigate(-1)} 
          className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
        >
          <ArrowLeftCircle className="w-8 h-8" />
        </button>
        <h2 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          سوالات متداول
        </h2>
      </div>

      {/* FAQ Content */}
      <div className="absolute top-16 bottom-0 left-0 right-0 overflow-y-auto p-4">
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div 
              key={faq.id}
              className={`rounded-xl border ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-800' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <span className={`text-right font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {faq.question}
                </span>
                {expandedId === faq.id ? (
                  <ChevronUp className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                ) : (
                  <ChevronDown className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                )}
              </button>
              {expandedId === faq.id && (
                <div className={`px-4 pb-3 text-right ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;