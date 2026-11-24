// 3D Vector Space & Semantic Embedding Math Engine

// Semantic cluster centers in normalized 3D space
export const CLUSTER_CENTERS = {
  CONCEPT: { x: 3.8, y: 2.5, z: -1.2, name: 'AI & Concepts', color: '#38bdf8' },
  ENTITY: { x: -3.5, y: -2.0, z: 2.8, name: 'Entities & Nouns', color: '#f59e0b' },
  ACTION: { x: 1.2, y: -3.6, z: -2.4, name: 'Actions & Verbs', color: '#10b981' },
  GRAMMAR: { x: -2.8, y: 3.2, z: 0.8, name: 'Grammar & Stopwords', color: '#c084fc' },
  PUNCT: { x: 0.0, y: 0.5, z: 4.2, name: 'Punctuation & Symbols', color: '#f43f5e' }
};

// Deterministic pseudo-random generator from string
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate a 3D coordinate vector for a token based on its semantic category and character hash
 */
export function getSemantic3DCoord(token, cluster = 'CONCEPT') {
  const center = CLUSTER_CENTERS[cluster] || CLUSTER_CENTERS.CONCEPT;
  const hash = hashString(token.toLowerCase());
  
  // Normal pseudo-random dispersion around cluster center
  const r1 = ((hash % 1000) / 1000 - 0.5) * 2.2;
  const r2 = (((hash >> 3) % 1000) / 1000 - 0.5) * 2.2;
  const r3 = (((hash >> 6) % 1000) / 1000 - 0.5) * 2.2;

  return {
    x: +(center.x + r1).toFixed(3),
    y: +(center.y + r2).toFixed(3),
    z: +(center.z + r3).toFixed(3),
  };
}

/**
 * Computes Cosine Similarity between two 3D vectors
 */
export function cosineSimilarity(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
  if (mag1 === 0 || mag2 === 0) return 0;
  return +(dot / (mag1 * mag2)).toFixed(3);
}

/**
 * Calculate sentence embedding as weighted sum of token coordinates
 */
export function calculateSentenceEmbedding(sentence, tokenList) {
  if (!tokenList || tokenList.length === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  let sumX = 0, sumY = 0, sumZ = 0, totalWeight = 0;

  for (const t of tokenList) {
    const coord = getSemantic3DCoord(t.token, t.cluster);
    // Give content words higher weight than grammar/punct
    const weight = (t.cluster === 'GRAMMAR' || t.cluster === 'PUNCT') ? 0.35 : 1.0;
    sumX += coord.x * weight;
    sumY += coord.y * weight;
    sumZ += coord.z * weight;
    totalWeight += weight;
  }

  const factor = totalWeight > 0 ? 1 / totalWeight : 1;
  return {
    x: +(sumX * factor).toFixed(3),
    y: +(sumY * factor).toFixed(3),
    z: +(sumZ * factor).toFixed(3),
  };
}

export const SAMPLE_SENTENCES_3D = [
  { text: "Transformers process embeddings in vector space.", label: "LLM Concept", cluster: "CONCEPT" },
  { text: "Neural networks optimize weights with gradient descent.", label: "Deep Learning", cluster: "CONCEPT" },
  { text: "The playful cat purrs warmly on the windowsill.", label: "Biology / Animal", cluster: "ENTITY" },
  { text: "Astronomers observe distant galaxies with radio telescopes.", label: "Astrophysics", cluster: "ENTITY" },
  { text: "Groq LPUs execute deterministic tensor streaming.", label: "Hardware / Compute", cluster: "CONCEPT" },
];
