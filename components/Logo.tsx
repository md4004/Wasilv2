
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'white' | 'navy' | 'sage';
}

const Logo: React.FC<LogoProps> = ({ className = "h-auto w-[150px]" }) => {
  return (
    <div className={`${className} flex items-center justify-center bg-transparent overflow-visible pointer-events-none`}>
      <img 
        src="https://i.postimg.cc/ZqLwz2HD/Gemini-Generated-Image-7cyjdz7cyjdz7cyj.png" 
        alt="Wasil Logo" 
        className="w-full h-full object-contain"
        width="600"
        height="600"
        style={{
          transform: 'scale(1.45) translateY(-8%)',
          
          // Aggressive radial falloff to ensure absolutely no edges of the source square remain.
          maskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 22%, rgba(0,0,0,0) 52%)',
          WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 22%, rgba(0,0,0,0) 52%)',
          
          // Enhanced filters to pull the white 'W' forward and clean up residual noise
          filter: 'contrast(1.35) brightness(1.1) saturate(1.1)',
          imageRendering: 'crisp-edges',
          
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          mixBlendMode: 'normal'
        }}
      />
    </div>
  );
};

export default Logo;
