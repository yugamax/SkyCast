import {
  StormCell,
  LightningStrike,
  AlertItem,
  TimelineStep,
  GridForecastPoint,
  HazardLevel,
  AlertThresholdConfig
} from '../types/weather';
import {
  INITIAL_STORM_CELLS,
  INITIAL_ALERTS,
  DEFAULT_ALERT_THRESHOLDS
} from '../data/mockData';
import { ambientAudio } from './ambientAudioService';

export type WeatherScenarioId =
  | 'SEVERE_STORM'
  | 'MONSOON_RAIN'
  | 'HAIL_MICROBURST'
  | 'DENSE_HAZE'
  | 'CLEAR_SUNNY'
  | 'CYCLONE_SQUALL';

export interface WeatherScenarioConfig {
  id: WeatherScenarioId;
  name: string;
  tagline: string;
  icon: string;
  condition: 'SUNNY' | 'HAZE' | 'MIST' | 'OVERCAST' | 'RAIN' | 'STORM';
  cloudCover: number; // 0 to 100
  windSpeed: number; // km/h
  humidity: number; // %
  baseDbz: number;
  description: string;
  cells: StormCell[];
  alerts: AlertItem[];
}

// Weather Scenarios for Judge Demonstrations
export const WEATHER_SCENARIOS: Record<WeatherScenarioId, WeatherScenarioConfig> = {
  SEVERE_STORM: {
    id: 'SEVERE_STORM',
    name: 'Severe Supercell & Cloudburst',
    tagline: '72 dBZ Convective Core • Violent Downburst • High-Voltage Lightning',
    icon: '⚡',
    condition: 'STORM',
    cloudCover: 95,
    windSpeed: 52,
    humidity: 88,
    baseDbz: 71.5,
    description: 'Extreme convective cloudburst advancing rapidly with destructive 92 km/h wind shear and frequent cloud-to-ground lightning strikes.',
    cells: JSON.parse(JSON.stringify(INITIAL_STORM_CELLS)),
    alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS))
  },
  MONSOON_RAIN: {
    id: 'MONSOON_RAIN',
    name: 'Monsoon Deluge & Heavy Rain',
    tagline: 'Widespread 110 mm/h Precipitation • Deep Coastal Trough',
    icon: '🌧️',
    condition: 'RAIN',
    cloudCover: 85,
    windSpeed: 28,
    humidity: 92,
    baseDbz: 54.0,
    description: 'Heavy continuous monsoon downpour across river basins with saturated soils and widespread urban runoff.',
    cells: [
      {
        id: 'CELL-M1-WB',
        name: 'Monsoon Trough Deep Convective Band',
        lat: 22.85,
        lng: 88.52,
        reflectivityDbz: 56.4,
        speedKmh: 24,
        directionDeg: 45,
        directionText: 'NE',
        severity: 'SEVERE',
        primaryHazard: 'CLOUDBURST',
        targetLocation: 'Kolkata Metropolitan Belt',
        targetLat: 22.5726,
        targetLng: 88.3639,
        etaMinutes: 18,
        radiusKm: 26,
        probHail: 15,
        probLightning: 68,
        probDownburst: 42,
        probCloudburst: 84,
        probHeavyRain: 98,
        predictedRainRateMmHr: 112.5,
        maxWindGustKmh: 58,
        vertIntegratedLiquidKgM2: 38.5,
        echoTopKm: 13.8,
        capeJouleKg: 2400,
        confidence: 94,
        growthRate: 'STEADY',
        radarSource: 'Kolkata DWR (S-Band)',
        detectedAt: new Date().toLocaleTimeString('en-GB'),
        affectedDistricts: ['Kolkata', 'North 24 Parganas', 'Howrah'],
        pastTrack: [[22.95, 88.60], [22.90, 88.56]],
        trajectory: [[22.85, 88.52], [22.75, 88.46], [22.65, 88.40], [22.5726, 88.3639]]
      },
      {
        id: 'CELL-M2-AS',
        name: 'Brahmaputra Valley Orographic Rainband',
        lat: 26.28,
        lng: 91.85,
        reflectivityDbz: 52.8,
        speedKmh: 22,
        directionDeg: 60,
        directionText: 'ENE',
        severity: 'SEVERE',
        primaryHazard: 'HEAVY_RAIN',
        targetLocation: 'Guwahati & Brahmaputra Corridor',
        targetLat: 26.1445,
        targetLng: 91.7362,
        etaMinutes: 24,
        radiusKm: 28,
        probHail: 10,
        probLightning: 58,
        probDownburst: 35,
        probCloudburst: 89,
        probHeavyRain: 99,
        predictedRainRateMmHr: 98.0,
        maxWindGustKmh: 52,
        vertIntegratedLiquidKgM2: 34.0,
        echoTopKm: 12.5,
        capeJouleKg: 2100,
        confidence: 92,
        growthRate: 'STEADY',
        radarSource: 'Agartala DWR',
        detectedAt: new Date().toLocaleTimeString('en-GB'),
        affectedDistricts: ['Kamrup Metropolitan', 'Nalbari', 'Morigaon'],
        pastTrack: [[26.35, 91.92], [26.31, 91.88]],
        trajectory: [[26.28, 91.85], [26.22, 91.80], [26.17, 91.75], [26.1445, 91.7362]]
      }
    ],
    alerts: [
      {
        id: 'ALT-MON-01',
        cellId: 'CELL-M1-WB',
        title: 'Flash Flood & Cloudburst Alert - Kolkata Basin',
        level: 'SEVERE',
        hazardType: 'CLOUDBURST',
        locationName: 'Kolkata Metropolitan Basin (West Bengal)',
        state: 'West Bengal',
        lat: 22.5726,
        lng: 88.3639,
        detectedAt: new Date().toLocaleTimeString('en-GB'),
        validUntil: '+2 Hours',
        etaMinutes: 18,
        confidence: 94,
        affectedDistricts: ['Kolkata', 'Howrah', 'Hooghly'],
        description: 'Heavy continuous monsoon precipitation bands (112.5 mm/h). High probability of urban waterlogging along major arterial bypasses.',
        recommendedAction: 'Activate municipal storm-water pump stations. Halt underground metro drainage construction.',
        windGustKmh: 58,
        rainRateMmHr: 112.5,
        hailSizeCm: 0.5,
        acknowledged: false,
        source: 'AI_NOWCAST_ENGINE'
      }
    ]
  },
  HAIL_MICROBURST: {
    id: 'HAIL_MICROBURST',
    name: 'Damaging Hailstorm & Microburst',
    tagline: '3.5 cm Severe Hail Risk • 88 km/h Wind Squall • Extreme Shear',
    icon: '🧊',
    condition: 'STORM',
    cloudCover: 85,
    windSpeed: 44,
    humidity: 74,
    baseDbz: 66.8,
    description: 'Elevated supercell with high VIL density producing damaging large hail and high-velocity microburst gusts.',
    cells: [
      {
        id: 'CELL-H1-KA',
        name: 'Deccan High-Shear Severe Hail Core',
        lat: 13.15,
        lng: 77.78,
        reflectivityDbz: 68.2,
        speedKmh: 38,
        directionDeg: 210,
        directionText: 'SSW',
        severity: 'CRITICAL',
        primaryHazard: 'HAIL',
        targetLocation: 'Bengaluru Tech Corridor & Airport',
        targetLat: 12.9716,
        targetLng: 77.5946,
        etaMinutes: 14,
        radiusKm: 22,
        probHail: 94,
        probLightning: 88,
        probDownburst: 86,
        probCloudburst: 65,
        probHeavyRain: 84,
        predictedRainRateMmHr: 76.0,
        maxWindGustKmh: 88,
        vertIntegratedLiquidKgM2: 56.4,
        echoTopKm: 16.2,
        capeJouleKg: 3600,
        confidence: 96,
        growthRate: 'RAPID_GROWTH',
        radarSource: 'Bengaluru DWR (C-Band)',
        detectedAt: new Date().toLocaleTimeString('en-GB'),
        affectedDistricts: ['Bengaluru Urban', 'Bengaluru Rural'],
        pastTrack: [[13.25, 77.85], [13.20, 77.81]],
        trajectory: [[13.15, 77.78], [13.08, 77.70], [13.02, 77.64], [12.9716, 77.5946]]
      }
    ],
    alerts: [
      {
        id: 'ALT-HAIL-01',
        cellId: 'CELL-H1-KA',
        title: 'Severe Damaging Hail & Microburst Warning',
        level: 'CRITICAL',
        hazardType: 'HAIL',
        locationName: 'Bengaluru South & Airport Corridor (Karnataka)',
        state: 'Karnataka',
        lat: 12.9716,
        lng: 77.5946,
        detectedAt: new Date().toLocaleTimeString('en-GB'),
        validUntil: '+1.5 Hours',
        etaMinutes: 14,
        confidence: 96,
        affectedDistricts: ['Bengaluru Urban', 'Ramanagara'],
        description: 'CRITICAL HAIL & MICROBURST: Severe hail up to 3.5 cm diameter with 88 km/h surface wind gusts. Protect greenhouses and aircraft.',
        recommendedAction: 'Issue immediate aerodrome ground stop. Shelter parked vehicles and fragile agricultural installations.',
        windGustKmh: 88,
        rainRateMmHr: 76.0,
        hailSizeCm: 3.5,
        acknowledged: false,
        source: 'DWR_ALGORITHM'
      }
    ]
  },
  DENSE_HAZE: {
    id: 'DENSE_HAZE',
    name: 'Dense Winter Fog & Atmospheric Haze',
    tagline: 'Visibility < 400m • Stable Inversion Layer • Calm Wind',
    icon: '🌫️',
    condition: 'HAZE',
    cloudCover: 50,
    windSpeed: 8,
    humidity: 89,
    baseDbz: 18.0,
    description: 'Boundary layer thermal inversion trapping particulate matter and fog, resulting in severely restricted aerodrome visibility.',
    cells: [
      {
        id: 'CELL-F1-NCR',
        name: 'Indo-Gangetic Radiation Inversion Sheet',
        lat: 28.75,
        lng: 77.30,
        reflectivityDbz: 22.0,
        speedKmh: 12,
        directionDeg: 90,
        directionText: 'E',
        severity: 'ADVISORY',
        primaryHazard: 'CONVECTIVE_INITIATION',
        targetLocation: 'New Delhi Indira Gandhi Airport',
        targetLat: 28.6139,
        targetLng: 77.2090,
        etaMinutes: 45,
        radiusKm: 14,
        probHail: 0,
        probLightning: 4,
        probDownburst: 6,
        probCloudburst: 2,
        probHeavyRain: 8,
        predictedRainRateMmHr: 1.5,
        maxWindGustKmh: 14,
        vertIntegratedLiquidKgM2: 4.2,
        echoTopKm: 3.2,
        capeJouleKg: 450,
        confidence: 90,
        growthRate: 'STEADY',
        radarSource: 'Delhi Mausam Bhavan DWR',
        detectedAt: new Date().toLocaleTimeString('en-GB'),
        affectedDistricts: ['New Delhi', 'South West Delhi', 'Gurugram'],
        pastTrack: [[28.80, 77.35], [28.78, 77.32]],
        trajectory: [[28.75, 77.30], [28.70, 77.26], [28.65, 77.23], [28.6139, 77.2090]]
      }
    ],
    alerts: [
      {
        id: 'ALT-FOG-01',
        cellId: 'CELL-F1-NCR',
        title: 'Dense Fog & Low Visibility Advisory',
        level: 'ADVISORY',
        hazardType: 'CONVECTIVE_INITIATION',
        locationName: 'Delhi NCR Expressway Corridor',
        state: 'Delhi NCR',
        lat: 28.6139,
        lng: 77.2090,
        detectedAt: new Date().toLocaleTimeString('en-GB'),
        validUntil: '+4 Hours',
        etaMinutes: 45,
        confidence: 90,
        affectedDistricts: ['New Delhi', 'Noida', 'Gurugram'],
        description: 'DENSE FOG ADVISORY: Surface horizontal visibility reduced below 400m. Airport operating under CAT-III ILS approach procedures.',
        recommendedAction: 'Enforce speed limits on Yamuna Expressway. Initiate low-visibility airport taxiing protocols.',
        windGustKmh: 14,
        rainRateMmHr: 0.5,
        hailSizeCm: 0.0,
        acknowledged: false,
        source: 'MULTI_SENSOR_FUSION'
      }
    ]
  },
  CLEAR_SUNNY: {
    id: 'CLEAR_SUNNY',
    name: 'Clear Sky & Solar Convection',
    tagline: '0% Clouds • High Solar Radiation • Gentle Atmospheric Breeze',
    icon: '☀️',
    condition: 'SUNNY',
    cloudCover: 5,
    windSpeed: 14,
    humidity: 48,
    baseDbz: 8.0,
    description: 'Unobstructed clear sky with high solar flux, stable anticyclonic subsidence, and peaceful acoustic resonance.',
    cells: [],
    alerts: []
  },
  CYCLONE_SQUALL: {
    id: 'CYCLONE_SQUALL',
    name: 'Tropical Cyclone Spiral Rainband',
    tagline: '115 km/h Coastal Squall • Storm Surge Risk • Rapid Cyclogenesis',
    icon: '🌀',
    condition: 'STORM',
    cloudCover: 100,
    windSpeed: 82,
    humidity: 95,
    baseDbz: 68.0,
    description: 'Severe cyclonic storm spiral bands making coastal landfall with hurricane-force gusts, torrential rainfall, and violent sea spray.',
    cells: [
      {
        id: 'CELL-C1-OD',
        name: 'Bay of Bengal Cyclone Primary Eyewall Band',
        lat: 20.45,
        lng: 86.85,
        reflectivityDbz: 70.4,
        speedKmh: 42,
        directionDeg: 305,
        directionText: 'NW',
        severity: 'CRITICAL',
        primaryHazard: 'DOWNBURST',
        targetLocation: 'Paradip Port & Jagatsinghpur Coast',
        targetLat: 20.3164,
        targetLng: 86.6114,
        etaMinutes: 12,
        radiusKm: 34,
        probHail: 30,
        probLightning: 92,
        probDownburst: 98,
        probCloudburst: 96,
        probHeavyRain: 99,
        predictedRainRateMmHr: 140.0,
        maxWindGustKmh: 115,
        vertIntegratedLiquidKgM2: 62.0,
        echoTopKm: 17.5,
        capeJouleKg: 4200,
        confidence: 98,
        growthRate: 'RAPID_GROWTH',
        radarSource: 'Paradip DWR (S-Band)',
        detectedAt: new Date().toLocaleTimeString('en-GB'),
        affectedDistricts: ['Jagatsinghpur', 'Kendrapara', 'Puri'],
        pastTrack: [[20.55, 86.95], [20.50, 86.90]],
        trajectory: [[20.45, 86.85], [20.40, 86.75], [20.35, 86.68], [20.3164, 86.6114]]
      }
    ],
    alerts: [
      {
        id: 'ALT-CYC-01',
        cellId: 'CELL-C1-OD',
        title: 'EMERGENCY CYCLONE LANDFALL WARNING',
        level: 'CRITICAL',
        hazardType: 'DOWNBURST',
        locationName: 'Paradip & Kendrapara Coastal Sector (Odisha)',
        state: 'Odisha',
        lat: 20.3164,
        lng: 86.6114,
        detectedAt: new Date().toLocaleTimeString('en-GB'),
        validUntil: '+3 Hours',
        etaMinutes: 12,
        confidence: 98,
        affectedDistricts: ['Jagatsinghpur', 'Kendrapara', 'Bhadrak'],
        description: 'EXTREME CYCLONE WARNING: Violent spiral bands crossing coast with 115 km/h squalls and 140 mm/h deluge. Full civil defense evacuation active.',
        recommendedAction: 'Immediate evacuation of coastal villages. Secure fishing trawlers. Deploy NDRF battalions to storm shelters.',
        windGustKmh: 115,
        rainRateMmHr: 140.0,
        hailSizeCm: 1.0,
        acknowledged: false,
        source: 'AI_NOWCAST_ENGINE'
      }
    ]
  }
};

