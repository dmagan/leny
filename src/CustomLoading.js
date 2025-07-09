import React from 'react';

const CustomLoading = () => {
  return (
    <div className="custom-loading-container">
      <div className="image-container">
        <img 
          src="/center.png" 
          alt="Loading" 
          className="loading-image"
        />
        <div className="shadow"></div>
      </div>
      
      <style jsx="true">{`
        .custom-loading-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0a4b6d;
          z-index: 9999;
        }
        
        .image-container {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 200px;
        }
        
        .loading-image {
          width: 150px;
          height: 150px;
          object-fit: contain;
          animation: bounce 1.5s infinite ease-in-out;
          z-index: 2;
        }
        
        .shadow {
          width: 120px;
          height: 20px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          position: absolute;
          bottom: 0;
          animation: shadowBounce 1.5s infinite ease-in-out;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        
        @keyframes shadowBounce {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(0.8);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomLoading;