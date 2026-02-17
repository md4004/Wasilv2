
import React from 'react';
import Logo from './Logo';

interface LoadingScreenProps {
  fadeOut?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fadeOut = false }) => {
  return (
    <div className={`fixed inset-0 z-[1000] bg-sage flex flex-col items-center justify-center transition-opacity duration-500 overflow-hidden h-[100dvh] ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col items-center animate-pulse duration-[4000ms]">
        <Logo className="h-auto w-3/4 max-w-[320px] md:max-w-[500px]" />
        <div className="mt-2 text-center relative z-10">
          <h2 className="text-white font-serif text-6xl md:text-8xl font-bold tracking-widest uppercase drop-shadow-lg">Wasil</h2>
          <p className="text-white/50 uppercase tracking-[0.6em] text-[10px] md:text-[14px] mt-6 font-semibold">Supporting Home from Anywhere</p>
        </div>
      </div>
      
      {/* Refined minimalist indicator */}
      <div className="absolute bottom-16 flex space-x-8">
        <div className="h-[1px] w-16 bg-white/20 overflow-hidden relative">
           <div className="absolute inset-0 bg-white animate-[loading-bar_3s_ease-in-out_infinite]" />
        </div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
