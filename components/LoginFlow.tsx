import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { User } from '../types';
import Logo from './Logo';
import CreateAccount from './CreateAccount';

interface LoginFlowProps {
  onLogin: (userData: User) => void;
  onBrowseGuest?: () => void;
}

const LoginFlow: React.FC<LoginFlowProps> = ({ onBrowseGuest }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    setInfoMessage('');
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setInfoMessage('Check your inbox for password reset instructions.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Could not send reset email. Try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError('');
    setInfoMessage('');
    
    if (!formData.email || !formData.password) {
      setError('Enter credentials.');
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      if (!userCredential.user.emailVerified) {
        setError('Please verify your email.');
        await signOut(auth);
        return;
      }
    } catch (err: any) {
      setError('Invalid login credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-sage overflow-y-auto p-4 safe-bottom">
      <div className="w-full max-w-sm animate-in fade-in zoom-in duration-700">
        
        <div className="flex flex-col items-center mb-6">
          <Logo className="h-auto w-[220px]" />
          <div className="text-center">
            <h1 className="text-white font-serif text-5xl font-bold tracking-tighter">Wasil</h1>
            <p className="text-white/60 uppercase tracking-[0.2em] text-[10px] font-bold">Supporting home, from anywhere.</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-2xl space-y-4">
          {mode === 'REGISTER' ? (
            <CreateAccount 
              onSuccess={() => {
                setMode('LOGIN');
                setInfoMessage("Verification email sent! Verify to sign in.");
              }} 
              onBack={() => setMode('LOGIN')} 
            />
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-xl font-serif font-bold text-navy">
                  {mode === 'LOGIN' ? 'Welcome Back' : 'Reset Password'}
                </h2>
                {mode === 'FORGOT_PASSWORD' && (
                  <p className="text-[10px] text-navy/40 font-bold mt-2">Enter your email to receive a reset link</p>
                )}
              </div>

              {error && <div className="bg-red-50 text-red-600 text-[10px] p-2 rounded-lg text-center font-bold border border-red-100">{error}</div>}
              {infoMessage && <div className="bg-sage/10 text-sage text-[10px] p-2 rounded-lg text-center font-bold">{infoMessage}</div>}

              <div className="space-y-3">
                {mode === 'LOGIN' ? (
                  <>
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full h-11 bg-sand rounded-xl px-4 text-xs outline-none focus:ring-1 focus:ring-sage border border-navy/5" />
                    <div className="space-y-1">
                      <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full h-11 bg-sand rounded-xl px-4 text-xs outline-none focus:ring-1 focus:ring-sage border border-navy/5" />
                      <div className="flex justify-end px-1">
                        <button 
                          onClick={() => { setMode('FORGOT_PASSWORD'); setError(''); setInfoMessage(''); }}
                          className="text-[9px] font-bold text-navy/40 hover:text-sage transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="w-full h-11 bg-sand rounded-xl px-4 text-xs outline-none focus:ring-1 focus:ring-sage border border-navy/5" />
                )}

                <button 
                  onClick={mode === 'LOGIN' ? handleSignIn : handleResetPassword} 
                  disabled={isLoading} 
                  className="w-full h-12 bg-navy text-sand rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                >
                  {isLoading ? '...' : (mode === 'LOGIN' ? 'Sign In' : 'Send Reset Link')}
                </button>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                      setError('');
                      setInfoMessage('');
                    }} 
                    className="text-sage font-bold text-[10px] uppercase tracking-widest text-center"
                  >
                    {mode === 'LOGIN' ? "Create Account" : "Back to Login"}
                  </button>
                  
                  {onBrowseGuest && mode === 'LOGIN' && (
                    <button 
                      onClick={onBrowseGuest}
                      className="text-navy/40 font-bold text-[10px] uppercase tracking-widest text-center border-t border-navy/5 pt-2 mt-2"
                    >
                      Browse as Guest
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginFlow;