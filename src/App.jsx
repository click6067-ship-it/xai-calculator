import React, { useState, useMemo } from 'react';
import InputPanel from './components/InputPanel';
import AttentionHeatmap from './components/AttentionHeatmap';
import CarryVisualizer from './components/CarryVisualizer';
import WeightInspector from './components/WeightInspector';
import TheorySection from './components/TheorySection';

function computeAddition(aStr, bStr) {
  const aDigits = aStr.split('').reverse().map(Number);
  const bDigits = bStr.split('').reverse().map(Number);
  const carries = [0];
  const rawSums = [];
  const resultDigits = [];

  for (let i = 0; i < 10; i++) {
    const raw = aDigits[i] + bDigits[i] + carries[i];
    rawSums.push(raw);
    resultDigits.push(raw % 10);
    carries.push(raw >= 10 ? 1 : 0);
  }

  rawSums.push(carries[10]);
  resultDigits.push(carries[10]);

  const resultStr = [...resultDigits].reverse().join('').replace(/^0+/, '') || '0';

  return { aDigits, bDigits, carries, rawSums, resultDigits, result: resultStr };
}

export default function App() {
  const [numA, setNumA] = useState('1234567890');
  const [numB, setNumB] = useState('9876543210');
  const [activeLayer, setActiveLayer] = useState(0);

  const paddedA = numA.padStart(10, '0').slice(-10);
  const paddedB = numB.padStart(10, '0').slice(-10);

  const computation = useMemo(
    () => computeAddition(paddedA, paddedB),
    [paddedA, paddedB]
  );

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200">
      {/* Fixed Home button — premium glass card */}
      <a
        href="https://yongha-kim-frontier.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="home-btn"
        title="Back to Portfolio"
      >
        <div className="home-btn__border" />
        <div className="home-btn__glass">
          <img src="/Yo-logo.png" alt="Home" className="home-btn__logo" />
        </div>
      </a>

      {/* Header */}
      <header className="border-b border-gray-800/60 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <div className="w-3 h-3 rounded-full bg-cyan-400 absolute inset-0 animate-ping opacity-20" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Zero-Training Compiler
            </h1>
            <span className="ml-2 px-2 py-0.5 text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full uppercase tracking-wider">
              Qwen3-343
            </span>
          </div>
          <p className="text-gray-400 text-lg ml-6">
            <span className="text-cyan-400 font-mono font-bold">343</span>{' '}
            parameters &middot; Zero gradient descent &middot;{' '}
            <span className="text-amber-400 font-semibold">100%</span> accurate
            10-digit addition
          </p>
          <p className="text-gray-500 text-sm mt-2 ml-6 max-w-3xl leading-relaxed">
            A Qwen3 Transformer whose weights are mathematically derived from the
            addition algorithm &mdash; not learned through training. Every weight
            has a purpose. Every computation is deterministic.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <InputPanel
          numA={numA}
          numB={numB}
          setNumA={setNumA}
          setNumB={setNumB}
          paddedA={paddedA}
          paddedB={paddedB}
          result={computation.result}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AttentionHeatmap
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            aDigits={computation.aDigits}
            bDigits={computation.bDigits}
            carries={computation.carries}
            rawSums={computation.rawSums}
          />
          <CarryVisualizer
            aDigits={computation.aDigits}
            bDigits={computation.bDigits}
            carries={computation.carries}
            rawSums={computation.rawSums}
            resultDigits={computation.resultDigits}
          />
        </div>

        <WeightInspector />
        <TheorySection />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 px-6 py-8 mt-8">
        <div className="max-w-7xl mx-auto text-center text-gray-600 text-xs font-mono">
          Qwen3-343 &middot; Algorithm &rarr; Weight Compilation &middot; No
          Training Required
        </div>
      </footer>
    </div>
  );
}
