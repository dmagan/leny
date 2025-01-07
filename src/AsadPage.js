// src/AsadPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AsadPage = ({ isDarkMode }) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`px-6 py-4 flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <button 
          onClick={() => navigate(-1)}
          className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
        >
          <ArrowRight className="w-6 h-6" />
          <span className="mr-1">برگشت</span>
        </button>
        <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          آقا اسد گل
        </span>
        <div className="w-8" />
      </div>

      {/* Main Content با طرح زرد */}
      <div className="relative w-full max-w-md mx-auto h-[calc(100vh-64px)]">
        {/* پس زمینه زرد */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f1b31e] to-[#FFD700]" />
        
        {/* کارت سفید */}
        <div className="absolute bottom-0 w-full">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6 shadow-lg`}>
            <div className="space-y-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                اشتراک ویژه
              </h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                دسترسی به تمام محتوای آموزشی و تحلیل‌های اختصاصی
              </p>
              <button className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors">
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