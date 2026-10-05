import React from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Navigation, 
  ChevronRight,
  Zap,
  Globe
} from 'lucide-react';
import { StormCell, RadarStation, AirportStation } from '../../types/weather';
import { useTheme } from '../../context/ThemeContext';

export interface UserLocationData {
  lat: number;
  lng: number;
  city?: string;
  accuracy?: number;
}

export type LocationPermissionState = 'PROMPTING' | 'GRANTED' | 'DENIED' | 'IDLE';

interface NearbyFindingsBannerProps {
  userLocation: UserLocationData | null;
  isLoadingLocation: boolean;
  locationStatus?: LocationPermissionState;
  filterScope?: 'LOCAL' | 'ALL_INDIA';
  onToggleFilterScope?: (scope: 'LOCAL' | 'ALL_INDIA') => void;
  onRequestLocation: () => void;
  onFlyToLocation: (lat: number, lng: number) => void;
  stormCells: StormCell[];
  radarStations: RadarStation[];
  airports: AirportStation[];
  onSelectCell?: (cell: StormCell) => void;
}

// Calculate Haversine distance in KM between two lat/lng points
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const NearbyFindingsBanner: React.FC<NearbyFindingsBannerProps> = ({
  userLocation,
  isLoadingLocation,
  locationStatus = 'IDLE',
  filterScope = 'LOCAL',
  onToggleFilterScope,
  onRequestLocation,
  onFlyToLocation,
  stormCells,
  radarStations,
  onSelectCell
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Fallback view when user rejected / denied location
  if (!userLocation) {
    const isDenied = locationStatus === 'DENIED';

    return (
      <div 
        className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 tactile-card ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/[0.03] border-white/[0.06]'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs text-slate-200">
                {isDenied ? 'Nationwide Weather Radar View Active' : 'Automatic Location Scanner'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                • {isDenied ? 'GPS Denied' : 'GPS Standby'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
              {isDenied 
                ? 'Showing nationwide radar grid across India. Enable location permissions to filter data for your exact city.'
                : 'Requesting device coordinates to show localized thunderstorm cells and Doppler proximity in your sector.'}
            </p>
          </div>
        </div>

        <button
          onClick={onRequestLocation}
          disabled={isLoadingLocation}
          className="tactile-btn-primary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 disabled:opacity-50"
        >
          <MapPin className={`w-3.5 h-3.5 ${isLoadingLocation ? 'animate-bounce' : ''}`} />
          <span>{isLoadingLocation ? 'Acquiring GPS...' : isDenied ? 'Enable Location' : 'Detect My Location'}</span>
        </button>
      </div>
    );
  }

  // Location granted: Calculate distances to all storm cells
  const stormDistances = stormCells.map(cell => ({
    cell,
    distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, cell.lat, cell.lng)
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const localNearbyStorms = stormDistances.filter(s => s.distanceKm <= 450);
  const nearestStorm = stormDistances[0] || null;

  // Find nearest radar station
  const radarDistances = radarStations.map(rad => ({
    radar: rad,
    distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, rad.lat, rad.lng)
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const nearestRadar = radarDistances[0] || null;

  const isNearbyThreat = nearestStorm && nearestStorm.distanceKm <= 120;
  const isDirectThreat = nearestStorm && nearestStorm.distanceKm <= 45;

  return (
    <div 
      className={`p-3.5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 tactile-card ${
        isDirectThreat 
          ? isLight ? 'bg-rose-50 border-rose-300' : 'bg-rose-950/20 border-rose-500/30'
          : isNearbyThreat
          ? isLight ? 'bg-amber-50 border-amber-300' : 'bg-amber-950/20 border-amber-500/30'
          : isLight ? 'bg-white border-slate-200' : 'bg-white/[0.03] border-white/[0.06]'
      }`}
    >
      {/* Left: Location details & Nearest threat analysis */}
      <div className="flex items-start space-x-3 min-w-0">
        <div 
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
            isDirectThreat
              ? 'bg-rose-500/20 text-rose-400'
              : isNearbyThreat
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-white/[0.06] text-slate-300'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-semibold text-xs text-slate-200 flex items-center space-x-1">
              <span>Location:</span>
              <span className="text-white font-bold">{userLocation.city || `${userLocation.lat.toFixed(3)}°N, ${userLocation.lng.toFixed(3)}°E`}</span>
            </span>

            {/* Minimalist status tag */}
            <span className="text-[10px] font-mono flex items-center space-x-1 text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isDirectThreat ? 'bg-rose-400' : isNearbyThreat ? 'bg-amber-400' : 'bg-emerald-400'} inline-block`} />
              <span>
                {isDirectThreat 
                  ? 'Severe Convection (<45 km)' 
                  : isNearbyThreat 
                  ? 'Active Cell in Range' 
                  : 'Stable Atmosphere'}
              </span>
            </span>
          </div>

          {/* Proximity telemetry line */}
          <div className="text-[11px] font-mono text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {nearestStorm && nearestStorm.distanceKm <= 450 ? (
              <span className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>
                  Closest Storm: <b className="text-slate-200">{nearestStorm.cell.id}</b> ({nearestStorm.distanceKm} km • {nearestStorm.cell.reflectivityDbz} dBZ)
                </span>
              </span>
            ) : (
              <span className="text-slate-300 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>No active storm cells within 450 km of sector.</span>
              </span>
            )}

            {nearestRadar && (
              <span className="text-slate-500 hidden sm:inline">
                • Radar: <b className="text-slate-300">{nearestRadar.radar.name}</b> ({nearestRadar.distanceKm} km)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions & Local/All-India Scope Switcher */}
      <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
        {onToggleFilterScope && (
          <div className="tactile-segmented-track p-0.5 rounded-lg text-[11px] font-mono">
            <button
              onClick={() => onToggleFilterScope('LOCAL')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filterScope === 'LOCAL'
                  ? 'bg-white/[0.12] text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Local ({localNearbyStorms.length})
            </button>
            <button
              onClick={() => onToggleFilterScope('ALL_INDIA')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                filterScope === 'ALL_INDIA'
                  ? 'bg-white/[0.12] text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All India ({stormCells.length})
            </button>
          </div>
        )}

        {nearestStorm && nearestStorm.distanceKm <= 450 && onSelectCell && (
          <button
            onClick={() => onSelectCell(nearestStorm.cell)}
            className="tactile-btn px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1"
          >
            <span>Inspect Cell</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        )}

        <button
          onClick={() => onFlyToLocation(userLocation.lat, userLocation.lng)}
          className="tactile-btn-primary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5"
          title="Center and zoom map on your coordinates"
        >
          <Navigation className="w-3 h-3" />
          <span>Fly to GPS</span>
        </button>
      </div>
    </div>
  );
};