// Web Audio API helper for tactical hazard warning beeps
class AudioAlertService {
  private audioCtx: AudioContext | null = null;

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
  }

  playAlertTone(type: 'CRITICAL' | 'SEVERE' | 'BEEP') {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'CRITICAL') {
        // Soft double harmonic ping chime (gentle sine wave, low volume)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'SEVERE') {
        // Soft two-tone alert chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Subtle tactile UI pip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch {
      // Audio playback might be restricted before user gesture
    }
  }
}

export const audioAlerts = new AudioAlertService();

export class SimulationEngine {
  private currentScenarioId: WeatherScenarioId = 'SEVERE_STORM';
  private cells: StormCell[] = JSON.parse(JSON.stringify(WEATHER_SCENARIOS.SEVERE_STORM.cells));
  private alerts: AlertItem[] = JSON.parse(JSON.stringify(WEATHER_SCENARIOS.SEVERE_STORM.alerts));
  private lightningStrikes: LightningStrike[] = [];
  private thresholds: AlertThresholdConfig = { ...DEFAULT_ALERT_THRESHOLDS };
  private isDemoMode: boolean = true;
  private listeners: (() => void)[] = [];
  private intervalId: number | null = null;
  private strikeCountLast10Min: number = 412;
  private strikeCountLast30Min: number = 1380;
  private simulationTickCount: number = 0;

