import React, { useEffect, useState } from 'react';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

/**
 * OPTICAL FIREWALL — Laser Mirror Puzzle
 *
 * Mirrors: angle 0 = ╱  (E→N, N→E, W→S, S→W)
 *          angle 1 = ╲  (E→S, S→E, W→N, N→W)
 *
 * All three puzzles are verified solvable!
 */

const PUZZLES = [
  {
    id: 'forest',
    name: '🌿 Forest Chamber',
    difficulty: 'EASY',
    diffColor: '#10b981',
    accentColor: '#10b981',
    emitter: { x: 0, z: 3, dir: 'E' },
    target:  { x: 3, z: 0 },
    // Solution: rotate Mirror A from ╲ → ╱ (one click)
    mirrors: [{ id: 1, x: 3, z: 3, angle: 1, name: 'Mirror A' }],
    walls: [{ x: 5, z: 3 }, { x: 3, z: 4 }],
    tip: 'One mirror, one click — rotate it to ╱',
  },
  {
    id: 'corrupted',
    name: '🌋 Corrupted Chamber',
    difficulty: 'MEDIUM',
    diffColor: '#f59e0b',
    accentColor: '#f59e0b',
    emitter: { x: 0, z: 4, dir: 'E' },
    target:  { x: 5, z: 1 },
    // Solution: both mirrors → ╱ (each needs 1 click from ╲)
    mirrors: [
      { id: 1, x: 2, z: 4, angle: 1, name: 'Mirror A' },
      { id: 2, x: 2, z: 1, angle: 1, name: 'Mirror B' },
    ],
    walls: [{ x: 4, z: 4 }, { x: 0, z: 2 }],
    tip: 'Route: East → North → East to target',
  },
  {
    id: 'castle',
    name: '🏰 Castle Chamber',
    difficulty: 'HARD',
    diffColor: '#ef4444',
    accentColor: '#ef4444',
    emitter: { x: 0, z: 5, dir: 'E' },
    target:  { x: 5, z: 0 },
    // Solution: all three mirrors → ╱ (each 1 click from ╲)
    mirrors: [
      { id: 1, x: 2, z: 5, angle: 1, name: 'Mirror A' },
      { id: 2, x: 2, z: 2, angle: 1, name: 'Mirror B' },
      { id: 3, x: 5, z: 2, angle: 1, name: 'Mirror C' },
    ],
    walls: [{ x: 4, z: 5 }, { x: 1, z: 2 }, { x: 3, z: 0 }],
    tip: 'Zig-zag: E→N→E→N to reach the castle target',
  },
];

// Trace laser path, returns { path: [{x,z}], hitTarget }
function traceLaser(puzzle, mirrors) {
  let { x, z, dir } = { ...puzzle.emitter };
  const path = [{ x, z }];
  let hitTarget = false;

  for (let step = 0; step < 30; step++) {
    // Advance one cell
    if (dir === 'E') x++;
    else if (dir === 'W') x--;
    else if (dir === 'N') z--;
    else if (dir === 'S') z++;

    // Out of bounds
    if (x < 0 || x > 5 || z < 0 || z > 5) break;

    // Wall
    if (puzzle.walls.find(w => w.x === x && w.z === z)) {
      path.push({ x, z, wall: true });
      break;
    }

    // Target
    if (x === puzzle.target.x && z === puzzle.target.z) {
      path.push({ x, z, target: true });
      hitTarget = true;
      break;
    }

    // Mirror
    const m = mirrors.find(m => m.x === x && m.z === z);
    if (m) {
      path.push({ x, z, mirror: true });
      if (m.angle === 0) { // ╱
        if (dir === 'E') dir = 'N';
        else if (dir === 'W') dir = 'S';
        else if (dir === 'N') dir = 'E';
        else if (dir === 'S') dir = 'W';
      } else { // ╲
        if (dir === 'E') dir = 'S';
        else if (dir === 'W') dir = 'N';
        else if (dir === 'N') dir = 'W';
        else if (dir === 'S') dir = 'E';
      }
    } else {
      path.push({ x, z });
    }
  }
  return { path, hitTarget };
}

// Fill in all cells the laser passes through (between path waypoints)
function buildLaserSet(path) {
  const set = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    if (b.wall) continue;
    if (a.x === b.x) {
      for (let z = Math.min(a.z, b.z); z <= Math.max(a.z, b.z); z++)
        set.add(`${a.x},${z}`);
    } else {
      for (let x = Math.min(a.x, b.x); x <= Math.max(a.x, b.x); x++)
        set.add(`${x},${a.z}`);
    }
  }
  return set;
}

