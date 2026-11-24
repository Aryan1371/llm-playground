import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PlaygroundTab from './components/PlaygroundTab';
import TokenizerTab from './components/TokenizerTab';
import VectorSpaceTab from './components/VectorSpaceTab';
import AttentionTab from './components/AttentionTab';
import PipelineTab from './components/PipelineTab';
import { Sparkles, ExternalLink, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('playground');
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || '';
  });

  // Sync apiKey to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('groq_api_key', apiKey);
    }
  }, [apiKey]);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'playground' && <PlaygroundTab apiKey={apiKey} />}
        {activeTab === 'tokenizer' && <TokenizerTab />}
        {activeTab === 'vectorspace' && <VectorSpaceTab />}
        {activeTab === 'attention' && <AttentionTab />}
        {activeTab === 'pipeline' && <PipelineTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 px-6 text-center text-xs text-slate-500 font-mono mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span className="text-slate-400 font-bold">Groq LLM Studio & Architecture Lab</span>
            <span>• Powered by Groq LPU Silicon</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Inspirations:</span>
            <a 
              href="https://llm-mechanics-studio.vercel.app/" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <span>LLM Mechanics</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://token-space.vercel.app/" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <span>Token Space</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://llm-pipeline-explorer-seven.vercel.app/" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <span>Pipeline Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
