import React, { useState, useMemo } from 'react';
import { 
  Workflow, 
  ArrowRight, 
  Binary, 
  Box, 
  BrainCircuit, 
  Cpu, 
  Sparkles, 
  RotateCcw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { tokenizeWithVocabSlider } from '../utils/tokenizer';

const PIPELINE_STEPS = [
  {
    step: 1,
    id: 'input',
    title: '1. Raw Text Prompt',
    subtitle: 'Unstructured Natural Language',
    icon: Sparkles,
    color: 'from-orange-500 to-amber-500',
    description: 'The user submits raw string text. Computers cannot process strings directly—characters must be translated into structured discrete elements.'
  },
  {
    step: 2,
    id: 'tokenize',
    title: '2. BPE Tokenization',
    subtitle: 'Discrete Lexical Tokens',
    icon: Binary,
    color: 'from-cyan-500 to-blue-500',
    description: 'Byte Pair Encoding (BPE) breaks text into tokens and assigns each token an integer ID from the fixed vocabulary dictionary.'
  },
  {
    step: 3,
    id: 'embedding',
    title: '3. Embedding + Positional Encoding',
    subtitle: 'Dense Vector Projections',
    icon: Box,
    color: 'from-emerald-500 to-teal-500',
    description: 'Each token ID is mapped into a d-dimensional vector (e.g. 4096 dimensions) and merged with Positional Encodings (RoPE or Sinusoidal) to encode word order.'
  },
  {
    step: 4,
    id: 'transformer',
    title: '4. Multi-Head Attention & FFN',
    subtitle: 'Contextual Layer Stacks',
    icon: BrainCircuit,
    color: 'from-indigo-500 to-purple-500',
    description: 'Dozens of transformer decoder layers perform self-attention, dynamically routing information between tokens before Feed-Forward Networks process high-level features.'
  },
  {
    step: 5,
    id: 'output',
    title: '5. Logits & Softmax Sampling',
    subtitle: 'Next-Token Probability',
    icon: Cpu,
    color: 'from-rose-500 to-pink-500',
    description: 'The final hidden state is projected against the vocabulary matrix (unembedding) producing raw logits, normalized by Softmax to predict the next token.'
  }
];

export default function PipelineTab() {
  const [promptText, setPromptText] = useState('The fastest AI chips for LLM inference are');
  const [activeStep, setActiveStep] = useState(1);
  const [temperature, setTemperature] = useState(0.7);

  // Tokens
  const tokens = useMemo(() => {
    return tokenizeWithVocabSlider(promptText);
  }, [promptText]);

  // Simulated Next-Token Candidates
  const nextTokenCandidates = useMemo(() => {
    const rawScores = [
      { token: 'Groq', logit: 8.4 },
      { token: 'custom', logit: 6.2 },
      { token: 'designed', logit: 5.8 },
      { token: 'optimized', logit: 5.1 },
      { token: 'specialized', logit: 4.6 },
      { token: 'tensor', logit: 3.9 }
    ];

    const temp = Math.max(0.05, temperature);
    const expScores = rawScores.map(c => ({
      ...c,
      exp: Math.exp(c.logit / temp)
    }));
    const totalExp = expScores.reduce((sum, c) => sum + c.exp, 0);

    return expScores.map(c => ({
      token: c.token,
      prob: +((c.exp / totalExp) * 100).toFixed(1),
      logit: c.logit
    })).sort((a, b) => b.prob - a.prob);
  }, [temperature]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-orange-950/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold uppercase tracking-wider font-mono">
              Stage 04 • Architectural Pipeline
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-display">
            End-to-End Large Language Model Architecture Lab
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed mt-1">
            Follow the life of a prompt through the five fundamental stages of modern generative AI: from raw characters to next-token probability distribution.
          </p>
        </div>

        <button
          onClick={() => setActiveStep(prev => prev < 5 ? prev + 1 : 1)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <span>{activeStep < 5 ? 'Step Forward' : 'Restart Pipeline'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stepper Navigation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {PIPELINE_STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = activeStep === s.step;
          const isDone = activeStep > s.step;

          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900 border-orange-500 shadow-lg shadow-orange-500/10'
                  : isDone
                  ? 'bg-slate-950/90 border-slate-700/80 hover:border-slate-600'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 block">Stage 0{s.step}</span>
                <span className={`text-xs font-bold truncate block ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {s.title.split('. ')[1]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Workspace */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
        
        {/* Stage Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold block mb-1">
              Currently Inspecting Stage {activeStep} of 5
            </span>
            <h3 className="text-base font-bold text-slate-100 font-display">
              {PIPELINE_STEPS[activeStep - 1].title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {PIPELINE_STEPS[activeStep - 1].description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Input length: {tokens.length} tokens
            </span>
          </div>
        </div>

        {/* Stage Specific Interactive Views */}

        {/* STAGE 1: Prompt Input */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Edit Pipeline Prompt:
            </label>
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono focus:border-orange-500 focus:outline-none"
            />
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300">Raw Prompt Status:</span>
              <p>Length: {promptText.length} characters • UTF-8 byte stream ready for BPE token splitting.</p>
            </div>
          </div>
        )}

        {/* STAGE 2: BPE Tokenization */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Discretized Token Sequence ({tokens.length} tokens):
            </span>
            <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              {tokens.map((t, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
                  <div className="font-bold text-cyan-300">{t.token}</div>
                  <div className="text-[10px] text-slate-500">ID: #{t.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: Embedding & Positional Encoding */}
        {activeStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Token Embedding Vector Projections (x = E_token + PE_pos):
            </span>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {tokens.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-5">pos {idx}:</span>
                    <strong className="text-emerald-300">{t.token}</strong>
                  </div>
                  <span className="text-slate-500 truncate max-w-sm">
                    [0.042, -0.187, 0.912, 0.005, -0.421, ... 4096 dims]
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 4: Multi-Head Transformer Layers */}
        {activeStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Transformer Block Execution Stack:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-indigo-400 font-bold block">1. Multi-Head Attention</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  32 heads compute parallel QK^T dot products across full sequence context.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold block">2. Residual & RMSNorm</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Skip connections prevent vanishing gradients and normalize intermediate tensor variance.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-bold block">3. SwiGLU / MLP Block</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Expands hidden dimension 3.5x to retrieve memorized facts and knowledge representations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: Logits & Softmax Sampling */}
        {activeStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Next-Token Softmax Probability Distribution:
                </span>
                <p className="text-[11px] text-slate-400">
                  Tuning temperature modifies the probability entropy before token sampling.
                </p>
              </div>

              {/* Temperature Slider */}
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs font-mono text-slate-400">Temp:</span>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono text-orange-400 font-bold w-10">
                  {temperature.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Candidate Next Tokens Bar */}
            <div className="space-y-2.5">
              {nextTokenCandidates.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="flex justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-4">#{idx + 1}</span>
                      <strong className="text-slate-100 text-sm">"{c.token}"</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">logit: {c.logit}</span>
                      <strong className="text-orange-400 text-sm">{c.prob}%</strong>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-200"
                      style={{ width: `${c.prob}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
