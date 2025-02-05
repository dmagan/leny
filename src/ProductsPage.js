import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'lucide-react';
import PaymentCard from './PaymentCard';

const products = [
  { 
    id: 1,
    title: "پکیج VIPسه ماهه",
    duration: "دسترسی 90 روزه",
    price: "79",
    description: "دسترسی به تمام سیگنال‌های معاملاتی و تحلیل‌های تکنیکال"
  },
  {
    id: 2, 
    title: "پکیج VIP شش ماهه",
    duration: "دسترسی 180 روزه",
    price: "199",
    description: "دسترسی به تمام سیگنال‌های معاملاتی و تحلیل‌های تکنیکال با تخفیف ویژه"
  },
  {
    id: 3,
    title: "پکیج VIP یکساله ماهه",
    duration: "دسترسی 365 روزه", 
    price: "299",
    description: "دسترسی نامحدود به تمام خدمات با بیشترین تخفیف"
  },
  {
    id: 4,
    title: "پکیج VIP دوساله ماهه",
    duration: "دسترسی 730 روزه", 
    price: "399",
    description: "دسترسی نامحدود به تمام خدمات با بیشترین تخفیف"
  }
];

const ProductsPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div dir="rtl" className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="relative h-16 flex items-center px-4">
          <button 
            onClick={() => navigate(-1)}
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h1 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            محصولات VIP
          </h1>
        </div>
      </div>

      <div className="absolute top-16 bottom-0 left-0 right-0 overflow-y-auto">
        <div className="p-4 pb-4">
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className={`p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-right">
                      {product.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.duration}
                    </p>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.description}
                    </p>
                    <p className="text-green-500 font-bold mt-2">
                      {product.price} دلار
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <PaymentCard
          isDarkMode={isDarkMode}
          onClose={() => setSelectedProduct(null)}
          productTitle={selectedProduct.title}
          price={selectedProduct.price}
        />
      )}
    </div>
  );
};

export default ProductsPage;