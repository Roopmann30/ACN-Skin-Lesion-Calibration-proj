import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { LesionSample } from '../types';

interface HomeScreenProps {
  samples: LesionSample[];
  onSelectSampleAndProceed: (sample: LesionSample) => void;
  onEnter: () => void;
  onExploreDemo: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  samples,
  onSelectSampleAndProceed,
  onEnter,
  onExploreDemo,
  canGoBack,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Catalog' },
    { id: 'malignant', label: 'Malignant Cases' },
    { id: 'benign', label: 'Benign Cases' },
  ];

  const filteredSamples = samples.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="w-full bg-white text-[#1d1d1f] flex flex-col items-center">
      {/* Top Back Button if navigated from another page */}
      {canGoBack && onBack && (
        <div className="w-full max-w-5xl px-6 pt-6 flex justify-start">
          <button
            id="home-back-button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#ebebed] text-[13px] font-medium text-[#1d1d1f] transition-colors cursor-pointer border border-black/[0.04]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Grand Store Banner */}
      <section className="w-full max-w-5xl mx-auto pt-8 sm:pt-14 pb-10 px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fbfbfd] via-[#f5f5f7] to-[#e8eef8] border border-black/[0.06] p-8 sm:p-14 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0071e3]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            {/* Storefront Badge (Flipkart Assured / Amazon Choice style) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.06] text-[#0071e3] text-[11px] font-mono font-semibold mb-5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ACN Assured · Certified Calibration</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1d1d1f] mb-4 leading-tight">
              Skin Lesion Calibration Store
            </h1>

            <p className="text-sm sm:text-base text-[#86868b] tracking-tight mb-8">
              Select verified clinical cases or upload dermatoscopy imagery for per-image uncertainty estimation.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="home-banner-enter"
                onClick={onEnter}
                className="px-7 py-3 rounded-full bg-[#0071e3] text-white text-[14px] font-medium tracking-tight hover:bg-[#0077ed] active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(0,113,227,0.25)] flex items-center gap-2 cursor-pointer"
              >
                <span>Enter Studio</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </button>

              <button
                id="home-banner-demo"
                onClick={onExploreDemo}
                className="px-6 py-3 rounded-full bg-white hover:bg-[#f9f9fb] text-[#1d1d1f] text-[14px] font-medium tracking-tight active:scale-[0.98] transition-all border border-black/[0.08] shadow-xs cursor-pointer"
              >
                Upload Custom Image
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Strip (Amazon / Flipkart department tabs) */}
      <section className="w-full max-w-5xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#1d1d1f] text-white shadow-xs'
                    : 'bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#ebebed]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-[12px] font-mono text-[#86868b] hidden sm:inline">
            Featured Diagnostics
          </span>
        </div>
      </section>

      {/* Product / Lesion Showcase Grid (Amazon / Flipkart card style) */}
      <section className="w-full max-w-5xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSamples.map((sample) => (
            <div
              key={sample.id}
              id={`catalog-card-${sample.id}`}
              className="group rounded-3xl p-4 bg-[#fbfbfd] hover:bg-white border border-black/[0.06] hover:border-black/[0.14] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between text-left"
            >
              <div>
                {/* Image Showcase Container */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/5 mb-3.5">
                  <img
                    src={sample.imageSrc}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Assured Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#0071e3] font-semibold shadow-xs">
                      <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                      <span>ACN Assured</span>
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-medium ${
                        sample.category === 'malignant'
                          ? 'bg-[#ff3b30]/90 text-white'
                          : 'bg-[#1d1d1f]/80 text-white'
                      }`}
                    >
                      {sample.category}
                    </span>
                  </div>
                </div>

                {/* Case Header */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#86868b] mb-1">
                  <span>{sample.code}</span>
                  <span>ISIC Dataset</span>
                </div>

                <h3 className="text-[16px] font-semibold text-[#1d1d1f] tracking-tight mb-2 group-hover:text-[#0071e3] transition-colors">
                  {sample.predictedClass}
                </h3>

                {/* Clinical Feature Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {sample.features.slice(0, 2).map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectSampleAndProceed(sample)}
                className="w-full py-2.5 rounded-xl bg-white group-hover:bg-[#0071e3] text-[#1d1d1f] group-hover:text-white border border-black/[0.08] group-hover:border-[#0071e3] text-[13px] font-medium tracking-tight transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Calibrate Case</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Store Guarantees / Service Highlights (No numerical values) */}
      <section className="w-full max-w-5xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="rounded-2xl p-6 bg-[#fbfbfd] border border-black/[0.06]">
            <div className="w-8 h-8 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#0071e3] mb-3 shadow-2xs">
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-1">
              Zero Overconfidence
            </div>
            <div className="text-[12px] text-[#86868b] leading-relaxed">
              Auxiliary network scales confidence downward for ambiguous lesions and preserves high confidence on textbook patterns.
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-[#fbfbfd] border border-black/[0.06]">
            <div className="w-8 h-8 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#0071e3] mb-3 shadow-2xs">
              <Sparkles className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-1">
              Adaptive Temperature
            </div>
            <div className="text-[12px] text-[#86868b] leading-relaxed">
              Per-image temperature parameter T(x) dynamically replaces static global temperatures.
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-[#fbfbfd] border border-black/[0.06]">
            <div className="w-8 h-8 rounded-full bg-white border border-black/[0.06] flex items-center justify-center text-[#0071e3] mb-3 shadow-2xs">
              <Check className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="text-[14px] font-semibold text-[#1d1d1f] mb-1">
              Instant Diagnosis
            </div>
            <div className="text-[12px] text-[#86868b] leading-relaxed">
              Zero backend roundtrip latency with instantaneous client-side calibration and reliability curves.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
