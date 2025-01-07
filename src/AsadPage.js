import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideArrowLeftFromLine, LucideArrowLeftSquare, LucideCircleArrowLeft } from 'lucide-react';

const AsadPage = ({ isDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* دکمه برگشت */}
      <button 
        onClick={() => navigate(-1)} 
        className={`absolute top-4 left-4 z-10 flex items-center gap-1 rounded-full px-4 py-2`}
      >
        <LucideCircleArrowLeft className="w-9 h-9" />
        {/*متن برای کلید بازگشت  */}
        <span></span>
      </button>

      {/* Main Content با طرح زرد */}
      <div className="relative w-full max-w-md mx-auto h-screen">
        {/* پس زمینه زرد */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f1ab1e] to-[#f4e8a6]" />
        
        {/* تصویر وسط */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ bottom: '100px' }}>
          <img 
            src="/0ta100.png"
            alt="Description"
            className="w-2/3 max-w-[300px] h-auto object-contain"
          />
        </div>
        
        {/* کارت سفید */}
        <div className="absolute bottom-0 w-full">
          <div 
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6 shadow-lg`} 
            style={{ height: '37vh', transform: 'translateY(0%)' }}
          >
            <div className="space-y-4 text-right">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} font-iransans`}>
                آموزش ۰ تا ۱۰۰ کریپتو
              </h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-iransans`}>
                دسترسی به تمام محتوای آموزشی و تحلیل‌های اختصاصی
              </p>
              <button
  className="w-11/12 bg-[#f1ab1e] text-white py-3 rounded-xl hover:bg-blue-600 transition-colors"
  style={{ marginTop: '‍17px' ,position: 'absolute' ,bottom: '20px', left: '50%', transform: 'translateX(-50%)' }} // فاصله از بالا
>
  خرید اشتراک
</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsadPage;
