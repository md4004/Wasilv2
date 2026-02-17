
import React from 'react';
import { ServiceRequest, RequestStatus } from '../types';
import TrackingCard from './TrackingCard';

interface DashboardProps {
  requests: ServiceRequest[];
  onNewRequest: () => void;
  onContactDispatcher: (id: string) => void;
  onCancelRequest: (requestId: string, reason: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ requests, onNewRequest, onContactDispatcher, onCancelRequest }) => {
  const activeRequests = requests.filter(r => 
    r.status !== RequestStatus.COMPLETED && 
    r.status !== RequestStatus.CANCELLED
  );
  const historyRequests = requests.filter(r => 
    r.status === RequestStatus.COMPLETED || 
    r.status === RequestStatus.CANCELLED
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-1 md:px-0">
      {/* Hero Stats - Mobile Stacking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-sage p-5 md:p-6 rounded-3xl text-navy flex flex-col justify-between min-h-[120px] md:min-h-[140px] shadow-sm">
          <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold opacity-60">Active Tasks</span>
          <span className="text-4xl md:text-5xl font-serif font-bold leading-none">{activeRequests.length}</span>
          <p className="text-sm">Local runners on the ground.</p>
        </div>
        <div className="bg-white p-5 md:p-6 rounded-3xl text-navy flex flex-col justify-between min-h-[120px] md:min-h-[140px] shadow-sm border border-navy/5">
          <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold opacity-40">Peace of Mind</span>
          <span className="text-2xl md:text-3xl font-serif font-bold leading-tight">Guaranteed</span>
          <p className="text-sm text-navy/60">Safety & Reliability checks.</p>
        </div>
        <button 
          onClick={onNewRequest}
          className="bg-navy p-5 md:p-6 rounded-3xl text-sand flex flex-col justify-center items-center gap-2 hover:bg-navy/90 transition-all group shadow-lg min-h-[120px]"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-sage flex items-center justify-center text-navy text-xl md:text-2xl group-hover:scale-110 transition-transform">
            +
          </div>
          <span className="font-bold text-base md:font-medium">New Service Request</span>
        </button>
      </div>

      {/* Active Requests */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-xl md:text-2xl font-serif font-bold text-navy">Active Missions</h3>
          <span className="text-[10px] px-2.5 py-1 bg-sage/20 text-sage-800 rounded-full font-bold">LIVE</span>
        </div>
        
        {activeRequests.length === 0 ? (
          <div className="bg-white/40 border-2 border-dashed border-navy/10 rounded-3xl p-8 md:p-12 text-center">
            <p className="text-navy/40 mb-4 text-sm">No active requests for your family right now.</p>
            <button onClick={onNewRequest} className="text-sage font-bold hover:underline text-base">Request your first service →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {activeRequests.map(req => (
              <TrackingCard 
                key={req.id} 
                request={req} 
                onContactDispatcher={onContactDispatcher}
                onCancel={() => {}} 
                onConfirmCancel={(reason) => onCancelRequest(req.id, reason)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Care History */}
      {historyRequests.length > 0 && (
        <section className="opacity-80">
          <h3 className="text-lg font-serif font-bold text-navy mb-4">Past Care History</h3>
          <div className="bg-white rounded-2xl border border-navy/5 divide-y divide-navy/5 overflow-hidden">
            {historyRequests.map(req => (
              <div key={req.id} className="p-4 md:p-5 flex justify-between items-center hover:bg-sand/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${req.status === RequestStatus.CANCELLED ? 'bg-red-50 text-red-500' : 'bg-sand text-sage'}`}>
                    {req.status === RequestStatus.CANCELLED ? '✕' : '✓'}
                  </span>
                  <div className="overflow-hidden">
                    <p className="font-bold text-navy text-sm md:text-base truncate">{req.serviceTitle}</p>
                    <p className="text-[10px] opacity-50 uppercase tracking-tighter">
                      {req.parentName} • {req.location}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className={`font-serif font-bold text-sm md:text-base ${req.status === RequestStatus.CANCELLED ? 'text-red-500/60 line-through' : ''}`}>
                    ${req.expatPrice.toFixed(0)}
                  </p>
                  {req.status === RequestStatus.CANCELLED && (
                    <p className="text-[9px] font-bold text-red-500 uppercase">Fee Applied</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
