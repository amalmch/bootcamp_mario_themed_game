import React from 'react';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

export function PasskeyModal({ data }) {
  if (!data) return null;

  const handleContinue = () => {
    try {
      audioManager.playCoin();
      if (typeof data.onContinue === 'function') {
        data.onContinue();
      } else if (data.finalReady) {
        gameState.setState({ activeView: 'final', passkeyToShow: null });
      } else if (data.nextWorld) {
        gameState.transitionToWorld(data.nextWorld);
      } else {
        gameState.setState({ activeView: 'playing', passkeyToShow: null });
      }
    } catch (err) {
      console.warn('Passkey transition fallback:', err);
      const targetWorld = data.nextWorld || 2;
      gameState.transitionToWorld(targetWorld);
    }
  };

  return (
    <div className="passkey-modal-backdrop animate-fade-in">
      <div className="passkey-modal-box glass-panel animate-scale-up">
        <div className="passkey-header-tag">
          🔒 ACCESS CREDENTIAL
        </div>

        <h1 className="passkey-title">
          {data.title || 'ACCESS GRANTED'}
        </h1>

        <div className="passkey-code-display">
          <span className="code-text">{data.code}</span>
        </div>

        {data.subtitle && (
          <div className="passkey-subtitle">
            {data.subtitle}
          </div>
        )}

        <div className="passkey-score-tag">
          +{data.points || 100} POINTS
        </div>

        <button className="primary-button passkey-continue-btn" onClick={handleContinue}>
          {data.buttonText || 'CONTINUE'} →
        </button>
      </div>
    </div>
  );
}

export default PasskeyModal;
