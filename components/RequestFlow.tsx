
import React, { useState, useEffect } from 'react';
import { Service, RequestStatus, ServiceRequest, Dependant } from '../types';
import { MARKUP_PERCENTAGE } from '../constants';
import { generatePeaceOfMindSummary } from '../services/geminiService';

interface RequestFlowProps {
  service: Service;
  dependants: Dependant[];
  onCancel: () => void;
  onComplete: (request: ServiceRequest) => void;
  onQuickRegister: () => void;
  initialDependantId?: string;
}

const RequestFlow: React.FC<RequestFlowProps> = ({ service, dependants, onCancel, onComplete, onQuickRegister, initialDependantId }) => {
  const [step, setStep] = useState(1);
  const [selectedDepId, setSelectedDepId] = useState<string>(initialDependantId || dependants[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialDependantId) {
      setSelectedDepId(initialDependantId);
    }
  }, [initialDependantId]);

  const expatPrice = service.basePrice * (1 + MARKUP_PERCENTAGE);
  const selectedDep = dependants.find(d => d.id === selectedDepId);

  const handleSubmit = async () => {
    if (!selectedDep) return;
    setIsSubmitting(true);
    
    const isCustom = service.id === 'custom-request';
    
    const newRequest: ServiceRequest = {
      id: `req-${Date.now()}`,
      serviceId: service.id,
      serviceTitle: isCustom ? 'Custom Request' : service.title,
      category: service.category,
      dependantId: selectedDep.id,
      parentName: selectedDep.name,
      location: selectedDep.location,
      status: RequestStatus.REQUESTED,
      urgentNotes: isCustom ? `${customDescription}\n\nNotes: ${notes}` : notes,
      expatPrice,
      runnerPayout: service.basePrice,
      timestamp: new Date().toISOString(),
      isCustom: isCustom
    };

    const aiSummary = await generatePeaceOfMindSummary(newRequest);
    newRequest.aiReassurance = aiSummary;

    onComplete(newRequest);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-right-4 duration-500 pb-12">
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-navy/5">
        
        <div className="flex justify-center space-x-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-sage' : 'bg-navy/10'}`} 
            />
          ))}
        </div>

        {step === 1 && (
          <div className="step-transition">
            <h3 className="text-3xl font-serif font-bold text-navy mb-2">Select Recipient</h3>
            <p className="text-navy/60 mb-8">Which family member is this for?</p>
            
            <div className="space-y-4">
              {dependants.map(dep => (
                <div 
                  key={dep.id}
                  onClick={() => setSelectedDepId(dep.id)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                    selectedDepId === dep.id ? 'border-sage bg-sand/30 shadow-md' : 'border-navy/5 hover:border-navy/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sand border border-navy/5 overflow-hidden flex items-center justify-center">
                      {dep.photoUrl ? (
                         <img src={dep.photoUrl} alt={dep.name} className="w-full h-full object-cover" />
                      ) : (
                         <span className="text-xl">🧓</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-navy">{dep.name}</p>
                      <p className="text-[10px] text-navy/40 uppercase tracking-widest">{dep.location}</p>
                    </div>
                  </div>
                  {selectedDepId === dep.id && <span className="text-sage text-xl font-bold">✓</span>}
                </div>
              ))}
              <button 
                onClick={onQuickRegister}
                className="w-full p-4 border-2 border-dashed border-navy/10 rounded-3xl text-navy/40 font-bold text-xs uppercase hover:text-navy hover:border-navy/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg">+</span>
                Register New Member
              </button>
            </div>
            
            <div className="flex space-x-4 mt-12">
              <button onClick={onCancel} className="flex-1 py-4 text-navy/40 font-bold hover:text-navy transition-colors">Cancel</button>
              <button 
                disabled={!selectedDepId}
                onClick={() => setStep(2)} 
                className="flex-[2] bg-navy text-sand py-4 rounded-2xl font-bold disabled:opacity-30 hover:bg-navy/90 transition-all shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-transition">
            <h3 className="text-3xl font-serif font-bold text-navy mb-2">
              {service.id === 'custom-request' ? 'Describe Your Need' : 'Service Details'}
            </h3>
            <p className="text-navy/60 mb-8">
              {service.id === 'custom-request' ? 'Tell us exactly what you need.' : 'Any specific instructions for our runner?'}
            </p>
            
            <div className="space-y-6">
              {service.id === 'custom-request' && (
                <div>
                  <label className="block text-xs uppercase font-bold text-navy/40 mb-2">Unique Request Details</label>
                  <textarea 
                    rows={4}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="e.g. Please find a generator filter for an 10kVA Perkins engine..."
                    className="w-full bg-sand border-none rounded-2xl p-4 text-navy placeholder:text-navy/20 focus:ring-2 focus:ring-sage/50 outline-none resize-none"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-xs uppercase font-bold text-navy/40 mb-2">Urgent Notes / Access Codes</label>
                <textarea 
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gate codes, specific floor instructions, or contact numbers..."
                  className="w-full bg-sand border-none rounded-2xl p-4 text-navy placeholder:text-navy/20 focus:ring-2 focus:ring-sage/50 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-12">
              <button onClick={() => setStep(1)} className="flex-1 py-4 text-navy/40 font-bold hover:text-navy transition-colors">Back</button>
              <button 
                onClick={() => setStep(3)} 
                className="flex-[2] bg-navy text-sand py-4 rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-lg"
              >
                Review Summary
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-transition">
            <h3 className="text-3xl font-serif font-bold text-navy mb-2">Secure Payment</h3>
            <p className="text-navy/60 mb-8">Care is on the way as soon as you confirm.</p>
            
            <div className="bg-sand rounded-3xl p-6 space-y-4 mb-8 border border-navy/5">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-50">Service</span>
                <span className="font-bold">{service.title}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-50">For</span>
                <span className="font-bold">{selectedDep?.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-50">Address</span>
                <span className="font-bold text-right max-w-[200px] truncate">{selectedDep?.fullAddress}</span>
              </div>
              
              <div className="h-px bg-navy/10 my-2" />
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-bold opacity-30">Total Fresh USD</span>
                  <span className="text-[10px] italic opacity-40">Includes Diaspora Service Markup</span>
                </div>
                <span className="text-3xl font-serif font-bold text-navy">${expatPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full bg-[#88A47C] text-navy py-5 rounded-3xl font-bold hover:bg-[#7a956e] transition-all shadow-xl shadow-sage/20 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Dispatching...</span>
                ) : (
                  <>
                    <span>Confirm & Pay</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </>
                )}
              </button>
              
              <button 
                disabled={isSubmitting}
                onClick={() => setStep(2)} 
                className="w-full py-4 text-navy/40 font-bold hover:text-navy transition-colors"
              >
                Modify Instructions
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RequestFlow;
