/**
 * Sound Effects & Ringtone Engine for ASLI GROUP Workspace
 * Pure Web Audio API implementation - Zero external asset dependencies, zero network latency
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private ringIntervalId: number | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('WORKSPACE_SOUND_ENABLED');
      this.isMuted = saved !== null ? saved === 'false' : false;
    } catch {
      this.isMuted = false;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('WORKSPACE_SOUND_ENABLED', (!muted).toString());
    } catch {}
    if (muted) {
      this.stopPhoneRingSound();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return !this.isMuted;
  }

  public play(type?: string): void {
    if (this.isMuted) return;
    if (type === 'success' || type === 'complete') {
      this.playNotificationSound();
    } else if (type === 'pop' || type === 'click') {
      this.playEmojiPopSound();
    } else {
      this.playChatSound();
    }
  }

  /**
   * 1. Nada Notifikasi (Crisp Corporate Bell Chime)
   * High-definition dual chime with soft acoustic resonance (D5 -> A5)
   */
  public playNotificationSound(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First Bell Tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Second Harmonics Bell Tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.08); // A5
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.22, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0005, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.7);
  }

  /**
   * 2. Nada Chat Masuk / Terkirim (Modern Subtle Waterdrop / Message Bubble Pop)
   * Crisp, soft, non-intrusive frequency ramp (380 Hz -> 720 Hz)
   */
  public playChatSound(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.09);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Playful Emoji Pop Sound for Feed Reactions
   */
  public playEmojiPopSound(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(990, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 3. Nada Dering Telfon / Panggilan Huddle (Melodic Corporate Phone Ringtone)
   * Softphone chime cadence (C6 -> G5 -> A5 -> E6) repeating rhythmically
   */
  public playPhoneRingSound(autoStopSeconds: number = 20): void {
    if (this.isMuted) return;
    this.stopPhoneRingSound();

    const ringStep = () => {
      const ctx = this.getAudioContext();
      if (!ctx || this.isMuted) return;

      const base = ctx.currentTime;
      const notes = [
        { freq: 1046.50, start: 0, dur: 0.14 },    // C6
        { freq: 783.99,  start: 0.15, dur: 0.14 }, // G5
        { freq: 880.00,  start: 0.30, dur: 0.16 }, // A5
        { freq: 1318.51, start: 0.48, dur: 0.38 }, // E6
        // Second melodic pulse
        { freq: 1046.50, start: 0.95, dur: 0.14 }, // C6
        { freq: 1318.51, start: 1.10, dur: 0.40 }  // E6
      ];

      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, base + start);

        gain.gain.setValueAtTime(0.001, base + start);
        gain.gain.linearRampToValueAtTime(0.20, base + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, base + start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(base + start);
        osc.stop(base + start + dur);
      });
    };

    ringStep();
    this.ringIntervalId = window.setInterval(ringStep, 2600);

    // Automatic safety timeout so it doesn't loop forever
    if (autoStopSeconds > 0) {
      setTimeout(() => {
        this.stopPhoneRingSound();
      }, autoStopSeconds * 1000);
    }
  }

  public stopPhoneRingSound(): void {
    if (this.ringIntervalId !== null) {
      clearInterval(this.ringIntervalId);
      this.ringIntervalId = null;
    }
  }

  /**
   * 4. Nada Task Baru / Selesai (Inspiring Rising Success Chord)
   * Ascending arpeggio (C5 -> E5 -> G5 -> C6) with golden sparkle
   */
  public playNewTaskSound(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const arpeggio = [
      { freq: 523.25, time: 0 },     // C5
      { freq: 659.25, time: 0.08 },  // E5
      { freq: 783.99, time: 0.16 },  // G5
      { freq: 1046.50, time: 0.24 }  // C6
    ];

    arpeggio.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.18, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 0.45);
    });
  }

  /**
   * Subtle, professional hand-raise alert sound.
   */
  public playHandRaiseSound(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 659.25, time: 0 },
      { freq: 783.99, time: 0.1 },
      { freq: 987.77, time: 0.2 }
    ];

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.15, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + 0.2);
    });
  }
}

export const soundEffects = new SoundEffectsEngine();
