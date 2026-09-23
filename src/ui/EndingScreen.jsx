import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';
import { submitScoreToSheet } from '../game/SheetService.js';

export function EndingScreen() {
  const state = gameState.getState();
  const [displayTime] = useState(() => gameState.formatTime((state.finalElapsedSec || 0) * 1000));
  const [submitStatus, setSubmitStatus] = useState('saving'); // 'saving' | 'saved' | 'offline'

  // Score breakdown
  const minigameScore = state.minigameScore || 0;
  const bitsScore = (state.bitsCollected || 0) * 5;
  const timeBonus = state.finalTimeBonus != null ? state.finalTimeBonus : 0;
  const totalScore = state.score;

  useEffect(() => {
    // Submit score to Google Sheet leaderboard
    submitScoreToSheet({
      teamName: state.teamName,
      finalScore: state.score,
      minigameScore: state.minigameScore || 0,
      bitsCollected: state.bitsCollected || 0,
      elapsedSec: state.finalElapsedSec || 0,
      timeBonus: state.finalTimeBonus || 0,
    }).then(result => {
      setSubmitStatus(result.ok ? 'saved' : 'offline');
    });

    // Fireworks / Confetti celebration burst
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e52521', '#00b81a', '#ffd700', '#60a5fa', '#ffffff'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e52521', '#00b81a', '#ffd700', '#60a5fa', '#ffffff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handlePlayAgain = () => {
    audioManager.playClick();
    gameState.startPlay(state.teamName);
  };

  const handleReturnMenu = () => {
    audioManager.playClick();
    gameState.setState({ activeView: 'menu' });
  };

  return (
    <div
      className="ending-screen-container"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 14, 39, 0.75), rgba(10, 14, 39, 0.9)), url('/assets/backgrounds/Code Castle Background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="ending-card glass-panel animate-scale-up">
        <div className="victory-badge animate-pulse">
          👑 VICTORY • ESCAPE COMPLETE
        </div>

        {/* Leaderboard submission status */}
        <div className={`sheet-status-badge sheet-status-${submitStatus}`}>
          {submitStatus === 'saving' && '⏳ Saving score to leaderboard...'}
          {submitStatus === 'saved'  && '✅ Score saved to leaderboard!'}
          {submitStatus === 'offline' && '📴 Offline — score not saved'}
        </div>
        {state.teamName && (
          <div className="ending-team-name">🏆 {state.teamName}</div>
        )}

        <h1 className="ending-title">CODE KINGDOM RESTORED!</h1>

        {/* Mario & Luigi Witty Ending Epilogue */}
        <div className="epilogue-dialogue-box">
          <div className="epilogue-char-row">
            <img src="/assets/characters/mario.png" alt="Mario" className="epilogue-avatar" />
            <div className="epilogue-bubble">
              <strong>Mario:</strong> "Did we actually fix it?"
            </div>
          </div>
          <div className="epilogue-char-row">
            <img src="/assets/characters/Luigi.png" alt="Luigi" className="epilogue-avatar" />
            <div className="epilogue-bubble">
              <strong>Luigi:</strong> "Mostly."
            </div>
          </div>
          <div className="epilogue-char-row">
            <img src="/assets/characters/mario.png" alt="Mario" className="epilogue-avatar" />
            <div className="epilogue-bubble">
              <strong>Mario:</strong> "Mostly?!"
            </div>
          </div>
          <div className="epilogue-char-row">
            <img src="/assets/characters/Luigi.png" alt="Luigi" className="epilogue-avatar" />
            <div className="epilogue-bubble">
              <strong>Luigi:</strong> "...Don't touch anything."
            </div>
          </div>
        </div>

        {/* Score Breakdown Card */}
        <div className="final-score-section">
          <div className="final-score-heading">FINAL SCORE</div>
          <div className="final-score-display">{totalScore} PTS</div>

          {/* Score breakdown table */}
          <div className="score-breakdown-table">
            <div className="score-row-item">
              <span className="score-row-label">🎮 Mini-Game Challenges</span>
              <span className="score-row-val">+{minigameScore}</span>
            </div>
            <div className="score-row-item">
              <span className="score-row-label">💾 Bits &amp; Fragments Collected ({state.bitsCollected || 0} × 5)</span>
              <span className="score-row-val">+{bitsScore}</span>
            </div>
            <div className="score-row-item">
              <span className="score-row-label">⏱️ Speed Bonus (Time: {displayTime})</span>
              <span className="score-row-val score-time-bonus">+{timeBonus}</span>
            </div>
            <div className="score-row-divider" />
            <div className="score-row-item score-row-total">
              <span className="score-row-label">🌟 TOTAL</span>
              <span className="score-row-val">{totalScore}</span>
            </div>
          </div>

          <div className="final-passkeys-list">
            <div className="final-pk-title">RECOVERED PASSKEYS:</div>
            <div className="final-pk-row">
              <span className="pk-tag">✓ BIN-42</span>
              <span className="pk-tag">✓ LASER-27</span>
              <span className="pk-tag">✓ RGB-63</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ending-buttons-row">
          <button className="primary-button ending-btn" onClick={handlePlayAgain}>
            🔄 PLAY AGAIN
          </button>
          <button className="secondary-button ending-btn" onClick={handleReturnMenu}>
            🏠 RETURN TO START
          </button>
        </div>
      </div>
    </div>
  );
}

export default EndingScreen;
