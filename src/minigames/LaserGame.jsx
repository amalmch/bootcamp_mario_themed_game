import React, { useEffect, useRef, useState } from 'react';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

/**
 * OPTICAL FIREWALL CHAMBER — Laser Mirror Puzzle
 *
 * HOW IT WORKS:
 * - A red laser fires from the EMITTER (🔴) in one direction
 * - Mirrors (💠) reflect the laser at 90°: click to rotate them
 * - WALLS (⬛) block the laser — route around them
 * - Hit the TARGET (🎯) to unlock the passkey!
 *
 * Mirror orientation:
 *   angle 0 → ╱  (reflects E→N, N→E, W→S, S→W)
 *   angle 1 → ╲  (reflects E→S, S→E, W→N, N→W)
 */

const GRID_SIZE = 6; // 6×6 grid

// Each puzzle: the player must click mirrors to rotate them until the laser hits the target
const PUZZLES = [
  {
    id: 'alpha',
    name: '🌿 Forest Chamber',
    subtitle: 'Route the laser through the Mushroom Woods!',
    difficulty: '⭐ EASY',
    diffClass: 'diff-easy',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: '#10b981',
    emitter: { x: 0, z: 2, dir: 'E' },
    target: { x: 5, z: 0 },
    // mirrors start in WRONG positions — player must rotate to correct angle
    mirrors: [
      { id: 1, x: 2, z: 2, angle: 0, correctAngle: 1, name: 'Mirror A', hint: 'Deflect laser north' },
      { id: 2, x: 2, z: 0, angle: 1, correctAngle: 0, name: 'Mirror B', hint: 'Deflect laser east' },
    ],
    walls: [{ x: 3, z: 2 }, { x: 2, z: 1 }],
    solution: 'Rotate Mirror A → ╲ (deflects laser north), Mirror B → ╱ (deflects east to target)',
  },
  {
    id: 'beta',
    name: '🌋 Corrupted Chamber',
    subtitle: 'Navigate the corrupted firewall grid!',
    difficulty: '⭐⭐ MEDIUM',
    diffClass: 'diff-medium',
    bgColor: 'rgba(236, 72, 153, 0.08)',
    borderColor: '#ec4899',
    emitter: { x: 1, z: 5, dir: 'N' },
    target: { x: 4, z: 1 },
    mirrors: [
      { id: 1, x: 1, z: 3, angle: 1, correctAngle: 0, name: 'Mirror X', hint: 'Deflect laser east' },
      { id: 2, x: 4, z: 3, angle: 0, correctAngle: 1, name: 'Mirror Y', hint: 'Deflect laser north' },
    ],
    walls: [{ x: 1, z: 2 }, { x: 2, z: 3 }, { x: 3, z: 1 }],
    solution: 'Rotate Mirror X → ╱ (north→east), Mirror Y → ╲ (east→north)',
  },
  {
    id: 'gamma',
    name: '🏰 Castle Chamber',
    subtitle: 'The zig-zag gauntlet — the hardest firewall!',
    difficulty: '⭐⭐⭐ HARD',
    diffClass: 'diff-hard',
    bgColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: '#6366f1',
    emitter: { x: 0, z: 4, dir: 'E' },
    target: { x: 5, z: 1 },
    mirrors: [
      { id: 1, x: 2, z: 4, angle: 0, correctAngle: 1, name: 'Mirror P', hint: 'Deflect south' },
      { id: 2, x: 2, z: 2, angle: 1, correctAngle: 0, name: 'Mirror Q', hint: 'Deflect east' },
      { id: 3, x: 4, z: 2, angle: 0, correctAngle: 1, name: 'Mirror R', hint: 'Deflect south' },
    ],
    walls: [{ x: 3, z: 4 }, { x: 1, z: 2 }, { x: 4, z: 3 }],
    solution: 'Mirrors P→╲ (east→south), Q→╱ (south→east), R→╲ (east→south to target)',
  },
];

