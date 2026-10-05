export type HazardLevel = 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'ADVISORY';

export type HazardType = 
  | 'THUNDERSTORM'
  | 'LIGHTNING'
  | 'HAIL'
  | 'DOWNBURST'
  | 'CLOUDBURST'
  | 'HEAVY_RAIN'
  | 'CONVECTIVE_INITIATION';

export interface StormCell {
  id: string;
  name: string;
  lat: number;
  lng: number;
  severity: HazardLevel;
  primaryHazard: HazardType;
  reflectivityDbz: number;
  echoTopKm: number;
  vertIntegratedLiquidKgM2: number;
  speedKmh: number;
  directionDeg: number;
  directionText: string;
  etaMinutes: number;
  targetLocation: string;
  targetLat: number;
  targetLng: number;
  probLightning: number;
  probHail: number;
  probDownburst: number;
  probCloudburst: number;
  probHeavyRain: number;
  confidence: number;
  growthRate: 'RAPID_GROWTH' | 'STEADY' | 'DECAYING';
  radarSource: string;
  trajectory: [number, number][];
  pastTrack: [number, number][];
  radiusKm: number;
  affectedDistricts: string[];
  maxWindGustKmh: number;
  predictedRainRateMmHr: number;
  hailDiameterCm?: number;
  capeJouleKg?: number;
  detectedAt: string;
}

export interface LightningStrike {
  id: string;
  lat: number;
  lng: number;
  timestamp: string;
  type: 'CG' | 'IC'; // Cloud-to-Ground or Intra-Cloud
  peakCurrentKa: number;
  polarity: '+' | '-';
  confidence: number;
  region: string;
  ageMs?: number;
}

export interface RadarStation {
  id: string;
  name: string;
  code: string;
  state: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast';
  lat: number;
  lng: number;
  band: 'C-Band' | 'S-Band' | 'X-Band';
  status: 'OPERATIONAL' | 'CALIBRATING' | 'STANDBY';
  rangeKm: number;
  lastScanTime: string;
  elevationAngleDeg: number;
  frequencyGhz: number;
  peakPowerKw: number;
}

export interface AirportStation {
  code: string;
  icao: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  elevationFt: number;
  metarSummary: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  convectiveThreat: HazardLevel;
  activeHazards: HazardType[];
  runwayStatus: 'OPEN' | 'WARNING' | 'GROUND_STOP';
  windKts: number;
  windDirDeg: number;
  gustKts: number;
  visibilityKm: number;
}

export interface AlertItem {
  id: string;
  cellId?: string;
  title: string;
  level: HazardLevel;
  hazardType: HazardType;
  locationName: string;
  state: string;
  lat: number;
  lng: number;
  detectedAt: string;
  etaMinutes: number;
  validUntil: string;
  confidence: number;
  affectedDistricts: string[];
  description: string;
  recommendedAction: string;
  windGustKmh: number;
  rainRateMmHr: number;
  hailSizeCm: number;
  acknowledged: boolean;
  source: 'AI_NOWCAST_ENGINE' | 'DWR_ALGORITHM' | 'MULTI_SENSOR_FUSION';
}

export type TimelineStep = 'NOW' | '+15m' | '+30m' | '+45m' | '+1h' | '+2h' | '+3h' | '+4h' | '+5h' | '+6h';

export interface GridForecastPoint {
  id: string;
  lat: number;
  lng: number;
  probThunderstorm: number;
  probLightning: number;
  probHail: number;
  probDownburst: number;
  probCloudburst: number;
  probHeavyRain: number;
  predictedDbz: number;
  predictedRainMm: number;
  confidence: number;
  cape: number;
  cin: number;
  vorticity: number;
  moistureConvergence: number;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  category: 'RADAR' | 'SATELLITE' | 'LIGHTNING' | 'SURFACE_AWS' | 'NWP';
  provider: string;
  updateFrequency: string;
  spatialResolution: string;
  latencySeconds: number;
  status: 'ONLINE' | 'DEGRADED' | 'STANDBY';
  packetRatePerSec: number;
  lastIngestTime: string;
  coverage: string;
  activeSensors: number;
  totalSensors: number;
  qualityScore: number;
}

export interface ModelVerificationMetrics {
  leadTime: string;
  pod: number; // Probability of Detection
  far: number; // False Alarm Rate
  csi: number; // Critical Success Index
  ets: number; // Equitable Threat Score
  hss: number; // Heidke Skill Score
  rmseDbz: number;
  fss3km: number; // Fractions Skill Score
  sampleCount: number;
}

export interface AlertThresholdConfig {
  thunderstormProb: number;
  lightningProb: number;
  hailProb: number;
  downburstProb: number;
  cloudburstProb: number;
  heavyRainMmHr: number;
  windGustKmh: number;
  dbzThreshold: number;
  autoAudioSiren: boolean;
  minimumConfidence: number;
}
