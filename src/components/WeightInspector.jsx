import React, { useState } from 'react';

const WEIGHT_GROUPS = [
  {
    name: 'Embedding',
    key: 'embed',
    description:
      'Maps digit d to [100, d, 0, 0, 0]. The 100 acts as a "presence flag" for attention scaling. Dimension 1 carries the actual digit value.',
    shape: '10 x 5',
    highlight: 'Row d = [100, d, 0, 0, 0]',
    matrix: [
      [100, 0, 0, 0, 0],
      [100, 1, 0, 0, 0],
      [100, 2, 0, 0, 0],
      [100, 3, 0, 0, 0],
      [100, 4, 0, 0, 0],
      [100, 5, 0, 0, 0],
      [100, 6, 0, 0, 0],
      [100, 7, 0, 0, 0],
      [100, 8, 0, 0, 0],
      [100, 9, 0, 0, 0],
    ],
    rowLabels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    colLabels: ['d0', 'd1', 'd2', 'd3', 'd4'],
  },
  {
    name: 'Layer 0 — Q Projection',
    key: 'l0_q',
    description:
      'Projects the embedding into query vectors. Only uses dimension 0 (the constant 100). The Q values encode rotation angles designed to match with specific key positions via RoPE.',
    shape: '4 x 5',
    matrix: [
      [0.985, 0, 0, 0, 0],
      [0.172, 0, 0, 0, 0],
      [0.966, 0, 0, 0, 0],
      [-0.257, 0, 0, 0, 0],
    ],
    rowLabels: ['H0:0', 'H0:1', 'H1:0', 'H1:1'],
    colLabels: ['d0', 'd1', 'd2', 'd3', 'd4'],
  },
  {
    name: 'Layer 0 — K Projection',
    key: 'l0_k',
    description:
      'Key projection — shared across heads (GQA with 1 KV head). Paired with Q via RoPE to achieve positional hard-wiring.',
    shape: '2 x 5',
    matrix: [
      [-0.317, 0, 0, 0, 0],
      [-0.949, 0, 0, 0, 0],
    ],
    rowLabels: ['k0', 'k1'],
    colLabels: ['d0', 'd1', 'd2', 'd3', 'd4'],
  },
  {
    name: 'Layer 0 — V Projection',
    key: 'l0_v',
    description:
      'Extracts the digit value (dim 1) from the embedding. Only V[0,1]=1 is non-zero — a pure "copy" operation.',
    shape: '2 x 5',
    highlight: 'V[0,1] = 1 copies digit value',
    matrix: [
      [0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    rowLabels: ['v0', 'v1'],
    colLabels: ['d0', 'd1', 'd2', 'd3', 'd4'],
  },
  {
    name: 'Layer 0 — O Projection',
    key: 'l0_o',
    description:
      'Routes the attended digit value into dimension 2 (the "sum accumulation" channel). Both heads contribute to dim 2.',
    shape: '5 x 4',
    highlight: 'Row 2 routes sum to dim 2',
    matrix: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 0, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    rowLabels: ['d0', 'd1', 'd2', 'd3', 'd4'],
    colLabels: ['H0:0', 'H0:1', 'H1:0', 'H1:1'],
  },
  {
    name: 'Layer 0 — MLP Down Proj',
    key: 'l0_down',
    description:
      'Routes MLP output to dimension 3 (carry intermediate). The [1, -1, 0] pattern starts the carry detection.',
    shape: '5 x 3',
    matrix: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [1, -1, 0],
      [0, 0, 0],
    ],
    rowLabels: ['d0', 'd1', 'd2', 'd3', 'd4'],
    colLabels: ['n0', 'n1', 'n2'],
  },
  {
    name: 'Layer 1 — MLP Down Proj',
    key: 'l1_down',
    description:
      'THE CARRY LOGIC GATE. [1, -10, +10] in dimension 2: neuron 0 passes raw sum, neuron 1 subtracts 10 (mod operation), neuron 2 adds 10 (carry propagation).',
    shape: '5 x 3',
    highlight: 'CRITICAL: [1, -10, 10]',
    matrix: [
      [0, 0, 0],
      [0, 0, 0],
      [1, -10, 10],
      [0, 0, 0],
      [0, 0, 0],
    ],
    rowLabels: ['d0', 'd1', 'd2', 'd3', 'd4'],
    colLabels: ['n0', 'n1', 'n2'],
  },
  {
    name: 'LM Head',
    key: 'lm_head',
    description:
      'Maps the 5-dim hidden state to 10-class logits (digits 0-9). These weights form an exact linear discriminant — not an approximation.',
    shape: '10 x 5',
    matrix: [
      [5.578, 3.132, -404.4, 62.59, 0.994],
      [5.081, 2.469, -314.4, 48.67, 0.773],
      [3.692, 1.766, -224.6, 34.76, 0.551],
      [1.408, 1.023, -134.7, 20.85, 0.328],
      [-1.768, 0.241, -44.9, 6.942, 0.103],
      [-5.838, -0.581, 44.87, -6.959, -0.122],
      [-10.8, -1.442, 134.6, -20.86, -0.348],
      [-16.66, -2.343, 224.3, -34.75, -0.576],
      [-23.41, -3.283, 313.9, -48.64, -0.805],
      [-31.05, -4.263, 403.5, -62.53, -1.034],
    ],
    rowLabels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    colLabels: ['d0', 'd1', 'd2', 'd3', 'd4'],
  },
];

function getCellColor(v) {
  const abs = Math.abs(v);
  if (abs === 0) return 'text-gray-700';
  if (abs >= 100) return v > 0 ? 'text-cyan-300 font-bold' : 'text-red-400 font-bold';
  if (abs >= 10) return v > 0 ? 'text-cyan-400' : 'text-red-400';
  if (abs >= 1) return v > 0 ? 'text-green-400' : 'text-amber-400';
  return 'text-gray-400';
}

function getCellBg(v) {
  const abs = Math.abs(v);
  if (abs === 0) return '';
  if (abs >= 100) return v > 0 ? 'bg-cyan-950/30' : 'bg-red-950/30';
  if (abs >= 10) return v > 0 ? 'bg-cyan-950/15' : 'bg-red-950/15';
  return '';
}

function formatVal(v) {
  if (v === 0) return '0';
  if (Number.isInteger(v)) return v.toString();
  if (Math.abs(v) >= 100) return v.toFixed(1);
  return v.toFixed(3);
}

function WeightMatrix({ group }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-[11px] font-mono border-collapse">
        {group.colLabels && (
          <thead>
            <tr>
              <th className="w-10" />
              {group.colLabels.map((l, j) => (
                <th
                  key={j}
                  className="px-3 py-1 text-[9px] text-gray-600 font-normal"
                >
                  {l}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {group.matrix.map((row, i) => (
            <tr key={i} className="border-t border-gray-800/20">
              {group.rowLabels && (
                <td className="pr-2 text-[9px] text-gray-600 text-right">
                  {group.rowLabels[i]}
                </td>
              )}
              {row.map((v, j) => (
                <td
                  key={j}
                  className={`px-3 py-1 text-right ${getCellColor(v)} ${getCellBg(v)} rounded`}
                >
                  {formatVal(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WeightInspector() {
  const [expanded, setExpanded] = useState({});

  const toggle = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            Weight Inspector
          </h2>
          <p className="text-[11px] text-gray-500 mt-1">
            Every weight analytically derived. Total:{' '}
            <span className="text-amber-400 font-mono font-bold">343</span>{' '}
            parameters.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-gray-600">
          <span>
            <span className="text-cyan-400">&#9632;</span> positive &ge;1
          </span>
          <span>
            <span className="text-red-400">&#9632;</span> negative
          </span>
          <span>
            <span className="text-gray-700">&#9632;</span> zero
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        {WEIGHT_GROUPS.map((group) => (
          <div
            key={group.key}
            className="border border-gray-800/40 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggle(group.key)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-800/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] text-gray-600 transition-transform duration-200 ${
                    expanded[group.key] ? 'rotate-90' : ''
                  }`}
                >
                  &#9654;
                </span>
                <span className="text-sm text-gray-200 group-hover:text-white transition-colors">
                  {group.name}
                </span>
                <span className="text-[10px] font-mono text-gray-600 bg-gray-800/50 px-2 py-0.5 rounded">
                  {group.shape}
                </span>
              </div>
              {group.highlight && (
                <span className="text-[10px] font-mono text-amber-400/70">
                  {group.highlight}
                </span>
              )}
            </button>

            {expanded[group.key] && (
              <div className="px-5 pb-5 border-t border-gray-800/30 animate-fade-in">
                <p className="text-[11px] text-gray-500 my-3 leading-relaxed">
                  {group.description}
                </p>
                <WeightMatrix group={group} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison */}
      <div className="mt-5 p-4 bg-cyan-950/20 border border-cyan-800/20 rounded-xl">
        <p className="text-[11px] text-cyan-300/70 leading-relaxed">
          <span className="text-cyan-300 font-semibold">
            Compiled vs. Learned:
          </span>{' '}
          In a gradient-trained model, these matrices contain seemingly random
          floats (e.g., 0.0234, -0.1892, 0.4621...) with no discernible pattern.
          Here, every non-zero entry serves an algebraic purpose:{' '}
          <code className="text-amber-300 bg-gray-800/60 px-1 rounded">100</code>{' '}
          scales attention,{' '}
          <code className="text-green-300 bg-gray-800/60 px-1 rounded">1.0</code>{' '}
          copies values,{' '}
          <code className="text-red-300 bg-gray-800/60 px-1 rounded">-10</code>{' '}
          implements modular arithmetic.
        </p>
      </div>
    </section>
  );
}
