import React, { useState, useMemo } from 'react';
import { 
  Binary, 
  Sliders, 
  Search, 
  Sparkles, 
  FileText, 
  Check, 
  Copy, 
  Layers, 
  BarChart2, 
  HelpCircle 
} from 'lucide-react';
import { 
  tokenizeWithVocabSlider, 
  BASE_VOCABULARY, 
  CLUSTERS 
} from '../utils/tokenizer';

const SAMPLE_TEXTS = [
  {
    label: 'LLM Mechanics',
    text: 'Transformers process embeddings in vector space before language models predict next tokens.'
  },
  {
    label: 'Subword Decomposition',
    text: 'Tokenization decomposes complex multilingual sentences into dynamic subword parameters.'
  },
  {
    label: 'Groq Silicon',
    text: 'Groq LPUs execute deterministic tensor calculations with minimal inference latency.'
  },
  {
    label: 'Deep Learning',
    text: 'Neural networks optimize loss functions using backpropagation and gradient descent.'
  }
];

export default function TokenizerTab() {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [vocabPercent, setVocabPercent] = useState(70);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Compute tokens with dynamic vocabulary slider
  const tokens = useMemo(() => {
    return tokenizeWithVocabSlider(inputText, vocabPercent);
  }, [inputText, vocabPercent]);

  // Statistics
  const charCount = inputText.length;
  const tokenCount = tokens.length;
  const charsPerToken = tokenCount > 0 ? (charCount / tokenCount).toFixed(2) : 0;
  const subwordCount = tokens.filter(t => t.isSubword).length;
  const compressionRatio = charCount > 0 ? (((charCount - tokenCount) / charCount) * 100).toFixed(1) : 0;

  // Filtered vocabulary list
  const filteredVocab = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return BASE_VOCABULARY;
    return BASE_VOCABULARY.filter(item => 
      item.word.toLowerCase().includes(q) || 
      item.id.toString().includes(q) ||
      item.cluster.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  const copyTokensAsJson = () => {
    navigator.clipboard.writeText(JSON.stringify(tokens, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold uppercase tracking-wider font-mono">
              Stage 01 • Tokenizer Lab
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-display">
            Byte Pair Encoding (BPE) & Dynamic Vocabulary Decomposition
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed mt-1">
            Language models cannot read strings directly. Text is sliced into discrete tokens mapped to numerical IDs. Drag the vocabulary slider left to observe how words break down into subwords (<code className="text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/30 font-mono">##subwords</code>).
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          {Object.entries(CLUSTERS).map(([key, item]) => (
            <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Input & Vocabulary Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Text & Samples (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Input Text Stream</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {charCount} characters
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            placeholder="Type or paste any text to tokenize..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 font-mono focus:border-cyan-500 focus:outline-none transition-all resize-none"
          />

          {/* Sample Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1">
              Sample Prompts:
            </span>
            {SAMPLE_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(sample.text)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Dynamic Vocabulary Slider (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-400" />
                <span>Vocabulary Dynamic Slider</span>
              </label>
              <span className="text-xs font-mono font-bold text-orange-400">
                {vocabPercent}% Capacity
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Drag left to simulate a constrained vocabulary size. As full words drop out of the active lexicon, the BPE engine decomposes them into constituent subwords.
            </p>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={vocabPercent}
              onChange={(e) => setVocabPercent(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5">
              <span>10% (High Subword Fragmentation)</span>
              <span>100% (Full Lexicon)</span>
            </div>
          </div>

          {/* Real-time Subword Status Box */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Active Subwords</span>
              <strong className="text-emerald-400 text-sm">{subwordCount} fragmented</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Compression Savings</span>
              <strong className="text-cyan-400 text-sm">+{compressionRatio}% efficiency</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Live Tokenized Chips Output Panel */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Tokenized Output Sequence ({tokenCount} tokens)
            </h3>
          </div>
          <button
            onClick={copyTokensAsJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-all self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>Copy Tokens JSON</span>
          </button>
        </div>

        {/* Token Chips Display */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[100px] flex flex-wrap gap-2 items-center">
          {tokens.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No tokens generated yet.</span>
          ) : (
            tokens.map((t, idx) => {
              const clusterInfo = CLUSTERS[t.cluster] || CLUSTERS.CONCEPT;
              return (
                <div
                  key={idx}
                  className="group relative inline-flex flex-col items-center px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all transform hover:scale-105 select-none"
                  style={{
                    backgroundColor: clusterInfo.bg,
                    borderColor: clusterInfo.border,
                    borderWidth: '1px',
                    color: clusterInfo.color
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{t.token}</span>
                    {t.isSubword && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        sub
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 opacity-70 group-hover:opacity-100">
                    #{t.id}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Compression Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Characters</span>
            <span className="text-base font-bold font-mono text-slate-200">{charCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Token Count</span>
            <span className="text-base font-bold font-mono text-cyan-400">{tokenCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Chars / Token</span>
            <span className="text-base font-bold font-mono text-amber-400">{charsPerToken}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Compression</span>
            <span className="text-base font-bold font-mono text-emerald-400">+{compressionRatio}%</span>
          </div>
        </div>
      </div>

      {/* Searchable Vocabulary Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" />
              <span>Vocabulary Registry & Token IDs ({filteredVocab.length} entries)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Inspect token IDs, categories, and pre-training corpus frequencies.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search word, ID, or category..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:border-purple-500 focus:outline-none transition-all w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Token ID</th>
                <th className="py-2.5 px-4 font-semibold">Token String</th>
                <th className="py-2.5 px-4 font-semibold">Category Cluster</th>
                <th className="py-2.5 px-4 font-semibold">Corpus Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
              {filteredVocab.slice(0, 15).map((item) => {
                const cluster = CLUSTERS[item.cluster] || CLUSTERS.CONCEPT;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400">#{item.id}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-200">{item.word}</td>
                    <td className="py-2.5 px-4">
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{ color: cluster.color, backgroundColor: cluster.bg }}
                      >
                        {cluster.name}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{item.freq.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
