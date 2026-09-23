import React, { useState, useEffect } from 'react';
import gameState from '../game/GameState.js';
import audioManager from '../game/AudioManager.js';

const QUESTION_BANK = [
  { q: 'What is 1010 in decimal?', options: ['8', '10', '12'], correct: '10' },
  { q: 'What is 1100 in decimal?', options: ['10', '12', '14'], correct: '12' },
  { q: 'What is 0111 in decimal?', options: ['5', '7', '9'], correct: '7' },
  { q: 'What is 1001 in decimal?', options: ['7', '9', '11'], correct: '9' },
  { q: 'What is 1111 in decimal?', options: ['13', '15', '16'], correct: '15' },
  { q: 'What is 0101 in decimal?', options: ['3', '5', '7'], correct: '5' },
  { q: 'What is 0011 in decimal?', options: ['2', '3', '4'], correct: '3' },
  { q: 'What is 1110 in decimal?', options: ['12', '14', '15'], correct: '14' },
  { q: 'What is decimal 8 in binary?', options: ['0110', '1000', '1010'], correct: '1000' },
  { q: 'What is decimal 12 in binary?', options: ['1011', '1100', '1110'], correct: '1100' },
  { q: 'What is hex A in decimal?', options: ['8', '10', '12'], correct: '10' },
  { q: 'What is hex F in decimal?', options: ['14', '15', '16'], correct: '15' },
  { q: 'What is hex 10 in decimal?', options: ['10', '16', '20'], correct: '16' },
];

export function BinaryGame() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const randomQ = QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];
    setCurrentQuestion(randomQ);

    const shuffled = [...randomQ.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
  }, []);

  const handleSelectOption = (option) => {
    if (isAnswered) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    const correct = option === currentQuestion.correct;
    setIsCorrect(correct);

    if (correct) {
      audioManager.playCorrect();
    } else {
      audioManager.playWrong();
    }
  };

  const handleContinue = () => {
    audioManager.playClick();
    gameState.completeBinary();
  };

  if (!currentQuestion) return null;

  return (
    <div
      className="ue-binary-game-wrapper animate-fade-in"
      style={{
        backgroundImage: `url('/assets/backgrounds/Magical Security Chamber.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="ue-binary-stage">
        {/* Unreal Engine Mockup Header */}
        <h1 className="ue-binary-title">THE BINARY DIMENSION</h1>
        <h2 className="ue-binary-question">{currentQuestion.q}</h2>

        {/* 3 Yellow Question-Block Answer Buttons */}
        <div className="ue-binary-options-row">
          {shuffledOptions.map((opt, idx) => {
            let btnClass = 'ue-block-btn';
            if (isAnswered) {
              if (opt === currentQuestion.correct) btnClass += ' block-correct';
              else if (opt === selectedAnswer) btnClass += ' block-wrong';
            }

            return (
              <button
                key={idx}
                className={btnClass}
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswered}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback Display */}
        {isAnswered && (
          <div className="ue-binary-feedback animate-slide-up">
            {isCorrect ? (
              <div className="ue-feedback-text success">
                ✓ CORRECT! PASSKEY: <strong>BIN-42</strong> (+100 PTS)
              </div>
            ) : (
              <div className="ue-feedback-text wrong">
                ✗ WRONG! Correct answer was: <strong>{currentQuestion.correct}</strong>
              </div>
            )}
          </div>
        )}

        {/* Green Continue Button */}
        <button
          className="ue-binary-continue-btn"
          onClick={handleContinue}
          disabled={!isAnswered}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}

export default BinaryGame;
