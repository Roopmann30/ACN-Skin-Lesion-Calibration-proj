import React, { useRef, useState } from 'react';
import { Upload, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { LesionSample } from '../types';

interface UploadScreenProps {
  samples: LesionSample[];
  selectedSample: LesionSample;
  onSelectSample: (sample: LesionSample) => void;
  onUploadImage: (file: File) => void;
  onProceed: () => void;
  onBack?: () => void;
  isAnalyzing?: boolean;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  samples,
  selectedSample,
  onSelectSample,
  onUploadImage,
  onProceed,
  onBack,
  isAnalyzing = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceSamples = samples.filter((s) => s.id.startsWith('case-')).slice(0, 4);
  const clinicalCards = referenceSamples.length >= 4 ? referenceSamples : samples.slice(0, 4);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-12 px-6 flex flex-col items-center">
      {/* Top Back Navigation Button */}
      {onBack && (
        <div className="w-full flex justify-start mb-6">
          <button
            id="upload-back-button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#ebebed] text-[13px] font-medium text-[#1d1d1f] transition-colors cursor-pointer border border-black/[0.04]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Hero Headline */}
      <h1 className="text-4xl sm:text-5xl font-extralight tracking-tight text-[#1d1d1f] text-center mb-3">
        Choose an image
      </h1>
      <p className="text-[14px] text-[#86868b] text-center mb-10 max-w-md">
        Upload a dermoscopy scan or test one of the 4 clinical reference cases below.
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="lesion-file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Upload Dropzone Card */}
      <div
        id="upload-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        className={`w-full rounded-[28px] p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 border-2 border-dashed ${
          isDragging
            ? 'border-[#0071e3] bg-[#0071e3]/[0.03] scale-[1.008] shadow-[0_8px_30px_rgba(0,113,227,0.12)]'
            : 'border-black/[0.12] bg-[#fafafc] hover:bg-white hover:border-black/[0.24] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
        }`}
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white border border-black/[0.06] shadow-xs flex items-center justify-center text-[#1d1d1f] transition-transform group-hover:scale-105">
          <Upload className={`w-6 h-6 stroke-[1.8] ${isAnalyzing ? 'animate-pulse text-[#0071e3]' : ''}`} />
        </div>
        <div className="text-lg font-medium text-[#1d1d1f] tracking-tight mb-1">
          {isAnalyzing ? 'Extracting ResNet-18 signals & calibrating T(x)...' : 'Upload your own dermoscopy image'}
        </div>
        <div className="text-[13px] text-[#86868b]">
          Drag and drop or click to browse (PNG, JPG, WEBP)
        </div>
      </div>

      {/* Divider */}
      <div className="w-full my-10 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-black/[0.06]" />
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#86868b]">
          4 Clinical Sample Cases
        </span>
        <div className="h-[1px] flex-1 bg-black/[0.06]" />
      </div>

      {/* 4 Clinical Sample Cases Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {clinicalCards.map((sample) => {
          const isSelected = selectedSample.id === sample.id;
          return (
            <button
              key={sample.id}
              id={`sample-card-${sample.id}`}
              onClick={() => {
                onSelectSample(sample);
                onProceed();
              }}
              className={`group relative text-left rounded-2xl p-3.5 transition-all duration-200 cursor-pointer focus:outline-none border ${
                isSelected
                  ? 'border-[#0071e3] bg-white ring-2 ring-[#0071e3]/20 shadow-[0_4px_20px_rgba(0,113,227,0.12)]'
                  : 'border-black/[0.06] bg-[#fafafc] hover:bg-white hover:border-black/[0.14] shadow-xs'
              }`}
            >
              {/* Square thumbnail container with lens styling */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/5 mb-3">
                <img
                  src={sample.imageSrc}
                  alt={sample.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Selection Check Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Category Tag */}
                <div className="absolute bottom-2 left-2">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-medium ${
                      sample.category === 'malignant'
                        ? 'bg-[#ff3b30] text-white'
                        : 'bg-[#1d1d1f] text-white'
                    }`}
                  >
                    {sample.category}
                  </span>
                </div>
              </div>

              {/* Sample metadata */}
              <div>
                <div className="text-[11px] font-mono text-[#86868b] mb-0.5">
                  {sample.code}
                </div>
                <div className="text-[14px] font-semibold text-[#1d1d1f] tracking-tight truncate mb-1">
                  {sample.name}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#86868b]">
                  <span>Conf: {sample.acnConfidence}%</span>
                  <span className="text-[#0071e3]">T(x): {sample.tx.toFixed(2)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Proceed Button */}
      <div className="mt-10 flex items-center gap-3">
        <button
          id="upload-proceed-button"
          onClick={onProceed}
          className="px-8 py-3 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-[14px] font-medium tracking-tight active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>Analyze Selected Lesion</span>
          <ArrowRight className="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  );
};
