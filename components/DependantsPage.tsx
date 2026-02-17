
import React, { useState, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../services/firebase';
import { Dependant, Location } from '../types';
import { LOCATIONS } from '../constants';

/**
 * Utility function to calculate age based on date of birth
 */
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
}

const DependantsPage: React.FC<DependantsPageProps> = ({ 
  dependants, 
  setDependants, 
  initialOpenForm, 
  setInitialOpenForm, 
  onNewRequestForDependant,
  onDeleteDependant,
  onAddClick
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
  
  const [medInput, setMedInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialOpenForm) {
      setShowAddForm(true);
      if (setInitialOpenForm) setInitialOpenForm(false);
    }
  }, [initialOpenForm, setInitialOpenForm]);

  const resetForm = () => {
    setFormData({ name: '', dateOfBirth: '', gender: 'Female', location: LOCATIONS[0], fullAddress: '', medicalConditions: '', medications: [], photoUrl: '' });
    setMedInput('');
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
      const userId = auth.currentUser.uid;
      const dependantId = editingDep ? editingDep.id : `dep-${Date.now()}`;
      let finalPhotoUrl = formData.photoUrl || '';

      if (selectedFile) {
        const storageRef = ref(storage, `users/${userId}/dependants/${dependantId}.jpg`);
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
        photoUrl: finalPhotoUrl || 'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=400&h=400&fit=crop'
      };

      await setDoc(doc(db, 'users', userId, 'dependants', dependantId), dependantData, { merge: true });

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

  const addMedication = () => {
    if (medInput.trim()) {
      setFormData({ ...formData, medications: [...(formData.medications || []), medInput.trim()] });
      setMedInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in slide-in-from-bottom-8 duration-500 pb-20 pt-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 py-2">
        <div className="space-y-4">
          <h2 className="text-6xl font-serif font-bold text-navy leading-none tracking-tight">My Family</h2>
          <p className="text-base text-navy/50 font-medium leading-relaxed max-w-md">
            The heart of Wasil. Manage profiles for personalized care, critical history, and immediate dispatch tracking.
          </p>
        </div>
        <button 
          onClick={onAddClick} 
          className="bg-sage text-white px-12 py-5 rounded-[2rem] font-bold shadow-2xl shadow-sage/30 hover:scale-105 hover:bg-[#7a956e] transition-all active:scale-95 text-base whitespace-nowrap flex items-center justify-center gap-3 border border-white/20"
        >
          <span className="text-2xl leading-none">+</span>
          Add Member
        </button>
      </div>

      {/* Dependants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {dependants.length === 0 ? (
          <div className="col-span-full py-28 bg-white/40 border-2 border-dashed border-navy/5 rounded-[4rem] flex flex-col items-center justify-center text-center p-12">
            <span className="text-7xl mb-8 opacity-20">🏠</span>
            <p className="text-navy/40 font-bold text-xl mb-3">Your family list is currently empty.</p>
            <p className="text-sm text-navy/20 max-w-sm mx-auto">Add members to unlock tailored care missions and high-priority tracking for your loved ones in Lebanon.</p>
          </div>
        ) : (
          dependants.map((dep) => (
            <div key={dep.id} className="bg-white rounded-[3rem] p-10 border border-navy/5 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col h-full">
              <button onClick={() => setDeleteConfirmId(dep.id)} className="absolute top-8 right-8 p-2 text-red-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Delete member">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-9xl pointer-events-none">❤️</div>
              <div className="flex items-center space-x-6 mb-10">
                <div className="w-24 h-24 rounded-[2rem] bg-sand overflow-hidden flex items-center justify-center border border-navy/5 shadow-inner">
                  {dep.photoUrl ? <img src={dep.photoUrl} alt={dep.name} className="w-full h-full object-cover" /> : <span className="text-5xl">🧓</span>}
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-navy">{dep.name}</h3>
                  <p className="text-[11px] font-bold opacity-30 mt-1">{calculateAge(dep.dateOfBirth)} years • {dep.location}</p>
                </div>
              </div>
              <div className="space-y-6 flex-grow">
                <div>
                  <p className="text-[10px] font-bold text-navy/30 mb-2">Primary address</p>
                  <p className="text-sm text-navy/70 leading-relaxed line-clamp-2">{dep.fullAddress}</p>
                </div>
                {dep.medicalConditions && (
                  <div>
                    <p className="text-[10px] font-bold text-navy/30 mb-2">Medical context</p>
                    <p className="text-sm text-red-800/60 font-medium">{dep.medicalConditions}</p>
                  </div>
                )}
              </div>
              <div className="mt-10 pt-10 border-t border-navy/5 flex justify-between items-center">
                <button onClick={() => handleEdit(dep)} className="text-[11px] font-bold text-navy/40 hover:text-navy transition-colors">Edit profile</button>
                <button onClick={() => onNewRequestForDependant(dep.id)} className="text-[11px] font-bold bg-sage text-white px-8 py-3 rounded-2xl transition-all shadow-xl shadow-sage/10 hover:bg-[#7a956e] active:scale-95">Request service →</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-8">🗑️</div>
            <h3 className="text-2xl font-serif font-bold text-navy mb-3">Delete profile?</h3>
            <p className="text-sm text-navy/40 mb-10 px-4">This action is permanent and will remove all service history associated with this member.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 text-navy/40 font-bold hover:text-navy transition-colors">Cancel</button>
              <button onClick={() => { onDeleteDependant(deleteConfirmId!); setDeleteConfirmId(null); }} className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-red-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-navy/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl flex flex-col max-h-[75vh] md:max-h-[90vh] overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 my-auto">
            <div className="px-10 py-8 shrink-0 border-b border-navy/5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-navy leading-none">{editingDep ? 'Update profile' : 'Register dependant'}</h3>
                  <p className="text-[10px] text-navy/40 font-bold mt-2">Personalize the care experience</p>
                </div>
                <button onClick={() => { setShowAddForm(false); resetForm(); }} className="p-3 text-navy/20 hover:text-navy/50 transition-colors -mr-3 bg-sand/20 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10 bg-sand/5">
              <div className="flex justify-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-28 h-28 rounded-[2rem] bg-sand border-4 border-white shadow-xl overflow-hidden relative">
                    {formData.photoUrl ? <img src={formData.photoUrl} alt="Preview" className={`w-full h-full object-cover ${isUploading ? 'opacity-30' : 'opacity-100'}`} /> : <div className="w-full h-full flex items-center justify-center text-navy/20 text-4xl">📷</div>}
                    {isUploading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin"></div></div>}
                  </div>
                  <div className="absolute inset-0 rounded-[2rem] bg-navy/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white text-[10px] font-bold">Change photo</span></div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="space-y-8">
                <div><label className="block text-[9px] font-bold text-navy/40 mb-2 ml-1">Full legal name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-12 bg-white border border-navy/5 rounded-[1.25rem] px-6 text-sm font-medium focus:ring-2 focus:ring-sage shadow-sm outline-none" placeholder="e.g. Papa Georges" /></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col relative">
                    <label className="block text-[9px] font-bold text-navy/40 mb-2 ml-1">Date of Birth</label>
                    <div className="relative">
                      {!formData.dateOfBirth && (
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 text-sm font-medium pointer-events-none">
                          Date of Birth
                        </div>
                      )}
                      <input 
                        type="date" 
                        max={new Date().toISOString().split('T')[0]}
                        value={formData.dateOfBirth || ''} 
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} 
                        className="w-full h-12 bg-white border border-navy/5 rounded-[1.25rem] px-6 text-sm font-medium focus:ring-2 focus:ring-sage shadow-sm outline-none appearance-none cursor-pointer" 
                      />
                      {formData.dateOfBirth && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-sage/10 text-sage px-3 py-1 rounded-full text-[10px] font-bold border border-sage/20 pointer-events-none whitespace-nowrap">
                          {calculateAge(formData.dateOfBirth)} years old
                        </div>
                      )}
                    </div>
                  </div>
                  <div><label className="block text-[9px] font-bold text-navy/40 mb-2 ml-1">Gender</label><select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as 'Male' | 'Female'})} className="w-full h-12 bg-white border border-navy/5 rounded-[1.25rem] px-6 text-sm font-bold focus:ring-2 focus:ring-sage shadow-sm outline-none appearance-none cursor-pointer"><option value="Female">Female</option><option value="Male">Male</option></select></div>
                </div>

                <div><label className="block text-[9px] font-bold text-navy/40 mb-2 ml-1">Area in Lebanon</label><select value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value as Location})} className="w-full h-12 bg-white border border-navy/5 rounded-[1.25rem] px-6 text-sm font-bold focus:ring-2 focus:ring-sage shadow-sm outline-none appearance-none cursor-pointer">{LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                <div><label className="block text-[9px] font-bold text-navy/40 mb-2 ml-1">Full detailed address</label><textarea value={formData.fullAddress} onChange={(e) => setFormData({...formData, fullAddress: e.target.value})} className="w-full bg-white border border-navy/5 rounded-[1.25rem] px-6 py-5 text-sm font-medium h-32 resize-none outline-none focus:ring-2 focus:ring-sage shadow-sm" placeholder="Building, Floor, Landmark, Cross-street..." /></div>
                <div><label className="block text-[9px] font-bold text-navy/40 mb-2 ml-1">Chronic medical conditions</label><input type="text" value={formData.medicalConditions} onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})} className="w-full h-12 bg-white border border-navy/5 rounded-[1.25rem] px-6 text-sm font-medium focus:ring-2 focus:ring-sage shadow-sm outline-none" placeholder="e.g. Hypertension, Diabetes Type II" /></div>
                <div><label className="block text-[9px] font-bold text-navy/40 mb-2 ml-1">Daily medications</label><div className="flex gap-3 mb-4"><input type="text" value={medInput} onChange={(e) => setMedInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addMedication()} className="flex-1 h-12 bg-white border border-navy/5 rounded-[1.25rem] px-6 text-sm font-medium focus:ring-2 focus:ring-sage shadow-sm outline-none" placeholder="Medication & Frequency" /><button onClick={addMedication} className="bg-navy text-sand h-12 px-6 rounded-[1.25rem] font-bold transition-all active:scale-95">+</button></div><div className="flex flex-wrap gap-2">{formData.medications?.map((m, i) => (<span key={i} className="bg-sage/10 text-sage text-[10px] px-4 py-2 rounded-xl border border-sage/20 flex items-center font-bold tracking-tight">{m}<button onClick={() => setFormData({...formData, medications: formData.medications?.filter((_, idx) => idx !== i)})} className="ml-2.5 opacity-40 hover:opacity-100 text-base leading-none">×</button></span>))}</div></div>
              </div>
            </div>
            <div className="px-10 py-10 border-t border-navy/5 flex gap-6 shrink-0 bg-white">
              <button disabled={isUploading} onClick={() => { setShowAddForm(false); resetForm(); }} className="flex-1 py-3 text-navy/30 font-bold hover:text-navy transition-colors text-sm disabled:opacity-30">Discard</button>
              <button disabled={isUploading} onClick={handleSaveDependant} className="flex-[2] bg-navy text-sand py-5 rounded-2xl font-bold shadow-2xl shadow-navy/10 hover:bg-navy/90 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-3 disabled:opacity-70">
                {isUploading ? (<><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Processing...</>) : (editingDep ? 'Update Profile' : 'Confirm Registration')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DependantsPage;
