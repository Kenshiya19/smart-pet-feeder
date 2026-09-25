// Web Audio API sound synthesizer for interactive feedback

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
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

  playClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Ignore audio failure
    }
  }

  playDispenseSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Motor whir sound
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.linearRampToValueAtTime(180, now + 0.4);
      osc1.frequency.linearRampToValueAtTime(120, now + 1.2);

      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.linearRampToValueAtTime(0.15, now + 0.5);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.3);

      // Dropping kibble ticks
      for (let i = 0; i < 8; i++) {
        const tickTime = now + 0.3 + i * 0.12 + (Math.random() * 0.04);
        const oscTick = ctx.createOscillator();
        const gainTick = ctx.createGain();
        oscTick.type = 'sine';
        oscTick.frequency.setValueAtTime(800 + Math.random() * 600, tickTime);
        oscTick.frequency.exponentialRampToValueAtTime(200, tickTime + 0.04);

        gainTick.gain.setValueAtTime(0.06, tickTime);
        gainTick.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.04);

        oscTick.connect(gainTick);
        gainTick.connect(ctx.destination);
        oscTick.start(tickTime);
        oscTick.stop(tickTime + 0.05);
      }

      // Pleasant completion chime
      setTimeout(() => {
        try {
          if (!this.ctx) return;
          const chimeCtx = this.ctx;
          const chimeNow = chimeCtx.currentTime;
          [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const osc = chimeCtx.createOscillator();
            const gain = chimeCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, chimeNow + idx * 0.08);

            gain.gain.setValueAtTime(0.09, chimeNow + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, chimeNow + idx * 0.08 + 0.4);

            osc.connect(gain);
            gain.connect(chimeCtx.destination);
            osc.start(chimeNow + idx * 0.08);
            osc.stop(chimeNow + idx * 0.08 + 0.45);
          });
        } catch {
          // Ignore
        }
      }, 1200);
    } catch {
      // Ignore
    }
  }

  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEffects();
