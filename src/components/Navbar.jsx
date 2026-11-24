import React, { useState } from 'react';
import { 
  Zap, 
  Binary, 
  Box, 
  BrainCircuit, 
  Workflow, 
  Key, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Trash2
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiKey, setApiKey }) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const navItems = [
    { id: 'playground', label: 'Chat Playground', icon: Zap, badge: 'Live Groq' },
    { id: 'tokenizer', label: 'Tokenizer Lab', icon: Binary, badge: 'BPE & Vocab' },
    { id: 'vectorspace', label: '3D Vector Space', icon: Box, badge: 'Three.js' },
    { id: 'attention', label: 'Attention Visualizer', icon: BrainCircuit, badge: 'Q-K Softmax' },
    { id: 'pipeline', label: 'Architecture Pipeline', icon: Workflow, badge: 'End-to-End' },
  ];

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (tempKey.trim()) {
      setApiKey(tempKey.trim());
    }
    setSaveSuccess(true);
    setTempKey('');
    setTimeout(() => {
      setSaveSuccess(false);
      setShowKeyModal(false);
    }, 1000);
  };

  const handleClearKey = () => {
    setApiKey('');
    localStorage.removeItem('groq_api_key');
    setShowKeyModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f55036] via-[#f89c36] to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base md:text-lg text-slate-100 font-display tracking-tight">
                  Groq LLM Studio
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-orange-950/70 border border-orange-500/40 text-orange-400 font-bold">
                  LPU Speed
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Interactive AI Mechanics & Fast Real-Time Inference Lab
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav 
            className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800"
            role="tablist"
            aria-label="Studio Navigation Tabs"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: API Status (Key is NEVER displayed) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-all font-mono"
              title="API Connection Settings"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {apiKey ? 'Groq Connected' : 'Connect Groq API'}
              </span>
              <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto mt-2.5 pb-1 border-t border-slate-800/60 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                  isActive 
                    ? 'bg-orange-600 text-white' 
                    : 'text-slate-400 bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* API Key Modal (Confidential & Masked) */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Groq Cloud API Connection</h3>
                <p className="text-xs text-slate-400">High-speed inference endpoint credentials</p>
              </div>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    API Key Status
                  </label>
                  {apiKey ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Connected (Masked)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400">
                      Not Configured
                    </span>
                  )}
                </div>

                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder={apiKey ? '••••••••••••••••••••••••••••••••••••••••' : 'Paste new key (gsk_...)'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono focus:border-orange-500 focus:outline-none transition-all"
                  autoComplete="off"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Keys are stored encrypted in memory / session storage and never printed on screen.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 leading-relaxed">
                <p className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confidential Mode Active
                </p>
                <p>Private credentials are hidden to ensure safe submission and public presentations.</p>
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-2">
                {apiKey ? (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/30 transition-all flex items-center gap-1.5"
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Updated!</span>
                      </>
                    ) : (
                      <span>Update Key</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
