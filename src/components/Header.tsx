import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onScrollToWaitlist: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onScrollToWaitlist,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF6F0]/95 backdrop-blur-md shadow-xs py-3.5 border-b border-[#E8DFD3]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        {/* Before scrolling the header is transparent over the dark hero, so
            the logo and wordmark switch to their light treatment. */}
        <a href="#" className="group focus:outline-none focus:ring-1 focus:ring-[#8C4A27] rounded-[5px] p-1">
          <BrandLogo size="md" variant={scrolled ? 'primary' : 'dark'} />
        </a>

        {/* Right CTA Action */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onScrollToWaitlist}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-sans font-semibold text-[#FFFDF9] bg-[#8C4A27] hover:bg-[#70381C] active:bg-[#582B14] rounded-[5px] shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer border border-[#8C4A27]"
          >
            <span>Join Waitlist</span>
            <ArrowRight className="w-4 h-4 text-[#FFFDF9] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};
