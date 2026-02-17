
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ServiceRequest, RequestStatus, Dispatcher } from '../types';
import { CANCELLATION_REASONS } from '../constants';

interface TrackingCardProps {
  request: ServiceRequest;
  onContactDispatcher: (id: string) => void;
  onCancel: () => void;
  onConfirmCancel: (reason: string) => void;
  canChangeStatus?: boolean;
  onStatusChange?: (id: string, newStatus: RequestStatus) => void;
  children?: React.ReactNode; // For extra info in dispatcher/admin views
}

const TrackingCard: React.FC<TrackingCardProps> = ({ 
  request, 
  onContactDispatcher, 
  onConfirmCancel, 
  canChangeStatus = false,
  onStatusChange,
  children
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0]);
  const [dispatcher, setDispatcher] = useState<Dispatcher | null>(null);

  useEffect(() => {
    if (request.assignedDispatcherId) {
      const unsub = onSnapshot(doc(db, 'dispatchers', request.assignedDispatcherId), (snap) => {
        if (snap.exists()) {
          setDispatcher({ ...snap.data(), id: snap.id } as Dispatcher);
        }
      });
      return () => unsub();
    }
  }, [request.assignedDispatcherId]);

  const statusSteps = [
    { status: RequestStatus.REQUESTED, label: 'Requested' },
    { status: RequestStatus.ASSIGNED, label: 'Assigned' },
    { status: RequestStatus.IN_PROGRESS, label: 'On Site' },
    { status: RequestStatus.COMPLETED, label: 'Done' }
  ];
  
  const currentStepIndex = statusSteps.findIndex(s => s.status === request.status);

  const handleContactDispatch = () => {
    onContactDispatcher(request.id);
  };

  const handleConfirmCancel = () => {
    onConfirmCancel(cancelReason);
    setShowCancelModal(false);
  };

  const getServiceIcon = (id: string) => {
    switch(id) {
      case 'solar-check': return '🔋';
      case 'medication': return '💊';
      case 'wifi-fix': return '📶';
      case 'home-chef': return '🥘';
      case 'cleaning': return '✨';
      case 'pet-care': return '🐾';
      default: return '🛠️';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-8 border border-navy/5 shadow-sm hover:shadow-md transition-shadow animate-in slide-in-from-left-4 duration-500 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 md:mb-12">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-sand flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
            {getServiceIcon(request.serviceId)}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-serif font-bold text-navy text-base md:text-lg leading-tight truncate">{request.serviceTitle}</h4>
            <p className="text-xs md:text-sm text-navy/40 truncate">{request.parentName} • {request.location}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {dispatcher ? (
            <div className="flex items-center gap-2 bg-sand/30 px-3 py-1.5 md:py-2 rounded-2xl border border-navy/5">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border border-white shadow-sm flex-shrink-0">
                <img src={dispatcher.photoUrl} alt={dispatcher.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-left overflow-hidden max-w-[80px] md:max-w-none">
                <p className="text-[8px] md:text-[10px] uppercase font-bold text-navy/40 tracking-widest leading-none mb-1">Scout</p>
                <p className="text-[11px] md:text-xs font-bold text-navy leading-none truncate">{dispatcher.name}</p>
              </div>
            </div>
          ) : request.assignedDispatcherId ? (
            <div className="flex items-center gap-2 bg-sand/10 px-3 py-1.5 md:py-2 rounded-2xl border border-navy/5 animate-pulse">
               <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-navy/5 flex-shrink-0" />
               <div className="h-4 w-16 bg-navy/5 rounded" />
            </div>
          ) : null}

          <div className="text-right">
            <span className="bg-sage/10 text-sage px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-sage/20 whitespace-nowrap">
              {request.status}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Progress Bar with Step Names Above */}
      <div className="relative mb-10 md:mb-12 px-6">
        <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-navy/5 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-6 h-0.5 bg-sage -translate-y-1/2 rounded-full transition-all duration-700" 
          style={{ width: currentStepIndex === -1 ? '0%' : `calc(${(currentStepIndex / (statusSteps.length - 1)) * 100}% - 4px)` }}
        />
        <div className="relative flex justify-between">
          {statusSteps.map((step, idx) => {
            const isActive = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.status} className="flex flex-col items-center group relative">
                {/* Step Name Over Circle */}
                <div 
                  onClick={() => canChangeStatus && onStatusChange?.(request.id, step.status)}
                  className={`absolute -top-6 transform -translate-y-1/2 whitespace-nowrap text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive ? 'text-sage' : 'text-navy/20'
                  } ${canChangeStatus ? 'cursor-pointer hover:text-navy hover:scale-110' : ''}`}
                >
                  {step.label}
                </div>

                {/* Circle */}
                <div 
                  onClick={() => canChangeStatus && onStatusChange?.(request.id, step.status)}
                  className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 bg-white transition-all duration-500 relative z-10 ${
                    isActive ? 'border-sage bg-sage scale-110' : 'border-navy/10 group-hover:border-navy/20'
                  } ${canChangeStatus ? 'cursor-pointer hover:shadow-lg hover:shadow-sage/20 active:scale-90' : ''}`}
                >
                  {isCurrent && (
                    <div className="absolute inset-0 bg-white/40 rounded-full animate-ping" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Children Content (Optional Extra Info) */}
      {children && (
        <div className="mb-6 animate-in fade-in duration-300">
          {children}
        </div>
      )}

      {/* AI Reassurance */}
      {request.aiReassurance && (
        <div className="bg-sand/50 rounded-2xl p-4 border border-sage/10 flex items-start space-x-3 italic">
          <div className="text-lg flex-shrink-0">🕯️</div>
          <p className="text-sm text-navy/70 leading-relaxed">
            "{request.aiReassurance}"
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-navy/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-[11px] md:text-xs text-navy/40">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{new Date(request.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button 
            onClick={() => setShowCancelModal(true)}
            className="text-[10px] font-bold text-red-500/70 hover:text-red-600 transition-colors uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-xl ml-auto md:ml-0"
          >
            Cancel
          </button>
        </div>
        <button 
          onClick={handleContactDispatch}
          className="w-full md:w-auto bg-navy text-sand py-3 px-6 rounded-2xl text-sm font-bold hover:bg-navy/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-navy/10"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          Contact Support / Scout
        </button>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 md:p-8 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⚠️</div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-navy text-center mb-2">Cancel Task?</h3>
            <p className="text-sm text-navy/60 text-center mb-6 px-2">
              Cancellations incur a <span className="font-bold text-red-600">50% service fee</span>.
            </p>

            <div className="space-y-4 mb-8">
              <label className="block text-[10px] uppercase font-bold text-navy/40 mb-1 ml-1">Reason</label>
              <select 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-12 bg-sand border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-red-200 outline-none"
              >
                {CANCELLATION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmCancel}
                className="h-12 w-full bg-red-500 text-white rounded-2xl font-bold shadow-lg hover:bg-red-600 transition-all"
              >
                Confirm Cancellation
              </button>
              <button 
                onClick={() => setShowCancelModal(false)} 
                className="h-12 w-full text-navy/40 font-bold hover:text-navy transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingCard;
