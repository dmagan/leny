import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MentorPage = ({ isDarkMode }) => {
 const navigate = useNavigate();
 const cardRef = useRef(null);
 const isDragging = useRef(false);
 const startY = useRef(0);

 const handleSubmit = () => {
   navigate('/login');
 };

 useEffect(() => {
   if (cardRef.current) {
     requestAnimationFrame(() => {
       cardRef.current.style.transform = 'translateY(0)';
     });
   }
 }, []);

 // Drag functionality
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
     
     card.style.transition = 'transform 0.3s ease-out';
     
     if (match) {
       const currentValue = parseFloat(match[1]);
       if (currentValue > 150) {
         card.style.transform = 'translateY(100%)';
         setTimeout(() => navigate(-1), 300);
       } else {
         card.style.transform = 'translateY(0)';
       }
     }
   
     setTimeout(() => {
       card.style.transition = '';
     }, 300);
   };

   card.addEventListener('touchstart', handleTouchStart, { passive: false });
   card.addEventListener('touchmove', handleTouchMove, { passive: false });
   card.addEventListener('touchend', handleTouchEnd);

   return () => {
     card.removeEventListener('touchstart', handleTouchStart);
     card.removeEventListener('touchmove', handleTouchMove);
     card.removeEventListener('touchend', handleTouchEnd);
   };
 }, [navigate]);

 return (
   <div className="fixed inset-0 z-50 bg-transparent overflow-hidden" style={{ pointerEvents: 'none' }}>
     <div 
       ref={cardRef}
       style={{ 
         transform: 'translateY(100%)',
         touchAction: 'none',
         pointerEvents: 'auto'
       }}
       className={`fixed bottom-0 left-0 right-0 w-full ${
         isDarkMode ? 'bg-[#141e35]' : 'bg-white'
       } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
     >
       {/* Handle Bar */}
       <div className="pt-2">
         <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
       </div>

       {/* Close Button */}
       <div className="absolute top-4 right-4">
         <button 
           onClick={() => {
             cardRef.current.style.transform = 'translateY(100%)';
             setTimeout(() => navigate(-1), 300);
           }}
           className={`p-2 rounded-full ${
             isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
           }`}
         >
           <X size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
         </button>
       </div>

       {/* Scrollable Content */}
       <div className="scrollable-content overflow-y-auto h-full pb-safe">
         <div className="px-6 pb-8">
           <div className="mb-8 text-center pt-4">
             <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-6 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 160">
                 <g>
                   <path d="m76.1194,62.98507a2,2 0 0 0 1.07,-3.69l-22,-14a2,2 0 0 0 -2.14,0l-22,14a2,2 0 0 0 1.07,3.69l4,0l0,20l-3,0a2,2 0 0 0 0,4l42,0a2,2 0 0 0 0,-4l-3,0l0,-20l4,0zm-24,20l-12,0l0,-20l12,0l0,20zm16,0l-12,0l0,-20l12,0l0,20zm-29.13,-24l15.13,-9.63l15.13,9.63l-30.26,0z" fill="#fff"/>
                 </g>
               </svg>
             </div>
             <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
               کلاس حرفه‌ای دکس تریدینگ
             </h1>
             <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
               نحوه پیدا کردن میم کوین های پامپی
             </p>
           </div>

           {/* محتوای اصلی */}
           <div className="space-y-4">
             <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
               <h2 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                 محتوای دوره
               </h2>
               <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                 <li className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                   <span>آشنایی با اصول دکس تریدینگ</span>
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                   <span>تحلیل تکنیکال پیشرفته</span>
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                   <span>استراتژی‌های معاملاتی</span>
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                   <span>مدیریت ریسک و سرمایه</span>
                 </li>
               </ul>
             </div>
           </div>

           {/* Submit Button */}
           <div className="mt-6">
             <button 
               onClick={handleSubmit}
               className="w-full bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium hover:bg-[#e5c44c] transition-colors"
             >
               ثبت نام در دوره
             </button>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default MentorPage;