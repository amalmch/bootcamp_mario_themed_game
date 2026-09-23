// Audio Manager: handles background music loop and procedural Web Audio API SFX

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.bgm = null;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.isBgmPlaying = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.bgm) {
      this.bgm = new Audio('/assets/audio/theme.mp3');
      this.bgm.loop = true;
      this.bgm.volume = 0.35;
    }
  }

  playBgm() {
    this.init();
    if (!this.musicEnabled || !this.bgm) return;
    this.bgm.play().then(() => {
      this.isBgmPlaying = true;
    }).catch((e) => {
      // Autoplay policy prevented immediate playback until user interaction
      console.log('BGM waiting for user interaction:', e);
    });
  }

  pauseBgm() {
    if (this.bgm) {
      this.bgm.pause();
      this.isBgmPlaying = false;
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.playBgm();
    } else {
      this.pauseBgm();
    }
    return this.musicEnabled;
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  // Synthesized Web Audio SFX
  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext error handling
    }
  }

  playJump() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playCoin() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.08);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.45);
    } catch (e) {}
  }

  playCorrect() {
    this.playCoin();
  }

  playWrong() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  playLaserRotate() {
    this.playTone(520, 'sine', 0.08, 0.1);
  }

  playLaserSuccess() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      chord.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch (e) {}
  }

  playDialogueChirp(charName = 'MARIO') {
    if (!this.sfxEnabled) return;
    const tones = {
      'MARIO': 360,
      'LUIGI': 440,
      'TOAD': 580,
      'PEACH': 520,
      'YOSHI': 480,
      'BOWSER': 140,
    };
    const freq = tones[charName.toUpperCase()] || 380;
    this.playTone(freq + (Math.random() * 40 - 20), 'triangle', 0.04, 0.08);
  }

  playClick() {
    this.playTone(800, 'sine', 0.03, 0.08);
  }

  playVictoryFanfare() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const notes = [
      { f: 523.25, d: 0.12 }, // C
      { f: 523.25, d: 0.12 }, // C
      { f: 523.25, d: 0.12 }, // C
      { f: 659.25, d: 0.28 }, // E
      { f: 783.99, d: 0.15 }, // G
      { f: 1046.50, d: 0.45 }, // C High
    ];

    let t = this.audioCtx.currentTime;
    notes.forEach((n) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + n.d);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + n.d);
      t += n.d + 0.04;
    });
  }
}

export const audioManager = new SoundManager();
export default audioManager;
