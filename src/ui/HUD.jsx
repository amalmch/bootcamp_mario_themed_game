import React, { useEffect, useState, useRef } from 'react';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

export function HUD() {
  const [state, setState] = useState(gameState.getState());
  const [musicOn, setMusicOn] = useState(audioManager.musicEnabled);
  const [sfxOn, setSfxOn] = useState(audioManager.sfxEnabled);
  const [displayTime, setDisplayTime] = useState('00:00');
  const timerRef = useRef(null);

  useEffect(() => {
    const unsub = gameState.subscribe((newState) => {
      setState(newState);
    });
    return unsub;
  }, []);

  // Live timer — updates every second while playing and not paused
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (state.activeView === 'playing' && !state.isPaused) {
      timerRef.current = setInterval(() => {
        setDisplayTime(gameState.formatTime(gameState.getElapsedMs()));
      }, 1000);
      // Set immediately too
      setDisplayTime(gameState.formatTime(gameState.getElapsedMs()));
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.activeView, state.isPaused, state.lastResumeTime]);

  const getObjective = () => {
    if (state.currentWorld === 1) {
      if (!state.binaryCompleted) return 'Collect code fragments & solve the Binary Problem!';
      return 'Enter the Binary Warp Pipe at the end of the path!';
    }
    if (state.currentWorld === 2) {
      if (!state.laserCompleted) return 'Navigate the corrupted zone & find Peach & Yoshi!';
      return 'Enter the Firewall Warp Pipe to advance to Code Castle!';
    }
    if (state.currentWorld === 3) {
      if (!state.rgbCompleted) return 'Meet the RGB Guardians & restore color!';
      return 'Approach the Grand Compiler Gate and restore reality!';
    }
    return 'Restore the Code Kingdom!';
  };

  const getWorldName = () => {
    switch (state.currentWorld) {
      case 1: return 'LEVEL 1: MAGICAL CODE KINGDOM';
      case 2: return 'LEVEL 2: CORRUPTED MUSHROOM REALM';
      case 3: return 'LEVEL 3: CODE CASTLE APPROACH';
      default: return 'CODE REALM';
    }
  };

  const getPieceLabel = () => {
    switch (state.currentWorld) {
      case 1: return 'FRAGMENTS';
      case 2: return 'CRYSTALS';
      case 3: return 'STARS';
      default: return 'PIECES';
    }
  };

  const handleToggleMusic = () => {
    const val = audioManager.toggleMusic();
    setMusicOn(val);
  };

  const handleToggleSfx = () => {
    const val = audioManager.toggleSfx();
    setSfxOn(val);
  };

  const handlePause = () => {
    audioManager.playClick();
    gameState.pauseGame();
  };

  return (
    <div className="hud-container">
      {/* Top Left: Score, World, & Collectibles */}
      <div className="hud-top-left">
        <div className="hud-world-title">{getWorldName()}</div>
        {state.teamName && (
          <div className="hud-team-name">🏆 {state.teamName}</div>
        )}
        <div className="hud-score-row">
          <span className="coin-icon">🪙</span>
          <span className="score-value">{state.score}</span>
          <span className="score-label">PTS</span>
        </div>
        <div className="hud-pieces-counter">
          <span className="piece-icon">🧩</span>
          <span className="piece-text">
            {getPieceLabel()}: <strong>{state.piecesCollected} / {state.piecesRequired}</strong>
          </span>
        </div>
        <div className="hud-bits-counter">
          <span className="piece-icon">💾</span>
          <span className="piece-text">BITS: <strong>{state.bitsCollected}</strong></span>
        </div>
      </div>

      {/* Top Center: Objective + Live Timer */}
      <div className="hud-top-center">
        <div className="hud-live-timer">
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{displayTime}</span>
        </div>
        <div className="quest-label">CURRENT OBJECTIVE</div>
        <div className="quest-desc">🎯 {getObjective()}</div>
      </div>

      {/* Top Right: Passkeys Inventory & Audio Controls */}
      <div className="hud-top-right">
        <div className="passkeys-inventory">
          <span className="inv-title">PASSKEYS:</span>
          <span className={`passkey-tag ${state.binaryCompleted ? 'unlocked' : 'locked'}`}>
            {state.binaryCompleted ? '✓ BIN-42' : '🔒 BIN-??'}
          </span>
          <span className={`passkey-tag ${state.laserCompleted ? 'unlocked' : 'locked'}`}>
            {state.laserCompleted ? '✓ LASER-27' : '🔒 LASER-??'}
          </span>
          <span className={`passkey-tag ${state.rgbCompleted ? 'unlocked' : 'locked'}`}>
            {state.rgbCompleted ? '✓ RGB-63' : '🔒 RGB-??'}
          </span>
        </div>

        <div className="hud-audio-controls">
          <button
            className={`audio-btn ${musicOn ? 'active' : ''}`}
            onClick={handleToggleMusic}
            title="Toggle Music"
          >
            {musicOn ? '🎵 BGM' : '🔇 BGM'}
          </button>
          <button
            className={`audio-btn ${sfxOn ? 'active' : ''}`}
            onClick={handleToggleSfx}
            title="Toggle SFX"
          >
            {sfxOn ? '🔊 SFX' : '🔈 SFX'}
          </button>
          <button
            className="audio-btn pause-btn"
            onClick={handlePause}
            title="Pause Game (ESC)"
          >
            ⏸️ ESC
          </button>
        </div>
      </div>

      {/* Active Road Sign Display */}
      {state.readSignText && state.activeView === 'playing' && (
        <div className="road-sign-popup animate-slide-up">
          <div className="sign-icon">📜</div>
          <div className="sign-text-content">
            <div className="sign-title">ROAD SIGN</div>
            <div className="sign-body">{state.readSignText}</div>
          </div>
        </div>
      )}

      {/* Center Bottom: Interaction Prompt */}
      {state.interactionPrompt && state.activeView === 'playing' && (
        <div className="interaction-prompt-banner animate-bounce">
          <span className="key-badge">E</span>
          <span className="prompt-text">{state.interactionPrompt.replace('[E]', '').trim()}</span>
        </div>
      )}

      {/* Bottom Left: Controls Legend */}
      <div className="hud-controls-helper">
        <span>WASD: Move</span> • <span>SHIFT: Run</span> • <span>SPACE: Jump</span> • <span>E: Interact</span>
      </div>
    </div>
  );
}

export default HUD;
