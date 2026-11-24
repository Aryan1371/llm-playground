// Self-Attention Mechanics Engine: Q, K, V dot-products & Softmax distribution

/**
 * Deterministically simulates Query (Q), Key (K), and Value (V) projections
 * and computes Scaled Dot-Product Attention:
 * Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
 */
export function computeSelfAttention(tokens, queryIndex = 0, temperature = 1.0) {
  if (!tokens || tokens.length === 0) {
    return {
      tokens: [],
      queryIndex: 0,
      attentionWeights: [],
      rawScores: [],
      attentionMatrix: [],
      dk: 64
    };
  }

  const n = tokens.length;
  const dk = 64; // standard head dimension
  const sqrtDk = Math.sqrt(dk);

  // Generate pseudo-deterministic Q and K vectors for each token
  const qVectors = [];
  const kVectors = [];

  for (let i = 0; i < n; i++) {
    const t = tokens[i];
    const text = typeof t === 'string' ? t : t.token;
    const seed = hashString(text + i);

    // Simulated 8-dim head projection
    const q = [];
    const k = [];
    for (let d = 0; d < 8; d++) {
      q.push(((seed * (d + 1) * 31) % 100) / 50 - 1.0);
      k.push(((seed * (d + 2) * 47) % 100) / 50 - 1.0);
    }
    qVectors.push(q);
    kVectors.push(k);
  }

  // Compute full N x N attention matrix
  const attentionMatrix = [];

  for (let qIdx = 0; qIdx < n; qIdx++) {
    const q = qVectors[qIdx];
    const rowRawScores = [];

    for (let kIdx = 0; kIdx < n; kIdx++) {
      const k = kVectors[kIdx];
      // Dot product Q . K
      let dot = 0;
      for (let d = 0; d < 8; d++) {
        dot += q[d] * k[d];
      }

      // Boost self-attention and grammatical relations slightly for realistic demo
      if (qIdx === kIdx) dot += 0.8;
      const tQ = (typeof tokens[qIdx] === 'string' ? tokens[qIdx] : tokens[qIdx].token).toLowerCase();
      const tK = (typeof tokens[kIdx] === 'string' ? tokens[kIdx] : tokens[kIdx].token).toLowerCase();

      if ((tQ === 'it' || tQ === 'they') && (tK === 'animal' || tK === 'street' || tK === 'dog' || tK === 'cat')) {
        dot += 2.2;
      }
      if (tQ === 'transformers' && (tK === 'attention' || tK === 'embeddings')) {
        dot += 1.8;
      }

      const scaledScore = dot / (sqrtDk / 2.8);
      rowRawScores.push(scaledScore);
    }

    // Apply Softmax over the row
    const expScores = rowRawScores.map(s => Math.exp(s / Math.max(0.05, temperature)));
    const sumExp = expScores.reduce((acc, v) => acc + v, 0);
    const rowSoftmax = expScores.map(v => +(v / sumExp).toFixed(4));

    attentionMatrix.push({
      qIndex: qIdx,
      rawScores: rowRawScores,
      weights: rowSoftmax
    });
  }

  const safeQueryIdx = Math.max(0, Math.min(queryIndex, n - 1));
  const activeRow = attentionMatrix[safeQueryIdx] || { rawScores: [], weights: [] };

  return {
    tokens: tokens.map((t, idx) => ({
      index: idx,
      token: typeof t === 'string' ? t : t.token,
      cluster: t.cluster || 'CONCEPT'
    })),
    queryIndex: safeQueryIdx,
    attentionWeights: activeRow.weights,
    rawScores: activeRow.rawScores,
    attentionMatrix,
    dk
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
