import React, { useState, useMemo } from 'react';
import { 
  BrainCircuit, 
  HelpCircle, 
  Sparkles, 
  Hash, 
  Activity, 
  Layers, 
  BarChart, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { computeSelfAttention } from '../utils/attention';

const ATTENTION_EXAMPLES = [
  {
    label: 'Coreference Resolution (it -> animal)',
    text: "The animal didn't cross the street because it was too tired."
  },
  {
    label: 'Architecture Context (transformers -> attention)',
    text: "Transformers dynamically route embeddings using scaled dot-product attention."
  },
  {
    label: 'Groq Hardware (LPUs -> tensors)',
    text: "Groq LPUs process massive tensor weights with deterministic silicon speed."
  }
];

export default function AttentionTab() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [inputText, setInputText] = useState(ATTENTION_EXAMPLES[0].text);
  const [queryIndex, setQueryIndex] = useState(7); // "it" in example 1
  const [temperature, setTemperature] = useState(1.0);

  // Split input into words/tokens
  const rawWords = useMemo(() => {
    return inputText.match(/[\w]+|[^\s\w]/g) || ['Transformers', 'process', 'tokens'];
  }, [inputText]);

  // Compute self-attention metrics
  const attentionData = useMemo(() => {
    return computeSelfAttention(rawWords, queryIndex, temperature);
  }, [rawWords, queryIndex, temperature]);

  const { tokens, attentionWeights, rawScores, attentionMatrix, dk } = attentionData;
  const activeToken = tokens[queryIndex] || tokens[0];

  const handleSelectExample = (idx) => {
    setSelectedExample(idx);
    setInputText(ATTENTION_EXAMPLES[idx].text);
    // pick an interesting query index
    setQueryIndex(idx === 0 ? 7 : 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold uppercase tracking-wider font-mono">
              Stage 03 • Self-Attention Visualizer
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-display">
            Scaled Dot-Product Self-Attention Pipeline Bridge
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed mt-1">
            In Transformer architectures, tokens dynamically gather context by projecting into Query (Q), Key (K), and Value (V) spaces. Click any token below to designate it as the Query (Q) and inspect its softmax attention distribution over all Keys (K).
          </p>
        </div>

        {/* Formula Badge */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-center">
          <span className="text-slate-500 block text-[10px] uppercase mb-0.5">Core Equation</span>
          <span className="text-indigo-300 font-bold">
            Attention(Q,K,V) = softmax(QK<sup>T</sup> / √d<sub>k</sub>) V
          </span>
        </div>
      </div>

      {/* Example Prompts Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Preset Examples:
        </span>
        {ATTENTION_EXAMPLES.map((ex, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectExample(idx)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              selectedExample === idx
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Interactive Token Selector Row */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Select Query Token (Q) to Inspect Attention Distribution</span>
          </label>
          <span className="text-xs font-mono text-indigo-400">
            Active Query: <strong className="text-white font-bold">"{activeToken?.token}"</strong> (Index #{queryIndex})
          </span>
        </div>

        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
          {tokens.map((t, idx) => {
            const isQuery = idx === queryIndex;
            const weight = attentionWeights[idx] ?? 0;
            return (
              <button
                key={idx}
                onClick={() => setQueryIndex(idx)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  isQuery
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30 scale-105 ring-2 ring-indigo-400'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/60'
                }`}
              >
                <span>{t.token}</span>
                <span className={`text-[10px] ${isQuery ? 'text-indigo-200' : 'text-slate-500'}`}>
                  #{idx}
                </span>
                {!isQuery && weight > 0.15 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bézier Curve Arc Visualization */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Bézier Curve Softmax Weight Routing
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Arc Thickness & Glow ∝ Softmax Weight
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The curves below connect the active Query token to all Key tokens. Stronger connections glow brighter and render thicker arcs.
        </p>

        {/* SVG Canvas for Bézier Arcs */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 overflow-x-auto">
          <svg className="w-full h-44 min-w-[650px]" viewBox={`0 0 ${Math.max(650, tokens.length * 60)} 160`}>
            {/* Draw Arcs */}
            {tokens.map((kToken, kIdx) => {
              const startX = queryIndex * 58 + 30;
              const endX = kIdx * 58 + 30;
              const weight = attentionWeights[kIdx] ?? 0;
              
              if (startX === endX) {
                // Loopback self-attention
                return (
                  <path
                    key={kIdx}
                    d={`M ${startX} 115 C ${startX - 20} 50, ${startX + 20} 50, ${startX} 115`}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth={Math.max(1.5, weight * 8)}
                    strokeOpacity={Math.max(0.2, weight * 1.5)}
                  />
                );
              }

              const midX = (startX + endX) / 2;
              const dist = Math.abs(endX - startX);
              const heightFactor = Math.min(85, dist * 0.45);

              return (
                <path
                  key={kIdx}
                  d={`M ${startX} 115 Q ${midX} ${115 - heightFactor}, ${endX} 115`}
                  fill="none"
                  stroke={weight > 0.25 ? '#38bdf8' : weight > 0.1 ? '#818cf8' : '#334155'}
                  strokeWidth={Math.max(1, weight * 7)}
                  strokeOpacity={Math.max(0.15, weight * 1.4)}
                />
              );
            })}

            {/* Token Base Nodes */}
            {tokens.map((t, idx) => {
              const isQuery = idx === queryIndex;
              const weight = attentionWeights[idx] ?? 0;
              const x = idx * 58 + 30;

              return (
                <g key={idx} className="cursor-pointer" onClick={() => setQueryIndex(idx)}>
                  <circle
                    cx={x}
                    cy={120}
                    r={isQuery ? 14 : 10}
                    fill={isQuery ? '#6366f1' : weight > 0.2 ? '#0284c7' : '#1e293b'}
                    stroke={isQuery ? '#a5b4fc' : '#334155'}
                    strokeWidth={isQuery ? 2.5 : 1}
                  />
                  <text
                    x={x}
                    y={145}
                    textAnchor="middle"
                    fill={isQuery ? '#a5b4fc' : '#94a3b8'}
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    fontWeight={isQuery ? 'bold' : 'normal'}
                  >
                    {t.token.slice(0, 6)}
                  </text>
                  <text
                    x={x}
                    y={123}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={9}
                    fontFamily="JetBrains Mono"
                  >
                    {idx}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Main Grid: Softmax Heat-Bars (7 Cols) & Attention Matrix (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Softmax Heat-Bars (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-cyan-400" />
              <span>Key (K) Softmax Attention Heat-Bars</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Σ weights = 1.000 (100%)
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {tokens.map((kToken, kIdx) => {
              const isQuery = kIdx === queryIndex;
              const weight = attentionWeights[kIdx] ?? 0;
              const rawScore = rawScores[kIdx] ?? 0;
              const percentage = (weight * 100).toFixed(1);

              return (
                <div
                  key={kIdx}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isQuery
                      ? 'bg-indigo-950/40 border-indigo-500/40'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-5">#{kIdx}</span>
                      <strong className={isQuery ? 'text-indigo-300 font-bold' : 'text-slate-200'}>
                        {kToken.token}
                      </strong>
                      {isQuery && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          QUERY (Q)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        raw logit: {rawScore.toFixed(2)}
                      </span>
                      <span className="text-cyan-400 font-bold">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Heat bar */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isQuery 
                          ? 'bg-indigo-500' 
                          : weight > 0.2 
                          ? 'bg-cyan-400' 
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attention Matrix & Explanation (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* N x N Matrix Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Full Head Attention Matrix</span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[160px]">
              <table className="w-full text-center text-[10px] font-mono">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="p-1 text-left">Q \ K</th>
                    {tokens.slice(0, 8).map((_, i) => (
                      <th key={i} className="p-1">#{i}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  {attentionMatrix.slice(0, 8).map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx === queryIndex ? 'bg-indigo-950/40' : ''}>
                      <td className="p-1 text-left font-bold text-slate-400">#{rIdx}</td>
                      {row.weights.slice(0, 8).map((w, cIdx) => (
                        <td
                          key={cIdx}
                          className="p-1 font-bold"
                          style={{
                            backgroundColor: `rgba(99, 102, 241, ${Math.min(0.8, w * 2.5)})`,
                            color: w > 0.2 ? '#ffffff' : '#94a3b8'
                          }}
                        >
                          {(w * 100).toFixed(0)}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Educational Explainer */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 space-y-2 leading-relaxed">
            <span className="font-bold text-slate-200 block text-xs">
              Why scale by 1 / √d<sub>k</sub>?
            </span>
            <p>
              In high dimensions (e.g. d<sub>k</sub> = 64 or 128), vector dot products grow large in magnitude, pushing the softmax function into regions with near-zero gradients. Dividing by √64 = 8 preserves stable gradient flow during backpropagation.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
