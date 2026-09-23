import React, { useState } from 'react';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

export function MainMenu() {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState('');
  const [teamNameError, setTeamNameError] = useState('');
  const state = gameState.getState();
  const hasSavedGame =
    state.score > 0 || state.currentWorld > 1 || state.binaryCompleted;

  const handleStartGame = () => {
    audioManager.playClick();
    setTeamNameInput(state.teamName || '');
    setTeamNameError('');
    setShowTeamModal(true);
  };

  const handleConfirmTeamName = () => {
    const name = teamNameInput.trim();
    if (!name) {
      setTeamNameError('Please enter your team name!');
      return;
    }
    setShowTeamModal(false);
    audioManager.init();
    audioManager.playClick();
    audioManager.playBgm();
    gameState.startPlay(name);
  };

  const handleContinue = () => {
    audioManager.init();
    audioManager.playClick();
    audioManager.playBgm();
    gameState.resumeGame();
  };

  return (
    <div
      className="main-menu-container"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 14, 39, 0.75), rgba(10, 14, 39, 0.92)), url('/assets/backgrounds/Magical Programming Kingdom.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="main-menu-content animate-fade-in">
        {/* Mario & Luigi Header Art */}
        <div className="menu-characters-row">
          <img src="/assets/characters/mario.png" alt="Mario" className="menu-hero-img mario-hero" />
          <img src="/assets/characters/toad.png" alt="Toad" className="menu-hero-img toad-hero" />
          <img src="/assets/characters/Luigi.png" alt="Luigi" className="menu-hero-img luigi-hero" />
        </div>

        <div className="menu-title-block">
          <div className="menu-acm-badge">★ ACM UNIVERSITY BOOTCAMP ★</div>
          <h1 className="menu-main-title">CODE KINGDOM</h1>
          <div className="menu-subtitle">An Escape-Room Programming Adventure</div>
        </div>

        <div className="menu-button-group">
          <button className="primary-button menu-btn start-btn" onClick={handleStartGame}>
            ▶ START NEW GAME
          </button>

          {hasSavedGame && (
            <button className="secondary-button menu-btn" onClick={handleContinue}>
              ⏩ CONTINUE ({state.teamName || 'Team'} • Level {state.currentWorld} • {state.score} PTS)
            </button>
          )}

          <button
            className="secondary-button menu-btn"
            onClick={() => {
              audioManager.playClick();
              setShowHowToPlay(true);
            }}
          >
            ❓ HOW TO PLAY
          </button>
        </div>

        <div className="menu-footer-credits">
          Made for ACM Bootcamp • Built with Three.js &amp; React
        </div>
      </div>

      {/* ===== TEAM NAME ENTRY MODAL ===== */}
      {showTeamModal && (
        <div
          className="modal-backdrop animate-fade-in"
          onClick={() => setShowTeamModal(false)}
        >
          <div
            className="team-name-modal glass-panel animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="team-modal-header">
              <div className="team-modal-chars">
                <img src="/assets/characters/mario.png" alt="Mario" className="team-modal-char-img" />
                <img src="/assets/characters/Luigi.png" alt="Luigi" className="team-modal-char-img" />
              </div>
              <div className="team-modal-badge">🍄 READY PLAYER ONE!</div>
              <h2 className="team-modal-title">Enter Your Team Name</h2>
              <p className="team-modal-subtitle">
                Mario says: <em>"Tell me who's playing before we save the kingdom!"</em>
              </p>
            </div>

            <div className="team-input-group">
              <label className="team-input-label" htmlFor="team-name-field">
                🏆 TEAM NAME
              </label>
              <input
                id="team-name-field"
                type="text"
                className="team-name-input"
                placeholder="e.g. Team Mushroom..."
                value={teamNameInput}
                maxLength={32}
                autoFocus
                onChange={(e) => {
                  setTeamNameInput(e.target.value);
                  setTeamNameError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmTeamName();
                }}
              />
              {teamNameError && (
                <div className="team-name-error animate-shake">
                  ⚠️ {teamNameError}
                </div>
              )}
            </div>

            <div className="team-modal-actions">
              <button
                className="primary-button team-confirm-btn"
                onClick={handleConfirmTeamName}
              >
                🚀 LET'S GO!
              </button>
              <button
                className="secondary-button"
                onClick={() => setShowTeamModal(false)}
              >
                ← BACK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setShowHowToPlay(false)}>
          <div className="how-to-play-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="htp-title">🎮 CONTROLS &amp; OBJECTIVES</h2>

            <div className="htp-grid">
              <div className="htp-item">
                <span className="htp-key">W A S D</span>
                <span className="htp-desc">Move character in 3D</span>
              </div>
              <div className="htp-item">
                <span className="htp-key">MOUSE</span>
                <span className="htp-desc">Orbit camera angle</span>
              </div>
              <div className="htp-item">
                <span className="htp-key">SHIFT</span>
                <span className="htp-desc">Sprint / Run faster</span>
              </div>
              <div className="htp-item">
                <span className="htp-key">SPACE</span>
                <span className="htp-desc">Jump over obstacles</span>
              </div>
              <div className="htp-item">
                <span className="htp-key">E</span>
                <span className="htp-desc">Interact with characters &amp; portals</span>
              </div>
              <div className="htp-item">
                <span className="htp-key">ESC</span>
                <span className="htp-desc">Pause game</span>
              </div>
            </div>

            <div className="htp-score-breakdown">
              <div className="htp-score-title">📊 SCORE BREAKDOWN</div>
              <div className="htp-score-row">
                <span>🧩 Code Fragment / Bit collected</span><strong>+5 pts each</strong>
              </div>
              <div className="htp-score-row">
                <span>✅ Binary Challenge solved</span><strong>+100 pts</strong>
              </div>
              <div className="htp-score-row">
                <span>🔴 Laser Puzzle solved</span><strong>+100 pts</strong>
              </div>
              <div className="htp-score-row">
                <span>🎨 RGB Riddle solved</span><strong>+100 pts</strong>
              </div>
              <div className="htp-score-row">
                <span>⏱️ Speed Bonus (faster = more!)</span><strong>up to +1000 pts</strong>
              </div>
            </div>

            <div className="htp-lore">
              <p>
                <strong>The Mission:</strong> Mario accidentally pressed the <em>"DO NOT PRESS"</em> button
                and corrupted the Code Kingdom! Explore the worlds, solve 3 coding mini-games,
                collect all code fragments and coins, and compile the final gate!
              </p>
            </div>

            <button
              className="primary-button htp-close-btn"
              onClick={() => {
                audioManager.playClick();
                setShowHowToPlay(false);
              }}
            >
              LET'S GO! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainMenu;
