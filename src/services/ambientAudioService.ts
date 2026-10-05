// Procedural Ambient Weather Audio Synthesizer (Web Audio API)
// 100% Client-side procedural audio synthesis with zero external asset dependencies.

export type WeatherAudioCondition = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'STORM' | 'MIST' | 'HAZE';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private isMutedState: boolean = false;
  private volume: number = 0.20; // Default gentle ambient volume (20%)
  private masterGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private breezeGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
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
      this.ctx.resume().catch(() => { });
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
        this.ctx.resume().catch(() => { });
      }
      return true;
    } catch (e) {
      console.warn('AudioContext initialization deferred:', e);
      return false;
    }
  }

  // Generate pink noise buffer for realistic continuous rain sound
  private createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 3; // 3 seconds continuous loop
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

  // Generate brown noise buffer for realistic deep howling wind gusting
  private createBrownNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 1.2;
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
        try { this.noiseNode.stop(); } catch { }
        this.noiseNode.disconnect();
      }
      if (this.windNoiseNode) {
        try { this.windNoiseNode.stop(); } catch { }
        this.windNoiseNode.disconnect();
      }

      // Master Gain Node
      this.masterGain = this.ctx.createGain();
      const currentGain = this.isMutedState ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(currentGain, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Soft Rain Synthesizer (Velvety Pink Noise + Warm Lowpass/Highpass filters)
      const rainBuffer = this.createPinkNoiseBuffer();
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = rainBuffer;
      this.noiseNode.loop = true;

      this.rainFilter = this.ctx.createBiquadFilter();
      this.rainFilter.type = 'lowpass';
      this.rainFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      this.rainFilter.Q.setValueAtTime(0.4, this.ctx.currentTime);

      const rainHighpass = this.ctx.createBiquadFilter();
      rainHighpass.type = 'highpass';
      rainHighpass.frequency.setValueAtTime(220, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.noiseNode.connect(this.rainFilter);
      this.rainFilter.connect(rainHighpass);
      rainHighpass.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);
      this.noiseNode.start(0);

      // 2. Dynamic Warm Wind Synthesizer (Brownian Noise + Gentle Resonant Lowpass)
      const windBuffer = this.createBrownNoiseBuffer();
      this.windNoiseNode = this.ctx.createBufferSource();
      this.windNoiseNode.buffer = windBuffer;
      this.windNoiseNode.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'lowpass';
      this.windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.1, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      this.windNoiseNode.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.masterGain);
      this.windNoiseNode.start(0);

      // 3. Clear Air Harmonic Ambient Tone (Gentle subtle undertone)
      const breezeOsc = this.ctx.createOscillator();
      breezeOsc.type = 'sine';
      breezeOsc.frequency.setValueAtTime(96, this.ctx.currentTime);

      const breezeFilter = this.ctx.createBiquadFilter();
      breezeFilter.type = 'lowpass';
      breezeFilter.frequency.setValueAtTime(180, this.ctx.currentTime);

      this.breezeGain = this.ctx.createGain();
      this.breezeGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      breezeOsc.connect(breezeFilter);
      breezeFilter.connect(this.breezeGain);
      this.breezeGain.connect(this.masterGain);
      breezeOsc.start(0);

      this.isRunning = true;
      this.applyWeatherParameters();
      this.startRainDropImpulses();
      this.notifyListeners();
    } catch (e) {
      console.warn('Ambient audio start failed:', e);
    }
  }

  // Individual Raindrop Impulse Clicks for gentle acoustic texture on glass
  private startRainDropImpulses() {
    if (this.dropImpulseTimer) clearInterval(this.dropImpulseTimer);
    if (typeof window === 'undefined') return;

    this.dropImpulseTimer = window.setInterval(() => {
      if (!this.ctx || this.isMutedState || !this.isRunning || (this.condition !== 'RAIN' && this.condition !== 'STORM')) return;

      if (Math.random() < (this.condition === 'STORM' ? 0.45 : 0.25)) {
        this.triggerSingleDropClick();
      }
    }, 280);
  }

  private triggerSingleDropClick() {
    if (!this.ctx || !this.masterGain || this.isMutedState) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const freq = 1200 + Math.random() * 1400;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.03);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(2.0, now);

      gain.gain.setValueAtTime(0.006 * this.rainIntensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch { }
  }

  private scheduleThunder() {
    if (this.thunderTimer) clearTimeout(this.thunderTimer);
    if (!this.isRunning || this.condition !== 'STORM') return;

    // Distant, infrequent thunder interval (30s to 60s)
    const nextInterval = 30000 + Math.random() * 30000;
    this.thunderTimer = window.setTimeout(() => {
      this.triggerThunder();
      this.scheduleThunder();
    }, nextInterval);
  }

  public triggerThunder() {
    this.unlock();
    if (!this.ctx || this.isMutedState || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Distant Atmospheric Diffuse Rumble (Smooth, low-frequency bandpass)
      const crackOsc = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();
      const crackFilter = this.ctx.createBiquadFilter();

      crackOsc.type = 'sine';
      crackOsc.frequency.setValueAtTime(140, now);
      crackOsc.frequency.exponentialRampToValueAtTime(32, now + 0.4);

      crackFilter.type = 'lowpass';
      crackFilter.frequency.setValueAtTime(280, now);
      crackFilter.Q.setValueAtTime(0.8, now);

      crackGain.gain.setValueAtTime(0.005, now);
      crackGain.gain.linearRampToValueAtTime(0.04, now + 0.06);
      crackGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.5);

      crackOsc.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(this.masterGain);

      crackOsc.start(now);
      crackOsc.stop(now + 0.55);

      // 2. Deep Sub-Bass Rolling Cinematic Rumble (Warm 55Hz down to 20Hz)
      const rumbleOsc = this.ctx.createOscillator();
      const rumbleGain = this.ctx.createGain();
      const rumbleFilter = this.ctx.createBiquadFilter();

      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.setValueAtTime(55, now);
      rumbleOsc.frequency.exponentialRampToValueAtTime(18, now + 2.8);

      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(95, now);

      rumbleGain.gain.setValueAtTime(0.005, now);
      rumbleGain.gain.linearRampToValueAtTime(0.08, now + 0.35);
      rumbleGain.gain.exponentialRampToValueAtTime(0.0005, now + 3.0);

      rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(this.masterGain);

      rumbleOsc.start(now);
      rumbleOsc.stop(now + 3.1);
    } catch (e) {
      console.warn('Thunder trigger skipped:', e);
    }
  }

  // Direct Audio Test Button to demonstrate procedural sound cleanly and softly
  public testAudio() {
    this.unlock();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Play a soft, pleasant harmonic chime arpeggio
      const tones = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      tones.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.035, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.08 + 0.22);

        osc.connect(gain);
        if (this.masterGain) gain.connect(this.masterGain);
        else gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });

      // Subtle thunder rumble preview after chime
      setTimeout(() => {
        this.triggerThunder();
      }, 400);
    } catch (e) {
      console.warn('Audio test failed:', e);
    }
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
    if (!this.ctx || !this.rainGain || !this.windGain || !this.breezeGain) return;

    const t = this.ctx.currentTime;
    const windTarget = Math.min(0.08, Math.max(0.02, (this.windVelocityKmh / 100) * 0.08));

    if (this.condition === 'STORM') {
      const rainTarget = Math.max(0.06, Math.min(0.12, this.rainIntensity * 0.12));
      this.rainGain.gain.linearRampToValueAtTime(rainTarget, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(Math.max(0.05, windTarget * 1.2), t + 0.5);
      this.breezeGain.gain.linearRampToValueAtTime(0.01, t + 0.5);
      if (this.rainFilter) this.rainFilter.frequency.linearRampToValueAtTime(2000, t + 0.5);
      if (this.windFilter) this.windFilter.frequency.linearRampToValueAtTime(320, t + 0.5);
      this.scheduleThunder();
    } else if (this.condition === 'RAIN') {
      const rainTarget = Math.max(0.04, Math.min(0.08, this.rainIntensity * 0.08));
      this.rainGain.gain.linearRampToValueAtTime(rainTarget, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(windTarget, t + 0.5);
      this.breezeGain.gain.linearRampToValueAtTime(0.01, t + 0.5);
      if (this.rainFilter) this.rainFilter.frequency.linearRampToValueAtTime(1600, t + 0.5);
      if (this.windFilter) this.windFilter.frequency.linearRampToValueAtTime(250, t + 0.5);
      if (this.thunderTimer) clearTimeout(this.thunderTimer);
    } else if (this.condition === 'CLOUDY' || this.condition === 'MIST' || this.condition === 'HAZE') {
      this.rainGain.gain.linearRampToValueAtTime(0.0, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(windTarget * 0.6, t + 0.5);
      this.breezeGain.gain.linearRampToValueAtTime(0.02, t + 0.5);
      if (this.windFilter) this.windFilter.frequency.linearRampToValueAtTime(200, t + 0.5);
      if (this.thunderTimer) clearTimeout(this.thunderTimer);
    } else {
      // CLEAR / SUNNY
      this.rainGain.gain.linearRampToValueAtTime(0.0, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(0.02, t + 0.5);
      this.breezeGain.gain.linearRampToValueAtTime(0.025, t + 0.5);
      if (this.windFilter) this.windFilter.frequency.linearRampToValueAtTime(180, t + 0.5);
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
