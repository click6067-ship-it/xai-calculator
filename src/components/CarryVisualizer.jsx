import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Cell,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-xl text-xs font-mono">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-cyan-300">
        {d.a} + {d.b} + {d.carryIn} = {d.rawSum}
      </p>
      {d.rawSum >= 10 && (
        <p className="text-red-400 mt-1">Carry generated!</p>
      )}
      <p className="text-green-400 mt-1">Output: {d.result}</p>
    </div>
  );
};

export default function CarryVisualizer({
  aDigits,
  bDigits,
  carries,
  rawSums,
  resultDigits,
}) {
  const data = aDigits.map((a, i) => ({
    position: `d${i}`,
    a,
    b: bDigits[i],
    carryIn: carries[i],
    rawSum: rawSums[i],
    result: resultDigits[i],
    carryOut: carries[i + 1],
  }));

  const maxSum = Math.max(...rawSums, 12);

  return (
    <section className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-6 animate-fade-in">
      <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2">
        Carry Logic Gate (MLP)
      </h2>
      <p className="text-[11px] text-gray-500 mb-5 leading-relaxed">
        The MLP acts as a logical IF-THEN gate: when the column sum &ge; 10, it
        fires a carry bit to the next position. SiLU activation is weaponized as
        a hard threshold.
      </p>

      {/* Bar chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f2937"
              vertical={false}
            />
            <XAxis
              dataKey="position"
              tick={{
                fill: '#9ca3af',
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
              }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis
              tick={{
                fill: '#6b7280',
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
              }}
              domain={[0, Math.max(maxSum + 1, 12)]}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={10}
              stroke="#f59e0b"
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{
                value: 'CARRY THRESHOLD = 10',
                fill: '#f59e0b',
                fontSize: 9,
                fontFamily: 'JetBrains Mono, monospace',
                position: 'insideTopRight',
              }}
            />
            <Bar dataKey="rawSum" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.rawSum >= 10 ? '#ef4444' : '#06b6d4'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Digit-by-digit table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="text-gray-600 border-b border-gray-800/60">
              <th className="text-left py-2 pr-4 font-medium">POS</th>
              {data.map((_, i) => (
                <th key={i} className="px-2 py-2 text-center font-medium">
                  d{i}
                </th>
              ))}
              <th className="px-2 py-2 text-center font-medium text-amber-500">
                d10
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1.5 pr-4 text-gray-500">A</td>
              {data.map((d, i) => (
                <td key={i} className="text-center text-cyan-300">
                  {d.a}
                </td>
              ))}
              <td className="text-center text-gray-700">&mdash;</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-4 text-gray-500">B</td>
              {data.map((d, i) => (
                <td key={i} className="text-center text-amber-300">
                  {d.b}
                </td>
              ))}
              <td className="text-center text-gray-700">&mdash;</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-4 text-gray-500">Carry in</td>
              {data.map((d, i) => (
                <td
                  key={i}
                  className={`text-center ${
                    d.carryIn ? 'text-red-400 font-bold' : 'text-gray-600'
                  }`}
                >
                  {d.carryIn}
                </td>
              ))}
              <td
                className={`text-center ${
                  carries[10] ? 'text-red-400 font-bold' : 'text-gray-600'
                }`}
              >
                {carries[10]}
              </td>
            </tr>
            <tr className="border-t border-gray-800/40">
              <td className="py-1.5 pr-4 text-gray-500 font-semibold">
                Raw sum
              </td>
              {data.map((d, i) => (
                <td
                  key={i}
                  className={`text-center font-bold ${
                    d.rawSum >= 10 ? 'text-red-400' : 'text-gray-200'
                  }`}
                >
                  {d.rawSum}
                </td>
              ))}
              <td className="text-center text-gray-400">{carries[10]}</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-4 text-gray-500">Carry out</td>
              {data.map((d, i) => (
                <td
                  key={i}
                  className={`text-center ${
                    d.carryOut
                      ? 'text-red-400 font-bold'
                      : 'text-gray-600'
                  }`}
                >
                  {d.carryOut}
                </td>
              ))}
              <td className="text-center text-gray-600">0</td>
            </tr>
            <tr className="border-t border-gray-700/50">
              <td className="py-1.5 pr-4 text-gray-400 font-bold">Output</td>
              {data.map((d, i) => (
                <td key={i} className="text-center font-bold text-green-400">
                  {d.result}
                </td>
              ))}
              <td className="text-center font-bold text-green-400">
                {resultDigits[10]}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Carry flow */}
      <div className="mt-5 flex items-center gap-1 overflow-x-auto py-3 px-1">
        {data.map((d, i) => (
          <React.Fragment key={i}>
            <div
              className={`flex flex-col items-center rounded-xl px-2.5 py-2 border transition-colors shrink-0 ${
                d.rawSum >= 10
                  ? 'bg-red-950/30 border-red-800/40'
                  : 'bg-gray-800/40 border-gray-700/40'
              }`}
            >
              <span className="text-[9px] text-gray-600 font-mono">
                d{i}
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {d.a}+{d.b}
              </span>
              <span
                className={`text-[10px] font-mono ${
                  d.rawSum >= 10 ? 'text-red-400' : 'text-gray-400'
                }`}
              >
                ={d.rawSum}
              </span>
            </div>
            {i < 9 && (
              <div
                className={`text-base font-mono shrink-0 ${
                  d.carryOut
                    ? 'text-red-400 carry-active font-bold'
                    : 'text-gray-700'
                }`}
              >
                {d.carryOut ? '→1→' : '→'}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* MLP explanation */}
      <div className="mt-5 p-4 bg-cyan-950/20 border border-cyan-800/20 rounded-xl">
        <p className="text-[11px] text-cyan-300/70 leading-relaxed">
          <span className="text-cyan-300 font-semibold">
            Layer 1 MLP down_proj:
          </span>{' '}
          <code className="text-amber-300 bg-gray-800/60 px-1.5 py-0.5 rounded">
            [1, -10, +10]
          </code>{' '}
          in dimension 2. When sum &ge; 10, gate neurons activate:{' '}
          <span className="text-green-300">+1</span> passes the raw sum,{' '}
          <span className="text-red-300">-10</span> subtracts (mod 10),{' '}
          <span className="text-cyan-300">+10</span> propagates the carry. A
          continuous activation discretized into a logic gate.
        </p>
      </div>
    </section>
  );
}
