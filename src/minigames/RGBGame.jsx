import React, { useState } from 'react';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

const RGB_RIDDLE_VARIANTS = [
  {
    title: 'CORAL EMBER MATRIX',
    rClue: 'ROSS [Toad]: "Red is boosted to maximum turbo power! 255!"',
    gClue: 'GRACE [Yoshi]: "Yoshi counted 100 green Yoshi eggs! Green is 100!"',
    bClue: 'BERNARD [Peach]: "Blue is as calm as 50 royal sapphire drops! Blue is 50!"',
    rgb: { r: 255, g: 100, b: 50 },
    hex: '#ff6432',
    name: 'Coral Ember',
    options: [
      { name: 'Coral Ember', r: 255, g: 100, b: 50, color: 'rgb(255, 100, 50)' },
      { name: 'Emerald Sage', r: 50, g: 220, b: 100, color: 'rgb(50, 220, 100)' },
      { name: 'Sky Azure', r: 60, g: 140, b: 255, color: 'rgb(60, 140, 255)' },
      { name: 'Deep Magenta', r: 210, g: 40, b: 180, color: 'rgb(210, 40, 180)' },
    ],
  },
  {
    title: 'CYBER LIME FREQUENCY',
    rClue: 'ROSS [Toad]: "Red is dialed down low, only 40 units!"',
    gClue: 'GRACE [Yoshi]: "Green is maxed out at 240 for Yoshi turbo speed!"',
    bClue: 'BERNARD [Peach]: "Blue is tuned to 100 sparkling castle crystals!"',
    rgb: { r: 40, g: 240, b: 100 },
    hex: '#28f064',
    name: 'Cyber Lime',
    options: [
      { name: 'Golden Glow', r: 240, g: 200, b: 40, color: 'rgb(240, 200, 40)' },
      { name: 'Cyber Lime', r: 40, g: 240, b: 100, color: 'rgb(40, 240, 100)' },
      { name: 'Midnight Violet', r: 120, g: 50, b: 230, color: 'rgb(120, 50, 230)' },
      { name: 'Crimson Burst', r: 230, g: 40, b: 70, color: 'rgb(230, 40, 70)' },
    ],
  },
  {
    title: 'ROYAL VIOLET HARMONY',
    rClue: 'ROSS [Toad]: "Red is glowing brightly with 190 power units!"',
    gClue: 'GRACE [Yoshi]: "Green is minimal, just 45!"',
    bClue: 'BERNARD [Peach]: "Blue is reaching high into the stratosphere at 240!"',
    rgb: { r: 190, g: 45, b: 240 },
    hex: '#be2df0',
    name: 'Royal Violet',
    options: [
      { name: 'Ocean Cyan', r: 40, g: 190, b: 240, color: 'rgb(40, 190, 240)' },
      { name: 'Sunny Orange', r: 245, g: 140, b: 30, color: 'rgb(245, 140, 30)' },
      { name: 'Royal Violet', r: 190, g: 45, b: 240, color: 'rgb(190, 45, 240)' },
      { name: 'Mint Meadow', r: 80, g: 230, b: 140, color: 'rgb(80, 230, 140)' },
    ],
  },
];

