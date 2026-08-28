/**
 * Somnithos RC Monogram Sonic Signature Engine (Web Audio API)
 * 
 * Procedural synthesis engine for the 0.0s – 2.4s RC reveal sequence.
 * Combines ancient bronze resonance, modern observatory harmonics, and a
 * distinctive 3-note Somnithos resolution chord.
 * 
 * 0KB external network dependencies, zero latency, perfectly synchronized.
 */

export class SonicSignatureService {
  private static audioCtx: AudioContext | null = null;
  private static isMuted: boolean = false;
  private static hasPlayedThisSession: boolean = false;

  private static initContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      this.audioCtx = new AudioContextClass();
    }
    return this.audioCtx;
  }

  /**
   * Check if sound is muted by user preference or reduced motion
   */
  public static isEnabled(): boolean {
    if (this.isMuted) return false;
    try {
      if (localStorage.getItem('somnithos_sound_muted') === 'true') {
        return false;
      }
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false;
      }
    } catch {
      // Fallback
    }
    return true;
  }

  /**
   * Toggle global sound preference
   */
  public static toggleSound(): boolean {
    const currentlyEnabled = this.isEnabled();
    const nextState = !currentlyEnabled;
    this.isMuted = !nextState;
    try {
      localStorage.setItem('somnithos_sound_muted', (!nextState).toString());
    } catch {
      // Fallback
    }

    // If unmuting, trigger the signature
    if (nextState) {
      this.playRcSonicSignature(true);
    }
    return nextState;
  }

  /**
   * Play the synchronized 2.4s RC Monogram Sonic Signature
   */
  public static playRcSonicSignature(force: boolean = false): void {
    if (!force && !this.isEnabled()) return;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.synthesizeSignature(ctx);
        }).catch(() => {
          // Autoplay blocked by browser policy; attach user interaction listener
          this.attachAutoplayUnlock(ctx);
        });
      } else {
        this.synthesizeSignature(ctx);
      }
    } catch (err) {
      console.warn('SonicSignatureService: Audio playback deferred', err);
    }
  }

  /**
   * Procedural Audio Graph Synthesis
   */
  private static synthesizeSignature(ctx: AudioContext): void {
    const t0 = ctx.currentTime;

    // Master Gain & Limiter (Peak capped at ~22% media volume for elegance)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, t0);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, t0);
    compressor.knee.setValueAtTime(12, t0);
    compressor.ratio.setValueAtTime(4, t0);
    compressor.attack.setValueAtTime(0.003, t0);
    compressor.release.setValueAtTime(0.25, t0);

    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // Fade in master volume softly
    masterGain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.5);
    // Fade out cleanly after full sequence decays (3.8s total)
    masterGain.gain.setValueAtTime(0.22, t0 + 2.8);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.8);

    // =========================================================================
    // 1. PHASE 1 (0.3s – 0.6s): Low Atmospheric Observatory Hum
    // =========================================================================
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, t0 + 0.3); // A1 sub-hum
    subOsc.frequency.exponentialRampToValueAtTime(65.4, t0 + 1.8); // Gentle drift to C2

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(120, t0 + 0.3);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.0001, t0 + 0.3);
    subGain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.8);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.8);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(masterGain);

    subOsc.start(t0 + 0.3);
    subOsc.stop(t0 + 3.0);

    // =========================================================================
    // 2. PHASE 2 (0.7s – 1.2s): Ancient Bronze Metal Resonance
    // =========================================================================
    // Struck singing bowl / bronze bell partials (C#3 fundamental + inharmonics)
    const bronzeFreqs = [138.6, 277.2, 415.3, 762.3];
    bronzeFreqs.forEach((freq, i) => {
      const bronzeOsc = ctx.createOscillator();
      bronzeOsc.type = i % 2 === 0 ? 'sine' : 'triangle';
      bronzeOsc.frequency.setValueAtTime(freq, t0 + 0.7);

      const bronzeGain = ctx.createGain();
      bronzeGain.gain.setValueAtTime(0.0001, t0 + 0.7);
      bronzeGain.gain.exponentialRampToValueAtTime(0.28 / (i + 1), t0 + 0.85);
      bronzeGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6);

      const bronzeFilter = ctx.createBiquadFilter();
      bronzeFilter.type = 'bandpass';
      bronzeFilter.frequency.setValueAtTime(freq * 1.1, t0 + 0.7);
      bronzeFilter.Q.setValueAtTime(3.5, t0 + 0.7);

      bronzeOsc.connect(bronzeFilter);
      bronzeFilter.connect(bronzeGain);
      bronzeGain.connect(masterGain);

      bronzeOsc.start(t0 + 0.7);
      bronzeOsc.stop(t0 + 2.8);
    });

    // =========================================================================
    // 3. PHASE 3 (1.2s – 1.7s): Soft Rising Ethereal Harmonic Shimmer
    // =========================================================================
    const sweepOsc = ctx.createOscillator();
    sweepOsc.type = 'sine';
    sweepOsc.frequency.setValueAtTime(277.2, t0 + 1.2); // C#4
    sweepOsc.frequency.exponentialRampToValueAtTime(440.0, t0 + 1.8); // Ascends to A4

    const sweepFilter = ctx.createBiquadFilter();
    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(300, t0 + 1.2);
    sweepFilter.frequency.exponentialRampToValueAtTime(1600, t0 + 1.8);
    sweepFilter.Q.setValueAtTime(2.0, t0 + 1.2);

    const sweepGain = ctx.createGain();
    sweepGain.gain.setValueAtTime(0.0001, t0 + 1.2);
    sweepGain.gain.exponentialRampToValueAtTime(0.22, t0 + 1.55);
    sweepGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2);

    sweepOsc.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(masterGain);

    sweepOsc.start(t0 + 1.2);
    sweepOsc.stop(t0 + 2.4);

    // =========================================================================
    // 4. PHASE 4 (1.7s – 2.1s): Delicate Crystalline Chime
    // =========================================================================
    const chimeOsc = ctx.createOscillator();
    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(1108.7, t0 + 1.75); // C#6 crystal chime

    const chimeGain = ctx.createGain();
    chimeGain.gain.setValueAtTime(0.0001, t0 + 1.75);
    chimeGain.gain.linearRampToValueAtTime(0.18, t0 + 1.78);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.0);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(masterGain);

    chimeOsc.start(t0 + 1.75);
    chimeOsc.stop(t0 + 3.1);

    // =========================================================================
    // 5. PHASE 5 (2.1s – 2.4s): Distinctive 3-Note Somnithos Signature Chord
    // Notes: E5 (659.25Hz) -> G#5 (830.61Hz) -> C#6 (1108.73Hz)
    // =========================================================================
    const signatureNotes = [
      { time: 2.05, freq: 659.25, gain: 0.16, decay: 1.1 }, // E5
      { time: 2.20, freq: 830.61, gain: 0.18, decay: 1.3 }, // G#5
      { time: 2.35, freq: 1108.73, gain: 0.22, decay: 1.6 }, // C#6 (Root resolution)
    ];

    signatureNotes.forEach(note => {
      const noteTime = t0 + note.time;

      // Primary tone
      const noteOsc = ctx.createOscillator();
      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(note.freq, noteTime);

      // Warm octave/fifth overtone
      const overtoneOsc = ctx.createOscillator();
      overtoneOsc.type = 'triangle';
      overtoneOsc.frequency.setValueAtTime(note.freq * 1.5, noteTime);

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, noteTime);
      noteGain.gain.linearRampToValueAtTime(note.gain, noteTime + 0.025);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.decay);

      const overtoneGain = ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.0001, noteTime);
      overtoneGain.gain.linearRampToValueAtTime(note.gain * 0.35, noteTime + 0.02);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.decay * 0.7);

      noteOsc.connect(noteGain);
      overtoneOsc.connect(overtoneGain);
      noteGain.connect(masterGain);
      overtoneGain.connect(masterGain);

      noteOsc.start(noteTime);
      noteOsc.stop(noteTime + note.decay + 0.1);
      overtoneOsc.start(noteTime);
      overtoneOsc.stop(noteTime + note.decay);
    });

    this.hasPlayedThisSession = true;
  }

  /**
   * Unlock audio context and trigger signature on first user interaction if blocked by autoplay
   */
  private static attachAutoplayUnlock(ctx: AudioContext): void {
    const unlockHandler = () => {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          if (!this.hasPlayedThisSession && this.isEnabled()) {
            this.synthesizeSignature(ctx);
          }
        }).catch(() => {});
      }
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
    };

    window.addEventListener('pointerdown', unlockHandler, { once: true });
    window.addEventListener('click', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });
    window.addEventListener('touchstart', unlockHandler, { once: true });
  }
}
