import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TabType, LesionSample, AppView, UserProfile } from '../types';
import { LogOut, ArrowLeft } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  onNavigateView: (view: AppView) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentSample: LesionSample;
  user: UserProfile | null;
  onSignOut: () => void;
  onGlobalBack?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigateView,
  activeTab,
  onTabChange,
  currentSample,
  user,
  onSignOut,
  onGlobalBack,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'upload', label: 'Upload' },
    { id: 'result', label: 'Result' },
    { id: 'calibration', label: 'Calibration' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-black/[0.06] transition-all">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brandmark & Back Navigation */}
        <div className="flex items-center gap-3">
          {onGlobalBack && (
            <button
              id="nav-global-back-button"
              onClick={onGlobalBack}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#86868b] hover:text-[#1d1d1f] px-3 py-1 rounded-full bg-[#f5f5f7] hover:bg-[#ebebed] transition-colors cursor-pointer border border-black/[0.04]"
              title="Go Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
              <span>Back</span>
            </button>
          )}

          <div className="flex items-center gap-2 select-none">
            <span className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
              ACN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
          </div>
        </div>

        {/* Center: 3 Calibration Tabs */}
        <nav aria-label="Calibration Tabs" className="flex items-center">
          <div className="inline-flex p-1 bg-[#f5f5f7] rounded-full border border-black/[0.04]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-4 py-1.5 text-[13px] font-medium transition-colors cursor-pointer rounded-full focus:outline-none select-none ${
                    isActive ? 'text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right Section: Minimal Sign Out */}
        <div className="flex items-center gap-3">
          <button
            id="nav-signout-button"
            onClick={onSignOut}
            className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer py-1"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};
