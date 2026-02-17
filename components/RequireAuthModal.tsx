
import React from 'react';

interface RequireAuthModalProps {
  onClose: () => void;
  onSignIn: () => void;
}

const RequireAuthModal: React.FC<RequireAuthModalProps> = ({ onClose, onSignIn }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-sand rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">🔒</div>
        
        <h3 className="text-2xl font-serif font-bold text-navy mb-2">Member Access Only</h3>
        <p className="text-sm text-navy/60 mb-8 leading-relaxed">
          Please create an account or sign in to access personalized care features, track missions, and chat with runners.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onSignIn}
            className="w-full bg-navy text-sand py-4 rounded-2xl font-bold shadow-xl hover:bg-navy/90 transition-all active:scale-[0.98]"
          >
            Sign In / Register
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 text-navy/30 font-bold hover:text-navy transition-colors text-sm uppercase tracking-widest"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequireAuthModal;
