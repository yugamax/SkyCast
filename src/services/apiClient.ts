import { simulationEngine } from './simulationEngine';
import { 
  StormCell, 
  LightningStrike, 
  AlertItem, 
  TimelineStep, 
  GridForecastPoint, 
  RadarStation, 
  AirportStation,
  DataSourceStatus,
  ModelVerificationMetrics 
} from '../types/weather';
import { 
  INITIAL_RADAR_STATIONS, 
  INITIAL_AIRPORTS, 
  DATA_SOURCES_STATUS, 
  VERIFICATION_METRICS 
} from '../data/mockData';

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class SkycastApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Get active OpenWeather API key from env or localStorage
  getOpenWeatherApiKey(): string | null {
    return (
      import.meta.env.VITE_OPENWEATHER_API_KEY ||
      import.meta.env.VITE_OPENWEATHERMAP_API_KEY ||
      localStorage.getItem('skycast_api_key_OPENWEATHER') ||
      null
    );
  }

  // Test OpenWeather connection with key
  async testOpenWeatherConnection(key?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const activeKey = key || this.getOpenWeatherApiKey();
    if (!activeKey) {
      return { success: false, message: 'No OpenWeatherMap key provided.' };
    }
    try {
      // Query New Delhi coordinates as test
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=28.6139&lon=77.2090&appid=${activeKey}&units=metric`);
      if (!res.ok) {
        return { success: false, message: `OpenWeather rejected key (HTTP ${res.status}). Check key activation.` };
      }
      const data = await res.json();
      return { 
        success: true, 
        message: `Connected! Live data received for ${data.name} (${data.main.temp}°C, ${data.weather[0].description}).`,
        data 
      };
    } catch (err: any) {
      return { success: false, message: `Connection failed: ${err.message || 'Network error'}` };
    }
  }

  // Check if live backend server is reachable
  async pingBackend(): Promise<boolean> {
    try {
      const resp = await fetch(`${this.baseUrl}/api/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      return resp.ok;
    } catch {
      return false;
    }
  }

  // GET /api/storm-cells
  async getStormCells(): Promise<StormCell[]> {
    if (simulationEngine.isDemo()) {
      return simulationEngine.getCells();
    }
    try {
      const resp = await fetch(`${this.baseUrl}/api/storm-cells`);
      if (!resp.ok) throw new Error('Live fetch failed');
      return await resp.json();
    } catch {
      return simulationEngine.getCells();
    }
  }

  // GET /api/radar/stations
  async getRadarStations(): Promise<RadarStation[]> {
    return INITIAL_RADAR_STATIONS;
  }

  // GET /api/airports
  async getAirports(): Promise<AirportStation[]> {
    return INITIAL_AIRPORTS;
  }

  // GET /api/lightning/realtime
  async getLightningStrikes(): Promise<LightningStrike[]> {
    if (simulationEngine.isDemo()) {
      return simulationEngine.getLightningStrikes();
    }
    try {
      const resp = await fetch(`${this.baseUrl}/api/lightning/realtime`);
      if (!resp.ok) throw new Error('Live fetch failed');
      return await resp.json();
    } catch {
      return simulationEngine.getLightningStrikes();
    }
  }

  // GET /api/alerts
  async getAlerts(): Promise<AlertItem[]> {
    if (simulationEngine.isDemo()) {
      return simulationEngine.getAlerts();
    }
    try {
      const resp = await fetch(`${this.baseUrl}/api/alerts`);
      if (!resp.ok) throw new Error('Live fetch failed');
      return await resp.json();
    } catch {
      return simulationEngine.getAlerts();
    }
  }

  // GET /api/nowcast?step=+15m
  async getNowcastGrid(step: TimelineStep): Promise<GridForecastPoint[]> {
    if (simulationEngine.isDemo()) {
      return simulationEngine.getNowcastGrid(step);
    }
    try {
      const resp = await fetch(`${this.baseUrl}/api/nowcast?step=${encodeURIComponent(step)}`);
      if (!resp.ok) throw new Error('Live fetch failed');
      return await resp.json();
    } catch {
      return simulationEngine.getNowcastGrid(step);
    }
  }

  // GET /api/system-sources
  async getDataSourcesStatus(): Promise<DataSourceStatus[]> {
    return DATA_SOURCES_STATUS;
  }

  // GET /api/verification/metrics
  async getVerificationMetrics(): Promise<ModelVerificationMetrics[]> {
    return VERIFICATION_METRICS;
  }
}

export const apiClient = new SkycastApiClient();
