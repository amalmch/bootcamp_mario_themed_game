// Centralized Game State for Code Kingdom Escape
const STORAGE_KEY = 'CODE_KINGDOM_ESCAPE_STATE_V4';

const defaultState = {
  // Identity
  teamName: '',

  // Scoring & Time
  score: 0,
  minigameScore: 0,
  bitsCollected: 0,
  gameStartTime: null,     // timestamp ms when game started
  gameElapsedMs: 0,        // accumulated ms (paused time excluded)
  lastResumeTime: null,    // timestamp ms when last resumed

  // Progress
  currentWorld: 1, // 1: Forest, 2: Corrupted, 3: Castle
  activeView: 'menu',
  piecesCollected: 0,
  piecesRequired: 5,
  binaryCompleted: false,
  laserCompleted: false,
  rgbCompleted: false,
  binaryCode: 'BIN-42',
  laserCode: 'LASER-27',
  rgbCode: 'RGB-63',

  passkeyToShow: null,
  isPaused: false,
  interactionPrompt: null,
  readSignText: null,
};

class GameStateManager {
  constructor() {
    this.state = { ...defaultState };
    this.listeners = new Set();
    this.load();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.save();
    this.notify();
  }

  // ------ Score helpers ------

  addScore(pts) {
    this.setState({ score: this.state.score + pts });
  }

  addMinigameScore(pts) {
    this.setState({
      minigameScore: this.state.minigameScore + pts,
      score: this.state.score + pts,
    });
  }

  collectPiece() {
    const nextCount = this.state.piecesCollected + 1;
    const pts = 10;
    this.setState({
      piecesCollected: nextCount,
      bitsCollected: this.state.bitsCollected + 1,
      score: this.state.score + pts,
    });
  }

  collectCoin() {
    const pts = 5;
    this.setState({
      bitsCollected: this.state.bitsCollected + 1,
      score: this.state.score + pts,
    });
  }

  // ------ Final score calculation ------
  // Score = minigameScore + (bitsCollected * 5) + timeBonus
  // timeBonus = max(0, 1000 - Math.floor(elapsedSeconds / 10))
  computeFinalScore() {
    const elapsedMs = this.getElapsedMs();
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const timeBonus = Math.max(0, 1000 - Math.floor(elapsedSec / 10));
    const finalScore =
      this.state.minigameScore +
      this.state.bitsCollected * 5 +
      timeBonus;
    return { finalScore, elapsedSec, timeBonus };
  }

  // ------ Timer helpers ------
  getElapsedMs() {
    let elapsed = this.state.gameElapsedMs;
    if (this.state.lastResumeTime && !this.state.isPaused) {
      elapsed += Date.now() - this.state.lastResumeTime;
    }
    return elapsed;
  }

  formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  // ------ Game lifecycle ------

  startPlay(teamName = '') {
    this.setState({
      teamName: teamName || this.state.teamName || 'Team Alpha',
      score: 0,
      minigameScore: 0,
      bitsCollected: 0,
      gameElapsedMs: 0,
      gameStartTime: Date.now(),
      lastResumeTime: Date.now(),
      currentWorld: 1,
      piecesCollected: 0,
      binaryCompleted: false,
      laserCompleted: false,
      rgbCompleted: false,
      activeView: 'story1',
      passkeyToShow: null,
      isPaused: false,
    });
  }

  startNewGame(teamName) {
    this.startPlay(teamName || this.state.teamName);
  }

  resumeGame() {
    const now = Date.now();
    this.setState({
      activeView: 'playing',
      isPaused: false,
      lastResumeTime: now,
    });
  }

  pauseGame() {
    // Accumulate elapsed time before pausing
    const addedMs = this.state.lastResumeTime
      ? Date.now() - this.state.lastResumeTime
      : 0;
    this.setState({
      isPaused: true,
      gameElapsedMs: this.state.gameElapsedMs + addedMs,
      lastResumeTime: null,
    });
  }

  unpauseGame() {
    this.setState({
      isPaused: false,
      lastResumeTime: Date.now(),
    });
  }

  finishStory1() {
    this.setState({
      activeView: 'playing',
      currentWorld: 1,
      piecesCollected: 0,
      piecesRequired: 5,
      passkeyToShow: null,
      lastResumeTime: Date.now(),
    });
  }

