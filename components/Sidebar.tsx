
import React from 'react';
import { AppView, User } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user }) => {
  const navItems = [
    { id: 'DASHBOARD' as AppView, label: 'Dashboard', icon: '🏠' },
    { id: 'CATALOG' as AppView, label: 'Services', icon: '✨' },
    { id: 'DEPENDANTS' as AppView, label: 'Dependants', icon: '❤️' },
    { id: 'DISPATCHERS' as AppView, label: 'Our Team', icon: '🛠️' },
    { id: 'ACCOUNT' as AppView, label: 'Account', icon: '👤' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-navy text-sand h-screen border-r border-navy/20 z-50">
      <div className="p-8 pb-4 flex flex-col items-start">
        <p className="text-[11px] uppercase tracking-[0.3em] opacity-40 font-bold leading-tight">
          Care Without<br/>Borders
        </p>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              currentView === item.id || (currentView === 'REQUEST_FLOW' && item.id === 'CATALOG')
                ? 'bg-sage text-navy font-semibold shadow-lg shadow-sage/20'
                : 'hover:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm uppercase tracking-widest font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button 
          onClick={() => setView('ACCOUNT')}
          className={`w-full bg-white/5 rounded-[2rem] p-4 border transition-all duration-300 ${
            currentView === 'ACCOUNT' ? 'border-sage/40 bg-white/10' : 'border-white/10 hover:bg-white/10'
          }`}
        >
          <p className="text-[9px] uppercase tracking-widest opacity-40 mb-3 text-left">Your Profile</p>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-sage overflow-hidden shadow-lg border-2 border-white/20">
              <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] opacity-40 uppercase tracking-tighter">{user.country}</p>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
