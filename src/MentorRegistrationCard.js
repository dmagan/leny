import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Store } from 'react-notifications-component';
import { useNavigate } from 'react-router-dom';

const MentorRegistrationCard = ({ isDarkMode, onClose = () => {} }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    capital: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const navigate = useNavigate();

  const notify = (title, message, type = 'danger') => {
    Store.addNotification({
      title,
      message,
      type,
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
      style: { direction: 'rtl', textAlign: 'right', zIndex: 99999 },
    });
  };

  useEffect(() => {
    setTimeout(() => setShowCard(true), 100);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchStart = (e) => {
      if (e.target.closest('.scrollable-content')?.scrollTop !== 0) return;
      isDragging.current = true;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff < 0) return;
      e.preventDefault();
      card.style.transform = `translateY(${diff}px)`;
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const match = card.style.transform.match(/translateY\(([0-9.]+)px\)/);
      const currentValue = match ? parseFloat(match[1]) : 0;
      if (currentValue > 150) closeCard();
      else card.style.transform = 'translateY(0)';
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
      navigate(-1);
    }, 300);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (phone) => phone.replace(/\D/g, '').length >= 10 && phone.replace(/\D/g, '').length <= 13;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phoneNumber' || name === 'capital'
        ? value.replace(/[^0-9]/g, '')
        : value
    }));
  };

  const handleSubmit = async () => {
    const { fullName, email, phoneNumber, capital } = formData;
    if (!fullName || !email || !capital) {
      notify("خطا", "لطفا تمام فیلدها را پر کنید");
      return;
    }
    if (!validateEmail(email)) {
      notify("خطا", "ایمیل وارد شده معتبر نیست");
      return;
    }
   // if (!validatePhoneNumber(phoneNumber)) {
   //   notify("خطا", "شماره تماس معتبر نیست");
   //   return;
   //  }

    setIsSubmitting(true);
    try {
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      const payload = {
        title: `درخواست منتور - ${fullName}`,
        status: 'publish',
        content: `نام: ${fullName} \nایمیل: ${email} \nتلفن: ${phoneNumber} \nسرمایه: ${capital}`,
        meta: {
          mentor_fullname: fullName,
          mentor_email: email,
          mentor_phone: phoneNumber,
          mentor_capital: capital
        }
      };

      const response = await fetch('https://alicomputer.com/wp-json/wp/v2/mentor_requests', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        notify("موفق", "درخواست با موفقیت ثبت شد", "success");
        setTimeout(closeCard, 2000);
      } else {
        notify("خطا", "مشکلی در ثبت درخواست به وجود آمد");
      }
    } catch (err) {
      console.error(err);
      notify("خطا", "خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden transition-opacity duration-300"
         style={{ opacity: showCard ? 1 : 0, pointerEvents: showCard ? 'auto' : 'none' }}>
      <div ref={cardRef}
           className={`fixed bottom-0 left-0 right-0 w-full ${isDarkMode ? 'bg-[#0d1822]' : 'bg-white'} rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
           style={{ transform: `translateY(${showCard ? '0' : '100%'})`, touchAction: 'none' }}>
        
        {/* Top Bar & Close */}
        <div className="pt-2 relative">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
          <button onClick={closeCard} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="scrollable-content h-full overflow-y-auto pb-16 px-6 pt-6 text-center" dir="rtl">
          {/* آیکون دایره‌ای بالای کارت */}
          <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ثبت درخواست منتور
          </h1>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            لطفاً اطلاعات خود را وارد کنید
          </p>

          {/* Form Inputs */}
          {[
            { name: 'fullName', placeholder: 'نام و نام خانوادگی' },
            { name: 'email', placeholder: 'ایمیل' },
            { name: 'phoneNumber', placeholder: 'شماره تماس' },
            { name: 'capital', placeholder: 'میزان سرمایه (دلار)' }
          ].map((field) => (
            <div key={field.name} className="mb-4">
              <input
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                type={field.name === 'email' ? 'email' : 'text'}
                className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] ${
                  isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                }`}
                placeholder={field.placeholder}
                dir="rtl"
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium transition-colors relative ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e5c44c]'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="opacity-0">ثبت درخواست</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                </div>
              </>
            ) : 'ثبت درخواست'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorRegistrationCard;
