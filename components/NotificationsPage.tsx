
import React from 'react';
import { Notification } from '../types';

interface NotificationsPageProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onBack: () => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, onMarkRead, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-12">
      <button onClick={onBack} className="mb-8 flex items-center text-navy/60 hover:text-navy transition-colors font-bold text-sm">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Back to Home
      </button>

      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-navy/5 shadow-sm">
        <div className="p-8 border-b border-navy/5 bg-sand/20">
          <h2 className="text-2xl font-serif font-bold text-navy">Activity History</h2>
          <p className="text-sm text-navy/40">Chronicle of all your concierge requests.</p>
        </div>
        
        <div className="divide-y divide-navy/5">
          {notifications.length === 0 ? (
            <div className="p-20 text-center text-navy/30 italic">No activity recorded yet.</div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => onMarkRead(n.id)}
                className={`p-8 hover:bg-sand/10 transition-colors cursor-pointer flex gap-6 items-start ${n.read ? 'opacity-60' : ''}`}
              >
                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${n.read ? 'bg-navy/10' : 'bg-sage'}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-navy">{n.title}</h4>
                    <span className="text-[10px] font-bold text-navy/30 uppercase tracking-widest">{n.time}</span>
                  </div>
                  <p className="text-sm text-navy/60 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
