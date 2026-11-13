import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Home } from 'lucide-react';
import { LesionSample } from '../types';

interface CalibrationScreenProps {
  sample: LesionSample;
  allSamples: LesionSample[];
  onSelectSample: (sample: LesionSample) => void;
  onReset: () => void;
  onBackToResult: () => void;
  onBackToHome?: () => void;
}

export const CalibrationScreen: React.FC<CalibrationScreenProps> = ({
  sample,
  allSamples,
  onSelectSample,
  onReset,
  onBackToResult,
  onBackToHome,
}) => {
  const [viewMode, setViewMode] = useState<'curve' | 'bins' | 'baselines'>('curve');
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);

  // SVG Chart Dimensions
  const width = 360;
  const height = 260;
  const padding = { top: 20, right: 25, bottom: 40, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Scale functions
  const getX = (conf: number) => padding.left + (conf / 100) * innerWidth;
  const getY = (acc: number) => padding.top + innerHeight - (acc / 100) * innerHeight;

  const uncalibratedPoints = [{ conf: 0, acc: 0 }, ...sample.bins.map((b) => ({ conf: b.confidence, acc: b.uncalibratedAcc }))];
  const uncalibratedPath = uncalibratedPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.conf)},${getY(p.acc)}`)
    .join(' ');

  const fixedPoints = [{ conf: 0, acc: 0 }, ...sample.bins.map((b) => ({ conf: b.confidence, acc: b.fixedTAcc }))];
  const fixedPath = fixedPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.conf)},${getY(p.acc)}`)
    .join(' ');

  const acnPoints = [{ conf: 0, acc: 0 }, ...sample.bins.map((b) => ({ conf: b.confidence, acc: b.acnAcc }))];
  const acnPath = acnPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.conf)},${getY(p.acc)}`)
    .join(' ');

  // ECE Improvement
  const eceImprovement = Number((sample.uncalibratedEce - sample.acnEce).toFixed(1));

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-10 px-6 flex flex-col items-center">
      {/* Top Back Navigation Bar */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          id="calibration-back-result-top"
          onClick={onBackToResult}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#ebebed] text-[13px] font-medium text-[#1d1d1f] transition-colors cursor-pointer border border-black/[0.04]"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
          <span>Back to Result</span>
        </button>

        {onBackToHome && (
          <button
            id="calibration-back-home-top"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        )}
      </div>

      {/* Quick Sample Selector Strip */}
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

      {/* Metric ECE Summary Header */}
      <div className="w-full grid grid-cols-3 gap-3 mb-6 text-center">
        {/* Uncalibrated ECE */}
        <div className="rounded-2xl p-4 bg-[#fbfbfd] border border-black/[0.06]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#86868b] mb-1">
            Uncalibrated ECE
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#86868b] tabular-nums">
            {sample.uncalibratedEce}%
          </div>
        </div>

        {/* Fixed T ECE */}
        <div className="rounded-2xl p-4 bg-[#fbfbfd] border border-black/[0.06]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#86868b] mb-1">
            Fixed T ECE
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tabular-nums">
            {sample.fixedEce}%
          </div>
        </div>

        {/* ACN T(x) ECE */}
        <div className="rounded-2xl p-4 bg-white border border-[#0071e3]/30 shadow-[0_2px_12px_rgba(0,113,227,0.06)] ring-1 ring-[#0071e3]/20">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#0071e3] font-semibold mb-1 flex items-center justify-center gap-1">
            <span>ACN ECE</span>
            <span className="text-[9px] bg-[#0071e3]/10 px-1 rounded">-{eceImprovement}%</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#0071e3] tabular-nums">
            {sample.acnEce}%
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full rounded-3xl p-6 sm:p-8 bg-[#fbfbfd] border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-6 flex flex-col items-center">
        {/* Chart Header & Mode Selector */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#86868b]">
            {viewMode === 'baselines' ? 'Baselines Benchmark (Figure 5.1)' : 'Reliability Diagram'}
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 bg-black/[0.05] rounded-full text-[11px] font-mono">
              <button
                onClick={() => setViewMode('curve')}
                className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'curve' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#86868b]'
                }`}
              >
                Curve
              </button>
              <button
                onClick={() => setViewMode('bins')}
                className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'bins' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#86868b]'
                }`}
              >
                Bins
              </button>
              <button
                onClick={() => setViewMode('baselines')}
                className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
                  viewMode === 'baselines' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#86868b]'
                }`}
              >
                All 5 Baselines
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        {viewMode !== 'baselines' && (
          <div className="w-full flex items-center justify-center gap-5 text-[11px] font-mono mb-4">
            <span className="flex items-center gap-1.5 text-[#86868b]">
              <span className="w-2.5 h-0.5 bg-[#86868b] rounded" />
              Uncalibrated
            </span>
            <span className="flex items-center gap-1.5 text-[#1d1d1f]">
              <span className="w-2.5 h-0.5 bg-[#1d1d1f] rounded" />
              Fixed T
            </span>
            <span className="flex items-center gap-1.5 text-[#0071e3] font-semibold">
              <span className="w-2.5 h-0.5 bg-[#0071e3] rounded" />
              ACN T(x)
            </span>
          </div>
        )}

        {/* Curve Mode */}
        {viewMode === 'curve' ? (
          <div className="w-full flex justify-center overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full max-w-[420px] h-auto select-none"
            >
              {/* Gridlines */}
              {[0, 25, 50, 75, 100].map((val) => (
                <g key={`grid-${val}`}>
                  <line
                    x1={padding.left}
                    y1={getY(val)}
                    x2={width - padding.right}
                    y2={getY(val)}
                    stroke="#e5e5ea"
                    strokeWidth="0.8"
                  />
                  <text
                    x={padding.left - 8}
                    y={getY(val) + 3}
                    textAnchor="end"
                    fill="#86868b"
                    fontSize="9"
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                  >
                    {val}%
                  </text>
                  <line
                    x1={getX(val)}
                    y1={padding.top}
                    x2={getX(val)}
                    y2={height - padding.bottom}
                    stroke="#e5e5ea"
                    strokeWidth="0.8"
                  />
                  <text
                    x={getX(val)}
                    y={height - padding.bottom + 16}
                    textAnchor="middle"
                    fill="#86868b"
                    fontSize="9"
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                  >
                    {val}%
                  </text>
                </g>
              ))}

              {/* Axis Titles */}
              <text
                x={width / 2}
                y={height - 8}
                textAnchor="middle"
                fill="#86868b"
                fontSize="10"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
              >
                Confidence →
              </text>
              <text
                x={14}
                y={height / 2}
                textAnchor="middle"
                fill="#86868b"
                fontSize="10"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                transform={`rotate(-90 14 ${height / 2})`}
              >
                Accuracy →
              </text>

              {/* Diagonal Ideal Line */}
              <line
                x1={getX(0)}
                y1={getY(0)}
                x2={getX(100)}
                y2={getY(100)}
                stroke="#c7c7cc"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />

              {/* Uncalibrated Path */}
              <path
                d={uncalibratedPath}
                fill="none"
                stroke="#86868b"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Fixed T Path */}
              <path
                d={fixedPath}
                fill="none"
                stroke="#1d1d1f"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* ACN T(x) Path */}
              <path
                d={acnPath}
                fill="none"
                stroke="#0071e3"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points for ACN */}
              {sample.bins.map((b, idx) => (
                <g
                  key={`pt-${idx}`}
                  onMouseEnter={() => setHoveredBin(idx)}
                  onMouseLeave={() => setHoveredBin(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={getX(b.confidence)}
                    cy={getY(b.acnAcc)}
                    r={hoveredBin === idx ? 6 : 4}
                    fill="#0071e3"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                </g>
              ))}
            </svg>
          </div>
        ) : viewMode === 'bins' ? (
          /* Bins Bar Mode */
          <div className="w-full space-y-3 my-2">
            {sample.bins.map((b, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredBin(idx)}
                onMouseLeave={() => setHoveredBin(null)}
                className={`p-2.5 rounded-xl border transition-all ${
                  hoveredBin === idx
                    ? 'border-[#0071e3]/40 bg-white shadow-xs'
                    : 'border-black/[0.04] bg-white'
                }`}
              >
                <div className="flex justify-between items-center text-[11px] font-mono mb-1.5">
                  <span className="text-[#1d1d1f] font-semibold">Bin {b.bin} (Conf: {b.confidence}%)</span>
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-[#86868b]">Uncal: {b.uncalibratedAcc}%</span>
                    <span className="text-[#1d1d1f]">Fixed: {b.fixedTAcc}%</span>
                    <span className="text-[#0071e3] font-bold">ACN: {b.acnAcc}%</span>
                  </div>
                </div>
                {/* 3-layer comparison bar */}
                <div className="grid grid-cols-3 gap-1.5 h-3">
                  <div className="bg-[#86868b]/25 rounded-sm overflow-hidden" title="Uncalibrated">
                    <div
                      className="bg-[#86868b] h-full"
                      style={{ width: `${b.uncalibratedAcc}%` }}
                    />
                  </div>
                  <div className="bg-[#1d1d1f]/15 rounded-sm overflow-hidden" title="Fixed T">
                    <div
                      className="bg-[#1d1d1f] h-full"
                      style={{ width: `${b.fixedTAcc}%` }}
                    />
                  </div>
                  <div className="bg-[#0071e3]/20 rounded-sm overflow-hidden" title="ACN">
                    <div
                      className="bg-[#0071e3] h-full shadow-xs"
                      style={{ width: `${b.acnAcc}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 5 Baselines Evaluation Table directly from Figure 5.1 */
          <div className="w-full my-2 overflow-x-auto">
            <table className="w-full text-left text-[11px] font-mono border-collapse">
              <thead>
                <tr className="border-b border-black/[0.08] text-[#86868b]">
                  <th className="py-2 px-2 font-normal">Method</th>
                  <th className="py-2 px-2 font-normal">ECE ↓</th>
                  <th className="py-2 px-2 font-normal">MCE ↓</th>
                  <th className="py-2 px-2 font-normal">Brier ↓</th>
                  <th className="py-2 px-2 font-normal">NLL ↓</th>
                  <th className="py-2 px-2 font-normal">Acc ↑</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {sample.comparisonMetrics.map((row) => (
                  <tr
                    key={row.method}
                    className={row.highlight ? 'bg-[#0071e3]/[0.06] font-semibold text-[#0071e3]' : 'text-[#1d1d1f]'}
                  >
                    <td className="py-2 px-2">{row.method}</td>
                    <td className="py-2 px-2">{row.ece.toFixed(1)}%</td>
                    <td className="py-2 px-2">{row.mce.toFixed(1)}%</td>
                    <td className="py-2 px-2">{row.brier.toFixed(3)}</td>
                    <td className="py-2 px-2">{row.nll.toFixed(3)}</td>
                    <td className="py-2 px-2">{row.accuracy.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Hover inspection readout */}
        <div className="h-6 mt-3 flex items-center justify-center">
          {hoveredBin !== null && viewMode !== 'baselines' ? (
            <div className="text-[11px] font-mono text-[#1d1d1f] bg-white px-3 py-1 rounded-full border border-black/[0.06] shadow-xs">
              Conf: {sample.bins[hoveredBin].confidence}% · ACN Acc: {sample.bins[hoveredBin].acnAcc}% · Gap: {Math.abs(sample.bins[hoveredBin].confidence - sample.bins[hoveredBin].acnAcc)}%
            </div>
          ) : (
            <div className="text-[11px] font-mono text-[#86868b]">
              Dashed line represents perfect calibration (ECE = 0)
            </div>
          )}
        </div>
      </div>

      {/* One-Line Takeaway */}
      <div className="w-full text-center py-3.5 px-6 rounded-2xl bg-white border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.02)] mb-8">
        <span className="text-[13px] sm:text-[14px] font-medium text-[#1d1d1f] tracking-tight">
          Per-image temperature T(x) aligns confidence with true diagnostic accuracy.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          id="calibration-back-button"
          onClick={onBackToResult}
          className="px-5 py-2.5 rounded-full bg-[#f5f5f7] hover:bg-[#ebebed] text-[#1d1d1f] text-[14px] font-medium tracking-tight transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
          <span>Back</span>
        </button>

        <button
          id="calibration-reset-button"
          onClick={onReset}
          className="px-7 py-2.5 rounded-full bg-[#0071e3] text-white text-[14px] font-medium tracking-tight hover:bg-[#0077ed] active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(0,113,227,0.25)] flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
          <span>New Lesion</span>
        </button>
      </div>
    </div>
  );
};
