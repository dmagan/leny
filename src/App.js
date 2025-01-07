// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CourseApp from './CourseApp';
import AsadPage from './AsadPage';

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sliders, setSliders] = useState([]);

  // انتقال useEffect ها به اینجا
  useEffect(() => {
    // کد مربوط به دریافت قیمت‌های ارز دیجیتال
    const staticData = [/* ... */];
    setCryptoPrices(staticData);
    // ... بقیه کد
  }, []);

  useEffect(() => {
    // کد مربوط به دریافت اسلایدرها
    const fetchSliders = async () => {
      // ... کد فعلی
    };
    fetchSliders();
  }, []);

  useEffect(() => {
    // کد مربوط به دریافت محصولات
    const fetchProducts = async () => {
      // ... کد فعلی
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // کد مربوط به دریافت stories
    const fetchStories = async () => {
      // ... کد فعلی
    };
    fetchStories();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <CourseApp 
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              products={products}
              cryptoPrices={cryptoPrices}
              stories={stories}
              loading={loading}
              sliders={sliders}
            />
          } 
        />
        <Route 
          path="/asad" 
          element={
            <AsadPage 
              isDarkMode={isDarkMode}
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;