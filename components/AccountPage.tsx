
import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../services/firebase';
import { User, Language } from '../types';

interface AccountPageProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  onLogout: () => void;
  onAddPayment: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
}

type ModalType = 'SUPPORT' | 'REPORT' | 'FAQ' | 'REFER' | 'ABOUT' | null;

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

const AccountPage: React.FC<AccountPageProps> = ({ user, setUser, onLogout, onAddPayment, language, setLanguage }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'SUPPORT' as ModalType, label: 'Get Support', icon: '🎧', sub: 'Concierge help' },
    { id: 'REPORT' as ModalType, label: 'Report Incident', icon: '⚠️', sub: 'Urgent issues', color: 'text-red-500' },
    { id: 'FAQ' as ModalType, label: 'FAQ', icon: '📖', sub: 'Common questions' },
    { id: 'REFER' as ModalType, label: 'Refer a Friend', icon: '🎁', sub: 'Earn credits' },
    { id: 'ABOUT' as ModalType, label: 'About Wasil', icon: 'ℹ️', sub: 'App info & soul' },
  ];

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    try {
      setIsUploading(true);
      
      const userId = auth.currentUser.uid;
      const storageRef = ref(storage, `users/${userId}/profile_pic.jpg`);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { photoUrl: downloadURL }, { merge: true });

      setUser({ ...user, photoUrl: downloadURL });
      
    } catch (error) {
      console.error("Profile Upload Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        address: user.address,
        dateOfBirth: user.dateOfBirth || ''
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Save Profile Error:", error);
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-700 pb-12 space-y-6">
      <div className="flex flex-col items-center pt-8 pb-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-sand transition-transform group-hover:scale-105 duration-500 relative">
            <img src={user.photoUrl} alt={user.name} className={`w-full h-full object-cover ${isUploading ? 'opacity-30' : 'opacity-100'}`} />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-navy/20 border-t-navy rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <button 
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-navy text-sand p-2 rounded-full border-2 border-white shadow-lg active:scale-90 transition-transform disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleProfileImageUpload} 
          />
        </div>
        <h2 className="text-3xl font-serif font-bold text-navy mt-6 mb-1">{user.name}</h2>
        <button 
          onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          className="text-[11px] font-bold text-sage uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="px-6">
        <div className="bg-white/50 p-1.5 rounded-2xl flex border border-navy/5 shadow-inner">
          {[
            { id: 'en', label: 'English' },
            { id: 'fr', label: 'Français' },
            { id: 'ar', label: 'العربية' }
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id as Language)}
              className={`flex-1 py-3 rounded-xl text-[11px] font-bold transition-all duration-300 ${
                language === lang.id 
                  ? 'bg-navy text-sand shadow-lg' 
                  : 'text-navy/40 hover:text-navy'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-navy/5 space-y-4">
          <DetailItem label="Full Name" value={user.name} isEditing={isEditing} onChange={(v) => setUser({...user, name: v})} />
          <DetailItem label="Email" value={user.email} isEditing={isEditing} onChange={(v) => setUser({...user, email: v})} />
          <DetailItem 
            label="Date of Birth" 
            value={user.dateOfBirth || ''} 
            isEditing={isEditing} 
            type="date"
            onChange={(v) => setUser({...user, dateOfBirth: v})} 
          />
          <DetailItem label="Phone" value={user.phone} isEditing={isEditing} onChange={(v) => setUser({...user, phone: v})} />
          <DetailItem label="Country" value={user.country} isEditing={isEditing} onChange={(v) => setUser({...user, country: v})} />
          <DetailItem label="Home Address" value={user.address} isEditing={isEditing} onChange={(v) => setUser({...user, address: v})} />
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-navy/5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">Payment Methods</h4>
            <button onClick={onAddPayment} className="text-[10px] font-bold text-sage uppercase tracking-widest hover:underline">+ Add</button>
          </div>
          <div className="flex items-center gap-3 bg-sand/20 p-4 rounded-2xl border border-navy/5">
            <span className="text-xl">💳</span>
            <div>
              <p className="text-sm font-bold text-navy">Visa ending in 4242</p>
              <p className="text-[10px] text-navy/40">Expires 12/26</p>
            </div>
            <span className="ml-auto text-[8px] bg-sage/10 text-sage px-2 py-1 rounded-full font-bold uppercase">Default</span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-2">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveModal(item.id)}
            className="w-full group flex items-center justify-between py-5 px-6 bg-white rounded-3xl border border-transparent hover:border-navy/5 hover:bg-white/80 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-5">
              <span className={`text-2xl ${item.color || 'text-navy'} opacity-80`}>{item.icon}</span>
              <div className="text-left">
                <p className={`text-sm font-bold text-navy leading-none mb-1`}>{item.label}</p>
                <p className="text-[10px] text-navy/30 uppercase tracking-widest font-bold">{item.sub}</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-navy/10 group-hover:text-navy/30 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      <div className="mt-6 px-10 text-center">
        <button 
          onClick={onLogout}
          className="text-xs font-bold text-red-400 hover:text-red-500 uppercase tracking-[0.3em] transition-colors"
        >
          Logout Session
        </button>
        <p className="text-[8px] text-navy/20 font-bold uppercase tracking-[0.4em] mt-6">Made with ❤️ for the Diaspora</p>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center transition-all duration-500">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeModal} />
          
          <div className="relative w-full max-w-2xl bg-[#FDFCF8] rounded-t-[3rem] shadow-2xl flex flex-col h-[90vh] animate-in slide-in-from-bottom-full duration-500 ease-out overflow-hidden">
            <div className="p-8 pb-4 border-b border-navy/5 flex justify-between items-center shrink-0">
               <h3 className="text-xl font-serif font-bold text-navy">
                 {activeModal === 'REPORT' && 'Report Incident'}
                 {activeModal === 'SUPPORT' && 'Get Support'}
                 {activeModal === 'FAQ' && 'FAQ'}
                 {activeModal === 'REFER' && 'Refer a Friend'}
                 {activeModal === 'ABOUT' && 'About Wasil'}
               </h3>
               <button onClick={closeModal} className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-all">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-8 pb-32">
              {activeModal === 'REPORT' && <ReportModalContent onComplete={closeModal} />}
              {activeModal === 'SUPPORT' && <SupportModalContent />}
              {activeModal === 'FAQ' && <FAQModalContent />}
              {activeModal === 'REFER' && <ReferModalContent />}
              {activeModal === 'ABOUT' && <AboutModalContent />}
              <div className="h-24 md:h-12" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string; isEditing: boolean; type?: string; onChange: (v: string) => void }> = ({ label, value, isEditing, type = "text", onChange }) => (
  <div className="flex flex-col border-b border-navy/5 pb-2 last:border-0 last:pb-0">
    <div className="flex justify-between items-center mb-1">
      <span className="text-[8px] uppercase font-bold text-navy/30 tracking-widest">{label}</span>
      {label === "Date of Birth" && value && !isEditing && (
        <span className="text-[9px] bg-sage/10 text-sage px-2 py-0.5 rounded-full font-bold border border-sage/20">
          {calculateAge(value)} years old
        </span>
      )}
    </div>
    {isEditing ? (
      <div className="relative">
        {type === "date" && !value && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-navy/20 text-[10px] font-bold pointer-events-none">
            Date of Birth
          </div>
        )}
        <input 
          type={type} 
          value={value} 
          max={type === "date" ? new Date().toISOString().split('T')[0] : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs font-bold text-navy bg-sand/30 px-2 py-1.5 rounded-lg focus:ring-1 focus:ring-sage outline-none border border-navy/5 w-full appearance-none"
        />
      </div>
    ) : (
      <span className="text-sm font-bold text-navy">{value || 'Not provided'}</span>
    )}
  </div>
);

const ReportModalContent: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [submitted, setSubmitted] = useState(false);
  
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-500 py-12">
        <div className="w-20 h-20 bg-sage rounded-full flex items-center justify-center text-navy mb-6 text-3xl">✓</div>
        <h4 className="text-2xl font-serif font-bold text-navy mb-2">We're on it.</h4>
        <p className="text-navy/60 text-sm max-w-xs">A manager will call you shortly to resolve this priority report.</p>
        <button onClick={onComplete} className="mt-8 text-navy font-bold underline">Close</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <p className="text-[10px] uppercase font-bold text-navy/40 tracking-widest mb-4">What happened?</p>
      <div className="grid grid-cols-2 gap-4">
        {['Scout No-Show', 'Damaged Item', 'Safety Concern', 'Other'].map(item => (
          <button key={item} className="p-6 bg-sand/30 rounded-3xl text-sm font-bold text-navy border border-navy/5 hover:bg-sand transition-all text-center">
            {item}
          </button>
        ))}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-navy/40 tracking-widest mb-2">Add Details</p>
        <textarea 
          placeholder="Describe the incident..."
          className="w-full bg-navy/5 border-none rounded-[2rem] p-6 text-sm text-navy placeholder:text-navy/20 focus:ring-2 focus:ring-red-200 outline-none h-40 resize-none"
        />
      </div>
      <button 
        onClick={() => setSubmitted(true)}
        className="w-full py-5 bg-red-500 text-white rounded-[2rem] font-bold shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-95"
      >
        Submit Priority Report
      </button>
    </div>
  );
};

const SupportModalContent: React.FC = () => (
  <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
    <div className="bg-sand/30 p-8 rounded-[2.5rem] border border-navy/5">
      <p className="text-[10px] uppercase font-bold text-navy/40 tracking-widest mb-4">Recent Mission</p>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-serif font-bold text-navy text-lg">Battery Health Check</h4>
          <p className="text-xs text-navy/40">Completed Oct 24 • Mama Layla</p>
        </div>
        <button className="text-[10px] font-bold text-sage underline uppercase tracking-widest">Help with this?</button>
      </div>
    </div>

    <div className="space-y-4">
      <p className="text-[10px] uppercase font-bold text-navy/40 tracking-widest">Common Topics</p>
      {['Billing', 'Account Access', 'App Issues'].map(topic => (
        <button key={topic} className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border border-navy/5 hover:border-navy/10 transition-all">
          <span className="text-sm font-bold text-navy">{topic}</span>
          <svg className="w-4 h-4 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      ))}
    </div>

    <div className="flex flex-col gap-4">
      <button className="w-full py-5 bg-sage text-navy rounded-[2rem] font-bold shadow-lg active:scale-95 transition-transform">Chat with Support</button>
      <button className="w-full py-5 border-2 border-navy text-navy rounded-[2rem] font-bold active:scale-95 transition-transform">Email Us</button>
    </div>
  </div>
);

const FAQModalContent: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: "How do I pay?", a: "We accept Transfer, Wish Money, and major credit cards via Stripe." },
    { q: "Can I schedule recurring care?", a: "Yes, you can set up weekly or monthly missions in the Mission Manager." },
    { q: "Are the scouts background checked?", a: "Every scout is personally vetted, background-checked, and trained by the Wasil team." },
    { q: "How fast is a critical response?", a: "Critical missions are dispatched within 15 minutes of confirmation." }
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-navy/5 rounded-full px-6 py-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" placeholder="Search for answers..." className="bg-transparent border-none focus:ring-0 text-sm flex-1 placeholder:text-navy/20" />
      </div>

      <div className="divide-y divide-navy/5">
        {faqs.map((faq, i) => (
          <div key={i} className="py-6">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-sm font-bold text-navy pr-8">{faq.q}</span>
              <svg className={`w-4 h-4 text-navy/20 transition-transform ${openIndex === i ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            {openIndex === i && (
              <p className="mt-4 text-sm text-navy/60 leading-relaxed animate-in slide-in-from-top-2 duration-300">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ReferModalContent: React.FC = () => (
  <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500 py-4">
    <div className="w-48 h-48 bg-sand/20 rounded-full flex items-center justify-center mb-8">
      <span className="text-7xl">🎁</span>
    </div>
    <h4 className="text-2xl font-serif font-bold text-navy mb-4">Sharing is Caring</h4>
    <p className="text-navy/60 text-sm max-w-xs mb-10 leading-relaxed">
      Help another family bridge the distance. Invite them to join Wasil and share the peace of mind.
    </p>

    <div className="w-full border-2 border-dashed border-navy/10 rounded-3xl p-6 flex items-center justify-between mb-8 bg-sand/5">
      <span className="text-2xl font-mono font-bold text-navy tracking-widest">MICHEL2026</span>
      <button className="text-[10px] font-bold text-sage uppercase tracking-widest hover:underline">Copy Code</button>
    </div>

    <button className="w-full py-5 bg-navy text-sand rounded-[2rem] font-bold shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
      <span>Share Link</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
    </button>
  </div>
);

const AboutModalContent: React.FC = () => (
  <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500 pb-12">
    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 overflow-hidden shadow-xl border border-navy/5">
      <img src="https://i.postimg.cc/ZqLwz2HD/Gemini-Generated-Image-7cyjdz7cyjdz7cyj.png" className="w-20 h-20 object-contain" alt="Wasil" />
    </div>
    
    <h4 className="text-3xl font-serif font-bold text-navy mb-1">Wasil</h4>
    <p className="text-navy/30 text-xs font-bold uppercase tracking-widest mb-6">Version 1.0.0</p>
    
    <p className="text-sm text-navy/70 leading-relaxed max-w-sm mb-10 px-4">
      Wasil is a high-end service concierge designed specifically for the Lebanese diaspora. 
      We offer a trusted link to your home, ensuring your family's needs are met with precision, 
      safety, and a deep sense of care. From technical support to daily essentials, we manage it all 
      so you can focus on what matters most—staying connected.
    </p>
    
    <div className="w-full space-y-6 mb-12 border-t border-navy/5 pt-8">
      <button className="text-sm font-bold text-navy hover:underline block w-full">Terms of Service</button>
      <button className="text-sm font-bold text-navy hover:underline block v-full">Privacy Policy</button>
    </div>

    <div className="flex gap-8 pb-4">
      {['Instagram', 'TikTok'].map(platform => (
        <button key={platform} className="text-[10px] font-bold text-navy/40 uppercase tracking-widest hover:text-navy transition-colors">
          {platform}
        </button>
      ))}
    </div>
  </div>
);

export default AccountPage;