  constructor() {
    this.seedInitialLightning();
    this.startSimulationLoop();
  }

  // Switch Weather Scenario dynamically for judge presentations
  public setWeatherScenario(scenarioId: WeatherScenarioId) {
    const scenario = WEATHER_SCENARIOS[scenarioId];
    if (!scenario) return;

    this.currentScenarioId = scenarioId;
    this.cells = JSON.parse(JSON.stringify(scenario.cells));
    this.alerts = JSON.parse(JSON.stringify(scenario.alerts));

    if (scenario.cells.length > 0) {
      this.seedInitialLightning();
    } else {
      this.lightningStrikes = [];
    }

    // Sync ambient audio synthesizer with the selected scenario
    const audioState =
      scenario.condition === 'STORM' ? 'STORM'
        : scenario.condition === 'RAIN' ? 'RAIN'
          : (scenario.condition === 'OVERCAST' || scenario.condition === 'HAZE' || scenario.condition === 'MIST') ? 'CLOUDY'
            : 'CLEAR';

    ambientAudio.setWeatherState(audioState, scenario.windSpeed, scenario.condition === 'STORM' ? 0.9 : scenario.condition === 'RAIN' ? 0.6 : 0.1);

    // If not muted, make sure audio resumes
    if (!ambientAudio.isMuted()) {
      ambientAudio.unmute();
    }

    this.notify();
  }

