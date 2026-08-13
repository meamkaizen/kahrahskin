import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ArrowRight } from 'lucide-react';

interface HeaderProps {
  onScrollToWaitlist: () => void;
}

/**
 * Transparent navigation bar overlaying the hero.
 *
 * Positioned absolutely rather than fixed, so it sits on the hero image and
 * scrolls away with it. A transparent bar that stayed fixed would put its
 * light logo and text over the pale sections further down, where they would
 * be unreadable.
 *
 * Deliberately static otherwise: no scroll listener, no background or logo
 * swap partway down, no entrance animation.
 */
export const Header: React.FC<HeaderProps> = ({ onScrollToWaitlist }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <a
          href="#"
          aria-label="KAHRÀH home"
          className="shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8C4A27]"
        >
          {/* Wrapped rather than passing display classes into BrandLogo, whose
              own inline-flex would otherwise compete with them. */}
          {/* Light treatment: the bar is transparent over the dark hero. */}
          <span className="flex sm:hidden">
            <BrandLogo size="sm" variant="dark" showSubtext={false} />
          </span>
          <span className="hidden sm:flex">
            <BrandLogo size="md" variant="dark" />
          </span>
        </a>

        {/* Right CTA Action */}
        <button
          onClick={onScrollToWaitlist}
          className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-sans font-semibold text-[#FFFDF9] bg-[#8C4A27] hover:bg-[#70381C] active:bg-[#582B14] rounded-[5px] transition-colors duration-200 cursor-pointer border border-[#8C4A27]"
        >
          <span>Join Waitlist</span>
          <ArrowRight className="w-4 h-4 shrink-0 text-[#FFFDF9]" />
        </button>
      </div>
    </header>
  );
};
