import React from 'react';

export default function InputPanel({
  numA,
  numB,
  setNumA,
  setNumB,
  paddedA,
  paddedB,
  result,
}) {
  const handleChange = (setter) => (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setter(val || '0');
  };

  const aReversed = paddedA.split('').reverse();
  const bReversed = paddedB.split('').reverse();
  const tokens = ['0', ...aReversed, '0', '0', ...bReversed, '0'];

  const getTokenStyle = (i) => {
    if (i === 0 || i === 11 || i === 12 || i === 23) {
      return {
        bg: 'bg-gray-800/40',
        text: 'text-gray-600',
        border: 'border-gray-700/30',
        label: 'PAD',
      };
    }
    if (i >= 1 && i <= 10) {
      return {
        bg: 'bg-cyan-950/40',
        text: 'text-cyan-300',
        border: 'border-cyan-800/30',
        label: `a${10 - i}`,
      };
    }
    return {
      bg: 'bg-amber-950/40',
      text: 'text-amber-300',
      border: 'border-amber-800/30',
      label: `b${22 - i}`,
    };
  };

  return (
    <section className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-6 glow-cyan animate-fade-in">
      <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-5">
        Input Interface
      </h2>

      {/* Number inputs */}
      <div className="flex flex-wrap items-end gap-4 mb-8">
        <div>
          <label className="block text-[11px] text-gray-500 mb-1.5 font-mono tracking-wide">
            ADDEND A
          </label>
          <input
            type="text"
            value={numA}
            onChange={handleChange(setNumA)}
            className="bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-xl font-mono text-white w-52 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            placeholder="0000000000"
            maxLength={10}
          />
        </div>
        <span className="text-3xl text-gray-600 pb-2 font-light">+</span>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1.5 font-mono tracking-wide">
            ADDEND B
          </label>
          <input
            type="text"
            value={numB}
            onChange={handleChange(setNumB)}
            className="bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-xl font-mono text-white w-52 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            placeholder="0000000000"
            maxLength={10}
          />
        </div>
        <span className="text-3xl text-gray-600 pb-2 font-light">=</span>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1.5 font-mono tracking-wide">
            RESULT
          </label>
          <div className="bg-gray-800/30 border border-amber-500/30 rounded-xl px-4 py-3 text-xl font-mono text-amber-400 min-w-[13rem] font-bold tracking-wide">
            {result}
          </div>
        </div>
      </div>

      {/* Token encoding */}
      <div>
        <h3 className="text-[11px] text-gray-500 mb-3 font-mono tracking-wide">
          TOKEN ENCODING &mdash; 24 tokens, reversed digits with sentinel padding
        </h3>
        <div className="flex flex-wrap gap-1">
          {tokens.map((t, i) => {
            const style = getTokenStyle(i);
            return (
              <div
                key={i}
                className={`${style.bg} ${style.text} border ${style.border} rounded-lg px-2 py-1.5 text-xs font-mono flex flex-col items-center min-w-[2.2rem] transition-colors`}
              >
                <span className="text-[9px] text-gray-600 leading-tight">
                  {i}
                </span>
                <span className="font-bold text-sm leading-tight">{t}</span>
                <span className="text-[8px] text-gray-600 leading-tight mt-0.5">
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-5 mt-3 text-[10px] text-gray-600 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-950/60 border border-cyan-800/30" />
            Number A (reversed)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-950/60 border border-amber-800/30" />
            Number B (reversed)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-gray-800/40 border border-gray-700/30" />
            Padding sentinel
          </span>
        </div>
      </div>
    </section>
  );
}