  public getCurrentScenarioId(): WeatherScenarioId {
    return this.currentScenarioId;
  }

  public getCurrentScenario(): WeatherScenarioConfig {
    return WEATHER_SCENARIOS[this.currentScenarioId] || WEATHER_SCENARIOS.SEVERE_STORM;
  }

  public getAllScenarios(): WeatherScenarioConfig[] {
    return Object.values(WEATHER_SCENARIOS);
  }

  private seedInitialLightning() {
    this.lightningStrikes = [];
    if (this.cells.length === 0) return;

    const now = Date.now();
    for (let i = 0; i < 40; i++) {
      const parentCell = this.cells[Math.floor(Math.random() * this.cells.length)];
      const angle = Math.random() * Math.PI * 2;
      const distDeg = (Math.random() * parentCell.radiusKm) / 111.0;
      const strikeLat = parentCell.lat + Math.sin(angle) * distDeg;
      const strikeLng = parentCell.lng + Math.cos(angle) * distDeg;

      this.lightningStrikes.push({
        id: `LTG-${now - i * 1500}-${i}`,
        lat: strikeLat,
        lng: strikeLng,
        timestamp: new Date(now - i * 1500).toLocaleTimeString('en-GB'),
        type: Math.random() > 0.35 ? 'CG' : 'IC',
        peakCurrentKa: Math.round((Math.random() * 80 + 15) * 10) / 10,
        polarity: Math.random() > 0.15 ? '-' : '+',
        confidence: Math.round(85 + Math.random() * 14),
        region: parentCell.targetLocation.split(' ')[0]
      });
    }
  }

