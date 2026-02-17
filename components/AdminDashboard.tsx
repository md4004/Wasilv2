
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../services/firebase';
import { Provider, ServiceRequest, RequestStatus, User } from '../types';
import { SERVICES } from '../constants';
import TrackingCard from './TrackingCard';

// 1. DASHBOARD TAB: Global Stats & Overview
interface AdminDashboardProps {
  user: User;
  requests: ServiceRequest[];
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, requests }) => {
  const [providerCount, setProviderCount] = useState(0);

  useEffect(() => {
    return onSnapshot(collection(db, 'dispatchers'), (snap) => setProviderCount(snap.size));
  }, []);

  const active = requests.filter(r => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.CANCELLED);
  const completed = requests.filter(r => r.status === RequestStatus.COMPLETED);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-navy p-6 md:p-8 rounded-[2.5rem] text-sand shadow-xl flex flex-col justify-between min-h-[140px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">System Load</span>
          <div className="text-5xl font-serif font-bold mt-2">{active.length}</div>
          <p className="text-xs mt-4 opacity-60">Ongoing missions across Lebanon.</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] text-navy border border-navy/5 shadow-sm flex flex-col justify-between min-h-[140px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Success Count</span>
          <div className="text-5xl font-serif font-bold mt-2">{completed.length}</div>
          <p className="text-xs mt-4 opacity-40">Missions successfully completed.</p>
        </div>
        <div className="bg-sage p-6 md:p-8 rounded-[2.5rem] text-navy shadow-lg flex flex-col justify-between min-h-[140px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Verified Fleet</span>
          <div className="text-5xl font-serif font-bold mt-2">{providerCount}</div>
          <p className="text-xs mt-4 opacity-60">Providers currently on active duty.</p>
        </div>
      </div>

      <section className="bg-white rounded-[3rem] p-6 md:p-10 border border-navy/5">
        <h3 className="text-2xl font-serif font-bold text-navy mb-6">Recent System Activity</h3>
        <div className="space-y-4">
          {requests.slice(0, 8).map(req => (
            <div key={req.id} className="flex justify-between items-center py-4 border-b border-navy/5 last:border-0">
              <div className="overflow-hidden pr-4">
                <p className="font-bold text-navy text-sm truncate">{req.serviceTitle}</p>
                <p className="text-[10px] text-navy/40 uppercase font-bold tracking-widest truncate">
                  {req.userName || 'Unknown User'} • {req.parentName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                  req.status === RequestStatus.IN_PROGRESS ? 'bg-sage/10 text-sage' : 'bg-sand text-navy/40'
                }`}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// 2. MISSIONS TAB: Global Ongoing Missions List
export const AdminOngoingMissions: React.FC<{ requests: ServiceRequest[], onContactDispatcher: (id: string) => void }> = ({ requests, onContactDispatcher }) => {
  const ongoing = requests.filter(r => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.CANCELLED);
  const [confirmingStatus, setConfirmingStatus] = useState<{id: string, status: RequestStatus} | null>(null);

  const groupedMissions = ongoing.reduce((acc, req) => {
    const userId = req.userId || 'unknown';
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(req);
    return acc;
  }, {} as Record<string, ServiceRequest[]>);

  const handleUpdateStatus = async () => {
    if (!confirmingStatus) return;
    await updateDoc(doc(db, 'requests', confirmingStatus.id), { status: confirmingStatus.status });
    setConfirmingStatus(null);
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <header>
        <h2 className="text-4xl font-serif font-bold text-navy">Global Mission Control</h2>
        <p className="text-navy/40 font-bold text-xs uppercase tracking-widest mt-2">Click steps on the progress bar to override status</p>
      </header>

      {ongoing.length === 0 ? (
        <div className="bg-white/40 border-2 border-dashed border-navy/10 rounded-[3rem] p-20 text-center">
          <p className="text-navy/20 font-bold">No active missions in the system.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedMissions).map(([userId, userReqs]) => (
            <div key={userId} className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="h-px bg-navy/10 flex-1" />
                <h4 className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.3em] whitespace-nowrap">
                  USER: {userReqs[0].userName || 'Private Expat'} ({userReqs.length})
                </h4>
                <div className="h-px bg-navy/10 flex-1" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {userReqs.map(req => (
                  <TrackingCard 
                    key={req.id} 
                    request={req} 
                    onContactDispatcher={() => onContactDispatcher(req.id)} 
                    onCancel={() => {}} 
                    onConfirmCancel={() => setConfirmingStatus({id: req.id, status: RequestStatus.CANCELLED})} 
                    canChangeStatus={true}
                    onStatusChange={(id, status) => setConfirmingStatus({ id, status })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmingStatus && (
        <div className="fixed inset-0 z-[1100] bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⚠️</div>
            <h3 className="text-2xl font-serif font-bold text-navy mb-2">Change Mission Step?</h3>
            <p className="text-sm text-navy/40 mb-10 leading-relaxed">
              You are manually forcing this mission to <span className="font-bold text-navy">"{confirmingStatus.status}"</span>. This will notify the user.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmingStatus(null)} className="flex-1 py-4 text-navy/40 font-bold hover:text-navy transition-colors">Discard</button>
              <button onClick={handleUpdateStatus} className="flex-1 bg-navy text-sand py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">Confirm Change</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. TEAM TAB: Provider Management & CMS
export const AdminTeamCMS: React.FC<{ user: User }> = ({ user }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamSettings, setTeamSettings] = useState({ videoUrl: '', thumbnailUrl: '', title: 'Building Trust: The Wasil Quality Standard' });

  const [form, setForm] = useState({ 
    name: '', email: '', password: '', role: 'Technician', 
    supportedServiceIds: [] as string[]
  });
  
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [fieldPhotoFile, setFieldPhotoFile] = useState<File | null>(null);
  const [workingVideoFile, setWorkingVideoFile] = useState<File | null>(null);
  const [pageVideoFile, setPageVideoFile] = useState<File | null>(null);
  const [pageCoverFile, setPageCoverFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    onSnapshot(collection(db, 'dispatchers'), (snap) => {
      setProviders(snap.docs.map(d => ({ ...d.data(), id: d.id } as Provider)));
    });
    getDoc(doc(db, 'settings', 'teamPage')).then(s => s.exists() && setTeamSettings(s.data() as any));
  }, []);

  const handleEditProvider = (p: Provider) => {
    setEditingProvider(p);
    setForm({
      name: p.name,
      email: '', // Not easily retrievable for simple UI, placeholder
      password: '',
      role: p.role,
      supportedServiceIds: p.supportedServiceIds || []
    });
    setPreviews({
      profile: p.photoUrl,
      field: p.fieldPhotoUrl || '',
      video: p.workingVideoUrl || ''
    });
    setShowCreate(true);
  };

  const handleFilePreview = (file: File, key: string) => {
    const url = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [key]: url }));
  };

  const handleUploadToStorage = async (file: File, path: string) => {
    const sRef = ref(storage, path);
    const snap = await uploadBytes(sRef, file);
    return await getDownloadURL(snap.ref);
  };

  const handleSavePageVisuals = async () => {
    setIsSubmitting(true);
    try {
      let vUrl = teamSettings.videoUrl;
      let cUrl = teamSettings.thumbnailUrl;
      if (pageVideoFile) vUrl = await handleUploadToStorage(pageVideoFile, `settings/teamPage/hero_video.mp4`);
      if (pageCoverFile) cUrl = await handleUploadToStorage(pageCoverFile, `settings/teamPage/hero_cover.jpg`);
      await setDoc(doc(db, 'settings', 'teamPage'), { ...teamSettings, videoUrl: vUrl, thumbnailUrl: cUrl });
      alert('Saved');
    } catch (e) { alert(e); } finally { setIsSubmitting(false); }
  };

  const handleCommitProvider = async () => {
    if (!editingProvider && (!form.email || !form.password)) return;
    setIsSubmitting(true);
    try {
      let uid = editingProvider?.id;
      if (!editingProvider) {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        uid = cred.user.uid;
      }
      
      let photoUrl = editingProvider?.photoUrl || '';
      let fieldPhotoUrl = editingProvider?.fieldPhotoUrl || '';
      let workingVideoUrl = editingProvider?.workingVideoUrl || '';

      if (profileFile) photoUrl = await handleUploadToStorage(profileFile, `providers/${uid}/profile.jpg`);
      if (fieldPhotoFile) fieldPhotoUrl = await handleUploadToStorage(fieldPhotoFile, `providers/${uid}/field.jpg`);
      if (workingVideoFile) workingVideoUrl = await handleUploadToStorage(workingVideoFile, `providers/${uid}/working.mp4`);

      const providerData = {
        id: uid,
        name: form.name,
        role: form.role,
        photoUrl,
        rating: editingProvider?.rating || 5,
        supportedServiceIds: form.supportedServiceIds,
        fieldPhotoUrl,
        workingVideoUrl
      };

      await setDoc(doc(db, 'dispatchers', uid!), providerData, { merge: true });
      if (!editingProvider) {
        await setDoc(doc(db, 'users', uid!), { uid, name: form.name, email: form.email, role: 'dispatcher', photoUrl, plan: 'Basic' });
      }

      setShowCreate(false);
      resetRecruitForm();
    } catch (e) { alert(e); } finally { setIsSubmitting(false); }
  };

  const resetRecruitForm = () => {
    setForm({ name: '', email: '', password: '', role: 'Technician', supportedServiceIds: [] });
    setProfileFile(null); setFieldPhotoFile(null); setWorkingVideoFile(null);
    setPreviews({}); setEditingProvider(null);
  };

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700 max-w-full overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy leading-tight">Fleet Command</h2>
          <p className="text-navy/40 font-bold text-xs uppercase tracking-[0.2em] mt-2">Manage personnel & visual presence</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full md:w-auto bg-sage text-white px-10 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
          <span className="text-2xl leading-none">+</span> Enlist Provider
        </button>
      </header>

      {/* Page Visuals CMS */}
      <section className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-navy/5 shadow-sm">
        <h3 className="text-2xl font-serif font-bold text-navy mb-8">Public Identity CMS</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="space-y-6">
             <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-navy/30 block ml-1">Hero Video (MP4)</label>
                <div className="flex items-center gap-4 bg-sand rounded-2xl p-3 border border-navy/5">
                  <input type="file" accept="video/mp4" onChange={e => e.target.files?.[0] && setPageVideoFile(e.target.files[0])} className="text-xs flex-1" />
                  {teamSettings.videoUrl && <span className="text-[9px] text-sage font-bold uppercase">Stored ✓</span>}
                </div>
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-navy/30 block ml-1">Cover Image (JPG)</label>
                <div className="flex items-center gap-4 bg-sand rounded-2xl p-3 border border-navy/5">
                  <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setPageCoverFile(e.target.files[0])} className="text-xs flex-1" />
                  {teamSettings.thumbnailUrl && <span className="text-[9px] text-sage font-bold uppercase">Stored ✓</span>}
                </div>
             </div>
           </div>
           <div className="flex flex-col justify-end gap-6">
             <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-navy/30 block ml-1">Mission Headline</label>
                <input value={teamSettings.title} onChange={e => setTeamSettings({...teamSettings, title: e.target.value})} className="w-full h-12 bg-sand rounded-2xl px-6 text-sm font-bold border border-navy/5" />
             </div>
             <button disabled={isSubmitting} onClick={handleSavePageVisuals} className="h-14 bg-navy text-sand rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
               Commit Visuals
             </button>
           </div>
        </div>
      </section>

      {/* Fleet List */}
      <section className="space-y-6">
        <h3 className="text-2xl font-serif font-bold text-navy">Verified Provider Fleet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(d => (
            <div key={d.id} className="bg-white p-6 rounded-[2.5rem] border border-navy/5 flex items-center gap-5 group hover:shadow-lg transition-all">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-sand shadow-sm shrink-0">
                <img src={d.photoUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-navy truncate">{d.name}</h4>
                <p className="text-[10px] text-sage font-bold uppercase tracking-widest truncate">{d.role}</p>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleEditProvider(d)} className="p-2 text-navy hover:text-sage">✏️</button>
                 <button onClick={() => { if(window.confirm('De-enlist provider?')) deleteDoc(doc(db, 'dispatchers', d.id)); }} className="p-2 text-red-500">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recruitment/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[1000] bg-navy/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-hidden">
          <div className="bg-[#FDFCF8] w-full max-w-2xl rounded-[2.5rem] md:rounded-[3rem] p-4 md:p-8 shadow-2xl flex flex-col h-[85dvh] md:h-auto md:max-h-[90dvh] overflow-hidden animate-in zoom-in slide-in-from-bottom-12 duration-500 relative">
            <div className="mb-4 flex justify-between items-start shrink-0 px-2 pt-1">
              <div>
                <h3 className="text-xl md:text-3xl font-serif font-bold text-navy leading-none">{editingProvider ? 'Edit Provider' : 'Recruit Provider'}</h3>
                <p className="text-[9px] text-navy/40 font-bold uppercase tracking-widest mt-1.5">{editingProvider ? 'Personnel Update' : 'Personnel Registration'}</p>
              </div>
              <button onClick={() => { setShowCreate(false); resetRecruitForm(); }} className="bg-navy/5 p-2 rounded-full hover:bg-navy/10 transition-colors">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 px-2">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'recruit-profile', label: 'Profile', key: 'profile', icon: '👤', set: setProfileFile },
                  { id: 'recruit-field', label: 'Field Photo', key: 'field', icon: '📸', set: setFieldPhotoFile },
                  { id: 'recruit-video', label: 'Working Video', key: 'video', icon: '🎥', set: setWorkingVideoFile, isVideo: true }
                ].map(item => (
                  <div key={item.id} className="flex flex-col items-center gap-1">
                    <label className="text-[7px] font-bold uppercase tracking-widest opacity-30 text-center">{item.label}</label>
                    <div onClick={() => document.getElementById(item.id)?.click()} className="w-full aspect-square md:w-24 md:h-24 rounded-[1.2rem] bg-sand flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-navy/10 relative">
                      {previews[item.key] ? (item.isVideo ? <video src={previews[item.key]} className="w-full h-full object-cover" /> : <img src={previews[item.key]} className="w-full h-full object-cover" />) : <span className="text-lg">{item.icon}</span>}
                      <input id={item.id} type="file" className="hidden" onChange={e => e.target.files?.[0] && (item.set(e.target.files[0]), handleFilePreview(e.target.files[0], item.key))} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full h-11 bg-sand rounded-xl px-4 text-xs font-bold border-none" />
                  {!editingProvider && (
                    <>
                      <input placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full h-11 bg-sand rounded-xl px-4 text-xs font-bold border-none" />
                      <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full h-11 bg-sand rounded-xl px-4 text-xs font-bold border-none" />
                    </>
                  )}
                </div>
                <div className="space-y-3">
                  <input placeholder="Role (e.g. Solar Pro)" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full h-11 bg-sand rounded-xl px-4 text-xs font-bold border-none" />
                  <div className="bg-sand rounded-xl p-3 border border-navy/5">
                    <p className="text-[7px] font-bold text-navy/30 uppercase tracking-widest mb-2">Authorizations</p>
                    <div className="grid grid-cols-1 gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                      {SERVICES.map(s => (
                        <label key={s.id} className="flex items-center gap-2 text-[9px] font-bold text-navy/60 hover:text-navy cursor-pointer">
                          <input type="checkbox" checked={form.supportedServiceIds.includes(s.id)} onChange={e => setForm({...form, supportedServiceIds: e.target.checked ? [...form.supportedServiceIds, s.id] : form.supportedServiceIds.filter(i => i !== s.id)})} className="w-3.5 h-3.5 rounded border-navy/10 text-sage" />
                          <span className="truncate">{s.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-navy/5 shrink-0 flex flex-col md:flex-row gap-2 px-2 pb-1">
              <button onClick={handleCommitProvider} disabled={isSubmitting} className="w-full md:flex-[2] bg-navy text-sand h-12 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl">
                {isSubmitting ? 'Processing...' : (editingProvider ? 'Update Provider' : 'Enlist Provider')}
              </button>
              <button onClick={() => { setShowCreate(false); resetRecruitForm(); }} className="w-full md:flex-1 h-10 text-navy/30 font-bold uppercase text-[9px] tracking-widest">Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
