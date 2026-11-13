import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TabType, LesionSample } from './types';
import { SAMPLE_LESIONS, createUploadedSample } from './data/samples';
import { LoginScreen } from './components/LoginScreen';
import { Navigation } from './components/Navigation';
import { UploadScreen } from './components/UploadScreen';
import { ResultScreen } from './components/ResultScreen';
import { CalibrationScreen } from './components/CalibrationScreen';
import { Footer } from './components/Footer';

export default function App() {
  const [screen, setScreen] = useState<'login' | 'app'>('login');
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [samples, setSamples] = useState<LesionSample[]>(SAMPLE_LESIONS);
  const [selectedSample, setSelectedSample] = useState<LesionSample>(SAMPLE_LESIONS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load reference + persisted samples from Express backend
  useEffect(() => {
    let active = true;
    fetch('/api/samples')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.samples?.length) {
          setSamples(data.samples);
          setSelectedSample(data.samples[0]);
        }
      })
      .catch(() => {
        // Fallback silently to bundled samples
      });
    return () => {
      active = false;
    };
  }, []);

  // Global Back navigation handler
  const handleGlobalBack = () => {
    if (activeTab === 'calibration') {
      setActiveTab('result');
    } else if (activeTab === 'result') {
      setActiveTab('upload');
    } else {
      setScreen('login');
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (screen === 'app') {
        if (e.key === '1') {
          setActiveTab('upload');
        } else if (e.key === '2') {
          setActiveTab('result');
        } else if (e.key === '3') {
          setActiveTab('calibration');
        } else if (e.key === 'ArrowRight') {
          setActiveTab((prev) => (prev === 'upload' ? 'result' : 'calibration'));
        } else if (e.key === 'ArrowLeft') {
          setActiveTab((prev) => (prev === 'calibration' ? 'result' : 'upload'));
        }
      }
      if (e.key === 'Escape') {
        handleGlobalBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, activeTab]);

  const handleLogin = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.token) {
          sessionStorage.setItem('acn_token', data.token);
        }
      }
    } catch {
      // Proceed smoothly
    }
    setScreen('app');
    setActiveTab('upload');
  };

  const handleGuest = async () => {
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data?.token) {
          sessionStorage.setItem('acn_token', data.token);
        }
      }
    } catch {
      // Proceed smoothly
    }
    setScreen('app');
    setActiveTab('upload');
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('acn_token');
    setScreen('login');
  };

  const handleSelectSample = (sample: LesionSample) => {
    setSelectedSample(sample);
  };

  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            fileName: file.name,
          }),
        });
        if (res.ok) {
          const payload = await res.json();
          if (payload?.sample) {
            setSamples((prev) => [payload.sample, ...prev.filter((s) => s.id !== payload.sample.id)]);
            setSelectedSample(payload.sample);
            setActiveTab('result');
            return;
          }
        }
      } catch {
        // Fallback to local inference helper if backend unavailable
      } finally {
        setIsAnalyzing(false);
      }

      const fallbackSample = createUploadedSample(dataUrl, file.name);
      setSamples((prev) => [fallbackSample, ...prev]);
      setSelectedSample(fallbackSample);
      setActiveTab('result');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',Helvetica,sans-serif] selection:bg-[#0071e3]/15 selection:text-[#0071e3]">
      <AnimatePresence mode="wait">
        {screen === 'login' ? (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex-1 flex flex-col justify-center"
          >
            <LoginScreen
              onLogin={handleLogin}
              onGuest={handleGuest}
            />
          </motion.div>
        ) : (
          <motion.div
            key="app-workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {/* Minimal Keynote Navigation Bar */}
            <Navigation
              currentView="app"
              onNavigateView={() => {}}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              currentSample={selectedSample}
              user={null}
              onSignOut={handleSignOut}
              onGlobalBack={handleGlobalBack}
            />

            {/* Screen Content */}
            <main className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {/* Screen 1: Upload + 4 Clinical Dermoscopy Samples */}
                {activeTab === 'upload' && (
                  <motion.div
                    key="screen-1-upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="w-full"
                  >
                    <UploadScreen
                      samples={samples}
                      selectedSample={selectedSample}
                      onSelectSample={handleSelectSample}
                      onUploadImage={handleUploadImage}
                      onProceed={() => setActiveTab('result')}
                      onBack={() => setScreen('login')}
                      isAnalyzing={isAnalyzing}
                    />
                  </motion.div>
                )}

                {/* Screen 2: Result (Predicted Class, Tabular Numerals, Fixed T vs T(x), Comparative Bar) */}
                {activeTab === 'result' && (
                  <motion.div
                    key="screen-2-result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="w-full"
                  >
                    <ResultScreen
                      sample={selectedSample}
                      allSamples={samples}
                      onSelectSample={handleSelectSample}
                      onViewCalibration={() => setActiveTab('calibration')}
                      onBackToUpload={() => setActiveTab('upload')}
                      onBackToHome={() => setScreen('login')}
                    />
                  </motion.div>
                )}

                {/* Screen 3: Calibration (Reliability Diagram, ECE Metrics, Concise Takeaway) */}
                {activeTab === 'calibration' && (
                  <motion.div
                    key="screen-3-calibration"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="w-full"
                  >
                    <CalibrationScreen
                      sample={selectedSample}
                      allSamples={samples}
                      onSelectSample={handleSelectSample}
                      onReset={() => setActiveTab('upload')}
                      onBackToResult={() => setActiveTab('result')}
                      onBackToHome={() => setScreen('login')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Footer with Specified Single-Line Statement: "Confidence you can trust." */}
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
