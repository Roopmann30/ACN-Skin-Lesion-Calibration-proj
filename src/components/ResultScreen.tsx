import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Home, Sparkles, ChevronDown, ChevronUp, Binary } from 'lucide-react';
import { LesionSample } from '../types';

interface ResultScreenProps {
  sample: LesionSample;
  allSamples: LesionSample[];
  onSelectSample: (sample: LesionSample) => void;
  onViewCalibration: () => void;
  onBackToUpload?: () => void;
  onBackToHome?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  sample,
  allSamples,
  onSelectSample,
  onViewCalibration,
  onBackToUpload,
  onBackToHome,
}) => {
  // Interactive mode toggle: 'acn' | 'fixed' | 'uncalibrated'
  const [activeMode, setActiveMode] = useState<'acn' | 'fixed' | 'uncalibrated'>('acn');
  const [showSignals, setShowSignals] = useState<boolean>(false);

  // Compute active display confidence based on selected mode
  const displayConfidence =
    activeMode === 'acn'
      ? sample.acnConfidence
      : activeMode === 'fixed'
      ? sample.fixedConfidence
      : sample.uncalibratedConfidence;

  const displayTemp =
    activeMode === 'acn'
      ? sample.tx.toFixed(2)
      : activeMode === 'fixed'
      ? sample.fixedT.toFixed(2)
      : '1.00';

  // Delta between uncalibrated and ACN
  const delta = Number((sample.acnConfidence - sample.uncalibratedConfidence).toFixed(1));

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-10 px-6 flex flex-col items-center">
      {/* Top Back Navigation Bar */}
      <div className="w-full flex items-center justify-between mb-4">
        {onBackToUpload && (
          <button
            id="result-back-upload-top"
            onClick={onBackToUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#ebebed] text-[13px] font-medium text-[#1d1d1f] transition-colors cursor-pointer border border-black/[0.04]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back to Upload</span>
          </button>
        )}
        {onBackToHome && (
          <button
            id="result-back-home-top"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        )}
      </div>

      {/* Lesion Sample Selection Strip */}
      <div className="w-full mb-6 flex items-center justify-center gap-1.5 overflow-x-auto py-1">
        {allSamples.map((s) => {
          const isSelected = s.id === sample.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSample(s)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-xs'
                  : 'bg-[#f5f5f7] text-[#86868b] border-transparent hover:text-[#1d1d1f] hover:bg-[#ebebed]'
              }`}
            >
              {s.code}
            </button>
          );
        })}
      </div>

      {/* Dermoscopic Scan Vignette */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.06)] bg-black/5 group">
          <img
            src={sample.imageSrc}
            alt={sample.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Subtle dermatoscope crosshair */}
          <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center">
            <div className="w-full h-[1px] bg-white/60" />
            <div className="absolute h-full w-[1px] bg-white/60" />
            <div className="w-16 h-16 rounded-full border border-white/60" />
          </div>
        </div>

        {/* Clinical Feature Pills */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {sample.features.map((feature, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full border border-black/[0.03]"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Predicted Class & Dynamic Confidence */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#86868b]">
            Predicted Class
          </span>
          <span
            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-medium ${
              sample.category === 'malignant'
                ? 'bg-[#ff3b30]/10 text-[#ff3b30]'
                : 'bg-[#34c759]/10 text-[#34c759]'
            }`}
          >
            {sample.category}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
          {sample.predictedClass}
        </h1>

        {/* Large Display Confidence */}
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-6xl sm:text-7xl font-semibold tracking-tighter text-[#1d1d1f] tabular-nums transition-all duration-300">
            {displayConfidence}%
          </span>
        </div>

        {/* Dynamic Mode Caption & Adjustment Tag */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span
            className={`text-[12px] font-mono font-medium ${
              activeMode === 'acn'
                ? 'text-[#0071e3]'
                : activeMode === 'fixed'
                ? 'text-[#1d1d1f]'
                : 'text-[#86868b]'
            }`}
          >
            {activeMode === 'acn'
              ? 'ACN Calibrated'
              : activeMode === 'fixed'
              ? 'Fixed T Scaled'
              : 'Uncalibrated Softmax'}
          </span>
          <span className="text-[11px] font-mono text-[#86868b]">
            (T = {displayTemp})
          </span>
        </div>

        {activeMode === 'acn' && delta !== 0 && (
          <div className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[11px] font-mono font-medium">
            <Sparkles className="w-3 h-3" />
            <span>
              {delta < 0
                ? `Tempered overconfidence by ${Math.abs(delta)}%`
                : `Sharpened confidence by +${delta}%`}
            </span>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison: Fixed T vs T(x) */}
      <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        {/* Fixed T Card */}
        <div
          id="metric-fixed-t"
          onClick={() => setActiveMode('fixed')}
          className={`rounded-2xl p-5 sm:p-6 text-center transition-all cursor-pointer border ${
            activeMode === 'fixed'
              ? 'bg-white border-[#1d1d1f] ring-2 ring-black/10 shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
              : 'bg-[#fbfbfd] border-black/[0.06] hover:bg-white hover:border-black/[0.12] shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
          }`}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#86868b] mb-1.5">
            Fixed T
          </div>
          <div className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-tight tabular-nums mb-1">
            {sample.fixedT.toFixed(2)}
          </div>
          <div className="text-[12px] font-mono text-[#86868b] tabular-nums">
            {sample.fixedConfidence}% conf
          </div>
        </div>

        {/* T(x) ACN Card */}
        <div
          id="metric-tx"
          onClick={() => setActiveMode('acn')}
          className={`rounded-2xl p-5 sm:p-6 text-center transition-all cursor-pointer border ${
            activeMode === 'acn'
              ? 'bg-white border-[#0071e3] ring-2 ring-[#0071e3]/20 shadow-[0_4px_20px_rgba(0,113,227,0.1)]'
              : 'bg-[#fbfbfd] border-black/[0.06] hover:bg-white hover:border-[#0071e3]/40 shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
          }`}
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#0071e3] font-semibold mb-1.5">
            T(x) · ACN
          </div>
          <div className="text-3xl sm:text-4xl font-semibold text-[#0071e3] tracking-tight tabular-nums mb-1">
            {sample.tx.toFixed(2)}
          </div>
          <div className="text-[12px] font-mono text-[#0071e3] font-medium tabular-nums">
            {sample.acnConfidence}% conf
          </div>
        </div>
      </div>

      {/* Confidence Bar: Before vs After Calibration */}
      <div className="w-full rounded-2xl p-6 bg-[#fbfbfd] border border-black/[0.06] mb-6">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#86868b] mb-4">
          <span>Confidence Calibration</span>
          <span>Target Accuracy</span>
        </div>

        {/* Uncalibrated Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[12px] mb-1.5 font-mono">
            <span className="text-[#86868b]">Uncalibrated (T=1.00)</span>
            <span className="font-semibold text-[#1d1d1f] tabular-nums">
              {sample.uncalibratedConfidence}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#86868b] transition-all duration-500 ease-out"
              style={{ width: `${sample.uncalibratedConfidence}%` }}
            />
          </div>
        </div>

        {/* Fixed T Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[12px] mb-1.5 font-mono">
            <span className="text-[#86868b]">Fixed T (T={sample.fixedT.toFixed(2)})</span>
            <span className="font-semibold text-[#1d1d1f] tabular-nums">
              {sample.fixedConfidence}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#48484a] transition-all duration-500 ease-out"
              style={{ width: `${sample.fixedConfidence}%` }}
            />
          </div>
        </div>

        {/* ACN T(x) Bar */}
        <div>
          <div className="flex justify-between items-center text-[12px] mb-1.5 font-mono">
            <span className="font-medium text-[#0071e3]">
              ACN T(x) (T={sample.tx.toFixed(2)})
            </span>
            <span className="font-bold text-[#0071e3] tabular-nums">
              {sample.acnConfidence}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0071e3] transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${sample.acnConfidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Extracted ResNet-18 Signals & HAM10000 7-Class Distribution Drawer */}
      <div className="w-full rounded-2xl border border-black/[0.06] bg-white p-5 mb-8 shadow-xs">
        <button
          onClick={() => setShowSignals(!showSignals)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#1d1d1f] tracking-tight">
                ResNet-18 Extracted Signals (Figure 5.1)
              </div>
              <div className="text-[11px] font-mono text-[#86868b]">
                512-dim features · 7-class logits · Entropy: {sample.signals.predictiveEntropy} nats
              </div>
            </div>
          </div>
          {showSignals ? (
            <ChevronUp className="w-4 h-4 text-[#86868b]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#86868b]" />
          )}
        </button>

        {showSignals && (
          <div className="mt-4 pt-4 border-t border-black/[0.04] space-y-4">
            {/* Signal metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-[#fbfbfd] border border-black/[0.04]">
                <div className="text-[10px] font-mono text-[#86868b]">Features Dim</div>
                <div className="text-[14px] font-semibold text-[#1d1d1f]">512</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#fbfbfd] border border-black/[0.04]">
                <div className="text-[10px] font-mono text-[#86868b]">L2 Feature Norm</div>
                <div className="text-[14px] font-semibold text-[#1d1d1f]">{sample.signals.featureNorm}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#fbfbfd] border border-black/[0.04]">
                <div className="text-[10px] font-mono text-[#86868b]">Max Softmax P</div>
                <div className="text-[14px] font-semibold text-[#1d1d1f]">{sample.uncalibratedConfidence}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#fbfbfd] border border-black/[0.04]">
                <div className="text-[10px] font-mono text-[#86868b]">Predictive Entropy</div>
                <div className="text-[14px] font-semibold text-[#0071e3]">{sample.signals.predictiveEntropy}</div>
              </div>
            </div>

            {/* 7 HAM10000 Diagnostic Classes Softmax Table */}
            <div>
              <div className="text-[11px] font-mono text-[#86868b] uppercase tracking-wider mb-2">
                HAM10000 7-Class Distribution:
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-[#86868b]">
                      <th className="pb-1.5 font-normal">Class</th>
                      <th className="pb-1.5 font-normal">Raw Logit</th>
                      <th className="pb-1.5 font-normal">Uncalibrated</th>
                      <th className="pb-1.5 font-normal text-[#0071e3]">ACN Calibrated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {sample.signals.classProbabilities.map((c) => (
                      <tr key={c.code} className="hover:bg-black/[0.01]">
                        <td className="py-1.5 text-[#1d1d1f] font-medium font-sans">
                          {c.name} ({c.code})
                        </td>
                        <td className="py-1.5 text-[#86868b]">{c.logit.toFixed(2)}</td>
                        <td className="py-1.5 text-[#86868b]">{c.uncalibrated}%</td>
                        <td className="py-1.5 text-[#0071e3] font-semibold">{c.acn}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onBackToUpload && (
          <button
            id="result-back-upload-bottom"
            onClick={onBackToUpload}
            className="px-5 py-2.5 rounded-full bg-[#f5f5f7] hover:bg-[#ebebed] text-[#1d1d1f] text-[14px] font-medium tracking-tight transition-all flex items-center gap-1.5 cursor-pointer border border-black/[0.04]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back to Upload</span>
          </button>
        )}
        <button
          id="result-proceed-button"
          onClick={onViewCalibration}
          className="px-7 py-2.5 rounded-full bg-[#0071e3] text-white text-[14px] font-medium tracking-tight hover:bg-[#0077ed] active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(0,113,227,0.25)] flex items-center gap-2 cursor-pointer"
        >
          <span>View Calibration</span>
          <ArrowRight className="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  );
};
