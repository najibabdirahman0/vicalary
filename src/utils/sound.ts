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

  // Single-voice continuous close-mic dry peel foley (zero echo, zero overlapping buffers)
  private peelBuffer: AudioBuffer | null = null;
  private peelSource: AudioBufferSourceNode | null = null;
  private peelGain: GainNode | null = null;
  private peelPeakFilter: BiquadFilterNode | null = null;
  private peelIdleTimer: number | null = null;

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
      this.stopScrollPeel();
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

  /**
   * Builds a 2.4-second seamless, close-mic dry stick-slip adhesive peel texture buffer.
   * Zero reverb or echo—pure micro-filament separation transients.
   */
  private getOrCreatePeelBuffer(ctx: AudioContext): AudioBuffer {
    if (this.peelBuffer && this.peelBuffer.sampleRate === ctx.sampleRate) {
      return this.peelBuffer;
    }

    const duration = 2.4;
    const sr = ctx.sampleRate;
    const sampleCount = Math.floor(sr * duration);
    const buffer = ctx.createBuffer(1, sampleCount, sr);
    const data = buffer.getChannelData(0);

    let nextSnap = Math.floor(sr * 0.004);
    let snapAmp = 0;
    let snapDecay = 0.96;
    let prevWhite = 0;
    let bodyState = 0;

    for (let i = 0; i < sampleCount; i++) {
      if (i >= nextSnap) {
        // Tight organic spacing (3.5ms - 13.5ms) mimicking real vinyl/paper adhesive separation
        const gapMs = 3.5 + Math.random() * 10.0;
        nextSnap = i + Math.max(48, Math.floor((gapMs / 1000) * sr));
        snapAmp = 0.38 + Math.random() * 0.62;
        // Dry 0.7ms - 1.9ms micro-snap decay (tight, zero ring/echo)
        const decayMs = 0.7 + Math.random() * 1.2;
        snapDecay = Math.exp(-1 / ((decayMs / 1000) * sr));
      }

      snapAmp *= snapDecay;

      const white = Math.random() * 2 - 1;
      const highCrisp = white - prevWhite * 0.65;
      prevWhite = white;

      bodyState = bodyState * 0.68 + white * 0.32;

      const dryBed = highCrisp * 0.16 + bodyState * 0.08;
      const snap = highCrisp * snapAmp * 1.25 + bodyState * snapAmp * 0.32;
      data[i] = dryBed + snap;
    }

    // 25ms seamless equal-power crossfade at loop edges so looping never clicks
    const fadeSamples = Math.min(Math.floor(sr * 0.025), Math.floor(sampleCount / 4));
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      data[i] *= t;
      data[sampleCount - 1 - i] *= t;
    }

    this.peelBuffer = buffer;
    return buffer;
  }

  private ensurePeelVoice(ctx: AudioContext) {
    if (this.peelSource && this.peelGain && this.peelPeakFilter) {
      return;
    }

    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.getOrCreatePeelBuffer(ctx);
    src.loop = true;

    // Strip low rumble so the sound stays dry and close-mic
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(780, now);
    hp.Q.value = 0.7;

    // Tight adhesive separation presence
    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.setValueAtTime(2700, now);
    peak.Q.value = 1.6;
    peak.gain.setValueAtTime(6.5, now);

    // Dry paper upper crispness without harshness
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(8200, now);
    lp.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);

    src.connect(hp);
    hp.connect(peak);
    peak.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);

    this.peelSource = src;
    this.peelPeakFilter = peak;
    this.peelGain = gain;
  }

  /**
   * Drives the single-voice dry sticker peel foley directly from scroll velocity.
   * Only audible while actively scrolling across the sticker; stops cleanly within ~30ms
   * when scrolling stops—no echo, no double triggers, no button-click peel bleed.
   */
  public updateScrollPeel(
    active: boolean,
    velocityPxPerSec: number,
    progress = 0.5,
    peelingOff = true
  ) {
    if (this.peelIdleTimer !== null) {
      window.clearTimeout(this.peelIdleTimer);
      this.peelIdleTimer = null;
    }

    if (!active || this.explicitlyMuted || velocityPxPerSec < 55) {
      this.fadeOutPeelVoice();
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;

    this.ensurePeelVoice(ctx);
    if (!this.peelGain || !this.peelSource || !this.peelPeakFilter) return;

    const now = ctx.currentTime;
    const normSpeed = Math.min(1, Math.max(0.08, (velocityPxPerSec - 55) / 1450));
    const targetGain = 0.09 + normSpeed * 0.25;
    const targetRate = 0.62 + normSpeed * 0.72;
    const targetFreq = peelingOff
      ? 2200 + Math.min(1, Math.max(0, progress)) * 1850
      : 3200 - (1 - Math.min(1, Math.max(0, progress))) * 1050;

    this.peelSource.playbackRate.setTargetAtTime(targetRate, now, 0.025);
    this.peelPeakFilter.frequency.setTargetAtTime(targetFreq, now, 0.03);
    this.peelGain.gain.setTargetAtTime(targetGain, now, 0.014);

    // Silence dryly right away if user pauses scrolling
    this.peelIdleTimer = window.setTimeout(() => {
      this.peelIdleTimer = null;
      this.fadeOutPeelVoice();
    }, 55);
  }

  private fadeOutPeelVoice() {
    if (!this.ctx || !this.peelGain) return;
    const now = this.ctx.currentTime;
    this.peelGain.gain.setTargetAtTime(0.0001, now, 0.012);
  }

  public stopScrollPeel() {
    if (this.peelIdleTimer !== null) {
      window.clearTimeout(this.peelIdleTimer);
      this.peelIdleTimer = null;
    }
    this.fadeOutPeelVoice();
  }

  // Soft tactile chime cue for UI clicks (when background sound is enabled)
  public playTapePeel() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.075, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
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
