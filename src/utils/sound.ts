// Web Audio API synthesizer for VICALARY's soothing wellness soundtrack & tactile UI cues

class VicalarySoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private explicitlyMuted = false;
  private masterGain: GainNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private chimeTimer: number | null = null;
  private stepIdx = 0;
  private unlockBound = false;

  constructor() {
    this.bindGestureUnlock();
  }

  private bindGestureUnlock() {
    if (typeof window === 'undefined' || this.unlockBound) return;
    this.unlockBound = true;

    const unlock = () => {
      const ctx = this.ensureContext();
      if (ctx && ctx.state === 'running') {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(next: boolean) {
    this.enabled = next;
    this.explicitlyMuted = !next;
    if (next) {
      this.startSoothingTune();
    } else {
      this.stopSoothingTune();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private startSoothingTune() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.stopSoothingTuneImmediate();

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.24, now + 0.9);
    master.connect(ctx.destination);
    this.masterGain = master;

    // Warm low-pass filter so harmonics sound velvety and tranquil
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(620, now);
    padFilter.Q.value = 0.7;

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.18, now);
    padFilter.connect(padGain);
    padGain.connect(master);

    // Serene Fmaj9 warm harmonic drone pad (F3, A3, C4, E4, G4)
    const padFreqs = [174.61, 220.0, 261.63, 329.63];
    this.padOscs = padFreqs.map((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx - 1.5) * 3.5, now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(idx === 0 ? 0.28 : 0.16, now);
      osc.connect(oscGain);
      oscGain.connect(padFilter);
      osc.start(now);
      return osc;
    });

    // Gentle pentatonic kalimba / Rhodes chimes (F major pentatonic: F4, G4, A4, C5, D5, F5)
    const melody = [349.23, 440.0, 523.25, 440.0, 587.33, 523.25, 392.0, 440.0];
    this.stepIdx = 0;

    const scheduleChime = () => {
      if (!this.enabled || !this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const freq = melody[this.stepIdx % melody.length];
      this.stepIdx += 1;

      const osc = this.ctx.createOscillator();
      const harmonic = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const env = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(freq * 2, t);

      const harmGain = this.ctx.createGain();
      harmGain.gain.setValueAtTime(0.18, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.22, t + 0.045);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

      osc.connect(filter);
      harmonic.connect(harmGain);
      harmGain.connect(filter);
      filter.connect(env);
      env.connect(this.masterGain);

      osc.start(t);
      harmonic.start(t);
      osc.stop(t + 2.45);
      harmonic.stop(t + 2.45);
    };

    // Play welcoming gentle chime right away, then breathe softly every 1.45s
    scheduleChime();
    this.chimeTimer = window.setInterval(scheduleChime, 1450);
  }

  private stopSoothingTune() {
    if (!this.ctx || !this.masterGain) {
      this.stopSoothingTuneImmediate();
      return;
    }
    const now = this.ctx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    } catch {
      // ignore if context closed
    }
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    const oscsToStop = [...this.padOscs];
    const gainToDrop = this.masterGain;
    this.padOscs = [];
    this.masterGain = null;
    window.setTimeout(() => {
      oscsToStop.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      try {
        gainToDrop?.disconnect();
      } catch {
        // ignore
      }
    }, 380);
  }

  private stopSoothingTuneImmediate() {
    if (this.chimeTimer !== null) {
      window.clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
    this.padOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.padOscs = [];
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // ignore
      }
      this.masterGain = null;
    }
  }

  private renderPeelSound(ctx: AudioContext, duration = 0.28, volume = 0.24, pitchShift = 1) {
    const now = ctx.currentTime;
    const sampleCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Textured adhesive-peel grain: modulated pink-ish noise with subtle micro-rip crackles
    let lastOut = 0;
    for (let i = 0; i < sampleCount; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.08 * white) / 1.08;
      const crackle = Math.random() > 0.94 ? (Math.random() * 2 - 1) * 0.95 : 0;
      const env = Math.sin((i / sampleCount) * Math.PI);
      data[i] = (lastOut * 1.9 + white * 0.45 + crackle * 0.6) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass sweep mimics adhesive lifting off paper ("shhkkrtt-zip")
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 1.9;
    band.frequency.setValueAtTime(950 * pitchShift, now);
    band.frequency.exponentialRampToValueAtTime(2600 * pitchShift, now + duration * 0.65);
    band.frequency.exponentialRampToValueAtTime(1450 * pitchShift, now + duration);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(420, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(band);
    band.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration + 0.02);
  }

  /**
   * Audible scroll-triggered sticker peel sound for "Start Your Journey" sticker.
   * Plays whenever audio is permitted (even before enabling background soundtrack),
   * unless the user explicitly muted sound.
   */
  public playScrollStickerPeel(progress = 0.5) {
    if (this.explicitlyMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const pitchShift = 0.9 + Math.min(1, Math.max(0, progress)) * 0.28;
    const trigger = () => this.renderPeelSound(ctx, 0.3, 0.26, pitchShift);

    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(trigger)
        .catch(() => {});
    } else {
      trigger();
    }
  }

  public playTapePeel() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.renderPeelSound(ctx, 0.24, 0.16, 1.05);
  }

  public playRollClick() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(349.23, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }
}

export const vicalarySound = new VicalarySoundEngine();
export const tapeSound = vicalarySound;
