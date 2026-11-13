import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
  onGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGuest }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email.trim() || 'clinician@acn.ai');
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-6 select-none">
      {/* Centered card floating on white */}
      <div className="w-full max-w-[380px] flex flex-col items-center text-center">
        {/* App name in large thin type */}
        <h1 className="text-5xl sm:text-6xl font-extralight tracking-tight text-[#1d1d1f] mb-3">
          ACN
        </h1>

        {/* One-line tagline */}
        <p className="text-[15px] font-normal text-[#86868b] tracking-tight mb-10">
          Confidence you can trust.
        </p>

        {/* Form with pill-shaped fields */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          <div>
            <input
              id="login-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-5 py-3.5 rounded-full bg-white border border-black/[0.12] text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black focus:ring-4 focus:ring-black/[0.04] transition-all"
            />
          </div>

          <div>
            <input
              id="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-5 py-3.5 rounded-full bg-white border border-black/[0.12] text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-black focus:ring-4 focus:ring-black/[0.04] transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              id="login-continue-button"
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-[15px] font-medium tracking-tight active:scale-[0.98] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer"
            >
              Continue
            </button>
          </div>
        </form>

        {/* Small secondary link */}
        <div className="mt-5">
          <button
            id="login-guest-button"
            type="button"
            onClick={onGuest}
            className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer py-1"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
};
