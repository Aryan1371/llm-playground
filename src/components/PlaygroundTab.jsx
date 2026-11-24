import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Square, 
  Trash2, 
  Copy, 
  Check, 
  Gauge, 
  Clock, 
  Hash, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  BrainCircuit, 
  Terminal, 
  Sliders, 
  RotateCcw,
  Download,
  AlertCircle
} from 'lucide-react';
import { GROQ_MODELS, SYSTEM_PROMPTS, streamGroqChat } from '../services/groqApi';

export default function PlaygroundTab({ apiKey }) {
  // State
  const [model, setModel] = useState(GROQ_MODELS[0].id);
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPTS[0].content);
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  
  // Parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [topP, setTopP] = useState(1.0);
  const [freqPenalty, setFreqPenalty] = useState(0.0);
  const [presencePenalty, setPresencePenalty] = useState(0.0);
  const [stream, setStream] = useState(true);

  // Chat conversation
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to the Groq LLM Studio! I am running on ultra-fast Groq LPU silicon. Ask me anything about Large Language Model architecture, code generation, quantum mechanics, or test multi-turn conversations.',
      reasoning: 'Assistant initialized with high-speed LPU readiness.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Real-time Telemetry
  const [telemetry, setTelemetry] = useState({
    speedTps: null,
    totalTokens: null,
    promptTokens: null,
    completionTokens: null,
    reasoningTokens: null,
    latencyMs: null,
    queueTimeMs: null
  });

  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle Send
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;

    if (!apiKey) {
      setErrorMsg('Please configure your Groq API Key using the "Set Groq Key" button in the header.');
      return;
    }

    setErrorMsg(null);
    const userMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    // Prepare API messages list including system prompt
    const apiMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
    ];

    // Placeholder assistant message
    const assistantIndex = updatedMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '', reasoning: '' }]);
    setIsGenerating(true);

    abortControllerRef.current = new AbortController();
    const startTime = performance.now();

    try {
      await streamGroqChat({
        apiKey,
        model,
        messages: apiMessages,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty: freqPenalty,
        presencePenalty: presencePenalty,
        signal: abortControllerRef.current.signal,
        onChunk: (chunk, fullContent) => {
          setMessages(prev => {
            const copy = [...prev];
            copy[assistantIndex] = {
              ...copy[assistantIndex],
              content: fullContent
            };
            return copy;
          });
        },
        onReasoning: (chunk, fullReasoning) => {
          setMessages(prev => {
            const copy = [...prev];
            copy[assistantIndex] = {
              ...copy[assistantIndex],
              reasoning: fullReasoning
            };
            return copy;
          });
        },
        onUsage: (usage) => {
          const latency = (performance.now() - startTime).toFixed(0);
          setTelemetry({
            speedTps: usage.groqTokensPerSec || usage.clientTokensPerSec,
            totalTokens: usage.total_tokens,
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            reasoningTokens: usage.completion_tokens_details?.reasoning_tokens || 0,
            latencyMs: latency,
            queueTimeMs: usage.queueTime ? (usage.queueTime * 1000).toFixed(1) : null
          });
        }
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setErrorMsg(err.message || 'Error calling Groq API');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setTelemetry({
      speedTps: null,
      totalTokens: null,
      promptTokens: null,
      completionTokens: null,
      reasoningTokens: null,
      latencyMs: null,
      queueTimeMs: null
    });
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const currentModelInfo = GROQ_MODELS.find(m => m.id === model) || GROQ_MODELS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-130px)]">
      
      {/* Main Chat Area (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col glass-panel rounded-2xl overflow-hidden border border-slate-800">
        
        {/* Chat Header / System Prompt Bar */}
        <div className="border-b border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSystemOpen(!isSystemOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-orange-400" />
              <span>System Prompt</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {systemPrompt ? `${systemPrompt.length} chars` : 'Default'}
              </span>
              {isSystemOpen ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
            </button>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Model: <strong className="text-orange-400">{currentModelInfo.name}</strong>
              </span>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-all text-xs flex items-center gap-1"
                title="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Collapsible System Prompt Drawer */}
          {isSystemOpen && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 animate-fadeIn">
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter custom system instructions..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-orange-500 focus:outline-none transition-all resize-none"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1">Presets:</span>
                {SYSTEM_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSystemPrompt(p.content)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all hover:border-orange-500/40"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-h-[calc(100vh-320px)] min-h-[350px]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <Sparkles className="w-10 h-10 text-orange-500/40 mb-3 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-300 mb-1">Groq Playground Ready</h3>
              <p className="text-xs max-w-sm text-slate-400">
                Type your message below to experience Groq's high-throughput Tensor Streaming architecture.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {isAssistant ? currentModelInfo.name : 'You'}
                    </span>
                    {isAssistant && msg.content && (
                      <button
                        onClick={() => copyToClipboard(msg.content, index)}
                        className="text-slate-500 hover:text-slate-300 transition-all"
                        title="Copy Response"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-900/90 text-slate-200 border border-slate-800/90 shadow-sm'
                        : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20'
                    }`}
                  >
                    {/* Chain-of-Thought Reasoning Accordion */}
                    {isAssistant && msg.reasoning && (
                      <details className="mb-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
                        <summary className="font-mono text-[11px] font-semibold text-amber-400 cursor-pointer flex items-center gap-1.5 select-none">
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>Chain-of-Thought Reasoning</span>
                        </summary>
                        <div className="mt-2 text-[11px] font-mono whitespace-pre-wrap text-slate-300 pl-2 border-l border-amber-500/30">
                          {msg.reasoning}
                        </div>
                      </details>
                    )}

                    {isAssistant ? (
                      <div className="prose prose-invert prose-xs sm:prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content || (isGenerating && index === messages.length - 1 ? 'Thinking...' : '')}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-4 mb-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/80">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything, test prompts, or explore transformer mechanics..."
              disabled={isGenerating}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-all disabled:opacity-50"
            />
            {isGenerating ? (
              <button
                type="button"
                onClick={handleStop}
                className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Run</span>
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Right Sidebar: Telemetry & Parameter Controls (4 Cols) */}
      <div className="lg:col-span-4 space-y-5">
        
        {/* Real-time Telemetry Card */}
        <div className="glass-panel-accent rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-orange-400" />
              <span>Inference Telemetry</span>
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5">Throughput Speed</span>
              <span className="text-lg font-bold font-mono text-orange-400">
                {telemetry.speedTps ? `${telemetry.speedTps}` : '---'}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">tokens/s</span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block mb-0.5">Total Latency</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {telemetry.latencyMs ? `${telemetry.latencyMs}` : '---'}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">ms</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-mono border-t border-slate-800/60 pt-3">
            <div className="flex justify-between text-slate-400">
              <span>Prompt Tokens:</span>
              <strong className="text-slate-200">{telemetry.promptTokens ?? '0'}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Completion Tokens:</span>
              <strong className="text-slate-200">{telemetry.completionTokens ?? '0'}</strong>
            </div>
            {telemetry.reasoningTokens > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Reasoning Tokens:</span>
                <strong>{telemetry.reasoningTokens}</strong>
              </div>
            )}
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/40">
              <span>Total Tokens:</span>
              <strong className="text-orange-400">{telemetry.totalTokens ?? '0'}</strong>
            </div>
            {telemetry.queueTimeMs && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Queue Time:</span>
                <span>{telemetry.queueTimeMs} ms</span>
              </div>
            )}
          </div>
        </div>

        {/* Model Selector & Hyperparameters Card */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Model & Sampling Controls</span>
            </h4>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Foundation Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
            >
              {GROQ_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.badge})
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
              {currentModelInfo.description}
            </p>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Temperature</span>
              <span className="font-mono text-orange-400 font-bold">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.0 (Deterministic)</span>
              <span>1.0</span>
              <span>2.0 (Creative)</span>
            </div>
          </div>

          {/* Max Tokens Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Max Completion Tokens</span>
              <span className="font-mono text-orange-400 font-bold">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="64"
              max="4096"
              step="64"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Top-P Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Top P (Nucleus Sampling)</span>
              <span className="font-mono text-orange-400 font-bold">{topP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Frequency & Presence Penalties */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Freq Penalty</span>
                <span className="font-mono text-slate-300">{freqPenalty.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={freqPenalty}
                onChange={(e) => setFreqPenalty(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Pres Penalty</span>
                <span className="font-mono text-slate-300">{presencePenalty.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={presencePenalty}
                onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
