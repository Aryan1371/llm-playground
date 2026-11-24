import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  RotateCw, 
  Plus, 
  Trash2, 
  Layers, 
  Maximize2, 
  Info, 
  Activity,
  Sliders,
  Check
} from 'lucide-react';
import { 
  CLUSTER_CENTERS, 
  getSemantic3DCoord, 
  cosineSimilarity, 
  calculateSentenceEmbedding,
  SAMPLE_SENTENCES_3D 
} from '../utils/embeddings';
import { tokenizeWithVocabSlider } from '../utils/tokenizer';

export default function VectorSpaceTab() {
  const mountRef = useRef(null);
  const [sentences, setSentences] = useState(SAMPLE_SENTENCES_3D);
  const [newSentence, setNewSentence] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [customWord, setCustomWord] = useState('');
  const [customPoints, setCustomPoints] = useState([]);
  const [isRotating, setIsRotating] = useState(true);

  // Three.js scene references
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const pointMeshMap = useRef(new Map());

  // Compute sentence embeddings
  const embeddedSentences = useMemo(() => {
    return sentences.map((s, idx) => {
      const tokens = tokenizeWithVocabSlider(s.text);
      const coord = calculateSentenceEmbedding(s.text, tokens);
      return {
        id: `s-${idx}`,
        label: s.label,
        text: s.text,
        cluster: s.cluster || 'CONCEPT',
        coord
      };
    });
  }, [sentences]);

  // Combined points for 3D render
  const all3DPoints = useMemo(() => {
    const list = [...embeddedSentences];
    for (const cp of customPoints) {
      list.push(cp);
    }
    return list;
  }, [embeddedSentences, customPoints]);

  // Compute Pairwise Cosine Similarity Matrix
  const similarityMatrix = useMemo(() => {
    const n = embeddedSentences.length;
    const matrix = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        row.push(cosineSimilarity(embeddedSentences[i].coord, embeddedSentences[j].coord));
      }
      matrix.push(row);
    }
    return matrix;
  }, [embeddedSentences]);

  // Three.js Scene Setup
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Grid Helpers & Axes
    const grid = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a);
    grid.position.y = -4;
    scene.add(grid);

    const axesHelper = new THREE.AxesHelper(6);
    scene.add(axesHelper);

    // Ambient & Directional Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Group for nodes
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    // Mouse Orbit Controls (simple dragging)
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let theta = 0.8;
    let phi = 0.6;
    let radius = 20;

    const updateCamera = () => {
      camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
      camera.position.y = radius * Math.sin(phi);
      camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      theta -= deltaX * 0.008;
      phi = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, phi + deltaY * 0.008));
      updateCamera();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      radius = Math.max(6, Math.min(35, radius + e.deltaY * 0.02));
      updateCamera();
      e.preventDefault();
    };

    currentMount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    currentMount.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (isRotating && !isDragging) {
        theta += 0.002;
        updateCamera();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      currentMount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      currentMount.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Points in 3D Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing meshes from map
    pointMeshMap.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    pointMeshMap.current.clear();

    // Render spheres and halos for all points
    all3DPoints.forEach((p) => {
      const cluster = CLUSTER_CENTERS[p.cluster] || CLUSTER_CENTERS.CONCEPT;
      const colorHex = parseInt(cluster.color.replace('#', '0x'), 16);

      const sphereGeo = new THREE.SphereGeometry(0.35, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.2
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(p.coord.x, p.coord.y, p.coord.z);
      sphere.userData = p;

      scene.add(sphere);
      pointMeshMap.current.set(p.id, sphere);
    });
  }, [all3DPoints]);

  const handleAddSentence = (e) => {
    e.preventDefault();
    if (!newSentence.trim()) return;
    setSentences(prev => [
      ...prev,
      {
        text: newSentence.trim(),
        label: `User Query ${prev.length + 1}`,
        cluster: 'CONCEPT'
      }
    ]);
    setNewSentence('');
  };

  const handleAddCustomWord = (e) => {
    e.preventDefault();
    if (!customWord.trim()) return;
    const coord = getSemantic3DCoord(customWord.trim(), 'CONCEPT');
    const newPt = {
      id: `w-${Date.now()}`,
      label: customWord.trim(),
      text: `Custom Token: "${customWord.trim()}"`,
      cluster: 'CONCEPT',
      coord
    };
    setCustomPoints(prev => [...prev, newPt]);
    setSelectedPoint(newPt);
    setCustomWord('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold uppercase tracking-wider font-mono">
              Stage 02 • Vector Space Explorer
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-display">
            Interactive 3D Semantic Embeddings & Cosine Similarity
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed mt-1">
            LLMs map discrete tokens into dense vector spaces where semantic relationships translate into geometric proximity. Explore 3D projected vectors, drag to rotate camera, and analyze pairwise Cosine Similarities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isRotating 
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/40' 
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? 'Auto Rotate' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Canvas (8 Cols) & Inspector (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 3D Canvas Box */}
        <div className="lg:col-span-8 glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col relative">
          
          {/* Top Canvas Controls Bar */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Box className="w-3.5 h-3.5 text-blue-400" />
              <span>3D Vector Space ({all3DPoints.length} active embeddings)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Left-click + drag to rotate • Scroll to zoom
            </span>
          </div>

          {/* Three.js mount container */}
          <div 
            ref={mountRef} 
            className="w-full h-[450px] relative cursor-grab active:cursor-grabbing"
          />

          {/* Overlay Coordinates Info */}
          {selectedPoint && (
            <div className="absolute bottom-4 left-4 z-10 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono backdrop-blur-md max-w-xs animate-fadeIn">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-300">{selectedPoint.label}</span>
                <span className="text-[10px] text-slate-500">Selected</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mb-1.5">{selectedPoint.text}</p>
              <div className="text-[10px] text-slate-300 grid grid-cols-3 gap-1">
                <span>X: {selectedPoint.coord.x}</span>
                <span>Y: {selectedPoint.coord.y}</span>
                <span>Z: {selectedPoint.coord.z}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Inspector & Custom Inserter (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Add Custom Word */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Inject Custom Word</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Type any word or concept to project its high-dimensional coordinate into the 3D space.
            </p>

            <form onSubmit={handleAddCustomWord} className="flex gap-2">
              <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                placeholder="e.g. quantum, silicon, tensor"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* Add New Sentence */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Add Sentence to Space</span>
            </h4>

            <form onSubmit={handleAddSentence} className="space-y-2">
              <input
                type="text"
                value={newSentence}
                onChange={(e) => setNewSentence(e.target.value)}
                placeholder="Enter complete sentence..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                Project Sentence
              </button>
            </form>
          </div>

          {/* Active Points List */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 max-h-[180px] overflow-y-auto space-y-1.5 text-xs font-mono">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-2">
              Rendered Points (Click to inspect)
            </span>
            {all3DPoints.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPoint(p)}
                className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between ${
                  selectedPoint?.id === p.id 
                    ? 'bg-blue-950/60 border-blue-500/50 text-blue-300' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="truncate pr-2">{p.label}</span>
                <span className="text-[10px] text-slate-500 shrink-0">
                  [{p.coord.x}, {p.coord.y}, {p.coord.z}]
                </span>
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Cosine Similarity Matrix Heatmap */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Pairwise Cosine Similarity Heatmap (cos θ = A • B / ||A|| ||B||)</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Values close to +1.0 indicate high semantic alignment in embedding space, while lower values represent orthogonal or dissimilar concepts.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-center text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 text-left">Sentence</th>
                {embeddedSentences.map((s, idx) => (
                  <th key={idx} className="py-2.5 px-3 truncate max-w-[120px]">
                    S{idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
              {similarityMatrix.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-left font-semibold text-slate-300 truncate max-w-[180px]">
                    S{rowIdx + 1}: {embeddedSentences[rowIdx].label}
                  </td>
                  {row.map((sim, colIdx) => {
                    const isSelf = rowIdx === colIdx;
                    // Color scale based on similarity
                    const bgColor = isSelf 
                      ? 'rgba(16, 185, 129, 0.4)' 
                      : sim > 0.7 
                      ? 'rgba(56, 189, 248, 0.3)' 
                      : sim > 0.4 
                      ? 'rgba(56, 189, 248, 0.15)' 
                      : 'rgba(30, 41, 59, 0.4)';
                    const textColor = sim > 0.7 ? '#38bdf8' : sim > 0.4 ? '#94a3b8' : '#64748b';

                    return (
                      <td 
                        key={colIdx} 
                        className="py-2 px-3 font-bold"
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        {sim.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