const DIR_ARROW = { E: '→', W: '←', N: '↑', S: '↓' };
const GRID = 6;

export function LaserGame() {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [mirrors, setMirrors] = useState(() => PUZZLES[0].mirrors.map(m => ({ ...m })));
  
  const [solvedIndices, setSolvedIndices] = useState([]);
  const [failedIndices, setFailedIndices] = useState([]);
  const [attemptsMap, setAttemptsMap] = useState({});
  const [moves, setMoves] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const puzzle = PUZZLES[puzzleIdx];
  const isCurrentSolved = solvedIndices.includes(puzzleIdx);
  const isCurrentFailed = failedIndices.includes(puzzleIdx);
  const attempts = attemptsMap[puzzleIdx] || 0;
  const completedCount = solvedIndices.length + failedIndices.length;
  const allCompleted = completedCount === PUZZLES.length;

  useEffect(() => {
    setMirrors(puzzle.mirrors.map(m => ({ ...m })));
    setMoves(0);
    setShowTip(false);
    setIsTesting(false);
  }, [puzzleIdx, puzzle.mirrors]);

  const { path, hitTarget } = traceLaser(puzzle, mirrors);
  const laserSet = buildLaserSet(path);

  const rotateMirror = (id) => {
    if (isCurrentSolved || isCurrentFailed || isTesting) return;
    audioManager.playClick?.();
    setMoves(m => m + 1);
    setMirrors(prev => prev.map(m => m.id === id ? { ...m, angle: m.angle === 0 ? 1 : 0 } : m));
  };

  const advanceToNext = () => {
    if (allCompleted) return;
    for (let i = 0; i < PUZZLES.length; i++) {
      if (!solvedIndices.includes(i) && !failedIndices.includes(i)) {
        setPuzzleIdx(i);
        return;
      }
    }
  };

  const handleTestBeam = () => {
    if (isCurrentSolved || isCurrentFailed || isTesting) return;
    
    audioManager.playClick?.();
    const newAttempts = attempts + 1;
    setAttemptsMap(prev => ({ ...prev, [puzzleIdx]: newAttempts }));
    setIsTesting(true);

    setTimeout(() => {
      setIsTesting(false);
      if (hitTarget) {
        setSolvedIndices(prev => [...prev, puzzleIdx]);
        setFlash(true);
        audioManager.playLaserSuccess?.();
        setTimeout(() => setFlash(false), 800);
      } else {
        audioManager.playWrong?.();
        if (newAttempts >= 2) {
          setFailedIndices(prev => [...prev, puzzleIdx]);
        }
      }
    }, 1500); // beam visible for 1.5s
  };

  const handleContinue = () => {
    audioManager.playClick();
    gameState.completeLaser(solvedIndices.length);
  };

  // Build flat cell array
  const cells = [];
  for (let z = 0; z < GRID; z++) {
    for (let x = 0; x < GRID; x++) {
      const isEmitter = puzzle.emitter.x === x && puzzle.emitter.z === z;
      const isTarget  = puzzle.target.x  === x && puzzle.target.z  === z;
      const isWall    = !!puzzle.walls.find(w => w.x === x && w.z === z);
      const mirror    = mirrors.find(m => m.x === x && m.z === z);
      const hasLaser  = laserSet.has(`${x},${z}`);
      cells.push({ x, z, isEmitter, isTarget, isWall, mirror, hasLaser });
    }
  }

  return (
    <div className={`lz-wrapper ${flash ? 'lz-flash' : ''}`}>
      <div className="lz-card animate-scale-up">

        {/* ── TOP BAR ── */}
        <div className="lz-topbar">
          <div className="lz-badge">🔴 OPTICAL FIREWALL</div>
          <div className="lz-tabs">
            {PUZZLES.map((p, i) => (
              <button
                key={p.id}
                className={`lz-tab ${puzzleIdx === i ? 'lz-tab-on' : ''}`}
                style={puzzleIdx === i ? { borderColor: p.accentColor, color: p.accentColor } : {}}
                onClick={() => { audioManager.playClick?.(); setPuzzleIdx(i); }}
              >
                <span className="lz-diff-dot" style={{ background: p.diffColor }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── INSTRUCTION (1 line) ── */}
        <div className="lz-instruction">
          <strong>🔴</strong> = Emitter&nbsp;&nbsp;
          <strong>🎯</strong> = Target&nbsp;&nbsp;
          <span className="lz-sym">╱╲</span> = Mirror (click to flip)&nbsp;&nbsp;
          <span className="lz-wall-icon">▪</span> = Wall
          &nbsp;&nbsp;→ Get the laser to the target!
        </div>

        {/* ── MAIN LAYOUT: Grid left, Controls right ── */}
        <div className="lz-body">

          {/* GRID */}
          <div className="lz-grid-wrap" style={{ borderColor: isCurrentSolved ? '#10b981' : puzzle.accentColor }}>
            <div className="lz-grid">
              {cells.map(cell => {
                let cls = 'lz-cell';
                let inner = null;

                if (cell.isWall) {
                  cls += ' lz-wall';
                  inner = <span className="lz-icon">▪</span>;
                } else if (cell.isEmitter) {
                  cls += ' lz-emitter';
                  inner = <span className="lz-icon">🔴<br/><small>{DIR_ARROW[puzzle.emitter.dir]}</small></span>;
                } else if (cell.isTarget) {
                  cls += isCurrentSolved ? ' lz-target-hit' : ' lz-target';
                  inner = <span className="lz-icon">{isCurrentSolved ? '✅' : '🎯'}</span>;
                } else if (cell.mirror) {
                  cls += ' lz-mirror';
                  inner = (
                    <button className="lz-mirror-cell" onClick={() => rotateMirror(cell.mirror.id)}>
                      <span className="lz-mirror-sym">{cell.mirror.angle === 0 ? '╱' : '╲'}</span>
                      <small>{cell.mirror.name}</small>
                    </button>
                  );
                }

                if (cell.hasLaser && !cell.isWall && (isTesting || isCurrentSolved || isCurrentFailed)) {
                  cls += isCurrentSolved ? ' lz-beam-hit' : ' lz-beam';
                }

                return <div key={`${cell.x}-${cell.z}`} className={cls}>{inner}</div>;
              })}
            </div>
          </div>

          {/* CONTROLS PANEL */}
          <div className="lz-controls">
            <div className="lz-puzzle-info">
              <div className="lz-puzzle-name">{puzzle.name}</div>
              <div className="lz-diff-tag" style={{ color: puzzle.diffColor, borderColor: puzzle.diffColor }}>
                {puzzle.difficulty}
              </div>
            </div>

            {/* Solved Banner for individual puzzle */}
            {isCurrentSolved && !allCompleted && (
              <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ✅ Chamber Solved! Complete the other {PUZZLES.length - completedCount} to proceed.
              </div>
            )}
            {isCurrentFailed && !allCompleted && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ❌ Chamber Blocked! Moving on to the next.
              </div>
            )}

            <div className="lz-section-label">🔄 MIRRORS — click to flip:</div>
            <div className="lz-mirror-btns">
              {mirrors.map(m => (
                <button
                  key={m.id}
                  className={`lz-mirror-btn ${isCurrentSolved || isCurrentFailed ? 'lz-btn-off' : ''}`}
                  onClick={() => rotateMirror(m.id)}
                  disabled={isCurrentSolved || isCurrentFailed || isTesting}
                >
                  <span className="lz-btn-sym">{m.angle === 0 ? '╱' : '╲'}</span>
                  <span className="lz-btn-name">{m.name}</span>
                </button>
              ))}
            </div>

            <div className="lz-moves">Moves: <strong>{moves}</strong></div>

            {!isCurrentSolved && !isCurrentFailed && (
              <button 
                className="primary-button" 
                style={{ width: '100%', margin: '10px 0', background: isTesting ? '#64748b' : '#ef4444' }} 
                onClick={handleTestBeam}
                disabled={isTesting}
              >
                {isTesting ? 'FIRING...' : `🔴 TEST FIRE (${2 - attempts} left)`}
              </button>
            )}

            {!allCompleted && (isCurrentSolved || isCurrentFailed) && (
              <button className="primary-button" style={{ width: '100%', margin: '10px 0' }} onClick={advanceToNext}>
                NEXT CHAMBER →
              </button>
            )}

            <button className="lz-tip-btn" onClick={() => setShowTip(v => !v)}>
              {showTip ? '🙈 Hide tip' : '💡 Show tip'}
            </button>

            {showTip && (
              <div className="lz-tip animate-fade-in">{puzzle.tip}</div>
            )}

            {allCompleted && (
              <div className="lz-success animate-scale-up">
                <div className="lz-success-icon">🎉</div>
                <div className="lz-success-text">FIREWALL SEQUENCE COMPLETE</div>
                <div className="lz-success-key">PASSKEY: <strong>LASER-27</strong></div>
                <button className="primary-button lz-continue" onClick={handleContinue}>
                  CONTINUE →
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default LaserGame;
