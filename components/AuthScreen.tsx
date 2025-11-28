import React, { useState } from 'react';
import { Smartphone, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  
  // Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phoneNumber.length < 3) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if user exists in Supabase
      const existingProfile = await supabaseService.getProfileByPhone(phoneNumber);
      
      // In this flow, we allow both login (if exists) and implicit signup (if not)
      // The actual creation happens after verification for security in real apps,
      // but here we just check presence to maybe tailor the UI or debug.
      // For now, we just proceed to OTP step to simulate security.
      
      setStep('OTP');
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setIsLoading(true);

    try {
      // Verification Logic (Simulated OTP)
      if (otp === '1234' || otp.length === 4) { 
        // 1. Try to get existing profile
        let profile = await supabaseService.getProfileByPhone(phoneNumber);
        
        // 2. If not exists, create new
        if (!profile) {
          profile = await supabaseService.createProfile(phoneNumber);
        }

        if (profile) {
          onLoginSuccess(profile);
        } else {
          setError('Failed to retrieve or create profile.');
        }
      } else {
        setError('Invalid code. Try 1234.');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      
      {/* Background FX */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-600 rounded-full blur-[128px] opacity-20" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-emerald-600 rounded-full blur-[128px] opacity-20" />

      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8 relative z-10">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">NutriChat Login</h1>
          <p className="text-slate-400 text-sm">
            {step === 'PHONE' ? 'Enter your phone to continue' : 'Verify your number'}
          </p>
        </div>

        {step === 'PHONE' ? (
          <form onSubmit={handleSendCode} className="space-y-5">
             <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-3 pl-4 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-white placeholder:text-slate-600 transition-all"
                  placeholder="+1 (555) 000-0000"
                  autoFocus
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">{error}</div>}

            <button
              type="submit"
              disabled={isLoading || !phoneNumber}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Code <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-4 text-center">
                Enter the 4-digit code sent to <span className="text-indigo-400">{phoneNumber}</span>
              </label>
              <div className="flex justify-center gap-3">
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-32 p-3 text-center text-2xl tracking-[0.5em] bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none text-white font-mono transition-all"
                  placeholder="0000"
                  autoFocus
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">{error}</div>}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading || otp.length !== 4}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Login <ShieldCheck className="w-4 h-4" /></>}
              </button>
              
              <button 
                type="button"
                onClick={() => { setStep('PHONE'); setError(''); }}
                className="w-full text-xs text-slate-500 hover:text-slate-300 py-2"
              >
                Change phone number
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;