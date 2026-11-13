import React, { useState } from 'react';
import { Fingerprint, ArrowRight, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onCancel }) => {
  const [authMode, setAuthMode] = useState<'passkey' | 'credentials'>('passkey');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [nameInput, setNameInput] = useState('');
  const [idInput, setIdInput] = useState('');

  const handlePasskeyAuth = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess({
        name: 'Dr. Varadharaj',
        role: 'Dermatology Specialist',
        institution: 'ISIC Archive Hub',
        avatarLetter: 'V',
      });
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess({
        name: nameInput.trim() || 'Clinical Fellow',
        role: authTab === 'signin' ? 'Registered Clinician' : 'New Investigator',
        institution: idInput.trim() || 'Dermatology AI Lab',
        avatarLetter: (nameInput.trim() || 'C')[0].toUpperCase(),
      });
    }, 350);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-white">
      {/* Subtle ambient blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#0071e3]/[0.05] to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* Back navigation */}
        <div className="w-full flex justify-start mb-6">
          <button
            id="auth-back-button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Home</span>
          </button>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl p-8 sm:p-10 bg-[#fbfbfd] border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center">
          {/* Luminous Key Symbol */}
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-white border border-black/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex items-center justify-center text-[#0071e3]">
            <Fingerprint className="w-7 h-7 stroke-[1.8]" />
          </div>

          {/* Grand Minimal Typography */}
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-1">
            {authTab === 'signin' ? 'Enter ACN' : 'Create Access ID'}
          </h2>
          <div className="text-[12px] font-mono text-[#86868b] mb-7">
            Auxiliary Calibration Studio
          </div>

          {/* Sign In vs Sign Up Segmented Pill */}
          <div className="inline-flex p-1 bg-[#f5f5f7] rounded-full border border-black/[0.04] mb-7 w-full">
            <button
              id="auth-tab-signin"
              onClick={() => setAuthTab('signin')}
              className={`flex-1 py-1.5 text-[13px] font-medium rounded-full transition-all cursor-pointer ${
                authTab === 'signin'
                  ? 'bg-white text-[#1d1d1f] shadow-xs'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              onClick={() => setAuthTab('signup')}
              className={`flex-1 py-1.5 text-[13px] font-medium rounded-full transition-all cursor-pointer ${
                authTab === 'signup'
                  ? 'bg-white text-[#1d1d1f] shadow-xs'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex items-center justify-center gap-4 text-[12px] font-mono mb-6">
            <button
              onClick={() => setAuthMode('passkey')}
              className={`pb-1 border-b-2 transition-all cursor-pointer ${
                authMode === 'passkey'
                  ? 'border-[#0071e3] text-[#0071e3] font-medium'
                  : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Biometric Passkey
            </button>
            <button
              onClick={() => setAuthMode('credentials')}
              className={`pb-1 border-b-2 transition-all cursor-pointer ${
                authMode === 'credentials'
                  ? 'border-[#0071e3] text-[#0071e3] font-medium'
                  : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Access ID
            </button>
          </div>

          {/* Passkey / 1-Click Grand Enter */}
          {authMode === 'passkey' ? (
            <div className="flex flex-col items-center">
              <button
                id="auth-passkey-button"
                onClick={handlePasskeyAuth}
                disabled={isVerifying}
                className="w-full py-3.5 px-6 rounded-2xl bg-white border border-[#0071e3]/30 hover:border-[#0071e3] shadow-[0_2px_12px_rgba(0,113,227,0.08)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer group mb-4"
              >
                <Fingerprint className={`w-5 h-5 text-[#0071e3] ${isVerifying ? 'animate-pulse' : ''}`} />
                <span className="text-[14px] font-medium text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                  {isVerifying ? 'Authenticating...' : 'Sign In with Touch / Face ID'}
                </span>
              </button>

              <div className="w-full flex items-center gap-2 my-4">
                <div className="h-[1px] flex-1 bg-black/[0.06]" />
                <span className="text-[10px] font-mono uppercase text-[#86868b]">
                  Or Instant Profile
                </span>
                <div className="h-[1px] flex-1 bg-black/[0.06]" />
              </div>

              {/* Quick Clinical Profile Pills */}
              <div className="w-full space-y-2">
                <button
                  onClick={() =>
                    onSuccess({
                      name: 'Dr. Varadharaj',
                      role: 'Senior Dermatologist',
                      institution: 'ISIC AI Consortium',
                      avatarLetter: 'V',
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-white hover:bg-[#f5f5f7] border border-black/[0.06] text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-[12px] font-semibold text-[#1d1d1f]">
                      Dr. Varadharaj
                    </div>
                    <div className="text-[10px] font-mono text-[#86868b]">
                      ISIC Lead Dermatologist
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#86868b]" />
                </button>

                <button
                  onClick={() =>
                    onSuccess({
                      name: 'Clinical Fellow',
                      role: 'Dermatology Resident',
                      institution: 'HAM-10K Evaluation Unit',
                      avatarLetter: 'C',
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-white hover:bg-[#f5f5f7] border border-black/[0.06] text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-[12px] font-semibold text-[#1d1d1f]">
                      Clinical Fellow
                    </div>
                    <div className="text-[10px] font-mono text-[#86868b]">
                      Evaluation Unit
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#86868b]" />
                </button>
              </div>
            </div>
          ) : (
            /* Credentials Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div className="text-left">
                <label className="text-[11px] font-mono uppercase text-[#86868b] block mb-1">
                  Clinician Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alex Vance"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.1] text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] transition-colors"
                />
              </div>

              <div className="text-left">
                <label className="text-[11px] font-mono uppercase text-[#86868b] block mb-1">
                  Institution ID / License
                </label>
                <input
                  type="text"
                  placeholder="e.g. MED-ISIC-892"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/[0.1] text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full mt-2 py-3 rounded-xl bg-[#0071e3] text-white text-[14px] font-medium tracking-tight hover:bg-[#0077ed] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                {isVerifying
                  ? 'Accessing...'
                  : authTab === 'signin'
                  ? 'Enter Studio'
                  : 'Register & Enter'}
              </button>
            </form>
          )}

          {/* Minimal Trust Badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#86868b]">
            <Shield className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>End-to-End Calibrated Uncertainty</span>
          </div>
        </div>
      </div>
    </div>
  );
};