  private startSimulationLoop() {
    if (typeof window === 'undefined') return;

    this.intervalId = window.setInterval(() => {
      this.stepSimulation();
      this.notify();
    }, 1000);
  }

  public stopSimulation() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private stepSimulation() {
    this.simulationTickCount++;

    // 1. Update storm cell positions and countdowns
    this.cells.forEach(cell => {
      const speedKmPerSec = cell.speedKmh / 3600;
      const distDeg = speedKmPerSec * 0.15;
      const rad = (cell.directionDeg * Math.PI) / 180;

      cell.lat += Math.cos(rad) * distDeg * 0.05;
      cell.lng += Math.sin(rad) * distDeg * 0.05;

      const dbzDrift = (Math.random() - 0.5) * 0.2;
      cell.reflectivityDbz = Math.min(74, Math.max(35, Math.round((cell.reflectivityDbz + dbzDrift) * 10) / 10));

      const dLat = (cell.targetLat - cell.lat) * 111;
      const dLng = (cell.targetLng - cell.lng) * 111 * Math.cos((cell.lat * Math.PI) / 180);
      const remainingDistKm = Math.sqrt(dLat * dLat + dLng * dLng);
      const exactEtaMins = (remainingDistKm / cell.speedKmh) * 60;
      cell.etaMinutes = Math.max(1, Math.round(exactEtaMins));

      const projSteps = 5;
      const newTraj: [number, number][] = [[cell.lat, cell.lng]];
      for (let s = 1; s <= projSteps; s++) {
        const stepDistDeg = ((cell.speedKmh * (s * 15 / 60)) / 111.0);
        newTraj.push([
          cell.lat + Math.cos(rad) * stepDistDeg,
          cell.lng + Math.sin(rad) * stepDistDeg
        ]);
      }
      cell.trajectory = newTraj;
    });

    // 2. Generate live lightning strikes probabilistically
    if (this.cells.length > 0 && Math.random() < 0.65) {
      const activeCell = this.cells[Math.floor(Math.random() * this.cells.length)];
      if (activeCell.probLightning > 45) {
        const angle = Math.random() * Math.PI * 2;
        const distDeg = (Math.random() * activeCell.radiusKm) / 111.0;
        const now = Date.now();
        const newStrike: LightningStrike = {
          id: `LTG-${now}-${Math.floor(Math.random() * 1000)}`,
          lat: activeCell.lat + Math.sin(angle) * distDeg,
          lng: activeCell.lng + Math.cos(angle) * distDeg,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          type: Math.random() > 0.35 ? 'CG' : 'IC',
          peakCurrentKa: Math.round((Math.random() * 95 + 20) * 10) / 10,
          polarity: Math.random() > 0.15 ? '-' : '+',
          confidence: Math.round(88 + Math.random() * 11),
          region: activeCell.targetLocation.split(' ')[0]
        };

        this.lightningStrikes.unshift(newStrike);
        if (this.lightningStrikes.length > 100) {
          this.lightningStrikes.pop();
        }
        this.strikeCountLast10Min++;
        this.strikeCountLast30Min++;
      }
    }

    // 3. Periodic automatic alert evaluation against thresholds
    if (this.simulationTickCount % 10 === 0) {
      this.evaluateAlerts();
    }
  }

