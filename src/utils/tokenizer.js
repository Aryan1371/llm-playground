// BPE Tokenizer Engine with Dynamic Vocabulary Slicing & Subword Decomposition

export const CLUSTERS = {
  CONCEPT: { name: 'AI & Concepts', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.4)' },
  ENTITY: { name: 'Entities & Nouns', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  ACTION: { name: 'Actions & Verbs', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
  GRAMMAR: { name: 'Grammar & Stopwords', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.4)' },
  PUNCT: { name: 'Punctuation & Symbols', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)' },
};

// Curated vocabulary items with semantic cluster mapping and frequency
export const BASE_VOCABULARY = [
  // High frequency / grammar
  { word: 'the', cluster: 'GRAMMAR', freq: 12040, id: 101 },
  { word: 'is', cluster: 'GRAMMAR', freq: 9840, id: 102 },
  { word: 'a', cluster: 'GRAMMAR', freq: 9400, id: 103 },
  { word: 'to', cluster: 'GRAMMAR', freq: 8900, id: 104 },
  { word: 'in', cluster: 'GRAMMAR', freq: 8300, id: 105 },
  { word: 'of', cluster: 'GRAMMAR', freq: 7900, id: 106 },
  { word: 'and', cluster: 'GRAMMAR', freq: 7600, id: 107 },
  { word: 'for', cluster: 'GRAMMAR', freq: 6500, id: 108 },
  { word: 'with', cluster: 'GRAMMAR', freq: 5200, id: 109 },
  { word: 'on', cluster: 'GRAMMAR', freq: 4900, id: 110 },
  { word: 'by', cluster: 'GRAMMAR', freq: 4300, id: 111 },
  { word: 'at', cluster: 'GRAMMAR', freq: 4100, id: 112 },
  { word: 'from', cluster: 'GRAMMAR', freq: 3900, id: 113 },
  { word: 'as', cluster: 'GRAMMAR', freq: 3800, id: 114 },
  { word: 'it', cluster: 'GRAMMAR', freq: 3600, id: 115 },
  { word: 'are', cluster: 'GRAMMAR', freq: 3500, id: 116 },
  { word: 'this', cluster: 'GRAMMAR', freq: 3400, id: 117 },
  { word: 'that', cluster: 'GRAMMAR', freq: 3300, id: 118 },
  { word: 'was', cluster: 'GRAMMAR', freq: 3100, id: 119 },

  // AI & Concepts
  { word: 'token', cluster: 'CONCEPT', freq: 2800, id: 201 },
  { word: 'tokens', cluster: 'CONCEPT', freq: 2600, id: 202 },
  { word: 'tokenization', cluster: 'CONCEPT', freq: 1800, id: 203 },
  { word: 'embedding', cluster: 'CONCEPT', freq: 2400, id: 204 },
  { word: 'embeddings', cluster: 'CONCEPT', freq: 2300, id: 205 },
  { word: 'transformer', cluster: 'CONCEPT', freq: 2200, id: 206 },
  { word: 'transformers', cluster: 'CONCEPT', freq: 1900, id: 207 },
  { word: 'attention', cluster: 'CONCEPT', freq: 2100, id: 208 },
  { word: 'self-attention', cluster: 'CONCEPT', freq: 1700, id: 209 },
  { word: 'llm', cluster: 'CONCEPT', freq: 2950, id: 210 },
  { word: 'llms', cluster: 'CONCEPT', freq: 2500, id: 211 },
  { word: 'groq', cluster: 'CONCEPT', freq: 3100, id: 212 },
  { word: 'lpu', cluster: 'CONCEPT', freq: 1600, id: 213 },
  { word: 'neural', cluster: 'CONCEPT', freq: 1850, id: 214 },
  { word: 'network', cluster: 'CONCEPT', freq: 1750, id: 215 },
  { word: 'networks', cluster: 'CONCEPT', freq: 1650, id: 216 },
  { word: 'model', cluster: 'CONCEPT', freq: 2700, id: 217 },
  { word: 'models', cluster: 'CONCEPT', freq: 2550, id: 218 },
  { word: 'weights', cluster: 'CONCEPT', freq: 1550, id: 219 },
  { word: 'parameters', cluster: 'CONCEPT', freq: 1500, id: 220 },
  { word: 'vector', cluster: 'CONCEPT', freq: 1950, id: 221 },
  { word: 'vectors', cluster: 'CONCEPT', freq: 1700, id: 222 },
  { word: 'matrix', cluster: 'CONCEPT', freq: 1400, id: 223 },
  { word: 'softmax', cluster: 'CONCEPT', freq: 1350, id: 224 },
  { word: 'logits', cluster: 'CONCEPT', freq: 1300, id: 225 },
  { word: 'inference', cluster: 'CONCEPT', freq: 1800, id: 226 },
  { word: 'temperature', cluster: 'CONCEPT', freq: 1250, id: 227 },
  { word: 'context', cluster: 'CONCEPT', freq: 1750, id: 228 },

  // Actions & Verbs
  { word: 'learn', cluster: 'ACTION', freq: 1450, id: 301 },
  { word: 'learns', cluster: 'ACTION', freq: 1100, id: 302 },
  { word: 'learning', cluster: 'ACTION', freq: 2100, id: 303 },
  { word: 'generate', cluster: 'ACTION', freq: 1850, id: 304 },
  { word: 'generates', cluster: 'ACTION', freq: 1400, id: 305 },
  { word: 'generating', cluster: 'ACTION', freq: 1300, id: 306 },
  { word: 'predict', cluster: 'ACTION', freq: 1650, id: 307 },
  { word: 'predicts', cluster: 'ACTION', freq: 1250, id: 308 },
  { word: 'predicting', cluster: 'ACTION', freq: 1150, id: 309 },
  { word: 'process', cluster: 'ACTION', freq: 1550, id: 310 },
  { word: 'processes', cluster: 'ACTION', freq: 1200, id: 311 },
  { word: 'encode', cluster: 'ACTION', freq: 1400, id: 312 },
  { word: 'encodes', cluster: 'ACTION', freq: 1050, id: 313 },
  { word: 'decode', cluster: 'ACTION', freq: 1350, id: 314 },
  { word: 'compute', cluster: 'ACTION', freq: 1500, id: 315 },
  { word: 'train', cluster: 'ACTION', freq: 1600, id: 316 },
  { word: 'training', cluster: 'ACTION', freq: 1900, id: 317 },
  { word: 'optimize', cluster: 'ACTION', freq: 1200, id: 318 },
  { word: 'optimizes', cluster: 'ACTION', freq: 950, id: 319 },

  // Entities & Nouns
  { word: 'data', cluster: 'ENTITY', freq: 2900, id: 401 },
  { word: 'text', cluster: 'ENTITY', freq: 2750, id: 402 },
  { word: 'corpus', cluster: 'ENTITY', freq: 1350, id: 403 },
  { word: 'sentence', cluster: 'ENTITY', freq: 1600, id: 404 },
  { word: 'sentences', cluster: 'ENTITY', freq: 1400, id: 405 },
  { word: 'language', cluster: 'ENTITY', freq: 2350, id: 406 },
  { word: 'languages', cluster: 'ENTITY', freq: 1300, id: 407 },
  { word: 'space', cluster: 'ENTITY', freq: 1700, id: 408 },
  { word: 'dimension', cluster: 'ENTITY', freq: 1200, id: 409 },
  { word: 'dimensions', cluster: 'ENTITY', freq: 1100, id: 410 },
  { word: 'speed', cluster: 'ENTITY', freq: 1500, id: 411 },
  { word: 'latency', cluster: 'ENTITY', freq: 1400, id: 412 },
  { word: 'hardware', cluster: 'ENTITY', freq: 1350, id: 413 },
  { word: 'chip', cluster: 'ENTITY', freq: 1250, id: 414 },
  { word: 'silicon', cluster: 'ENTITY', freq: 1050, id: 415 },
  { word: 'student', cluster: 'ENTITY', freq: 950, id: 416 },
  { word: 'students', cluster: 'ENTITY', freq: 900, id: 417 },
  { word: 'cat', cluster: 'ENTITY', freq: 850, id: 418 },
  { word: 'dog', cluster: 'ENTITY', freq: 800, id: 419 },
  { word: 'galaxy', cluster: 'ENTITY', freq: 700, id: 420 },
  { word: 'telescope', cluster: 'ENTITY', freq: 650, id: 421 },
  { word: 'quantum', cluster: 'ENTITY', freq: 750, id: 422 },
  { word: 'physics', cluster: 'ENTITY', freq: 800, id: 423 },
  { word: 'mechanics', cluster: 'ENTITY', freq: 900, id: 424 }
];

// Subword prefixes for decomposition
const COMMON_SUBWORDS = [
  'trans', 'form', 'er', 'ers', 'ing', 'tion', 'tions', 'ment', 'able',
  'embed', 'ding', 'dings', 'token', 'ize', 'ized', 'izing', 'ation',
  'learn', 'ed', 'un', 're', 'pre', 'post', 'sub', 'inter', 'multi',
  'head', 'layer', 'deep', 'auto', 'prob', 'abil', 'ity', 'distrib',
  'param', 'eter', 'eters', 'dynam', 'ic', 'graph', 'play', 'ground'
];

/**
 * Tokenize a text string given a vocabulary size limit (1 to 100% of BASE_VOCABULARY)
 */
export function tokenizeWithVocabSlider(text, vocabPercent = 100) {
  if (!text) return [];

  // Sort base vocab by freq descending
  const sorted = [...BASE_VOCABULARY].sort((a, b) => b.freq - a.freq);
  const activeCount = Math.max(5, Math.round((sorted.length * vocabPercent) / 100));
  const activeVocabSet = new Map();

  for (let i = 0; i < activeCount; i++) {
    const item = sorted[i];
    activeVocabSet.set(item.word.toLowerCase(), item);
  }

  // Regex to split into words and punctuation
  const rawTokens = text.match(/[\w]+|[^\s\w]/g) || [];
  const result = [];
  let currentId = 1000;

  for (const raw of rawTokens) {
    const lower = raw.toLowerCase();

    // Check if punctuation
    if (/^[^\w\s]$/.test(raw)) {
      result.push({
        token: raw,
        id: raw.charCodeAt(0),
        cluster: 'PUNCT',
        isSubword: false,
        byteLength: new Blob([raw]).size,
        freq: 15000
      });
      continue;
    }

    // Check if the whole word is in the active vocabulary
    if (activeVocabSet.has(lower)) {
      const match = activeVocabSet.get(lower);
      result.push({
        token: raw,
        id: match.id,
        cluster: match.cluster,
        isSubword: false,
        byteLength: new Blob([raw]).size,
        freq: match.freq
      });
    } else {
      // Decompose word into subwords!
      const subwords = decomposeIntoSubwords(raw, activeVocabSet);
      for (const sw of subwords) {
        result.push({
          token: sw.text,
          id: sw.id || ++currentId,
          cluster: sw.cluster || 'CONCEPT',
          isSubword: sw.isSubword,
          byteLength: new Blob([sw.text]).size,
          freq: sw.freq || 250
        });
      }
    }
  }

  return result;
}

function decomposeIntoSubwords(word, activeVocabSet) {
  const parts = [];
  let remaining = word.toLowerCase();
  let isFirst = true;

  while (remaining.length > 0) {
    let matched = null;

    // Try finding the longest match from active vocabulary or common subwords
    for (let len = remaining.length; len >= 2; len--) {
      const sub = remaining.slice(0, len);
      if (activeVocabSet.has(sub)) {
        const item = activeVocabSet.get(sub);
        matched = {
          text: isFirst ? sub : `##${sub}`,
          id: item.id,
          cluster: item.cluster,
          isSubword: !isFirst,
          freq: item.freq
        };
        remaining = remaining.slice(len);
        break;
      }
      if (COMMON_SUBWORDS.includes(sub)) {
        matched = {
          text: isFirst ? sub : `##${sub}`,
          id: 5000 + sub.charCodeAt(0),
          cluster: 'CONCEPT',
          isSubword: !isFirst,
          freq: 850
        };
        remaining = remaining.slice(len);
        break;
      }
    }

    if (matched) {
      parts.push(matched);
      isFirst = false;
    } else {
      // Fallback single character
      const char = remaining[0];
      parts.push({
        text: isFirst ? char : `##${char}`,
        id: 7000 + char.charCodeAt(0),
        cluster: 'GRAMMAR',
        isSubword: !isFirst,
        freq: 300
      });
      remaining = remaining.slice(1);
      isFirst = false;
    }
  }

  return parts;
}
