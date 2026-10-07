// Web Audio API Retro Sound Synthesizer for "The Board Room"

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;
  private currentThemeLoop: { stop: () => void } | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.currentThemeLoop) {
      this.stopFinalJeopardyThink();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Sound: Board Reveal / Grid Fill cascade
   */
  public playBoardReveal() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C4 chord cascade
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  /**
   * Sound: Clue Select Blip
   */
  public playClueSelect() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25 * this.masterVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  /**
   * Sound: Daily Double Fanfare
   * Classic triumphant laser/brass fanfare with laser sweep
   */
  public playDailyDouble() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const chords = [
      { freqs: [392.0, 493.88, 587.33], duration: 0.22, delay: 0 },       // G chord
      { freqs: [440.0, 554.37, 659.25], duration: 0.22, delay: 0.22 },    // A chord
      { freqs: [493.88, 622.25, 739.99], duration: 0.25, delay: 0.44 },   // B chord
      { freqs: [587.33, 739.99, 880.0], duration: 0.7, delay: 0.7 },      // D high triumph
    ];

    chords.forEach(({ freqs, duration, delay }) => {
      freqs.forEach((freq) => {
        const startTime = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.18 * this.masterVolume, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });
    });
  }

  /**
   * Sound: Buzzer Lockout (Player Buzzed In)
   * Sharp, resonant game-show buzz
   */
  public playBuzzer() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);

    gain.gain.setValueAtTime(0.35 * this.masterVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.29);
  }

  /**
   * Sound: Times Up / Triple Stumper (three sharp descending buzzes)
   */
  public playTimesUp() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const beeps = [440, 370, 311];
    beeps.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.16;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.28 * this.masterVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.13);
    });
  }

  /**
   * Sound: Right Answer Chime
   */
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const freqs = [587.33, 880.0, 1174.66]; // D5, A5, D6
    freqs.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25 * this.masterVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.42);
    });
  }

  /**
   * Sound: Wrong Answer Dull Buzz
   */
  public playIncorrect() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(75, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.3 * this.masterVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.42);
  }

  /**
   * Sound: 30-Second Final Jeopardy "Think!" Theme
   * Synthesized marimba/vibraphone recreation of the iconic melody
   */
  public playFinalJeopardyThink(): { stop: () => void } {
    this.stopFinalJeopardyThink();

    if (this.isMuted) {
      return { stop: () => {} };
    }

    const ctx = this.getAudioContext();
    if (!ctx) return { stop: () => {} };

    let isRunning = true;
    const activeNodes: OscillatorNode[] = [];

    // Note frequencies in Hz
    const N: Record<string, number> = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
    };

    // Synthesize a marimba/glockenspiel note
    const playNote = (pitch: number, time: number, dur: number, vol = 0.22) => {
      if (!isRunning) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, time);

      // Add harmonic for mallet/chime warmth
      const harmonic = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(pitch * 2, time);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol * this.masterVolume, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      harmGain.gain.setValueAtTime(0, time);
      harmGain.gain.linearRampToValueAtTime(vol * 0.3 * this.masterVolume, time + 0.01);
      harmGain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      harmonic.connect(harmGain);
      harmGain.connect(ctx.destination);

      osc.start(time);
      harmonic.start(time);

      osc.stop(time + dur + 0.05);
      harmonic.stop(time + dur + 0.05);

      activeNodes.push(osc, harmonic);
    };

    // Percussive ticking clock beat
    const playTick = (time: number) => {
      if (!isRunning) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, time);
      gain.gain.setValueAtTime(0.04 * this.masterVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.04);
      activeNodes.push(osc);
    };

    const bpm = 120;
    const beat = 60 / bpm; // 0.5s per quarter note
    const sixteenth = beat / 4;

    // Melody definition: [noteName, startBeat, durationBeats]
    // The famous Jeopardy Think theme phrase:
    // C - F - C - G | C - F - C
    // C - F - C - A - G - F - E - D
    // C - F - C - G | C - F - C
    // C - G - F - E - D - C
    const phraseA = [
      ['C4', 0, 1], ['F4', 1, 1], ['C4', 2, 1], ['G3', 3, 1],
      ['C4', 4, 1], ['F4', 5, 1], ['C4', 6, 2],
      ['C4', 8, 1], ['F4', 9, 1], ['C4', 10, 1], ['A4', 11, 0.5], ['G4', 11.5, 0.5],
      ['F4', 12, 1], ['E4', 13, 1], ['D4', 14, 2],

      ['C4', 16, 1], ['F4', 17, 1], ['C4', 18, 1], ['G3', 19, 1],
      ['C4', 20, 1], ['F4', 21, 1], ['C4', 22, 2],
      ['C4', 24, 0.75], ['G4', 24.75, 0.75], ['F4', 25.5, 0.75], ['E4', 26.25, 0.75],
      ['D4', 27, 1], ['C4', 28, 2],
    ] as const;

    const baseTime = ctx.currentTime + 0.1;

    // Schedule melody
    phraseA.forEach(([noteName, startB, durB]) => {
      const freq = N[noteName];
      if (freq) {
        playNote(freq, baseTime + startB * beat, durB * beat * 0.95);
      }
    });

    // Schedule background walking bass & ticking clock for 30s
    for (let b = 0; b < 60; b++) {
      const t = baseTime + b * beat;
      // Clock tick
      playTick(t);

      // Bass notes on quarter beats
      if (b % 2 === 0) {
        const bassFreq = (b % 8 === 0 || b % 8 === 4) ? N.C3 : (b % 8 === 2 ? N.F3 : N.G3);
        if (bassFreq) {
          playNote(bassFreq, t, beat * 0.8, 0.14);
        }
      }
    }

    // Final dramatic gong / conclusion at 30s
    const finalTime = baseTime + 29.5;
    playNote(N.C4, finalTime, 2.5, 0.4);
    playNote(N.G4, finalTime, 2.5, 0.35);
    playNote(N.C5, finalTime, 2.5, 0.3);

    const controller = {
      stop: () => {
        isRunning = false;
        activeNodes.forEach((node) => {
          try {
            node.stop();
            node.disconnect();
          } catch {
            // Already stopped
          }
        });
        activeNodes.length = 0;
        if (this.currentThemeLoop === controller) {
          this.currentThemeLoop = null;
        }
      },
    };

    this.currentThemeLoop = controller;
    return controller;
  }

  public stopFinalJeopardyThink() {
    if (this.currentThemeLoop) {
      this.currentThemeLoop.stop();
      this.currentThemeLoop = null;
    }
  }
}

export const retroAudio = new RetroAudioEngine();
