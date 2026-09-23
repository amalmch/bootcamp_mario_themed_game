import React, { useState, useEffect } from 'react';
import gameState from '../game/GameState.js';
import { dialogueData } from '../game/dialogueData.js';
import audioManager from '../game/AudioManager.js';

export function DialogueUI({ dialogueId = 'world1_intro' }) {
  const dialogue = dialogueData[dialogueId] || dialogueData.world1_intro;
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const currentLine = dialogue.lines[lineIndex];

  // Determine Story Card Background based on current story or world
  const getCardBackground = () => {
    if (dialogueId.includes('world2') || dialogueId.includes('peach') || dialogueId.includes('yoshi')) {
      return '/assets/backgrounds/Corrupted Mushroom Kingdom.png';
    }
    if (dialogueId.includes('world3') || dialogueId.includes('bowser')) {
      return '/assets/backgrounds/Code Castle Background.png';
    }
    return '/assets/backgrounds/Magical Programming Kingdom.png';
  };

  // Typewriter effect
  useEffect(() => {
    if (!currentLine) return;

    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const fullText = currentLine.text;

    const interval = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        if (charIndex % 3 === 0) {
          audioManager.playDialogueChirp(currentLine.character);
        }
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [lineIndex, dialogueId]);

  const handleNext = () => {
    audioManager.playClick();

    if (isTyping) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
      return;
    }

    if (lineIndex < dialogue.lines.length - 1) {
      setLineIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleAction = () => {
    audioManager.playClick();

    if (dialogueId === 'world1_intro') {
      gameState.finishStory1(); // Starts 3D movement & piece collection in Level 1
    } else if (dialogueId === 'world2_intro') {
      gameState.finishStory2(); // Enters Laser Chamber
    } else if (dialogueId === 'world3_intro') {
      gameState.finishStory3(); // Enters RGB riddle
    } else {
      gameState.setState({ activeView: 'playing' });
    }
  };

  return (
    <div
      className="ue-story-card-wrapper animate-fade-in"
      style={{
        backgroundImage: `url('${getCardBackground()}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={!isComplete ? handleNext : undefined}
    >
      {!isComplete ? (
        <div className="ue-story-card-stage" onClick={(e) => e.stopPropagation()}>
          {/* Character standing above dialogue box on the right (Unreal Engine Mockup Style!) */}
          <div className="ue-character-actor animate-bounce-subtle">
            <img
              src={currentLine.portrait}
              alt={currentLine.character}
              className="ue-actor-img"
            />
          </div>

          {/* Dialogue Box (Dark horizontal bar at bottom center) */}
          <div className="ue-dialogue-box">
            <div className="ue-speaker-name">
              {currentLine.character}
            </div>

            <div className="ue-dialogue-text">
              "{displayedText}"
              {isTyping && <span className="typewriter-cursor">|</span>}
            </div>

            <button className="ue-next-btn" onClick={handleNext}>
              {isTyping ? 'SKIP ▶' : lineIndex < dialogue.lines.length - 1 ? 'NEXT ▶' : 'FINISH ▶'}
            </button>
          </div>
        </div>
      ) : (
        /* Completion Story Card Overlay */
        <div className="ue-completion-overlay animate-scale-up" onClick={(e) => e.stopPropagation()}>
          <div className="ue-completion-content glass-panel">
            <h1 className="ue-completion-title">
              {dialogue.completionTitle || 'STORY CARD COMPLETED'}
            </h1>
            {dialogue.completionSubtitle && (
              <p className="ue-completion-sub">{dialogue.completionSubtitle}</p>
            )}
            <button className="ue-enter-portal-btn" onClick={handleAction}>
              {dialogue.completionButton || 'ENTER PORTAL'} ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DialogueUI;