// Trace the laser path on the 2D grid
function traceLaser(emitter, mirrors, walls, target) {
  let x = emitter.x;
  let z = emitter.z;
  let dir = emitter.dir;
  const segments = [{ x, z }];
  let hitTarget = false;
  let steps = 0;

  while (steps < 20) {
    steps++;
    // Advance
    if (dir === 'E') x += 1;
    else if (dir === 'W') x -= 1;
    else if (dir === 'N') z -= 1;
    else if (dir === 'S') z += 1;

    // Out of bounds
    if (x < 0 || x >= GRID_SIZE || z < 0 || z >= GRID_SIZE) {
      segments.push({ x, z, end: true });
      break;
    }

    // Wall
    if (walls.find(w => w.x === x && w.z === z)) {
      segments.push({ x, z, blocked: true });
      break;
    }

    // Target
    if (x === target.x && z === target.z) {
      segments.push({ x, z, isTarget: true });
      hitTarget = true;
      break;
    }

    // Mirror
    const mirror = mirrors.find(m => m.x === x && m.z === z);
    if (mirror) {
      segments.push({ x, z, isMirror: true });
      const a = mirror.angle % 2;
      if (a === 0) { // ╱
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
      segments.push({ x, z });
    }
  }

  return { segments, hitTarget };
}

// Build a 2D set of cells the laser passes through
function getLaserCells(segments) {
  const cells = new Map(); // "x,z" -> color
  for (let i = 0; i < segments.length - 1; i++) {
    const a = segments[i];
    const b = segments[i + 1];
    if (b.end || b.blocked) continue;
    // Draw horizontal/vertical line between a and b
    if (a.x === b.x) {
      const minZ = Math.min(a.z, b.z);
      const maxZ = Math.max(a.z, b.z);
      for (let z = minZ; z <= maxZ; z++) cells.set(`${a.x},${z}`, true);
    } else {
      const minX = Math.min(a.x, b.x);
      const maxX = Math.max(a.x, b.x);
      for (let x = minX; x <= maxX; x++) cells.set(`${x},${a.z}`, true);
    }
  }
  return cells;
}

export function LaserGame() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [mirrors, setMirrors] = useState(() =>
    PUZZLES[0].mirrors.map(m => ({ ...m }))
  );
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [flashSuccess, setFlashSuccess] = useState(false);
  const [moves, setMoves] = useState(0);

  const puzzle = PUZZLES[puzzleIndex];

  // Reset when puzzle changes
  useEffect(() => {
    setMirrors(puzzle.mirrors.map(m => ({ ...m })));
    setIsSolved(false);
    setShowHint(false);
    setMoves(0);
  }, [puzzleIndex]);

  // Trace laser
  const { segments, hitTarget } = traceLaser(puzzle.emitter, mirrors, puzzle.walls, puzzle.target);
  const laserCells = getLaserCells(segments);

  // Detect solve
  useEffect(() => {
    if (hitTarget && !isSolved) {
      setIsSolved(true);
      setFlashSuccess(true);
      audioManager.playLaserSuccess?.();
      setTimeout(() => setFlashSuccess(false), 1000);
    }
  }, [hitTarget, isSolved]);

  const handleRotate = (mirrorId) => {
    if (isSolved) return;
    audioManager.playClick?.();
    setMoves(m => m + 1);
    setMirrors(prev =>
      prev.map(m => m.id === mirrorId ? { ...m, angle: (m.angle + 1) % 2 } : m)
    );
  };

  const handleContinue = () => {
    audioManager.playClick();
    gameState.completeLaser();
  };

  // Build grid cells
  const grid = [];
  for (let z = 0; z < GRID_SIZE; z++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const isEmitter = puzzle.emitter.x === x && puzzle.emitter.z === z;
      const isTarget = puzzle.target.x === x && puzzle.target.z === z;
      const isWall = puzzle.walls.find(w => w.x === x && w.z === z);
      const mirror = mirrors.find(m => m.x === x && m.z === z);
      const hasLaser = laserCells.has(`${x},${z}`);

      grid.push({ x, z, isEmitter, isTarget, isWall, mirror, hasLaser });
    }
  }

  const dirEmoji = { E: '→', W: '←', N: '↑', S: '↓' };

  return (
    <div className={`laser-fullscreen-wrapper ${flashSuccess ? 'laser-flash-success' : ''}`}
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      <div className="laser-game-card animate-scale-up">

        {/* ── HEADER ── */}
        <div className="laser-card-header">
          <div className="laser-badge">🔴 MINI-GAME 2: OPTICAL FIREWALL</div>
          <h1 className="laser-title">{puzzle.name}</h1>
          <p className="laser-subtitle">{puzzle.subtitle}</p>
        </div>

        {/* ── PUZZLE SELECTOR ── */}
        <div className="laser-puzzle-tabs">
          {PUZZLES.map((p, i) => (
            <button
              key={p.id}
              className={`laser-tab ${puzzleIndex === i ? 'laser-tab-active' : ''}`}
              onClick={() => { audioManager.playClick?.(); setPuzzleIndex(i); }}
            >
              <span className={`diff-dot ${p.diffClass}`} />
              {p.name}
            </button>
          ))}
        </div>

        {/* ── HOW TO PLAY BANNER ── */}
        <div className="laser-howto-banner">
          <span className="laser-howto-icon">💡</span>
          <span>
            <strong>How to play:</strong> The red laser fires from <strong>🔴 EMITTER {dirEmoji[puzzle.emitter.dir]}</strong>.
            Click <strong>💠 MIRROR</strong> buttons below to rotate them (╱ or ╲) and bounce the beam into <strong>🎯 TARGET</strong>.
            Avoid <strong>⬛ WALLS</strong>!
          </span>
        </div>

        {/* ── LEGEND ── */}
        <div className="laser-legend-row">
          <span className="legend-item"><span className="legend-dot emitter-dot">🔴</span> Emitter</span>
          <span className="legend-item"><span className="legend-dot">🎯</span> Target</span>
          <span className="legend-item"><span className="legend-dot mirror-dot">💠</span> Mirror (click to rotate)</span>
          <span className="legend-item"><span className="legend-dot wall-dot">⬛</span> Wall (blocks laser)</span>
          <span className="legend-item"><span className="legend-laser-line" /> Laser beam</span>
        </div>

        {/* ── 2D GRID ── */}
        <div
          className="laser-grid-container"
          style={{ borderColor: isSolved ? '#10b981' : puzzle.borderColor }}
        >
          <div className="laser-grid">
            {grid.map(cell => {
              let cellClass = 'laser-cell';
              let content = null;

              if (cell.isWall) {
                cellClass += ' cell-wall';
                content = <span className="cell-icon">⬛</span>;
              } else if (cell.isEmitter) {
                cellClass += ' cell-emitter';
                content = (
                  <span className="cell-icon">
                    🔴<span className="emitter-dir">{dirEmoji[puzzle.emitter.dir]}</span>
                  </span>
                );
              } else if (cell.isTarget) {
                cellClass += isSolved ? ' cell-target-hit' : ' cell-target';
                content = <span className="cell-icon">{isSolved ? '✅' : '🎯'}</span>;
              } else if (cell.mirror) {
                cellClass += ' cell-mirror';
                const sym = cell.mirror.angle % 2 === 0 ? '╱' : '╲';
                content = (
                  <button
                    className="mirror-cell-btn"
                    onClick={() => handleRotate(cell.mirror.id)}
                    title={`Click to rotate ${cell.mirror.name}`}
                  >
                    <span className="mirror-symbol">{sym}</span>
                    <span className="mirror-cell-label">{cell.mirror.name}</span>
                  </button>
                );
              }

              if (cell.hasLaser && !cell.isWall) {
                cellClass += isSolved ? ' cell-laser-hit' : ' cell-laser';
              }

              return (
                <div key={`${cell.x}-${cell.z}`} className={cellClass}>
                  {content}
                </div>
              );
            })}
          </div>

          {/* Grid coordinate labels */}
          <div className="grid-x-labels">
            {Array.from({ length: GRID_SIZE }, (_, i) => (
              <span key={i} className="grid-coord">{i}</span>
            ))}
          </div>
        </div>

        {/* ── MIRROR CONTROLS ── */}
        <div className="laser-mirror-controls">
          <div className="mirror-controls-title">🔄 CLICK A MIRROR TO ROTATE IT:</div>
          <div className="mirror-btns-row">
            {mirrors.map(m => (
              <button
                key={m.id}
                className={`laser-mirror-btn ${isSolved ? 'mirror-btn-disabled' : ''}`}
                onClick={() => handleRotate(m.id)}
                disabled={isSolved}
              >
                <span className="mirror-btn-symbol">{m.angle % 2 === 0 ? '╱' : '╲'}</span>
                <span className="mirror-btn-name">{m.name}</span>
                <span className="mirror-btn-hint">{m.hint}</span>
              </button>
            ))}
          </div>
          <div className="laser-moves-counter">
            Moves: <strong>{moves}</strong>
            <button
              className="laser-hint-toggle"
              onClick={() => setShowHint(v => !v)}
            >
              {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
            </button>
          </div>
        </div>

        {/* ── HINT ── */}
        {showHint && (
          <div className="laser-hint-box animate-slide-up">
            <strong>💡 HINT:</strong> {puzzle.solution}
          </div>
        )}

        {/* ── SUCCESS BANNER ── */}
        {isSolved && (
          <div className="laser-success-card animate-slide-up">
            <div className="laser-success-icon">🎉</div>
            <div className="laser-success-title">TARGET HIT! FIREWALL OVERRIDDEN!</div>
            <div className="laser-success-passkey">
              PASSKEY: <strong>LASER-27</strong> &nbsp;·&nbsp; Solved in <strong>{moves}</strong> moves &nbsp;·&nbsp; +100 PTS
            </div>
            <button className="primary-button laser-continue-btn" onClick={handleContinue}>
              CLAIM PASSKEY &amp; CONTINUE →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LaserGame;
