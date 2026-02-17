
import React from 'react';
import { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const tabs = [
    { 
      id: 'DASHBOARD' as AppView, 
      label: 'Home', 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 11v10h14V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 21v-6h4v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'CATALOG' as AppView, 
      label: 'Services', 
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16c2 1 4 2 8 2s6-1 8-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M2 14c2 0 3-3 6-3s4 3 4 3 1-3 4-3 4 3 6 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M12 4v4m-2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 6l-1-1m2 0l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: 'DEPENDANTS' as AppView, 
      label: 'Family', 
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20s-1-1-4-4-5-6-5-9c0-2.5 2-4.5 4.5-4.5 1.5 0 2.5.5 3.5 1.5 1-1.5 3-2.5 5.5-2 2.5.5 4.5 3 4 7-.5 4-4.5 9-8.5 11z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'DISPATCHERS' as AppView, 
      label: 'Team', 
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="14" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 11c0-1.5 1.5-3 4-3s4 1.5 4 3H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="currentColor" fillOpacity="0.1"/>
          <circle cx="17" cy="14" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M13 11c0-1.5 1.5-3 4-3s4 1.5 4 3h-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="currentColor" fillOpacity="0.1"/>
          <path d="M11 19h2M12 18v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      id: 'ACCOUNT' as AppView, 
      label: 'Account', 
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-20 px-4 safe-bottom">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id || (tab.id === 'CATALOG' && currentView === 'REQUEST_FLOW');
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 active:scale-90"
            >
              <div className={`${isActive ? 'text-sage' : 'text-gray-400'} transition-colors duration-300`}>
                {tab.icon}
              </div>
              <span className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${isActive ? 'text-sage' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
