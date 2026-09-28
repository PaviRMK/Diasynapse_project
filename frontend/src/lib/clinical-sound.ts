/**
 * Clinical Sound & Reminder Utility
 * Built with Web Audio API for lightweight, zero-dependency, professional healthcare auditory feedback.
 */

const STORAGE_KEY = 'diasynapse-sound-enabled';

class ClinicalAudioEngine {
  private ctx: AudioContext | null = null;

  public isEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    const val = localStorage.getItem(STORAGE_KEY);
    // Defaults to true once user clicks enable/unmute
    return val === 'true';
  }

  public setEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    if (enabled) {
      this.initContext();
      this.playActionBeep();
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext unavailable
    }
    return this.ctx;
  }

  /**
   * Professional 2-tone melodic chime for medication & activity reminders (D5 -> A5)
   */
  public playReminderSound(): void {
    if (!this.isEnabled()) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);

      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.14, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch {
      // Safely catch audio errors
    }
  }

  /**
   * Subtle, clean confirmation pulse for marking medication taken or saving
   */
  public playActionBeep(): void {
    if (!this.isEnabled()) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now); // G5 gentle confirmation

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Safely catch audio errors
    }
  }

  /**
   * Subtle interactive click feedback for button interactions
   */
  public playClick(): void {
    if (!this.isEnabled()) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Safely catch audio errors
    }
  }

  /**
   * Dual harmonic chime for successful authentication or onboarding completion
   */
  public playConfirm(): void {
    this.playReminderSound();
  }
}

export const clinicalAudio = new ClinicalAudioEngine();
