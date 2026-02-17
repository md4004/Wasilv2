
import React, { useState } from 'react';

interface PaymentMethodSelectionProps {
  onBack: () => void;
  onConfirm: () => void;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({ onBack, onConfirm }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const methods = [
    { id: 'card', name: 'Credit / Debit Card', icon: '💳', desc: 'Secure payment via Stripe gateway.', color: 'bg-navy' },
    { id: 'whish', name: 'Whish Money', icon: '🟠', desc: 'Fast local cash-out for runners.', color: 'bg-[#F37021]' },
    { id: 'omt', name: 'OMT Lebanon', icon: '🟡', desc: 'Traditional local money transfer.', color: 'bg-[#FFDE00]' },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-in zoom-in duration-500 pb-12">
      <button onClick={onBack} className="mb-8 flex items-center text-navy/60 hover:text-navy transition-colors font-bold text-sm">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Back to Account
      </button>

      <div className="bg-white rounded-[2.5rem] p-10 border border-navy/5 shadow-sm">
        <h2 className="text-3xl font-serif font-bold text-navy mb-2">Add Payment Method</h2>
        <p className="text-sm text-navy/60 mb-10">Choose how you want to settle your care requests.</p>
        
        <div className="space-y-4">
          {methods.map((m) => (
            <div 
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`flex items-center p-6 rounded-3xl border-2 transition-all cursor-pointer group ${
                selected === m.id ? 'border-sage bg-sand/20' : 'border-navy/5 hover:border-navy/10'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mr-6 shadow-sm ${m.color} ${m.id === 'omt' ? 'text-navy' : 'text-sand'}`}>
                {m.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-serif font-bold text-navy group-hover:text-sage transition-colors">{m.name}</h4>
                <p className="text-xs text-navy/40">{m.desc}</p>
              </div>
              {selected === m.id ? (
                <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-navy animate-in zoom-in duration-300">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center group-hover:bg-navy group-hover:text-sand transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {selected && (
          <button 
            onClick={onConfirm}
            className="w-full mt-10 bg-navy text-sand py-5 rounded-[2rem] font-bold shadow-xl hover:bg-navy/90 transition-all animate-in slide-in-from-bottom-4 duration-500"
          >
            Connect {methods.find(m => m.id === selected)?.name}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSelection;