export function RGBGame() {
  const [variantIndex, setVariantIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solvedIndices, setSolvedIndices] = useState([]);

  const riddle = RGB_RIDDLE_VARIANTS[variantIndex];
  const allSolved = solvedIndices.length === RGB_RIDDLE_VARIANTS.length;

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedColor(opt);
    setIsAnswered(true);

    const correct = opt.name === riddle.name;
    setIsCorrect(correct);

    if (correct) {
      audioManager.playCorrect();
      if (!solvedIndices.includes(variantIndex)) {
        setSolvedIndices(prev => [...prev, variantIndex]);
      }
    } else {
      audioManager.playWrong();
    }
  };

  const handleRetry = () => {
    audioManager.playClick();
    setSelectedColor(null);
    setIsAnswered(false);
  };

  const handleContinue = () => {
    audioManager.playClick();
    gameState.completeRGB();
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
      <div className="mario-rgb-card animate-scale-up">
        {/* Header Badge */}
        <div className="mario-badge-tag yellow-tag">
          🎨 MINI-GAME 3: RGB GUARDIAN RIDDLE
        </div>

        <h1 className="mario-game-title">
          TOAD, YOSHI & PEACH'S COLOR LOCK
        </h1>
        <p className="mario-game-subtitle">
          Combine the Red, Green, and Blue frequency clues to restore color to the Code Castle!
        </p>

        {/* Puzzle Variants Selector */}
        <div className="mario-tabs-row">
          {RGB_RIDDLE_VARIANTS.map((v, i) => (
            <button
              key={i}
              className={`mario-tab-btn ${variantIndex === i ? 'mario-tab-active' : ''}`}
              onClick={() => {
                audioManager.playClick();
                setVariantIndex(i);
                setSelectedColor(null);
                setIsAnswered(false);
              }}
            >
              {v.title}
            </button>
          ))}
        </div>

        {/* 3 Character Dialogue Clue Cards */}
        <div className="mario-clues-row">
          {/* Toad / Red Clue */}
          <div className="mario-clue-box red-box">
            <div className="mario-clue-header">
              <div className="avatar-circle red-ring">
                <img src="/assets/characters/toad.png" alt="Ross the Toad" className="mario-avatar-img" />
              </div>
              <div className="mario-speaker-label">ROSS (RED)</div>
            </div>
            <p className="mario-clue-bubble">{riddle.rClue}</p>
          </div>

          {/* Yoshi / Green Clue */}
          <div className="mario-clue-box green-box">
            <div className="mario-clue-header">
              <div className="avatar-circle green-ring">
                <img src="/assets/characters/yoshi.png" alt="Grace the Yoshi" className="mario-avatar-img" />
              </div>
              <div className="mario-speaker-label">GRACE (GREEN)</div>
            </div>
            <p className="mario-clue-bubble">{riddle.gClue}</p>
          </div>

          {/* Peach / Blue Clue */}
          <div className="mario-clue-box blue-box">
            <div className="mario-clue-header">
              <div className="avatar-circle blue-ring">
                <img src="/assets/characters/peach.png" alt="Bernard Princess Peach" className="mario-avatar-img" />
              </div>
              <div className="mario-speaker-label">BERNARD (BLUE)</div>
            </div>
            <p className="mario-clue-bubble">{riddle.bClue}</p>
          </div>
        </div>

        {/* Target RGB Frequency Pill */}
        <div className="mario-rgb-summary-pill">
          <div className="channel-chip chip-r">R: <strong>{riddle.rgb.r}</strong></div>
          <span className="chip-plus">+</span>
          <div className="channel-chip chip-g">G: <strong>{riddle.rgb.g}</strong></div>
          <span className="chip-plus">+</span>
          <div className="channel-chip chip-b">B: <strong>{riddle.rgb.b}</strong></div>
          <span className="chip-eq">=</span>
          <div className="channel-chip chip-target">RGB({riddle.rgb.r}, {riddle.rgb.g}, {riddle.rgb.b})</div>
        </div>

        <h3 className="mario-prompt-question">
          Which color swatch matches this RGB recipe?
        </h3>

        {/* 4 Super Mario Color Choices */}
        <div className="mario-swatches-grid">
          {riddle.options.map((opt, idx) => {
            let itemClass = 'mario-swatch-card';
            if (isAnswered) {
              if (opt.name === riddle.name) itemClass += ' swatch-winner';
              else if (opt === selectedColor) itemClass += ' swatch-loser';
            }

            return (
              <button
                key={idx}
                className={itemClass}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
              >
                <div className="swatch-color-disc" style={{ backgroundColor: opt.color }} />
                <div className="swatch-text-meta">
                  <div className="swatch-title-text">{opt.name}</div>
                  <div className="swatch-val-text">RGB({opt.r}, {opt.g}, {opt.b})</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback & Continue */}
        {isAnswered && (
          <div className="mario-feedback-banner animate-slide-up">
            {isCorrect ? (
              <div className="mario-result-box mario-win-box">
                <div className="win-headline">🌟 MAMMA MIA! COLOR RESTORED! 🌟</div>
                {allSolved ? (
                  <div className="win-passkey">PASSKEY: <strong>RGB-63</strong> (+100 POINTS)</div>
                ) : (
                  <div className="win-passkey">Nice job! Now complete the other {RGB_RIDDLE_VARIANTS.length - solvedIndices.length} riddle(s).</div>
                )}
              </div>
            ) : (
              <div className="mario-result-box mario-fail-box">
                <div className="fail-headline">🍄 OOPS! That was {selectedColor?.name}!</div>
                <div className="fail-hint">Target was {riddle.name}. You must answer correctly to pass!</div>
              </div>
            )}

            {!isCorrect ? (
              <button className="secondary-button mario-continue-btn" onClick={handleRetry} style={{ background: '#f59e0b', borderColor: '#d97706' }}>
                🔄 TRY AGAIN
              </button>
            ) : allSolved ? (
              <button className="primary-button mario-continue-btn" onClick={handleContinue}>
                CLAIM PASSKEY & UNLOCK GRAND COMPILER GATE →
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default RGBGame;
