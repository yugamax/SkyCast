// Procedural Ambient Weather Audio Synthesizer (Web Audio API)
// 100% Client-side procedural audio synthesis with zero external asset dependencies.
// Clean, natural rain acoustic texture with zero synthetic humming/bass drones.

export type WeatherAudioCondition = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'STORM' | 'MIST' | 'HAZE';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private isMutedState: boolean = false;
  private volume: number = 0.06; // Default gentle, soft ambient volume (6%)
  private masterGain: GainNode | null = null;
  
  // Rain Synthesizer Nodes
  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainHighpass: BiquadFilterNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  
  // Air / Wind Breeze Nodes (Clean, airy, NO low-frequency humming)
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windHighpass: BiquadFilterNode | null = null;
  private windNoiseNode: AudioBufferSourceNode | null = null;
  
  private thunderTimer: number | null = null;
  private dropImpulseTimer: number | null = null;
  private condition: WeatherAudioCondition = 'STORM';
  private windVelocityKmh: number = 42;
  private rainIntensity: number = 0.85;
  private listeners: Set<(isMuted: boolean, isRunning: boolean, volume: number) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.unlock();
      };
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  public unlock() {
    if (!this.ctx) {
      this.initContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.isRunning && !this.isMutedState) {
      this.start();
    }
  }

  private initContext(): boolean {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtxClass) return false;
        this.ctx = new AudioCtxClass();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    } catch (e) {
      console.warn('AudioContext initialization deferred:', e);
      return false;
    }
  }

  // Generate pink noise buffer for clean, soothing natural rainfall
  private createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.10;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Generate white noise buffer for airy rustle and electrical lightning snaps
  private createWhiteNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    return buffer;
  }

  public async start() {
    try {
      if (!this.initContext() || !this.ctx) return;

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Cleanup existing sources if any
      if (this.noiseNode) {
        try { this.noiseNode.stop(); } catch {}
        this.noiseNode.disconnect();
      }
      if (this.windNoiseNode) {
        try { this.windNoiseNode.stop(); } catch {}
        this.windNoiseNode.disconnect();
      }

      // Master Gain Node with smooth transition
      this.masterGain = this.ctx.createGain();
      const currentGain = this.isMutedState ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(currentGain, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Natural Rain Shower Synthesizer (Zero humming - 350Hz highpass cutoff prevents any bass hum)
      const rainBuffer = this.createPinkNoiseBuffer();
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = rainBuffer;
      this.noiseNode.loop = true;

      this.rainHighpass = this.ctx.createBiquadFilter();
      this.rainHighpass.type = 'highpass';
      this.rainHighpass.frequency.setValueAtTime(380, this.ctx.currentTime); // Cuts out ALL low hum / drone

      this.rainFilter = this.ctx.createBiquadFilter();
      this.rainFilter.type = 'lowpass';
      this.rainFilter.frequency.setValueAtTime(2400, this.ctx.currentTime);
      this.rainFilter.Q.setValueAtTime(0.2, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

      this.noiseNode.connect(this.rainHighpass);
      this.rainHighpass.connect(this.rainFilter);
      this.rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);
      this.noiseNode.start(0);

      // 2. Soft Whispering Wind Breeze (Clean airy hiss, NO low resonant humming)
      const windBuffer = this.createWhiteNoiseBuffer();
      this.windNoiseNode = this.ctx.createBufferSource();
      this.windNoiseNode.buffer = windBuffer;
      this.windNoiseNode.loop = true;

      this.windHighpass = this.ctx.createBiquadFilter();
      this.windHighpass.type = 'highpass';
      this.windHighpass.frequency.setValueAtTime(450, this.ctx.currentTime); // Removes all bass drone

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(950, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(0.5, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.012, this.ctx.currentTime);

      this.windNoiseNode.connect(this.windHighpass);
      this.windHighpass.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.masterGain);
      this.windNoiseNode.start(0);

      this.isRunning = true;
      this.applyWeatherParameters();
      this.startRainDropImpulses();
      this.notifyListeners();
    } catch (e) {
      console.warn('Ambient audio start failed:', e);
    }
  }

  // Natural Pitter-Patter Raindrop Clicks (Random pitch, realistic texture on glass)
  private startRainDropImpulses() {
    if (this.dropImpulseTimer) clearInterval(this.dropImpulseTimer);
    if (typeof window === 'undefined') return;

    this.dropImpulseTimer = window.setInterval(() => {
      if (!this.ctx || this.isMutedState || !this.isRunning || (this.condition !== 'RAIN' && this.condition !== 'STORM')) return;

      if (Math.random() < (this.condition === 'STORM' ? 0.65 : 0.35)) {
        this.triggerSingleDropClick();
      }
    }, 180);
  }

  private triggerSingleDropClick() {
    if (!this.ctx || !this.masterGain || this.isMutedState) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Pitch variance between 1.2 kHz and 3.5 kHz for natural droplet acoustic variety
      const freq = 1400 + Math.random() * 2000;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.025);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.003 * this.rainIntensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.028);
    } catch {}
  }

  // Periodic Thunder Scheduler in Storm mode
  private scheduleThunder() {
    if (this.thunderTimer) clearTimeout(this.thunderTimer);
    if (!this.isRunning || this.condition !== 'STORM') return;

    // Trigger every 25 to 45 seconds during storm mode
    const nextInterval = 25000 + Math.random() * 20000;
    this.thunderTimer = window.setTimeout(() => {
      this.triggerLightning();
      this.scheduleThunder();
    }, nextInterval);
  }

  /**
   * ⚡ Real-Time Procedural Lightning & Thunder Sound Synthesizer
   * 3-Stage Acoustic Simulation:
   * 1. Crisp Electrical Arc Snap & Crackle (High-frequency discharge)
   * 2. Explosive Acoustic Shockwave Crack (Sudden supersonic expansion)
   * 3. Reverberant Rolling Thunder Rumble (Smooth low-frequency atmospheric roll)
   */
  public triggerLightning(intensity: number = 1.0) {
    this.unlock();
    if (!this.ctx || this.isMutedState || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      // =========================================================================
      // 1. ELECTRICAL LIGHTNING ARC DISCHARGE SNAP (High-frequency crisp crackle)
      // =========================================================================
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const snapBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const snapData = snapBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Modulated random spark spikes
        const env = Math.exp(-i / (bufferSize * 0.25));
        snapData[i] = (Math.random() * 2 - 1) * env * (Math.random() > 0.4 ? 1 : 0);
      }

      const snapSource = this.ctx.createBufferSource();
      snapSource.buffer = snapBuffer;

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(2800, now);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.028 * intensity, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.12);

      snapSource.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.masterGain);
      snapSource.start(now);

      // =========================================================================
      // 2. SHOCKWAVE THUNDER CLAP (Sudden sharp atmospheric acoustic crack)
      // =========================================================================
      const clapOsc = this.ctx.createOscillator();
      const clapGain = this.ctx.createGain();
      const clapFilter = this.ctx.createBiquadFilter();

      clapOsc.type = 'triangle';
      clapOsc.frequency.setValueAtTime(280, now + 0.03);
      clapOsc.frequency.exponentialRampToValueAtTime(65, now + 0.25);

      clapFilter.type = 'bandpass';
      clapFilter.frequency.setValueAtTime(320, now + 0.03);
      clapFilter.Q.setValueAtTime(1.5, now + 0.03);

      clapGain.gain.setValueAtTime(0.001, now);
      clapGain.gain.linearRampToValueAtTime(0.035 * intensity, now + 0.04);
      clapGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.35);

      clapOsc.connect(clapFilter);
      clapFilter.connect(clapGain);
      clapGain.connect(this.masterGain);

      clapOsc.start(now + 0.02);
      clapOsc.stop(now + 0.38);

      // =========================================================================
      // 3. ROLLING ATMOSPHERIC THUNDER RUMBLE (Deep, resonant rolling decay)
      // =========================================================================
      const rumbleOsc = this.ctx.createOscillator();
      const rumbleGain = this.ctx.createGain();
      const rumbleFilter = this.ctx.createBiquadFilter();

      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.setValueAtTime(75, now + 0.08);
      rumbleOsc.frequency.exponentialRampToValueAtTime(32, now + 2.8);

      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(110, now + 0.08);
      rumbleFilter.Q.setValueAtTime(0.5, now + 0.08);

      rumbleGain.gain.setValueAtTime(0.001, now);
      rumbleGain.gain.linearRampToValueAtTime(0.038 * intensity, now + 0.28);
      rumbleGain.gain.exponentialRampToValueAtTime(0.0003, now + 3.2);

      rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(this.masterGain);

      rumbleOsc.start(now + 0.08);
      rumbleOsc.stop(now + 3.3);
    } catch (e) {
      console.warn('Lightning audio trigger skipped:', e);
    }
  }

  // Alias for backward compatibility
  public triggerThunder() {
    this.triggerLightning(1.0);
  }

  // Direct Audio Test Demo Button
  public testAudio() {
    this.unlock();
    this.triggerLightning(1.1);
  }

  public setWeatherState(
    condition: WeatherAudioCondition,
    windVelocityKmh: number = 36,
    rainIntensity: number = 0.8
  ) {
    this.condition = condition;
    this.windVelocityKmh = windVelocityKmh;
    this.rainIntensity = rainIntensity;
    this.applyWeatherParameters();
  }

  public setCondition(condition: WeatherAudioCondition) {
    this.condition = condition;
    this.applyWeatherParameters();
  }

  private applyWeatherParameters() {
    if (!this.ctx || !this.rainGain || !this.windGain) return;

    const t = this.ctx.currentTime;
    const windTarget = Math.min(0.02, Math.max(0.004, (this.windVelocityKmh / 100) * 0.02));

    if (this.condition === 'STORM') {
      const rainTarget = Math.max(0.03, Math.min(0.055, this.rainIntensity * 0.055));
      this.rainGain.gain.linearRampToValueAtTime(rainTarget, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(windTarget * 1.2, t + 0.5);
      if (this.rainFilter) this.rainFilter.frequency.linearRampToValueAtTime(2800, t + 0.5);
      this.scheduleThunder();
    } else if (this.condition === 'RAIN') {
      const rainTarget = Math.max(0.015, Math.min(0.035, this.rainIntensity * 0.035));
      this.rainGain.gain.linearRampToValueAtTime(rainTarget, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(windTarget, t + 0.5);
      if (this.rainFilter) this.rainFilter.frequency.linearRampToValueAtTime(2200, t + 0.5);
      if (this.thunderTimer) clearTimeout(this.thunderTimer);
    } else {
      // CLEAR / CLOUDY / MIST / HAZE
      this.rainGain.gain.linearRampToValueAtTime(0.0, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(0.005, t + 0.5);
      if (this.thunderTimer) clearTimeout(this.thunderTimer);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.isMutedState) {
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, t + 0.1);
    }
    this.notifyListeners();
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.unlock();
    if (!this.isRunning) {
      this.start();
      this.isMutedState = false;
    } else {
      this.isMutedState = !this.isMutedState;
    }

    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.masterGain) {
        const t = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(t);
        this.masterGain.gain.linearRampToValueAtTime(this.isMutedState ? 0 : this.volume, t + 0.15);
      }
    }

    this.notifyListeners();
    return this.isMutedState;
  }

  public unmute() {
    this.unlock();
    this.isMutedState = false;
    if (!this.isRunning) {
      this.start();
    } else if (this.ctx && this.masterGain) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, t + 0.15);
    }
    this.notifyListeners();
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public subscribe(cb: (isMuted: boolean, isRunning: boolean, volume: number) => void) {
    this.listeners.add(cb);
    cb(this.isMutedState, this.isRunning, this.volume);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.isMutedState, this.isRunning, this.volume));
  }
}

export const ambientAudio = new AmbientAudioEngine();

