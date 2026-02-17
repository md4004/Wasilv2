
import React from 'react';
import { Dispatcher } from '../types';

interface AssignmentModalProps {
  dispatcher: Dispatcher;
  onClose: () => void;
  onChat: () => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ dispatcher, onClose, onChat }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl text-center relative overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-700">
        
        {/* Celebration Background Effect */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-sage/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-sage/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-sage rounded-full flex items-center justify-center text-navy mx-auto mb-6 shadow-xl shadow-sage/20 animate-bounce">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>

          <h2 className="text-3xl font-serif font-bold text-navy mb-2">Request Received!</h2>
          <p className="text-navy/60 text-sm mb-10 leading-relaxed">
            Your parent's care is in excellent hands. We've matched you with a specialized responder.
          </p>

          <div className="bg-sand/30 rounded-3xl p-6 border border-navy/5 mb-10">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                <img src={dispatcher.photoUrl} alt={dispatcher.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 right-0 bg-navy text-sand text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                ★ {dispatcher.rating}
              </div>
            </div>
            
            <h3 className="text-xl font-serif font-bold text-navy">{dispatcher.name}</h3>
            <p className="text-xs text-sage font-bold uppercase tracking-widest">{dispatcher.role}</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={onChat}
              className="w-full bg-navy text-sand py-4 rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              Chat with {dispatcher.name} Now
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 text-navy/40 font-bold hover:text-navy transition-colors text-sm"
            >
              View Tracking Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
