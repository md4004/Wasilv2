
import React, { useState } from 'react';
import { Siren } from 'lucide-react';

const EmergencyButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contacts = [
    { name: 'Red Cross', number: '140', icon: '🚑' },
    { name: 'Civil Defense', number: '125', icon: '🚒' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 w-9 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 border border-white/20 ${
          isOpen ? 'bg-navy text-sand' : 'bg-red-600 text-white'
        }`}
      >
        <Siren className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 mt-3 flex flex-col gap-2 transition-all duration-300 origin-top-left z-[210] ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-4 pointer-events-none'
        }`}
      >
        {contacts.map((c) => (
          <a
            key={c.number}
            href={`tel:${c.number}`}
            className="bg-white px-4 py-2 rounded-2xl shadow-2xl border border-red-100 flex items-center gap-3 active:scale-95 transition-transform hover:bg-red-50 whitespace-nowrap"
          >
            <span className="text-base">{c.icon}</span>
            <div className="text-left">
              <p className="text-[7px] uppercase font-bold text-navy/40 leading-none mb-1 tracking-widest">{c.name}</p>
              <p className="text-xs font-bold text-red-600 leading-none">{c.number}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default EmergencyButton;
