import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

// 3 Dynamic Puzzle Layouts (Grid 6x6)
// Emitter position & dir: [x, z, dir] ('E', 'W', 'N', 'S')
// Target position: [x, z]
// Mirrors: [{ id, x, z, angle: 0..3, required: 0..3 }] (angle 0: /, 1: \, 2: /, 3: \)
// Obstacles: [{ x, z }]
const PUZZLE_LEVELS = [
  {
    name: 'MATRIX ALPHA',
    emitter: { x: 0, z: 2, dir: 'E' },
    target: { x: 5, z: 0 },
    mirrors: [
      { id: 1, x: 2, z: 2, angle: 1, name: 'Mirror 1' }, // reflects N
      { id: 2, x: 2, z: 0, angle: 0, name: 'Mirror 2' }, // reflects E
      { id: 3, x: 5, z: 0, angle: 0, name: 'Mirror 3' }, // hits target at x:5, z:0
    ],
    obstacles: [{ x: 3, z: 2 }, { x: 2, z: 1 }]
  },
  {
    name: 'MATRIX BETA',
    emitter: { x: 1, z: 5, dir: 'N' },
    target: { x: 4, z: 1 },
    mirrors: [
      { id: 1, x: 1, z: 3, angle: 0, name: 'Mirror A' },
      { id: 2, x: 4, z: 3, angle: 1, name: 'Mirror B' },
      { id: 3, x: 4, z: 1, angle: 0, name: 'Mirror C' },
    ],
    obstacles: [{ x: 1, z: 2 }, { x: 2, z: 3 }]
  },
  {
    name: 'MATRIX GAMMA (ZIG-ZAG)',
    emitter: { x: 0, z: 4, dir: 'E' },
    target: { x: 5, z: 1 },
    mirrors: [
      { id: 1, x: 2, z: 4, angle: 2, name: 'Mirror X' },
      { id: 2, x: 2, z: 2, angle: 3, name: 'Mirror Y' },
      { id: 3, x: 4, z: 2, angle: 0, name: 'Mirror Z' },
      { id: 4, x: 4, z: 1, angle: 1, name: 'Mirror W' },
    ],
    obstacles: [{ x: 3, z: 4 }, { x: 1, z: 2 }]
  }
];

