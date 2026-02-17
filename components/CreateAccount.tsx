
import React, { useState, useMemo, useRef } from 'react';
import { 
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../services/firebase';
import { COUNTRIES } from '../constants';
import { SubscriptionTier } from '../types';

interface CreateAccountProps {
  onSuccess: () => void;
  onBack: () => void;
}

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

const CreateAccount: React.FC<CreateAccountProps> = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: COUNTRIES[0].name,
    city: COUNTRIES[0].cities[0],
    address: ''
  });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = useMemo(() => emailRegex.test(formData.email), [formData.email]);

  const selectedCountry = useMemo(() => {
    return COUNTRIES.find(c => c.name === formData.country) || COUNTRIES[0];
  }, [formData.country]);

  const validatePassword = (pass: string) => {
    const hasUppercase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const isLongEnough = pass.length >= 8;
    return hasUppercase && hasNumber && isLongEnough;
  };

  const validateStep1 = () => {
    setError('');
    const { name, email, phone, country, city, address, dateOfBirth } = formData;

    if (!name || !email || !phone || !country || !city || !address || !dateOfBirth) {
      setError('Please fill in all personal details.');
      return false;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (phone.length < 8 || phone.length > 15 || !/^\d+$/.test(phone)) {
      setError('Please enter a valid phone number.');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    setError('');
    const { password, confirmPassword } = formData;

    if (!validatePassword(password)) {
      setError('Password is too weak. Min 8 chars, 1 uppercase, 1 number.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleToSecurityStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleCreateAccount = async () => {
    if (!validateStep2()) return;
    
    setIsLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      setStep(3);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered.');
      } else {
        setError(err.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async (skipPhoto = false) => {
    const user = auth.currentUser;
    if (!user) return;

    setIsLoading(true);
    try {
      let photoUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop';

      if (!skipPhoto && selectedFile) {
        const storageRef = ref(storage, `users/${user.uid}/profile_pic.jpg`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      await updateProfile(user, { 
        displayName: formData.name,
        photoURL: photoUrl
      });

      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        phone: `${selectedCountry.code} ${formData.phone}`,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        photoUrl: photoUrl,
        plan: 'Basic' as SubscriptionTier,
        role: 'user',
        createdAt: serverTimestamp()
      });

      await sendEmailVerification(user);
      await signOut(auth);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-500 max-w-full">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-navy">
          {step === 1 ? 'Personal Details' : step === 2 ? 'Security' : 'Add a Photo'}
        </h2>
        <div className="flex justify-center gap-1 mt-2">
           {[1, 2, 3].map(s => (
             <div key={s} className={`h-1 w-6 rounded-full ${step === s ? 'bg-sage' : 'bg-navy/10'}`} />
           ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-[10px] p-2 rounded-xl text-center font-bold border border-red-100">{error}</div>}

      {step === 1 && (
        <div className="space-y-3">
          <input 
            name="name" 
            type="text" 
            placeholder="Full Legal Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            className="w-full h-11 bg-sand rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-sage border border-navy/5" 
          />
          
          <div className="space-y-1">
            <div className="relative">
              <input 
                name="email" 
                type="email" 
                placeholder="Email Address" 
                value={formData.email} 
                onBlur={() => setEmailTouched(true)}
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className={`w-full h-11 bg-sand rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-sage border transition-colors ${
                  emailTouched && !isEmailValid ? 'border-red-500' : 'border-navy/5'
                }`} 
              />
              {isEmailValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sage animate-in fade-in zoom-in duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {emailTouched && !isEmailValid && (
              <p className="text-[10px] text-red-500 font-bold ml-1">Please enter a valid email address.</p>
            )}
          </div>

          <div className="relative">
            {!formData.dateOfBirth && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20 text-xs font-medium pointer-events-none">
                Date of Birth
              </div>
            )}
            <input 
              type="date" 
              max={new Date().toISOString().split('T')[0]}
              value={formData.dateOfBirth} 
              onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} 
              className="w-full h-11 bg-sand rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-sage border border-navy/5 appearance-none cursor-pointer"
            />
            {formData.dateOfBirth && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-sage/10 text-sage px-2 py-0.5 rounded-full text-[9px] font-bold border border-sage/20 pointer-events-none">
                {calculateAge(formData.dateOfBirth)} yrs
              </div>
            )}
          </div>
          
          <div className="w-full h-11 bg-sand rounded-xl border border-navy/5 flex items-center overflow-hidden focus-within:ring-1 focus-within:ring-sage transition-all">
            <div className="px-3 md:px-4 text-[11px] font-bold text-navy/40 border-r border-navy/10 whitespace-nowrap bg-navy/5 h-full flex items-center">
              {selectedCountry.code}
            </div>
            <input 
              name="phone" 
              type="tel" 
              placeholder="Phone Number" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
              className="flex-1 h-full bg-transparent px-4 text-sm outline-none placeholder:text-navy/20" 
            />
          </div>

          <div className="relative">
            <select 
              name="country" 
              value={formData.country} 
              onChange={e => setFormData({...formData, country: e.target.value, city: (COUNTRIES.find(c => c.name === e.target.value)?.cities[0] || '')})} 
              className="w-full h-11 bg-sand rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-sage border border-navy/5 appearance-none font-medium text-navy/80"
            >
              {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {formData.country === 'Lebanon' ? (
            <div className="relative">
              <select 
                name="city" 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
                className="w-full h-11 bg-sand rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-sage border border-navy/5 appearance-none font-medium text-navy/80"
              >
                {selectedCountry.cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          ) : (
            <input 
              name="city" 
              placeholder="City" 
              value={formData.city} 
              onChange={e => setFormData({...formData, city: e.target.value})} 
              className="w-full h-11 bg-sand rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-sage border border-navy/5" 
            />
          )}

          <input 
            name="address" 
            placeholder="Full Street Address" 
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})} 
            className="w-full h-11 bg-sand rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-sage border border-navy/5" 
          />

          <button 
            onClick={handleToSecurityStep} 
            disabled={!isEmailValid || !formData.name || !formData.phone || !formData.address || !formData.dateOfBirth}
            className="w-full h-12 bg-navy text-sand rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl mt-2 disabled:opacity-50"
          >
            Next: Security
          </button>
          
          <button onClick={onBack} className="w-full text-navy/40 font-bold text-[10px] uppercase tracking-widest text-center py-2">
            Back to Sign In
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-3">
            <input 
              name="password" 
              type="password" 
              placeholder="Create Password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className="w-full h-12 bg-sand rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-sage border border-navy/5" 
            />
            <input 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirm Password" 
              value={formData.confirmPassword} 
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
              className="w-full h-12 bg-sand rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-sage border border-navy/5" 
            />
            <div className="bg-sand/50 p-4 rounded-xl border border-navy/5">
              <p className="text-[10px] uppercase font-bold text-navy/40 mb-2 tracking-widest">Password Checklist</p>
              <ul className="text-[11px] font-bold space-y-1.5">
                <li className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-sage' : 'text-navy/20'}`}>
                  <div className={`w-1 h-1 rounded-full ${formData.password.length >= 8 ? 'bg-sage' : 'bg-navy/20'}`} />
                  Minimum 8 characters
                </li>
                <li className={`flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-sage' : 'text-navy/20'}`}>
                  <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-sage' : 'bg-navy/20'}`} />
                  One uppercase letter
                </li>
                <li className={`flex items-center gap-2 ${/[0-9]/.test(formData.password) ? 'text-sage' : 'text-navy/20'}`}>
                  <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-sage' : 'bg-navy/20'}`} />
                  One numerical digit
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={handleCreateAccount} 
              disabled={isLoading || !validateStep2()} 
              className="w-full h-12 bg-navy text-sand rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-xl"
            >
              {isLoading ? 'Processing...' : 'Create Account'}
            </button>
            <button 
              onClick={() => setStep(1)} 
              className="w-full text-navy/40 font-bold text-[10px] uppercase tracking-widest text-center"
            >
              Back to Details
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center space-y-6 py-2 animate-in zoom-in duration-500">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-40 h-40 rounded-full border-4 border-dashed border-navy/10 flex items-center justify-center cursor-pointer overflow-hidden relative group bg-sand shadow-inner"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <span className="text-4xl">📷</span>
                <p className="text-[10px] font-bold text-navy/30 uppercase mt-2 tracking-tighter">Tap to upload</p>
              </div>
            )}
            <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-bold uppercase">Change</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

          <div className="w-full space-y-3">
            <button 
              onClick={() => handleFinish()} 
              disabled={isLoading || !selectedFile} 
              className="w-full h-12 bg-navy text-sand rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-xl"
            >
              {isLoading ? 'Finalizing...' : 'Upload & Finish'}
            </button>
            <button 
              onClick={() => handleFinish(true)} 
              disabled={isLoading}
              className="w-full h-12 text-navy/40 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy/5 transition-all text-center"
            >
              Skip for Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccount;
