import React, { useState } from 'react';

function getHeatColor(v) {
  if (v > 0.9) return '#22d3ee';
  if (v > 0.7) return '#06b6d4';
  if (v > 0.5) return '#0891b2';
  if (v > 0.3) return '#0e7490';
  if (v > 0.15) return '#155e75';
  if (v > 0.05) return '#164e63';
  return '#0f172a';
}

function getHeatColorRGB(v) {
  // Smooth interpolation for gradient
  if (v > 0.8) {
    const t = (v - 0.8) / 0.2;
    return `rgb(${Math.round(34 + t * (34))}, ${Math.round(211 - t * 30)}, ${Math.round(238 - t * 20)})`;
  }
  if (v > 0.3) {
    const t = (v - 0.3) / 0.5;
    return `rgb(${Math.round(14 + t * 20)}, ${Math.round(116 + t * 95)}, ${Math.round(144 + t * 94)})`;
  }
  if (v > 0.05) {
    const t = (v - 0.05) / 0.25;
    return `rgb(${Math.round(15 + t * 0)}, ${Math.round(30 + t * 86)}, ${Math.round(41 + t * 103)})`;
  }
  return '#0f172a';
}

export default function AttentionHeatmap({
  activeLayer,
  setActiveLayer,
  aDigits,
  bDigits,
  carries,
  rawSums,
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const size = activeLayer === 0 ? 10 : 11;
  const matrix = [];

  for (let q = 0; q < size; q++) {
    const row = [];
    for (let k = 0; k < size; k++) {
      if (activeLayer === 0) {
        // Layer 0: strict diagonal (positional hard-wiring)
        row.push(q === k ? 0.95 : Math.exp(-4 * Math.abs(q - k)) * 0.04);
      } else {
        // Layer 1: sub-diagonal carry chain
        if (q === 0) {
          row.push(k === 0 ? 0.4 : 0.01);
        } else {
          row.push(
            k === q - 1
              ? 0.92
              : k === q
                ? 0.06
                : 0.01
          );
        }
      }
    }
    matrix.push(row);
  }

  const labels =
    activeLayer === 0
      ? Array.from({ length: 10 }, (_, i) => `d${i}`)
      : Array.from({ length: 11 }, (_, i) => (i < 10 ? `d${i}` : 'c'));

  const getTooltip = (qi, ki) => {
    if (activeLayer === 0) {
      if (qi === ki) {
        return `a[${qi}]=${aDigits[qi]} pairs with b[${ki}]=${bDigits[ki]} → sum=${aDigits[qi] + bDigits[ki]}`;
      }
      return `a[${qi}] does NOT attend to b[${ki}] (position mismatch)`;
    }
    if (ki === qi - 1 && qi > 0) {
      return `Position ${qi} reads carry from position ${ki} (carry=${carries[qi]})`;
    }
    return `Minimal attention (not part of carry chain)`;
  };

  return (
    <section className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
          Attention Matrix
        </h2>
        <div className="flex gap-1">
          {[0, 1].map((l) => (
            <button
              key={l}
              onClick={() => setActiveLayer(l)}
              className={`px-3 py-1.5 text-[11px] font-mono rounded-lg transition-all ${
                activeLayer === l
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                  : 'bg-gray-800/60 text-gray-500 border border-gray-700/50 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              Layer {l}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-500 mb-5 leading-relaxed">
        {activeLayer === 0
          ? 'Positional hard-wiring pairs digit aₙ with digit bₙ via RoPE-tuned Q/K matrices. This is deterministic matching, not probabilistic attention.'
          : 'Carry propagation chain — each position attends to its predecessor to check if a carry was generated (sum >= 10).'}
      </p>

      {/* Heatmap grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block">
          {/* Column headers */}
          <div className="flex ml-10">
            {labels.map((l, i) => (
              <div
                key={i}
                className="w-9 h-7 flex items-center justify-center text-[10px] font-mono text-gray-500"
              >
                {activeLayer === 0 ? `b${i}` : l}
              </div>
            ))}
          </div>

          {/* Rows */}
          {matrix.map((row, qi) => (
            <div key={qi} className="flex items-center">
              <div className="w-10 text-[10px] font-mono text-gray-500 text-right pr-2">
                {activeLayer === 0 ? `a${qi}` : labels[qi]}
              </div>
              {row.map((v, ki) => (
                <div
                  key={ki}
                  className="w-9 h-9 border border-gray-800/30 heatmap-cell relative cursor-crosshair flex items-center justify-center"
                  style={{ backgroundColor: getHeatColorRGB(v) }}
                  title={getTooltip(qi, ki)}
                  onMouseEnter={() => setHoveredCell({ q: qi, k: ki, v })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {v > 0.5 && (
                    <span className="text-[9px] font-mono text-white/90 font-bold">
                      {v.toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hover info */}
      <div className="h-8 mt-2">
        {hoveredCell && (
          <p className="text-[11px] font-mono text-gray-400 animate-fade-in">
            {getTooltip(hoveredCell.q, hoveredCell.k)}
            <span className="text-cyan-400 ml-2">
              score={hoveredCell.v.toFixed(3)}
            </span>
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] text-gray-600 font-mono">0.0</span>
        <div className="flex rounded overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => i / 19).map((v, i) => (
            <div
              key={i}
              className="w-3 h-3"
              style={{ backgroundColor: getHeatColorRGB(v) }}
            />
          ))}
        </div>
        <span className="text-[10px] text-gray-600 font-mono">1.0</span>
      </div>

      {/* Key insight */}
      <div className="mt-5 p-4 bg-cyan-950/20 border border-cyan-800/20 rounded-xl">
        <p className="text-[11px] text-cyan-300/70 leading-relaxed">
          {activeLayer === 0 ? (
            <>
              <span className="text-cyan-300 font-semibold">Key insight:</span>{' '}
              The diagonal pattern shows deterministic 1-to-1 pairing. Unlike learned
              attention which distributes weight across all positions, these compiled
              weights create binary "switches" &mdash; each digit position exclusively
              attends to its counterpart.
            </>
          ) : (
            <>
              <span className="text-cyan-300 font-semibold">Key insight:</span>{' '}
              The sub-diagonal pattern creates a sequential carry chain. Position{' '}
              <em>n</em> reads the intermediate result from position <em>n-1</em>.
              This is the Transformer equivalent of a ripple-carry adder circuit in
              digital hardware.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