  private evaluateAlerts() {
    this.cells.forEach(cell => {
      const isCritical =
        cell.reflectivityDbz >= this.thresholds.dbzThreshold ||
        cell.probCloudburst >= this.thresholds.cloudburstProb ||
        cell.probHail >= this.thresholds.hailProb ||
        cell.maxWindGustKmh >= this.thresholds.windGustKmh;

      const isSevere =
        cell.probLightning >= this.thresholds.lightningProb ||
        cell.probDownburst >= this.thresholds.downburstProb ||
        cell.probHeavyRain >= 75;

      let determinedLevel: HazardLevel = 'MODERATE';
      if (isCritical) determinedLevel = 'CRITICAL';
      else if (isSevere) determinedLevel = 'SEVERE';

      cell.severity = determinedLevel;

      const alert = this.alerts.find(a => a.cellId === cell.id);
      if (alert) {
        alert.level = determinedLevel;
        alert.etaMinutes = cell.etaMinutes;
        alert.windGustKmh = cell.maxWindGustKmh;
        alert.rainRateMmHr = cell.predictedRainRateMmHr;
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getCells(): StormCell[] {
    return this.cells;
  }

  public setCells(newCells: StormCell[]) {
    this.cells = newCells;
    this.notify();
  }

  public getCellById(id: string): StormCell | undefined {
    return this.cells.find(c => c.id === id);
  }

  public getAlerts(): AlertItem[] {
    return this.alerts;
  }

  public setAlerts(newAlerts: AlertItem[]) {
    this.alerts = newAlerts;
    this.notify();
  }

  public acknowledgeAlert(id: string) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      this.notify();
    }
  }

  public getLightningStrikes(): LightningStrike[] {
    return this.lightningStrikes;
  }

  public getLightningStats() {
    const cgCount = this.lightningStrikes.filter(s => s.type === 'CG').length;
    const icCount = this.lightningStrikes.filter(s => s.type === 'IC').length;
    const maxCurrent = this.lightningStrikes.reduce((max, s) => Math.max(max, s.peakCurrentKa), 0);
    const strikesPerMin = Math.round(this.strikeCountLast10Min / 10);

    return {
      totalRealtime: this.lightningStrikes.length,
      cgCount,
      icCount,
      cgRatio: Math.round((cgCount / Math.max(1, cgCount + icCount)) * 100),
      strikesPerMin,
      strikeCountLast10Min: this.strikeCountLast10Min,
      strikeCountLast30Min: this.strikeCountLast30Min,
      maxPeakCurrentKa: maxCurrent || 64.2
    };
  }

  public getThresholds(): AlertThresholdConfig {
    return this.thresholds;
  }

  public updateThresholds(newThresholds: Partial<AlertThresholdConfig>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.evaluateAlerts();
    this.notify();
  }

  public isDemo(): boolean {
    return this.isDemoMode;
  }

  public setDemoMode(demo: boolean) {
    this.isDemoMode = demo;
    this.notify();
  }

  public getNowcastGrid(step: TimelineStep): GridForecastPoint[] {
    const stepMultiplierMap: Record<TimelineStep, number> = {
      'NOW': 0,
      '+15m': 0.25,
      '+30m': 0.5,
      '+45m': 0.75,
      '+1h': 1.0,
      '+2h': 2.0,
      '+3h': 3.0,
      '+4h': 4.0,
      '+5h': 5.0,
      '+6h': 6.0
    };

    const hours = stepMultiplierMap[step] || 0;
    const points: GridForecastPoint[] = [];

    this.cells.forEach((cell, idx) => {
      const rad = (cell.directionDeg * Math.PI) / 180;
      const speedKm = cell.speedKmh * hours;
      const distDeg = speedKm / 111.0;

      const projLat = cell.lat + Math.cos(rad) * distDeg;
      const projLng = cell.lng + Math.sin(rad) * distDeg;

      const decayFactor = Math.max(0.35, 1 - (hours * 0.12));
      const predDbz = Math.round(cell.reflectivityDbz * decayFactor);

      for (let dx = -3; dx <= 3; dx++) {
        for (let dy = -3; dy <= 3; dy++) {
          const rSq = dx * dx + dy * dy;
          if (rSq > 10) continue;

          const pointLat = projLat + (dy * 0.022);
          const pointLng = projLng + (dx * 0.022);
          const falloff = Math.exp(-rSq / 4.0);

          points.push({
            id: `GRID-${idx}-${dx}-${dy}-${step}`,
            lat: pointLat,
            lng: pointLng,
            predictedDbz: Math.round(predDbz * falloff),
            probThunderstorm: Math.min(99, Math.round(cell.probLightning * falloff * decayFactor)),
            probLightning: Math.min(99, Math.round(cell.probLightning * falloff * decayFactor)),
            probHail: Math.min(95, Math.round(cell.probHail * falloff * decayFactor)),
            probDownburst: Math.min(95, Math.round(cell.probDownburst * falloff * decayFactor)),
            probCloudburst: Math.min(98, Math.round(cell.probCloudburst * falloff * decayFactor)),
            probHeavyRain: Math.min(99, Math.round(cell.probHeavyRain * falloff * decayFactor)),
            predictedRainMm: Math.round(cell.predictedRainRateMmHr * falloff * decayFactor),
            confidence: Math.max(50, Math.round(cell.confidence - hours * 6)),
            cape: Math.round((cell.capeJouleKg || 3000) * falloff),
            cin: Math.round(35 + Math.random() * 20),
            vorticity: Math.round((14 + Math.random() * 8) * falloff * 10) / 10,
            moistureConvergence: Math.round((28 + Math.random() * 12) * falloff)
          });
        }
      }
    });

    return points;
  }
}

// Global Singleton Instance
export const simulationEngine = new SimulationEngine();
