import React, { useEffect, useRef, useState } from 'react';
import ThreeEngine from './game/ThreeEngine.js';
import gameState from './game/GameState.js';
import audioManager from './game/AudioManager.js';

import MainMenu from './ui/MainMenu.jsx';
import HUD from './ui/HUD.jsx';
import DialogueUI from './ui/DialogueUI.jsx';
import PasskeyModal from './ui/PasskeyModal.jsx';
import PauseMenu from './ui/PauseMenu.jsx';
import EndingScreen from './ui/EndingScreen.jsx';
import WorldTransitionOverlay from './ui/WorldTransitionOverlay.jsx';

import BinaryGame from './minigames/BinaryGame.jsx';
import LaserGame from './minigames/LaserGame.jsx';
import RGBGame from './minigames/RGBGame.jsx';
import FinalGame from './minigames/FinalGame.jsx';

export function App() {
  const threeContainerRef = useRef(null);
  const engineRef = useRef(null);
  const [state, setState] = useState(gameState.getState());

  // Subscribe to central state
  useEffect(() => {
    const unsub = gameState.subscribe((newState) => {
      setState(newState);
    });
    return unsub;
  }, []);

  // Initialize Three.js Engine once container is mounted
  useEffect(() => {
    if (threeContainerRef.current && !engineRef.current) {
      engineRef.current = new ThreeEngine(threeContainerRef.current);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Global ESC key listener for Pause Menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        if (state.activeView === 'playing') {
          if (state.isPaused) {
            gameState.unpauseGame();
          } else {
            gameState.pauseGame();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activeView, state.isPaused]);

  return (
    <div className="game-wrapper">
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={threeContainerRef}
        className="three-canvas-container"
        style={{
          visibility: state.activeView === 'playing' ? 'visible' : 'hidden',
        }}
      />

      {/* Persistent Gameplay HUD */}
      {state.activeView === 'playing' && <HUD />}

      {/* Main Menu Screen */}
      {state.activeView === 'menu' && <MainMenu />}

      {/* Sequenced Story Cards */}
      {state.activeView === 'story1' && <DialogueUI dialogueId="world1_intro" />}
      {state.activeView === 'story2' && <DialogueUI dialogueId="world2_intro" />}
      {state.activeView === 'story3' && <DialogueUI dialogueId="world3_intro" />}
      {state.activeView === 'dialogue' && <DialogueUI dialogueId={state.dialogueId} />}

      {/* Dynamic Mini-Games */}
      {state.activeView === 'binary' && <BinaryGame />}
      {state.activeView === 'laser' && <LaserGame />}
      {state.activeView === 'rgb' && <RGBGame />}
      {state.activeView === 'final' && <FinalGame />}

      {/* Glowing Passkey Modal */}
      {state.activeView === 'passkey' && state.passkeyToShow && (
        <PasskeyModal data={state.passkeyToShow} />
      )}

      {/* Pause Menu Modal */}
      {state.isPaused && <PauseMenu />}

      {/* World Transition Overlay */}
      {state.isTransitioning && (
        <WorldTransitionOverlay targetWorld={state.targetTransitionWorld} />
      )}

      {/* Final Ending Screen */}
      {state.activeView === 'ending' && <EndingScreen />}
    </div>
  );
}

export default App;
