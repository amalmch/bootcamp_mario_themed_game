import React from 'react';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

export function PauseMenu() {
  const state = gameState.getState();

  const handleResume = () => {
    audioManager.playClick();
    gameState.unpauseGame();
  };

  const handleRestart = () => {
    audioManager.playClick();
    gameState.startPlay(state.teamName);
  };

  const handleMainMenu = () => {
    audioManager.playClick();
    // Accumulate time before leaving
    gameState.pauseGame();
    gameState.setState({ activeView: 'menu', isPaused: false });
  };

  const elapsedMs = gameState.getElapsedMs();
  const displayTime = gameState.formatTime(elapsedMs);

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="pause-menu-card glass-panel animate-scale-up">
        <div className="pause-badge">⏸️ GAME PAUSED</div>
        <h2 className="pause-title">PAUSED</h2>

        {state.teamName && (
          <div className="pause-team-info">
            🏆 <strong>{state.teamName}</strong>
          </div>
        )}

        <div className="pause-stats-row">
          <div className="pause-stat-item">
            <span className="pause-stat-icon">🪙</span>
            <span className="pause-stat-val">{state.score}</span>
            <span className="pause-stat-lbl">PTS</span>
          </div>
          <div className="pause-stat-item">
            <span className="pause-stat-icon">⏱️</span>
            <span className="pause-stat-val">{displayTime}</span>
            <span className="pause-stat-lbl">TIME</span>
          </div>
          <div className="pause-stat-item">
            <span className="pause-stat-icon">💾</span>
            <span className="pause-stat-val">{state.bitsCollected}</span>
            <span className="pause-stat-lbl">BITS</span>
          </div>
        </div>

        <div className="pause-button-list">
          <button className="primary-button pause-btn-action" onClick={handleResume}>
            ▶ RESUME GAME
          </button>
          <button className="secondary-button pause-btn-action" onClick={handleRestart}>
            🔄 RESTART FROM LEVEL 1
          </button>
          <button className="secondary-button pause-btn-action" onClick={handleMainMenu}>
            🏠 RETURN TO MAIN MENU
          </button>
        </div>

        <div className="pause-tip">
          Tip: Press <strong>ESC</strong> anytime to return to the action!
        </div>
      </div>
    </div>
  );
}

export default PauseMenu;
