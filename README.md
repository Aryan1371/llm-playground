# ⚡ Groq LLM Studio & Architecture Lab

> An interactive LLM playground combining **real-time Groq LPU inference** with deep **educational architecture visualizations**: BPE tokenization, 3D vector space, self-attention mechanics, and end-to-end pipeline inspection.

![Groq LLM Studio Banner](https://img.shields.io/badge/Groq-LPU%20Speed-f55036?style=for-the-badge&logo=zap)
![React](https://img.shields.io/badge/React%2018-TailwindCSS-0284c7?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-3D%20Vectors-10b981?style=for-the-badge)

---

## 🌟 Features

### 1. ⚡ Groq Chat Playground (Live Inference)
- **High-Throughput Streaming**: Real-time token streaming with Groq's Tensor Streaming architecture.
- **Model Selection**:
  - `openai/gpt-oss-120b` (Flagship Reasoning, 131K Context)
  - `openai/gpt-oss-20b` (Lightning Reasoning, 131K Context)
  - `qwen/qwen3.8-27b` (Multilingual & Multimodal, 131K Context)
  - `allam-2-7b` (High-performance bilingual)
  - `meta-llama/llama-prompt-guard-2-86m` (Security & Jailbreak detection)
- **Chain-of-Thought Reasoning**: Live expandable reasoning drawer for reasoning models.
- **Real-Time Telemetry**: Live tokens/sec throughput, queue time, prompt/completion token count, and latency tracking.
- **Hyperparameter Controls**: Temperature, Top-P, Max Tokens, Frequency Penalty, and Presence Penalty.
- **System Prompt Presets**: Code Architect, Step-by-Step Reasoner, AI Researcher, and more.

### 2. 🔤 BPE Tokenizer Lab
- **Dynamic Vocabulary Slider**: Drag the vocabulary capacity slider (10% to 100%) to watch full words decompose into constituent subwords (`##subwords`) in real-time.
- **Semantic Classification**: Tokens color-coded by category (AI/Concepts, Entities/Nouns, Verbs/Actions, Grammar, Punctuation).
- **Compression Metrics**: Real-time calculation of character count, token count, characters/token ratio, and byte compression efficiency.
- **Searchable Vocabulary Registry**: Explore pre-training corpus frequencies and token IDs.

### 3. 🌐 Interactive 3D Vector Space Explorer
- **Three.js 3D Canvas**: Interactive orbiting vector space with glowing semantic clusters, coordinate grids, and camera controls.
- **Pairwise Cosine Similarity**: Pairwise cosine matrix ($cos(\theta) = \frac{A \cdot B}{\|A\|\|B\|}$) with color heatmaps.
- **Custom Word Injection**: Type any concept or word to project it into the 3D semantic neighborhood.

### 4. 🧠 Multi-Head Self-Attention Visualizer
- **Interactive Query Selector**: Click any token in the sequence to designate it as the active Query ($Q$).
- **Dynamic Bézier Curve Arcs**: Arcs connect the active Query to all Keys ($K$) with thickness and glow proportional to Softmax attention weight.
- **Softmax Heat-Bars**: Key distribution summing to 100% with raw logit scores.
- **Mathematical Explanations**: Detailed breakdown of $QK^T / \sqrt{d_k}$ scaling and gradient stability.

### 5. 🚀 End-to-End Architectural Pipeline
- **Interactive 5-Stage Stepper**:
  1. Raw Unstructured Text
  2. Byte Pair Encoding
  3. Dense Embedding Projections & Positional Encoding
  4. Multi-Head Attention & FFN Stacks
  5. Logits & Temperature-Controlled Softmax Next-Token Predictions

---

## 🛠️ Tech Stack
- **Framework**: React 18, Vite 6
- **Styling**: Tailwind CSS, PostCSS, Lucide Icons
- **3D Graphics**: Three.js
- **Markdown & Math**: React Markdown, Remark GFM
- **API Engine**: Groq Cloud REST & SSE Streaming API

---

## 🚀 Quickstart

1. **Clone the repository:**
```bash
git clone https://github.com/Aryan1371/llm-playground.git
cd llm-playground
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure your Groq API key:**
Create a `.env` file:
```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```
*(You can also configure or change the API key directly in the web UI at any time)*

4. **Run the local development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
```

---

## 💡 Inspirations & Credits
- [LLM Mechanics Studio](https://llm-mechanics-studio.vercel.app/)
- [Token Space](https://token-space.vercel.app/)
- [LLM Pipeline Explorer](https://llm-pipeline-explorer-seven.vercel.app/)
- [Groq Console Playground](https://console.groq.com/playground)
