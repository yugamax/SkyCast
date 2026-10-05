// Clean Ambient Weather Audio Service & Real Recorded Thunder Sound Engine
// Uses authentic recorded natural thunder & lightning audio samples with clean, soothing ambient rain.
// Zero synthetic humming, zero artificial low-frequency bass drone.

export type WeatherAudioCondition = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'STORM' | 'MIST' | 'HAZE';

interface ThunderSample {
  id: string;
  localUrl: string;
  fallbackUrl: string;
  volumeScale: number;
}

const REAL_THUNDER_TRACKS: ThunderSample[] = [
  {
    id: 'strike_1',
    localUrl: '/audio/thunder_strike_1.mp3',
    fallbackUrl: 'https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3',
    volumeScale: 0.95
  },
  {
    id: 'crack_2',
    localUrl: '/audio/thunder_crack_2.mp3',
    fallbackUrl: 'https://assets.mixkit.co/active_storage/sfx/1272/1272-preview.mp3',
    volumeScale: 0.90
  },
  {
    id: 'google_crack',
    localUrl: '/audio/thunder_google_crack.ogg',
    fallbackUrl: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg',
    volumeScale: 1.0
  },
  {
    id: 'google_rolling',
    localUrl: '/audio/rolling_thunder.ogg',
    fallbackUrl: 'https://actions.google.com/sounds/v1/weather/rolling_thunder.ogg',
    volumeScale: 0.85
  },
  {
    id: 'distant_3',
    localUrl: '/audio/thunder_distant_3.mp3',
    fallbackUrl: 'https://assets.mixkit.co/active_storage/sfx/2477/2477-preview.mp3',
    volumeScale: 0.80
  }
];

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private isMutedState: boolean = false;
  private volume: number = 0.08; // Gentle, pleasant ambient volume (8%)
  private masterGain: GainNode | null = null;
  
  // Natural Rain Synthesizer (High-passed, zero low hum)
  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainHighpass: BiquadFilterNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  
  // Soft Airy Breeze (Clean, airy, NO low-frequency humming)
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
  
  // Real Audio Elements Cache for zero-latency playback
  private audioPool: Map<string, HTMLAudioElement> = new Map();
  private lastTrackIndex: number = -1;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.unlock();
      };
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      
      // Preload real thunder audio samples in background
      this.preloadThunderAudio();
    }
  }

  private preloadThunderAudio() {
    if (typeof window === 'undefined') return;
    REAL_THUNDER_TRACKS.forEach(track => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = track.localUrl;
        
        // If local fails, switch source to remote CDN fallback
        audio.addEventListener('error', () => {
          if (audio.src !== track.fallbackUrl) {
            audio.src = track.fallbackUrl;
            audio.load();
          }
        });
        
        this.audioPool.set(track.id, audio);
      } catch (e) {
        console.warn('Audio preload skipped:', e);
      }
    });
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

  // Generate pink noise buffer for soothing natural rainfall (high-passed)
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
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Generate white noise buffer for airy rustle
  private createWhiteNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
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

      // 1. Natural Rain Shower (400Hz highpass cutoff prevents any bass hum/drone)
      const rainBuffer = this.createPinkNoiseBuffer();
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = rainBuffer;
      this.noiseNode.loop = true;

      this.rainHighpass = this.ctx.createBiquadFilter();
      this.rainHighpass.type = 'highpass';
      this.rainHighpass.frequency.setValueAtTime(420, this.ctx.currentTime); // Eliminates all bass hum

      this.rainFilter = this.ctx.createBiquadFilter();
      this.rainFilter.type = 'lowpass';
      this.rainFilter.frequency.setValueAtTime(2600, this.ctx.currentTime);
      this.rainFilter.Q.setValueAtTime(0.2, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.025, this.ctx.currentTime);

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
      this.windHighpass.frequency.setValueAtTime(500, this.ctx.currentTime); // Removes all bass drone

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(0.4, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.01, this.ctx.currentTime);

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

  // Gentle Pitter-Patter Raindrop Clicks (High frequency, crisp texture on glass)
  private startRainDropImpulses() {
    if (this.dropImpulseTimer) clearInterval(this.dropImpulseTimer);
    if (typeof window === 'undefined') return;

    this.dropImpulseTimer = window.setInterval(() => {
      if (!this.ctx || this.isMutedState || !this.isRunning || (this.condition !== 'RAIN' && this.condition !== 'STORM')) return;

      if (Math.random() < (this.condition === 'STORM' ? 0.6 : 0.3)) {
        this.triggerSingleDropClick();
      }
    }, 200);
  }

  private triggerSingleDropClick() {
    if (!this.ctx || !this.masterGain || this.isMutedState) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Pitch variance between 1.5 kHz and 3.8 kHz for delicate droplet acoustic variety
      const freq = 1600 + Math.random() * 2200;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.022);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.0025 * this.rainIntensity, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.025);
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
   * ⚡ Real Recorded Thunder & Lightning Audio Player
   * Plays authentic, crisp, natural thunder recordings from high-quality audio library.
   * Zero artificial bass synthesizer drones.
   */
  public triggerLightning(intensity: number = 1.0) {
    this.unlock();
    if (this.isMutedState || this.volume <= 0) return;

    try {
      // Pick next track with acoustic variety (avoid repeating exact same sample consecutively)
      let trackIndex = Math.floor(Math.random() * REAL_THUNDER_TRACKS.length);
      if (trackIndex === this.lastTrackIndex && REAL_THUNDER_TRACKS.length > 1) {
        trackIndex = (trackIndex + 1) % REAL_THUNDER_TRACKS.length;
      }
      this.lastTrackIndex = trackIndex;

      const track = REAL_THUNDER_TRACKS[trackIndex];
      const audio = new Audio();
      
      // Calculate realistic, balanced volume (never ear-piercing)
      const effectiveVol = Math.max(0.02, Math.min(0.85, this.volume * 3.5 * track.volumeScale * intensity));
      audio.volume = effectiveVol;

      // Try local primary file, fallback to CDN URL on error
      audio.src = track.localUrl;
      audio.onerror = () => {
        if (audio.src !== track.fallbackUrl) {
          audio.src = track.fallbackUrl;
          audio.play().catch(() => {});
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If browser policy prevents immediate HTML5 audio, play a gentle noise-burst fallback
          console.warn('Real thunder audio autoplay handled:', err.message);
          this.playSubtleLightningSpark();
        });
      }
    } catch (e) {
      console.warn('Lightning audio trigger skipped:', e);
      this.playSubtleLightningSpark();
    }
  }

  // Pure high-frequency electrical spark crackle (Clean, NO bass oscillator)
  private playSubtleLightningSpark() {
    if (!this.ctx || !this.masterGain || this.isMutedState) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.1);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.exp(-i / (bufferSize * 0.2));
        data[i] = (Math.random() * 2 - 1) * env * 0.15;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(2500, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      source.connect(highpass);
      highpass.connect(gain);
      gain.connect(this.masterGain);
      source.start(now);
    } catch {}
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
    const windTarget = Math.min(0.015, Math.max(0.003, (this.windVelocityKmh / 100) * 0.015));

    if (this.condition === 'STORM') {
      const rainTarget = Math.max(0.025, Math.min(0.045, this.rainIntensity * 0.045));
      this.rainGain.gain.linearRampToValueAtTime(rainTarget, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(windTarget * 1.2, t + 0.5);
      if (this.rainFilter) this.rainFilter.frequency.linearRampToValueAtTime(2800, t + 0.5);
      this.scheduleThunder();
    } else if (this.condition === 'RAIN') {
      const rainTarget = Math.max(0.012, Math.min(0.03, this.rainIntensity * 0.03));
      this.rainGain.gain.linearRampToValueAtTime(rainTarget, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(windTarget, t + 0.5);
      if (this.rainFilter) this.rainFilter.frequency.linearRampToValueAtTime(2200, t + 0.5);
      if (this.thunderTimer) clearTimeout(this.thunderTimer);
    } else {
      // CLEAR / CLOUDY / MIST / HAZE
      this.rainGain.gain.linearRampToValueAtTime(0.0, t + 0.5);
      this.windGain.gain.linearRampToValueAtTime(0.004, t + 0.5);
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