export function LaserGame() {
  const mountRef = useRef(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [mirrorsState, setMirrorsState] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [flash, setFlash] = useState(false);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const laserLinesRef = useRef([]);
  const mirrorMeshesRef = useRef([]);
  const targetMeshRef = useRef(null);

  const level = PUZZLE_LEVELS[levelIndex];

  // Initialize randomized mirrors for the selected puzzle level
  useEffect(() => {
    const randomized = level.mirrors.map(m => ({
      ...m,
      angle: Math.floor(Math.random() * 4) // randomized starting orientation
    }));
    setMirrorsState(randomized);
    setIsSolved(false);
  }, [levelIndex]);

  // Three.js 3D Chamber Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 440;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0c0f24);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.5, 9.5, 6.8);
    camera.lookAt(2.5, 0, 2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(7, 7, 0x00f3ff, 0x1e293b);
    gridHelper.position.set(2.5, 0.01, 2.5);
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(2.5, 0, 2.5);
    scene.add(floor);

    // Lighting
    const amb = new THREE.AmbientLight(0x38bdf8, 1.2);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    // Emitter Mesh
    const emitterGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.6, 16);
    const emitterMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xff0000, emissiveIntensity: 0.8 });
    const emitterMesh = new THREE.Mesh(emitterGeo, emitterMat);
    emitterMesh.position.set(level.emitter.x, 0.3, level.emitter.z);
    scene.add(emitterMesh);

    // Target Mesh
    const targetGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.7, 16);
    const targetMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.5 });
    const targetMesh = new THREE.Mesh(targetGeo, targetMat);
    targetMesh.position.set(level.target.x, 0.35, level.target.z);
    scene.add(targetMesh);
    targetMeshRef.current = targetMesh;

    // Obstacles
    level.obstacles.forEach(obs => {
      const obsGeo = new THREE.BoxGeometry(0.8, 1.0, 0.8);
      const obsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
      const obsMesh = new THREE.Mesh(obsGeo, obsMat);
      obsMesh.position.set(obs.x, 0.5, obs.z);
      scene.add(obsMesh);
    });

    // Mirrors
    mirrorMeshesRef.current = [];
    mirrorsState.forEach((m, idx) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(m.x, 0, m.z);

      const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.2, 16);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.1;
      mGroup.add(baseMesh);

      const mirrorGeo = new THREE.BoxGeometry(0.08, 0.7, 0.8);
      const mirrorMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.95,
        roughness: 0.05,
        emissive: 0x0284c7,
        emissiveIntensity: 0.4
      });
      const mirrorMesh = new THREE.Mesh(mirrorGeo, mirrorMat);
      mirrorMesh.position.y = 0.5;
      mGroup.add(mirrorMesh);

      // Angle rotation (0, 1, 2, 3 -> increments of 45/90 deg)
      mGroup.rotation.y = m.angle * (Math.PI / 2) + Math.PI / 4;

      scene.add(mGroup);
      mirrorMeshesRef.current.push({ id: m.id, group: mGroup });
    });

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (targetMeshRef.current) {
        targetMeshRef.current.rotation.y += 0.02;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [levelIndex]);

  // Update laser beam whenever mirrorsState changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Update mirror rotations in 3D
    mirrorsState.forEach(m => {
      const match = mirrorMeshesRef.current.find(entry => entry.id === m.id);
      if (match) {
        match.group.rotation.y = m.angle * (Math.PI / 2) + Math.PI / 4;
      }
    });

    // Remove old laser segments
    laserLinesRef.current.forEach(line => scene.remove(line));
    laserLinesRef.current = [];

    // Raytrace laser beam
    let currX = level.emitter.x;
    let currZ = level.emitter.z;
    let dir = level.emitter.dir;

    const points = [new THREE.Vector3(currX, 0.35, currZ)];
    let hitTarget = false;
    let maxSteps = 16;

    while (maxSteps > 0) {
      maxSteps--;

      // Advance 1 step
      if (dir === 'E') currX += 1;
      else if (dir === 'W') currX -= 1;
      else if (dir === 'S') currZ += 1;
      else if (dir === 'N') currZ -= 1;

      // Out of bounds
      if (currX < 0 || currX > 6 || currZ < 0 || currZ > 6) {
        points.push(new THREE.Vector3(currX, 0.35, currZ));
        break;
      }

      // Check hit obstacle
      const hitObs = level.obstacles.find(o => o.x === currX && o.z === currZ);
      if (hitObs) {
        points.push(new THREE.Vector3(currX, 0.35, currZ));
        break;
      }

      // Check hit target
      if (currX === level.target.x && currZ === level.target.z) {
        points.push(new THREE.Vector3(currX, 0.35, currZ));
        hitTarget = true;
        break;
      }

      // Check hit mirror
      const hitMirror = mirrorsState.find(m => m.x === currX && m.z === currZ);
      if (hitMirror) {
        points.push(new THREE.Vector3(currX, 0.35, currZ));

        // Mirror orientation (mod 2: 0 is '/', 1 is '\')
        const orientation = hitMirror.angle % 2; // 0 or 1
        if (orientation === 0) {
          // '/' mirror: E -> N, W -> S, N -> E, S -> W
          if (dir === 'E') dir = 'N';
          else if (dir === 'W') dir = 'S';
          else if (dir === 'N') dir = 'E';
          else if (dir === 'S') dir = 'W';
        } else {
          // '\' mirror: E -> S, W -> N, N -> W, S -> E
          if (dir === 'E') dir = 'S';
          else if (dir === 'W') dir = 'N';
          else if (dir === 'N') dir = 'W';
          else if (dir === 'S') dir = 'E';
        }
      }
    }

    // Render Laser Beams as glowing lines
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineBasicMaterial({
        color: hitTarget ? 0x10b981 : 0xef4444,
        linewidth: 4,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      laserLinesRef.current.push(line);
    }

    if (hitTarget && !isSolved) {
      setIsSolved(true);
      setFlash(true);
      audioManager.playLaserSuccess();
      if (targetMeshRef.current) {
        targetMeshRef.current.material.emissive.setHex(0x00ff88);
        targetMeshRef.current.material.emissiveIntensity = 1.8;
      }
      setTimeout(() => setFlash(false), 800);
    }
  }, [mirrorsState, isSolved]);

  const handleRotateMirror = (mirrorId) => {
    audioManager.playLaserRotate();
    setMirrorsState(prev =>
      prev.map(m => (m.id === mirrorId ? { ...m, angle: (m.angle + 1) % 4 } : m))
    );
  };

  const handleContinue = () => {
    audioManager.playClick();
    gameState.completeLaser();
  };

  return (
    <div className={`minigame-container laser-minigame-bg ${flash ? 'laser-screen-flash' : ''}`}>
      <div className="laser-game-layout glass-panel animate-fade-in">
        <div className="laser-header">
          <div className="card-badge magenta-badge">
            🔴 MINI-GAME 2: OPTICAL FIREWALL CHAMBER
          </div>
          <div className="puzzle-variant-selector">
            <span>CHAMBER:</span>
            {PUZZLE_LEVELS.map((lvl, idx) => (
              <button
                key={idx}
                className={`variant-pill ${levelIndex === idx ? 'active-pill' : ''}`}
                onClick={() => {
                  audioManager.playClick();
                  setLevelIndex(idx);
                }}
              >
                {lvl.name}
              </button>
            ))}
          </div>
        </div>

        <p className="laser-instruction">
          Rotate the reflection mirrors to direct the red optical laser into the green target node!
        </p>

        {/* 3D Canvas Mounting Area */}
        <div className="laser-3d-viewport" ref={mountRef} />

        {/* Mirror Rotation Controls */}
        <div className="mirror-controls-bar">
          {mirrorsState.map((m) => (
            <button
              key={m.id}
              className="mirror-rotate-button"
              onClick={() => handleRotateMirror(m.id)}
            >
              🔄 Rotate {m.name} ({(m.angle * 90) % 180 === 0 ? '╱' : '╲'})
            </button>
          ))}
        </div>

        {isSolved && (
          <div className="laser-success-banner animate-slide-up">
            <div className="laser-success-title">✓ TARGET LOCKED & FIREWALL OVERRIDDEN!</div>
            <div className="laser-passkey-box">
              PASSKEY: <strong>LASER-27</strong> (+100 POINTS)
            </div>
            <button className="primary-button laser-btn" onClick={handleContinue}>
              CLAIM PASSKEY & CONTINUE →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LaserGame;
