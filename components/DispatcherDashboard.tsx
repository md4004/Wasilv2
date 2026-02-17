
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { ServiceRequest, RequestStatus, User, Dependant } from '../types';
import { generatePeaceOfMindSummary } from '../services/geminiService';
import ChatModal from './ChatModal';
import TrackingCard from './TrackingCard';

interface DispatcherDashboardProps {
  user: User;
  onLogout: () => void;
}

const DispatcherDashboard: React.FC<DispatcherDashboardProps> = ({ user, onLogout }) => {
  const [missions, setMissions] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<ServiceRequest | null>(null);
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [dependantCache, setDependantCache] = useState<Record<string, Dependant>>({});

  useEffect(() => {
    const q = query(
      collection(db, 'requests'),
      where('assignedDispatcherId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const missionList = snapshot.docs.map(doc => ({ 
          ...doc.data(), 
          id: doc.id 
        } as ServiceRequest));
        
        setMissions(missionList.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        setLoading(false);
        setIndexError(null);
      },
      (error: any) => {
        console.error("Firestore Error:", error);
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          const urlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
          setIndexError(urlMatch ? urlMatch[0] : 'Missing Firestore Index');
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  const fetchDependantData = async (userId: string, depId: string) => {
    if (dependantCache[depId]) return;
    try {
      const depDoc = await getDoc(doc(db, 'users', userId, 'dependants', depId));
      if (depDoc.exists()) {
        setDependantCache(prev => ({ ...prev, [depId]: depDoc.data() as Dependant }));
      }
    } catch (error) {
      console.error("Error fetching dependant info:", error);
    }
  };

  const handleStatusUpdate = async (missionId: string, newStatus: RequestStatus) => {
    try {
      const missionRef = doc(db, 'requests', missionId);
      const mission = missions.find(m => m.id === missionId);
      if (!mission) return;

      const updateData: any = { status: newStatus };

      if (newStatus === RequestStatus.IN_PROGRESS) {
        const aiSummary = await generatePeaceOfMindSummary({ ...mission, status: newStatus });
        updateData.aiReassurance = aiSummary;
      }

      await updateDoc(missionRef, updateData);

      // Notify the User
      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(db, 'users', mission.userId, 'notifications', notifId), {
        id: notifId,
        title: `Mission ${newStatus}`,
        message: `${user.name} has updated your ${mission.serviceTitle} request to ${newStatus}.`,
        time: 'Just now',
        timestamp: serverTimestamp(),
        read: false
      });

    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const activeMissions = missions.filter(m => m.status !== RequestStatus.COMPLETED && m.status !== RequestStatus.CANCELLED);
  const pastMissions = missions.filter(m => m.status === RequestStatus.COMPLETED || m.status === RequestStatus.CANCELLED);

  if (indexError) {
    return (
      <div className="min-h-screen bg-sand p-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-orange-100 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">⚙️</div>
          <h2 className="text-2xl font-serif font-bold text-navy mb-4">System Optimization Required</h2>
          <p className="text-sm text-navy/60 mb-8 leading-relaxed">
            Your database needs a specific index to process dispatcher assignments across the platform.
          </p>
          <a 
            href={indexError} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full bg-navy text-sand py-4 rounded-2xl font-bold hover:bg-navy/90 transition-all shadow-xl text-sm"
          >
            Create Firestore Index
          </a>
          <p className="mt-4 text-[10px] text-navy/30 uppercase font-bold tracking-widest">Refresh the app after clicking above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand p-6 pb-24 md:p-12 font-sans">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-navy">Scout Portal</h1>
          <p className="text-navy/40 font-bold text-xs uppercase tracking-widest mt-1">Logged in as {user.name}</p>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-red-500 uppercase tracking-widest border border-red-100 px-4 py-2 rounded-xl bg-white shadow-sm">Logout</button>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-serif font-bold text-navy">Current Assignments</h2>
            <span className="bg-sage text-navy px-2 py-0.5 rounded-full text-[10px] font-bold">{activeMissions.length}</span>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => <div key={i} className="h-40 bg-white/50 rounded-3xl" />)}
            </div>
          ) : activeMissions.length === 0 ? (
            <div className="bg-white/40 border-2 border-dashed border-navy/10 rounded-[2.5rem] p-16 text-center">
              <span className="text-5xl mb-4 block">☕</span>
              <p className="text-navy/40 font-bold">All clear for now, Scout.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeMissions.map(mission => (
                <TrackingCard 
                  key={mission.id} 
                  request={mission} 
                  onContactDispatcher={() => setActiveChat(mission)} 
                  onCancel={() => {}} 
                  onConfirmCancel={() => handleStatusUpdate(mission.id, RequestStatus.CANCELLED)}
                  canChangeStatus={true}
                  onStatusChange={handleStatusUpdate}
                >
                  {/* Mission Info Dossier for Dispatchers */}
                  <div className="mt-6 pt-6 border-t border-navy/5">
                    <button 
                      onClick={() => {
                        setExpandedMissionId(expandedMissionId === mission.id ? null : mission.id);
                        fetchDependantData(mission.userId, mission.dependantId);
                      }}
                      className="w-full h-12 border border-navy/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-navy/40 hover:text-navy hover:bg-navy/5 transition-all"
                    >
                      {expandedMissionId === mission.id ? 'Hide Sensitive Info' : 'View Mission Dossier'}
                    </button>

                    {expandedMissionId === mission.id && dependantCache[mission.dependantId] && (
                      <div className="mt-4 bg-sand/30 p-6 rounded-3xl space-y-6 animate-in slide-in-from-top-4 duration-300">
                        <div>
                          <p className="text-[9px] font-bold text-navy/30 uppercase tracking-widest mb-1">Detailed Address</p>
                          <p className="text-sm font-medium text-navy leading-relaxed">{dependantCache[mission.dependantId].fullAddress}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                             <p className="text-[9px] font-bold text-navy/30 uppercase tracking-widest mb-1">Medical Context</p>
                             <p className="text-xs font-bold text-red-500">{dependantCache[mission.dependantId].medicalConditions || 'None reported'}</p>
                           </div>
                           <div>
                             <p className="text-[9px] font-bold text-navy/30 uppercase tracking-widest mb-1">Medications</p>
                             <p className="text-xs font-bold text-navy">{dependantCache[mission.dependantId].medications.join(', ') || 'None'}</p>
                           </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-navy/30 uppercase tracking-widest mb-1">Expat Notes</p>
                          <p className="text-xs italic text-navy/60 leading-relaxed">"{mission.urgentNotes || 'No specific instructions provided.'}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TrackingCard>
              ))}
            </div>
          )}
        </section>

        <section className="opacity-60">
          <h2 className="text-xl font-serif font-bold text-navy mb-6">Mission Log (Past)</h2>
          <div className="bg-white rounded-[2rem] divide-y divide-navy/5 border border-navy/5 overflow-hidden">
            {pastMissions.length === 0 ? (
               <div className="p-10 text-center text-xs text-navy/20 italic">No historical missions recorded.</div>
            ) : (
              pastMissions.map(m => (
                <div key={m.id} className="p-6 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-navy text-sm">{m.serviceTitle}</h4>
                    <p className="text-[10px] text-navy/40">{m.parentName} • {m.location}</p>
                  </div>
                  <div className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase ${m.status === RequestStatus.COMPLETED ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {m.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {activeChat && (
        <ChatModal 
          request={activeChat} 
          onClose={() => setActiveChat(null)} 
          currentUser={user} 
          dispatcher={{ ...user, role: 'Dispatcher' } as any} 
        />
      )}
    </div>
  );
};

export default DispatcherDashboard;
