/**
 * Ambient Nocturnal Soundscape Service (Web Audio API)
 * 
 * Synthesizes a calming, low-frequency meditative drone with gentle harmonic binaural sweeps
 * entirely client-side. Zero external MP3 downloads required.
 */

export class AmbientAudioService {
  private static audioCtx: AudioContext | null = null;
  private static isPlaying: boolean = false;
  private static gainNode: GainNode | null = null;
  private static oscillators: OscillatorNode[] = [];

  public static toggleSound(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public static getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public static start(): void {
    if (this.isPlaying) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      // Gentle fade in
      this.gainNode.gain.exponentialRampToValueAtTime(0.045, this.audioCtx.currentTime + 3);

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

      this.gainNode.connect(filter);
      filter.connect(this.audioCtx.destination);

      // Frequencies for a tranquil, meditative nocturnal chord (C# minor / 432Hz ambient tuning)
      const freqs = [108, 162, 216, 324];

      this.oscillators = freqs.map((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);

        // Subtle LFO detuning for gentle organic movement
        const lfo = this.audioCtx!.createOscillator();
        lfo.frequency.setValueAtTime(0.08 + idx * 0.03, this.audioCtx!.currentTime);
        const lfoGain = this.audioCtx!.createGain();
        lfoGain.gain.setValueAtTime(1.5, this.audioCtx!.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(this.gainNode!);
        osc.start();
        return osc;
      });

      this.isPlaying = true;
    } catch (e) {
      console.warn('AmbientAudioService could not initialize audio context:', e);
      this.isPlaying = false;
    }
  }

  public static stop(): void {
    if (!this.isPlaying || !this.gainNode || !this.audioCtx) {
      this.isPlaying = false;
      return;
    }

    try {
      const now = this.audioCtx.currentTime;
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_) {}
        });
        this.oscillators = [];
        if (this.audioCtx && this.audioCtx.state !== 'closed') {
          this.audioCtx.close();
        }
        this.audioCtx = null;
        this.isPlaying = false;
      }, 1600);
    } catch (_) {
      this.isPlaying = false;
    }
  }
}
