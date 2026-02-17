
import React, { useState, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../services/firebase';
import { Dependant, Location } from '../types';
import { LOCATIONS } from '../constants';

const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

interface DependantsPageProps {
  dependants: Dependant[];
  setDependants: React.Dispatch<React.SetStateAction<Dependant[]>>;
  initialOpenForm?: boolean;
  setInitialOpenForm?: (val: boolean) => void;
  onNewRequestForDependant: (depId: string) => void;
  onDeleteDependant: (id: string) => void;
  onAddClick: () => void; 
  isAdminView?: boolean;
}

const DependantsPage: React.FC<DependantsPageProps> = ({ 
  dependants, 
  setDependants, 
  initialOpenForm, 
  setInitialOpenForm, 
  onNewRequestForDependant,
  onDeleteDependant,
  onAddClick,
  isAdminView = false
}) => {
  const [showAddForm, setShowAddForm] = useState(initialOpenForm || false);
  const [editingDep, setEditingDep] = useState<Dependant | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Dependant>>({
    name: '',
    dateOfBirth: '',
    gender: 'Female',
    location: LOCATIONS[0],
    fullAddress: '',
    medicalConditions: '',
    medications: [],
    photoUrl: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialOpenForm) {
      setShowAddForm(true);
      if (setInitialOpenForm) setInitialOpenForm(false);
    }
  }, [initialOpenForm, setInitialOpenForm]);

  const resetForm = () => {
    setFormData({ name: '', dateOfBirth: '', gender: 'Female', location: LOCATIONS[0], fullAddress: '', medicalConditions: '', medications: [], photoUrl: '' });
    setSelectedFile(null);
    setEditingDep(null);
  };

  const handleEdit = (dep: Dependant) => {
    setEditingDep(dep);
    setFormData({ ...dep });
    setShowAddForm(true);
  };

  const handleSaveDependant = async () => {
    if (!formData.name || !auth.currentUser) return;
    
    try {
      setIsUploading(true);
      const currentUid = auth.currentUser.uid;
      // Target UID is either the owner (if admin view) or the current user
      const targetUserId = (isAdminView && editingDep?.userId) ? editingDep.userId : currentUid;
      const dependantId = editingDep ? editingDep.id : `dep-${Date.now()}`;
      
      let finalPhotoUrl = formData.photoUrl || '';
      if (selectedFile) {
        const storageRef = ref(storage, `users/${targetUserId}/dependants/${dependantId}.jpg`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        finalPhotoUrl = await getDownloadURL(snapshot.ref);
      }

      const dependantData: Dependant = {
        id: dependantId,
        name: formData.name!,
        dateOfBirth: formData.dateOfBirth || '',
        gender: (formData.gender as 'Male' | 'Female') || 'Female',
        location: (formData.location as Location) || LOCATIONS[0],
        fullAddress: formData.fullAddress || '',
        medicalConditions: formData.medicalConditions || '',
        medications: formData.medications || [],
        photoUrl: finalPhotoUrl || 'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=400&h=400&fit=crop',
        userId: targetUserId,
        userName: editingDep?.userName || (isAdminView ? 'Expat Member' : auth.currentUser.displayName || 'Unknown')
      };

      await setDoc(doc(db, `users/${targetUserId}/dependants/${dependantId}`), dependantData, { merge: true });
      
      // Also sync to global collection if in use
      await setDoc(doc(db, `global_dependants/${dependantId}`), dependantData, { merge: true });

      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error("Save Dependant Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, photoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 md:space-y-16 animate-in slide-in-from-bottom-8 duration-500 pb-28 md:pb-20 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 py-2">
        <div className="space-y-4">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-navy leading-none tracking-tight">
            {isAdminView ? 'Global Family' : 'My Family'}
          </h2>
          <p className="text-sm md:text-base text-navy/50 font-medium leading-relaxed max-w-md">
            {isAdminView ? 'HQ management of all family profiles across the Wasil network.' : 'The heart of Wasil. Manage profiles for personalized care.'}
          </p>
        </div>
        {!isAdminView && (
          <button onClick={onAddClick} className="w-full md:w-auto bg-sage text-white px-10 py-5 rounded-[2rem] font-bold shadow-2xl hover:scale-105 transition-all text-base flex items-center justify-center gap-3">
            <span className="text-2xl leading-none">+</span> Add Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
        {dependants.length === 0 ? (
          <div className="col-span-full py-20 bg-white/40 border-2 border-dashed border-navy/5 rounded-[3rem] text-center p-8">
            <span className="text-6xl mb-6 opacity-20">🏠</span>
            <p className="text-navy/40 font-bold text-lg">No records.</p>
          </div>
        ) : (
          dependants.map((dep) => (
            <div key={dep.id} className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-navy/5 shadow-sm group hover:shadow-xl transition-all relative flex flex-col h-full overflow-hidden">
              <button 
                onClick={() => { if(isAdminView || window.confirm('Delete profile?')) onDeleteDependant(dep.id); }} 
                className="absolute top-6 right-6 p-2 text-red-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              
              <div className="flex items-center space-x-5 md:space-x-6 mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-sand overflow-hidden border border-navy/5 shrink-0">
                  {dep.photoUrl ? <img src={dep.photoUrl} alt={dep.name} className="w-full h-full object-cover" /> : <span className="text-3xl flex h-full items-center justify-center">🧓</span>}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-navy truncate">{dep.name}</h3>
                  <p className="text-[10px] font-bold opacity-30 mt-1 uppercase tracking-widest">{calculateAge(dep.dateOfBirth)} yrs • {dep.location}</p>
                  {isAdminView && dep.userName && <div className="mt-2 text-[8px] bg-navy/5 text-navy/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Expat: {dep.userName}</div>}
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 flex-grow">
                <div>
                  <p className="text-[9px] font-bold text-navy/30 mb-1 uppercase tracking-widest">Location</p>
                  <p className="text-xs text-navy/70 leading-relaxed line-clamp-2">{dep.fullAddress}</p>
                </div>
                {dep.medicalConditions && (
                  <div>
                    <p className="text-[9px] font-bold text-navy/30 mb-1 uppercase tracking-widest">Medical Context</p>
                    <p className="text-xs text-red-800/60 font-medium">{dep.medicalConditions}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-navy/5 flex justify-between items-center">
                <button onClick={() => handleEdit(dep)} className="text-[10px] font-bold text-navy/40 hover:text-navy uppercase tracking-widest">Edit Profile</button>
                {!isAdminView && <button onClick={() => onNewRequestForDependant(dep.id)} className="text-[10px] font-bold bg-sage text-white px-6 py-2.5 rounded-2xl shadow-lg">Request Service →</button>}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-navy/60 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl flex flex-col h-[85vh] overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="px-6 py-6 shrink-0 border-b border-navy/5 flex justify-between items-center">
              <h3 className="text-2xl font-serif font-bold text-navy">{editingDep ? 'Update Profile' : 'Register Member'}</h3>
              <button onClick={() => { setShowAddForm(false); resetForm(); }} className="p-2 bg-sand/20 rounded-full">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 bg-sand/5">
              <div className="flex justify-center">
                <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-[1.5rem] bg-sand border-4 border-white shadow-xl overflow-hidden">
                    {formData.photoUrl ? <img src={formData.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">📷</div>}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="space-y-6">
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-11 bg-white border border-navy/5 rounded-xl px-4 text-sm" placeholder="Full legal name" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full h-11 bg-white border border-navy/5 rounded-xl px-4 text-sm" />
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as 'Male' | 'Female'})} className="w-full h-11 bg-white border border-navy/5 rounded-xl px-4 text-sm"><option value="Female">Female</option><option value="Male">Male</option></select>
                </div>
                <select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value as Location})} className="w-full h-11 bg-white border border-navy/5 rounded-xl px-4 text-sm">{LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                <textarea value={formData.fullAddress} onChange={(e) => setFormData({...formData, fullAddress: e.target.value})} className="w-full bg-white border border-navy/5 rounded-xl px-4 py-3 text-sm h-24 resize-none" placeholder="Detailed Address..." />
                <input type="text" value={formData.medicalConditions} onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})} className="w-full h-11 bg-white border border-navy/5 rounded-xl px-4 text-sm" placeholder="Medical conditions" />
              </div>
            </div>
            <div className="px-6 py-6 border-t border-navy/5 flex gap-4 bg-white">
              <button onClick={() => { setShowAddForm(false); resetForm(); }} className="flex-1 text-navy/30 font-bold uppercase text-xs">Cancel</button>
              <button disabled={isUploading} onClick={handleSaveDependant} className="flex-[2] bg-navy text-sand py-4 rounded-2xl font-bold text-xs uppercase shadow-xl">{isUploading ? 'Saving...' : 'Commit Profile'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DependantsPage;
