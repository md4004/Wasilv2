
import React, { useState } from 'react';
import { AppView, Notification } from '../types';
import EmergencyButton from './EmergencyButton';

interface HeaderProps {
  activeView: AppView;
  setView: (view: AppView) => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setView, notifications, onMarkRead }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fix: Added missing ADMIN_DASHBOARD title to satisfy AppView Record requirement
  const titles: Record<AppView, string> = {
    DASHBOARD: 'Home',
    CATALOG: 'Services',
    REQUEST_FLOW: 'Request',
    TRACKING: 'Tracking',
    ACCOUNT: 'Profile',
    AUTH: 'Auth',
    DEPENDANTS: 'Dependants',
    NOTIFICATIONS_FULL: 'Activity',
    PAYMENT_METHODS_ADD: 'Payments',
    DISPATCHERS: 'Team',
    DISPATCHER_DASHBOARD: 'Scout Portal',
    ADMIN_DASHBOARD: 'HQ Control'
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 z-[100] px-4 md:px-8 py-3 glass flex justify-between items-center border-b border-navy/5 safe-top min-h-[72px]">
      {/* Centered Title */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center">
         <h2 className="text-sm md:text-xl font-serif font-bold text-navy uppercase tracking-[0.3em] leading-none">
           {titles[activeView] || 'Wasil'}
         </h2>
      </div>
      
      {/* Left Emergency Utility */}
      <div className="flex items-center">
        <EmergencyButton />
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 relative">
        <button 
          onClick={() => setShowNotifs(!showNotifs)}
          className={`h-9 w-9 md:h-10 md:w-10 rounded-full transition-all relative flex items-center justify-center active:scale-95 ${showNotifs ? 'bg-sage text-navy shadow-inner' : 'hover:bg-navy/5 text-navy'}`}
        >
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          )}
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {showNotifs && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)}></div>
            <div className="absolute top-full right-0 mt-4 w-[calc(100vw-32px)] md:w-80 bg-white rounded-[2rem] shadow-2xl border border-navy/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="p-4 border-b border-navy/5 flex justify-between items-center bg-sand/30">
                <span className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">Recent Activity</span>
                {unreadCount > 0 && <span className="text-[10px] bg-sage text-navy px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
              </div>
              <div className="max-h-[60vh] md:max-h-96 overflow-y-auto divide-y divide-navy/5 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center opacity-30 text-sm italic">No updates.</div>
                ) : (
                  notifications.slice(0, 5).map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => { onMarkRead(notif.id); setShowNotifs(false); }}
                      className={`p-5 hover:bg-sand/20 transition-colors cursor-pointer ${notif.read ? 'opacity-50' : ''}`}
                    >
                      <p className="text-sm font-bold text-navy mb-0.5">{notif.title}</p>
                      <p className="text-xs text-navy/60 leading-relaxed mb-1">{notif.message}</p>
                      <p className="text-[9px] text-navy/30 uppercase font-bold tracking-tight">{notif.time}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-navy/5 text-center">
                <button 
                  onClick={() => { setView('NOTIFICATIONS_FULL'); setShowNotifs(false); }}
                  className="text-xs font-bold text-sage uppercase tracking-widest hover:underline"
                >
                  View All History
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;