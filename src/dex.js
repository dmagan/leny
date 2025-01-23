import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';




const PlayButton = ({ isActive }) => (
 <svg 
   width="32" height="32" viewBox="0 0 32 32" 
   fill="none" xmlns="http://www.w3.org/2000/svg" 
   className="cursor-pointer transition-colors"
 >
   <circle cx="16" cy="16" r="15" 
     stroke={isActive ? "#F7D55D" : "#4B5563"} strokeWidth="2"/>
   <path 
     d="M20.5 15.134C21.1667 15.5189 21.1667 16.4811 20.5 16.866L14.5 20.3301C13.8333 20.715 13 20.2339 13 19.4641L13 12.5359C13 11.7661 13.8333 11.285 14.5 11.6699L20.5 15.134Z" 
     fill={isActive ? "#F7D55D" : "#4B5563"}
   />
 </svg>
);

const episodes = [
 { 
   id: 1, 
   title: "قسمت اول: مقدمه و آشنایی با مفاهیم دکس", 
   duration: "45 دقیقه",
   videoUrl: "https://www.daryukala.com/dl/binance-1.mp4"
 },
 { 
   id: 2, 
   title: "قسمت دوم: تنظیمات اولیه و راه‌اندازی", 
   duration: "50 دقیقه", 
   videoUrl: "https://www.daryukala.com/dl/binance-2.mp4"
 },
 // سایر قسمت‌ها...
];

const DexPage = ({ isDarkMode }) => {
 const navigate = useNavigate();
 const [activeEpisode, setActiveEpisode] = useState(null);
 const [showVideo, setShowVideo] = useState(false);

 const handlePlayClick = (episode, event) => {
   event.stopPropagation();
   setActiveEpisode(episode);
   setShowVideo(true);
 };

 const handleCloseVideo = () => {
  setShowVideo(false);
  setActiveEpisode(null);
  // Ensure we're showing the episodes list
  const episodesList = document.querySelector('.episodes-list');
  if (episodesList) {
    episodesList.scrollIntoView({ behavior: 'smooth' });
  }
};

 return (
   <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
     {/* Header */}
     <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
     <div className="relative h-16 flex items-center px-4">
  {!showVideo && (
    <>
      <button 
        onClick={() => navigate(-1)}
        className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
      >
        <ArrowLeftCircle className="w-8 h-8" />
      </button>
      <h1 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        دوره دکس تریدینگ
      </h1>
    </>
  )}
</div>
     </div>

     {/* Video Section */}
     <div className="absolute top-16 left-0 right-0 z-20 px-4">
       {showVideo && activeEpisode && (
         <VideoPlayer
           videoUrl="https://www.daryukala.com/dl/binance.mp4"
           title={activeEpisode?.title}
           isDarkMode={isDarkMode}
           onClose={handleCloseVideo}
         />
       )}
     </div>

     {/* Episodes List */}
     <div className="absolute top-[calc(4rem+56.25vw)] bottom-0 left-0 right-0 overflow-y-auto">
       <div className="p-4 pb-32">
         <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
           قسمت‌های دوره
         </h2>
         <div className="space-y-3">
           {episodes.map((episode) => (
             <div
               key={episode.id}
               className={`p-4 rounded-xl border ${
                 isDarkMode 
                   ? 'bg-gray-900 border-gray-700 text-white' 
                   : 'bg-white border-gray-200 text-gray-900'
               }`}
             >
               <div className="flex items-center justify-between">
                 <div className="flex-1 ml-4">
                   <h3 className="font-medium text-right">{episode.title}</h3>
                   <p className={`text-sm mt-1 ${
                     isDarkMode ? 'text-gray-400' : 'text-gray-500'
                   }`}>
                     {episode.duration}
                   </p>
                 </div>
                 <div 
                   onClick={(e) => handlePlayClick(episode, e)}
                   className="flex items-center justify-center"
                 >
                   <PlayButton isActive={activeEpisode?.id === episode.id} />
                 </div>
               </div>
             </div>
           ))}
         </div>
       </div>
     </div>
   </div>
 );
};

export default DexPage;