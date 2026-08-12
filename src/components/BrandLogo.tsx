import React from 'react';
import logoImage from '../assets/images/kahrah-logo.png';
import logoImageLight from '../assets/images/kahrah-logo-light.png';

interface BrandLogoProps {
  variant?: 'primary' | 'dark' | 'monogram-only' | 'wordmark-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtext?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  showSubtext = true,
}) => {
  const isDarkBg = variant === 'dark';

  // Sizing mappings
  const monogramDimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 44, height: 44 },
    lg: { width: 64, height: 64 },
  }[size];

  const titleSizes = {
    sm: 'text-xl tracking-tight',
    md: 'text-2xl md:text-3xl tracking-tight',
    lg: 'text-3xl md:text-4xl tracking-tight',
  }[size];

  const subtextSizes = {
    sm: 'text-[9px] tracking-[0.32em]',
    md: 'text-[11px] tracking-[0.38em]',
    lg: 'text-[13px] tracking-[0.42em]',
  }[size];

  const primaryTextColor = isDarkBg ? 'text-[#F8FAFC]' : 'text-[#0F172A]';
  const subtextColor = isDarkBg ? 'text-[#CBD5E1]' : 'text-[#64748B]';

  // KAHRÀH calligraphic K monogram — the brand mark, also used for the
  // favicon and link-preview image.
  const MonogramIcon = (
    <img
      src={isDarkBg ? logoImageLight : logoImage}
      width={monogramDimensions.width}
      height={monogramDimensions.height}
      alt="KAHRÀH monogram"
      decoding="async"
      className="shrink-0 object-contain transition-transform duration-300 hover:scale-105"
      style={{ width: monogramDimensions.width, height: monogramDimensions.height }}
    />
  );

  if (variant === 'monogram-only') {
    return <div className={`inline-flex items-center ${className}`}>{MonogramIcon}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {MonogramIcon}

      {variant !== 'monogram-only' && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-sans font-bold uppercase ${titleSizes} ${primaryTextColor}`}>
            KAHRÀH
          </span>
          {showSubtext && (
            <span className={`font-sans font-semibold uppercase mt-0.5 ${subtextSizes} ${subtextColor}`}>
              SKINCARE
            </span>
          )}
        </div>
      )}
    </div>
  );
};
