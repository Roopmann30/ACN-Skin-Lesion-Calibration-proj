import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, ArrowLeft, RotateCcw } from 'lucide-react';
import { LesionSample } from '../types';

interface ImageSelectionScreenProps {
  samples: LesionSample[];
  selectedSample: LesionSample | null;
  onSelectSample: (sample: LesionSample) => void;
  onUploadFile: (file: File) => void;
  onClearSelection: () => void;
  onSignOut: () => void;
}

export const ImageSelectionScreen: React.FC<ImageSelectionScreenProps> = ({
  samples,
  selectedSample,
  onSelectSample,
  onUploadFile,
  onClearSelection,
  onSignOut,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between py-8 px-6 select-none font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',Helvetica,sans-serif]">
      {/* Top Bar with Minimal Sign Out */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="text-[14px] font-medium tracking-tight text-[#1d1d1f]">
          ACN
        </div>

        <button
          id="screen2-signout-button"
          onClick={onSignOut}
          className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer py-1"
        >
          Sign out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl mx-auto my-auto py-8 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!selectedSample ? (
            /* SELECTION VIEW */
            <motion.div
              key="selection-grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full flex flex-col items-center"
            >
              {/* Large confident headline */}
              <h1 className="text-4xl sm:text-6xl font-extralight tracking-tight text-[#1d1d1f] text-center mb-10 sm:mb-14">
                Choose an image
              </h1>

              {/* Two Premium Cards Side by Side */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Card 1: Upload your own */}
                <div
                  id="card-upload-own"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative rounded-[28px] p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 border-2 border-dashed ${
                    isDragging
                      ? 'border-[#0071e3] bg-[#0071e3]/[0.02]'
                      : 'border-black/[0.12] hover:border-black/[0.3] bg-[#fafafc] hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-16 h-16 rounded-full bg-white shadow-xs border border-black/[0.06] flex items-center justify-center text-[#1d1d1f] group-hover:scale-105 transition-transform mb-6">
                    <Upload className="w-6 h-6 stroke-[1.75]" />
                  </div>

                  <h3 className="text-xl font-medium tracking-tight text-[#1d1d1f] mb-1.5">
                    Upload your own
                  </h3>

                  <p className="text-[13px] text-[#86868b] font-normal">
                    Drag and drop or browse file
                  </p>
                </div>

                {/* Card 2: Use a sample */}
                <div
                  id="card-use-sample"
                  className="rounded-[28px] p-6 sm:p-8 bg-[#fafafc] border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                >
                  <div className="mb-4 text-center sm:text-left">
                    <h3 className="text-xl font-medium tracking-tight text-[#1d1d1f] mb-1">
                      Use a sample
                    </h3>
                    <p className="text-[13px] text-[#86868b] font-normal">
                      Curated skin lesion cases
                    </p>
                  </div>

                  {/* Curated thumbnail grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {samples.map((sample) => (
                      <button
                        key={sample.id}
                        id={`sample-thumbnail-${sample.id}`}
                        onClick={() => onSelectSample(sample)}
                        className="group relative rounded-2xl p-2.5 bg-white border border-black/[0.06] hover:border-black/[0.2] hover:shadow-xs transition-all text-left flex flex-col items-center cursor-pointer active:scale-[0.98]"
                      >
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/5 mb-2">
                          <img
                            src={sample.imageSrc}
                            alt={sample.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span className="text-[12px] font-medium text-[#1d1d1f] tracking-tight truncate w-full text-center">
                          {sample.predictedClass}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* RESULTS VIEW — Instant transition */
            <motion.div
              key="results-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full max-w-xl flex flex-col items-center text-center"
            >
              {/* Back to image selection */}
              <div className="w-full flex justify-start mb-6">
                <button
                  id="results-back-button"
                  onClick={onClearSelection}
                  className="flex items-center gap-1.5 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer py-1"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2]" />
                  <span>Choose another image</span>
                </button>
              </div>

              {/* Lesion Image */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border border-black/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.06)] mb-6 bg-black/5">
                <img
                  src={selectedSample.imageSrc}
                  alt={selectedSample.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Predicted Class */}
              <div className="text-[13px] font-mono uppercase tracking-widest text-[#86868b] mb-1">
                Predicted Class
              </div>
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#1d1d1f] mb-4">
                {selectedSample.predictedClass}
              </h2>

              {/* Calibrated Confidence */}
              <div className="mb-8">
                <div className="text-6xl sm:text-7xl font-extralight tracking-tight text-[#1d1d1f] tabular-nums mb-1">
                  {selectedSample.acnConfidence}%
                </div>
                <div className="text-[13px] text-[#86868b]">
                  Calibrated Confidence
                </div>
              </div>

              {/* Side by Side: Fixed T vs T(x) */}
              <div className="w-full grid grid-cols-2 gap-4 mb-8">
                {/* Fixed T */}
                <div className="rounded-3xl p-6 bg-[#fafafc] border border-black/[0.06] text-center">
                  <div className="text-[12px] font-mono uppercase tracking-wider text-[#86868b] mb-1">
                    Fixed T
                  </div>
                  <div className="text-3xl sm:text-4xl font-light text-[#1d1d1f] tabular-nums mb-1">
                    {selectedSample.fixedT.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-mono text-[#86868b]">
                    Standard scaling
                  </div>
                </div>

                {/* T(x) — ACN Per-Image */}
                <div className="rounded-3xl p-6 bg-[#fafafc] border border-black/[0.12] text-center shadow-xs">
                  <div className="text-[12px] font-mono uppercase tracking-wider text-[#0071e3] font-semibold mb-1">
                    T(x)
                  </div>
                  <div className="text-3xl sm:text-4xl font-light text-[#0071e3] tabular-nums mb-1">
                    {selectedSample.tx.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-mono text-[#86868b]">
                    ACN per-image
                  </div>
                </div>
              </div>

              {/* Simple Calibration Comparison Bar */}
              <div className="w-full rounded-2xl p-4 bg-[#fafafc] border border-black/[0.06] mb-8 text-left">
                <div className="flex justify-between text-[11px] font-mono text-[#86868b] mb-2">
                  <span>Raw: {selectedSample.uncalibratedConfidence}%</span>
                  <span className="text-[#0071e3]">ACN: {selectedSample.acnConfidence}%</span>
                </div>
                <div className="relative w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#86868b]/40 rounded-full"
                    style={{ width: `${selectedSample.uncalibratedConfidence}%` }}
                  />
                  <div
                    className="absolute top-0 left-0 h-full bg-[#0071e3] rounded-full"
                    style={{ width: `${selectedSample.acnConfidence}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                id="results-new-image-button"
                onClick={onClearSelection}
                className="px-8 py-3 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-[14px] font-medium tracking-tight active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4 stroke-[2]" />
                <span>Choose another image</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle bottom spacer */}
      <div className="h-4" />
    </div>
  );
};