  openBinaryGame() {
    this.setState({ activeView: 'binary' });
  }

  transitionToWorld(worldNum) {
    this.setState({
      currentWorld: worldNum,
      activeView: 'playing',
      piecesCollected: 0,
      piecesRequired: 5,
      passkeyToShow: null,
      isPaused: false,
      lastResumeTime: Date.now(),
    });
  }

  completeBinary() {
    if (!this.state.binaryCompleted) {
      this.addMinigameScore(100);
    }
    this.setState({
      binaryCompleted: true,
      activeView: 'passkey',
      passkeyToShow: {
        title: 'ACCESS CODE RECOVERED',
        code: 'BIN-42',
        subtitle: 'BINARY PORTAL BYPASSED',
        points: 100,
        nextWorld: 2,
        buttonText: 'ENTER CORRUPTED KINGDOM →',
        onContinue: () => {
          this.transitionToWorld(2);
        }
      }
    });
  }

  triggerStory2() {
    this.setState({ activeView: 'story2' });
  }

  finishStory2() {
    this.setState({ activeView: 'laser' });
  }

  completeLaser() {
    if (!this.state.laserCompleted) {
      this.addMinigameScore(100);
    }
    this.setState({
      laserCompleted: true,
      activeView: 'passkey',
      passkeyToShow: {
        title: 'ACCESS CODE RECOVERED',
        code: 'LASER-27',
        subtitle: 'FIREWALL MATRIX BYPASSED',
        points: 100,
        nextWorld: 3,
        buttonText: 'ENTER CODE CASTLE →',
        onContinue: () => {
          this.transitionToWorld(3);
        }
      }
    });
  }

  triggerStory3() {
    this.setState({ activeView: 'story3' });
  }

  finishStory3() {
    this.setState({ activeView: 'rgb' });
  }

  completeRGB() {
    if (!this.state.rgbCompleted) {
      this.addMinigameScore(100);
    }
    this.setState({
      rgbCompleted: true,
      activeView: 'passkey',
      passkeyToShow: {
        title: 'RGB SYSTEM RESTORED',
        code: 'RGB-63',
        subtitle: 'COLOR FREQUENCIES HARMONIZED',
        points: 100,
        finalReady: true,
        buttonText: 'ENTER THE FINAL COMPILER GATE →',
        onContinue: () => {
          this.setState({
            activeView: 'final',
            passkeyToShow: null,
          });
        }
      }
    });
  }

  completeFinalChallenge() {
    const { finalScore, elapsedSec, timeBonus } = this.computeFinalScore();
    this.setState({
      score: finalScore,
      activeView: 'ending',
      passkeyToShow: null,
      finalElapsedSec: elapsedSec,
      finalTimeBonus: timeBonus,
    });
  }

  setInteractionPrompt(prompt) {
    if (this.state.interactionPrompt !== prompt) {
      this.state.interactionPrompt = prompt;
      this.notify();
    }
  }

  setSignText(text) {
    if (this.state.readSignText !== text) {
      this.state.readSignText = text;
      this.notify();
    }
  }

  save() {
    try {
      const toSave = {
        teamName: this.state.teamName,
        score: this.state.score,
        minigameScore: this.state.minigameScore,
        bitsCollected: this.state.bitsCollected,
        gameElapsedMs: this.getElapsedMs(),
        currentWorld: this.state.currentWorld,
        binaryCompleted: this.state.binaryCompleted,
        laserCompleted: this.state.laserCompleted,
        rgbCompleted: this.state.rgbCompleted,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {}
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        this.state = {
          ...this.state,
          teamName: saved.teamName || '',
          score: saved.score || 0,
          minigameScore: saved.minigameScore || 0,
          bitsCollected: saved.bitsCollected || 0,
          gameElapsedMs: saved.gameElapsedMs || 0,
          currentWorld: saved.currentWorld || 1,
          binaryCompleted: !!saved.binaryCompleted,
          laserCompleted: !!saved.laserCompleted,
          rgbCompleted: !!saved.rgbCompleted,
        };
      }
    } catch (e) {}
  }
}

export const gameState = new GameStateManager();
export default gameState;
