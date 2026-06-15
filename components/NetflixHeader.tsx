
import React, { useState, useEffect } from 'react';

const NetflixHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 px-4 md:px-12 py-4 flex items-center justify-between ${
        isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center gap-8">
        <h1 className="text-2xl md:text-4xl font-black text-[#E50914] tracking-tighter uppercase cursor-pointer drop-shadow-lg brand-font">
          EduFlix
        </h1>
      </div>
      <div className="flex items-center gap-6 text-white">
        <button className="hover:text-gray-300 transition-colors">
           <i className="fas fa-search text-lg"></i>
        </button>
        <button className="hover:text-gray-300 transition-colors">
           <i className="fas fa-bell text-lg"></i>
        </button>
        <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-bold text-white text-xs shadow-md">
          ST
        </div>
      </div>
    </header>
  );
};

export default NetflixHeader;
