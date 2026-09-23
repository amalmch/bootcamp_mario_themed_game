import React, { useState } from 'react';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

export function FinalGame() {
  const state = gameState.getState();

  const [inputBinary, setInputBinary] = useState('');
  const [inputHex, setInputHex] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleCompile = (e) => {
    e.preventDefault();

    // Check answers:
    // Binary 1010 -> 10, or passkey BIN-42
    const binaryValid = inputBinary.trim() === '10' || inputBinary.trim().toUpperCase() === 'BIN-42';
    // Hex 0A -> 10, or passkey LASER-27
    const hexValid = inputHex.trim() === '10' || inputHex.trim().toUpperCase() === 'LASER-27';
    // RGB
    const colorValid = selectedColor === 'coral';

    if (!binaryValid) {
      audioManager.playWrong();
      setErrorMsg('Syntax Error in Binary Stream: 1010 in decimal is 10 (or enter passkey BIN-42)!');
      return;
    }

    if (!hexValid) {
      audioManager.playWrong();
      setErrorMsg('Syntax Error in Hex Buffer: 0A in decimal is 10 (or enter passkey LASER-27)!');
      return;
    }

    if (!colorValid) {
      audioManager.playWrong();
      setErrorMsg('Color resonance imbalance! Choose Coral Ember RGB(255, 100, 50).');
      return;
    }

    // Success!
    audioManager.playVictoryFanfare();
    gameState.completeFinalChallenge();
  };

  const handleAutoFillPasskeys = () => {
    setInputBinary('BIN-42');
    setInputHex('LASER-27');
    setSelectedColor('coral');
    setErrorMsg(null);
    audioManager.playCoin();
  };

  return (
    <div
      className="mario-minigame-viewport animate-fade-in"
      style={{
        backgroundImage: `linear-gradient(rgba(240, 249, 255, 0.88), rgba(254, 243, 199, 0.92)), url('/assets/backgrounds/Code Castle Background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mario-final-card animate-scale-up">
        {/* Header Badge */}
        <div className="mario-badge-tag yellow-tag">
          🏆 GRAND COMPILER GATE
        </div>

        <h1 className="mario-game-title">
          RESTORE THE CODE KINGDOM!
        </h1>
        <p className="mario-game-subtitle">
          Combine all 3 recovered passkeys to override Bowser's corruption exception!
        </p>

        {/* Mario & Luigi Encouragement Banner */}
        <div className="mario-hero-speech-banner">
          <div className="hero-speech-item">
            <img src="/assets/characters/mario.png" alt="Mario" className="speech-avatar" />
            <div className="speech-bubble">
              <strong>MARIO:</strong> "Yahoo! We got the passkeys! Let's enter them and compile reality!"
            </div>
          </div>
          <div className="hero-speech-item">
            <img src="/assets/characters/Luigi.png" alt="Luigi" className="speech-avatar" />
            <div className="speech-bubble">
              <strong>LUIGI:</strong> "Click Auto-Fill if you want us to type the credentials for you!"
            </div>
          </div>
        </div>

        {/* Passkeys Summary Row */}
        <div className="mario-passkeys-row">
          <div className="passkey-chip cyan-chip">
            <span className="chip-icon">🔢</span>
            <div>
              <span className="chip-label">PASSKEY 1</span>
              <strong className="chip-code">{state.binaryCode || 'BIN-42'}</strong>
            </div>
          </div>

          <div className="passkey-chip magenta-chip">
            <span className="chip-icon">🔴</span>
            <div>
              <span className="chip-label">PASSKEY 2</span>
              <strong className="chip-code">{state.laserCode || 'LASER-27'}</strong>
            </div>
          </div>

          <div className="passkey-chip gold-chip">
            <span className="chip-icon">🎨</span>
            <div>
              <span className="chip-label">PASSKEY 3</span>
              <strong className="chip-code">{state.rgbCode || 'RGB-63'}</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleCompile} className="mario-final-form">
          {/* Section 1: Binary */}
          <div className="mario-form-group">
            <label className="mario-input-label">
              1. BINARY STREAM: Enter Passkey <code>BIN-42</code> (or decimal 10):
            </label>
            <input
              type="text"
              className="mario-text-input"
              placeholder="e.g. BIN-42 or 10"
              value={inputBinary}
              onChange={(e) => setInputBinary(e.target.value)}
            />
          </div>

          {/* Section 2: Hex / Optical */}
          <div className="mario-form-group">
            <label className="mario-input-label">
              2. OPTICAL FIREWALL: Enter Passkey <code>LASER-27</code> (or decimal 10):
            </label>
            <input
              type="text"
              className="mario-text-input"
              placeholder="e.g. LASER-27 or 10"
              value={inputHex}
              onChange={(e) => setInputHex(e.target.value)}
            />
          </div>

          {/* Section 3: RGB Resonance */}
          <div className="mario-form-group">
            <label className="mario-input-label">
              3. CHROMATIC HARMONY: Select <code>Coral Ember RGB(255, 100, 50)</code>:
            </label>
            <div className="mario-color-options-row">
              <button
                type="button"
                className={`mario-color-circle ${selectedColor === 'coral' ? 'circle-selected' : ''}`}
                style={{ backgroundColor: 'rgb(255, 100, 50)' }}
                onClick={() => {
                  audioManager.playClick();
                  setSelectedColor('coral');
                }}
              >
                {selectedColor === 'coral' ? '✓' : ''}
              </button>
              <button
                type="button"
                className={`mario-color-circle ${selectedColor === 'lime' ? 'circle-selected' : ''}`}
                style={{ backgroundColor: 'rgb(50, 220, 80)' }}
                onClick={() => {
                  audioManager.playClick();
                  setSelectedColor('lime');
                }}
              >
                {selectedColor === 'lime' ? '✓' : ''}
              </button>
              <button
                type="button"
                className={`mario-color-circle ${selectedColor === 'blue' ? 'circle-selected' : ''}`}
                style={{ backgroundColor: 'rgb(40, 100, 255)' }}
                onClick={() => {
                  audioManager.playClick();
                  setSelectedColor('blue');
                }}
              >
                {selectedColor === 'blue' ? '✓' : ''}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mario-error-alert animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="mario-actions-bar">
            <button
              type="button"
              className="secondary-button autofill-btn"
              onClick={handleAutoFillPasskeys}
            >
              ⚡ AUTO-FILL PASSKEYS
            </button>

            <button type="submit" className="primary-button compile-run-btn">
              🌟 COMPILE & RESCUE THE KINGDOM! 🌟
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FinalGame;
