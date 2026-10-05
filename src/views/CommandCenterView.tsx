import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Wind, 
  Clock, 
  Radio,
  MapPin,
  Droplets,
  Gauge,
  Flame,
  LocateFixed
} from 'lucide-react';
import { WeatherMap } from '../components/Map/WeatherMap';
import { HourlyScrubRibbon, HourlyForecastPoint } from '../components/Editorial/HourlyScrubRibbon';
import { AnimatedCounter } from '../components/Common/AnimatedCounter';
import { 
  StormCell, 
  RadarStation, 
  AirportStation, 
  LightningStrike, 
  GridForecastPoint, 
  TimelineStep, 
  AlertItem 
} from '../types/weather';
import { UserLocationData, LocationPermissionState, calculateDistanceKm } from '../components/Common/NearbyFindingsBanner';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';
import { LiveWeatherData } from '../services/liveWeatherService';

interface CommandCenterViewProps {
  stormCells: StormCell[];
  radarStations: RadarStation[];
  airports: AirportStation[];
  lightningStrikes: LightningStrike[];
  nowcastGrid: GridForecastPoint[];
  alerts: AlertItem[];
  timelineStep: TimelineStep;
  selectedCell: StormCell | null;
  userLocation?: UserLocationData | null;
  liveWeather?: LiveWeatherData | null;
  isLoadingLocation?: boolean;
  locationStatus?: LocationPermissionState;
  filterScope?: 'LOCAL' | 'ALL_INDIA';
  onToggleFilterScope?: (scope: 'LOCAL' | 'ALL_INDIA') => void;
  onRequestLocation?: () => void;
  onFlyToLocation?: (lat: number, lng: number) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  onSelectCell: (cell: StormCell) => void;
  onOpenCellDetails: (cell: StormCell) => void;
  onSelectRadar: (radar: RadarStation) => void;
  onSelectAirport: (airport: AirportStation) => void;
  onOpenInfo?: (infoId: string) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  stormCells,
  radarStations,
  airports,
  lightningStrikes,
  nowcastGrid,
  alerts,
  timelineStep,
  selectedCell,
  userLocation,
  liveWeather,
  isLoadingLocation = false,
  locationStatus = 'IDLE',
  filterScope = 'LOCAL',
  onToggleFilterScope,
  onRequestLocation,
  onFlyToLocation,
  flyToCoords,
  onSelectCell,
  onOpenCellDetails,
  onSelectRadar,
  onSelectAirport,
  onOpenInfo
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Synchronized scrubbing state from the bottom 24-hour timeline
  const [scrubbedPoint, setScrubbedPoint] = useState<HourlyForecastPoint | null>(null);

  // Compute distances to user location
  const isLocalActive = filterScope === 'LOCAL' && !!userLocation;

  const stormCellsWithDistance = useMemo(() => {
    if (!userLocation) {
      return stormCells.map(c => ({ ...c, distanceKm: undefined as number | undefined }));
    }
    return stormCells.map(cell => ({
      ...cell,
      distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, cell.lat, cell.lng)
    })).sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }, [stormCells, userLocation]);

  const localNearbyCells = useMemo(() => {
    if (!userLocation) return [];
    return stormCellsWithDistance.filter(c => (c.distanceKm ?? 9999) <= 450);
  }, [stormCellsWithDistance, userLocation]);

  const displayedStormCells = isLocalActive ? localNearbyCells : stormCellsWithDistance;

  // Find most severe cell
  const mostSevereCell = useMemo(() => {
    if (isLocalActive) {
      return localNearbyCells[0] || null;
    }
    return stormCells.find(c => c.severity === 'CRITICAL') || stormCells[0] || null;
  }, [isLocalActive, localNearbyCells, stormCells]);

  // Synchronized scrubber callback
  const handleScrubHour = (point: HourlyForecastPoint) => {
    if (point.hourIndex === 0) {
      setScrubbedPoint(null);
    } else {
      setScrubbedPoint(point);
    }
  };

  // Telemetry computation (derived dynamically from live weather or scrubbed forecast point)
  const isScrubbed = scrubbedPoint !== null;
  const currentHourIndex = scrubbedPoint?.hourIndex ?? 0;
  
  const currentTemp = scrubbedPoint ? scrubbedPoint.temp : (liveWeather ? liveWeather.temperature : 29);
  const currentFeelsLike = scrubbedPoint ? scrubbedPoint.feelsLike : (liveWeather ? liveWeather.feelsLike : 33);
  const currentPhrase = scrubbedPoint 
    ? scrubbedPoint.conditionPhrase 
    : (liveWeather ? liveWeather.conditionPhrase : (mostSevereCell 
      ? `Elevated precipitation bands with gust front • Active convection advancing ${mostSevereCell.directionText}`
      : 'Atmospheric moisture convergence along coastal trough • Barometric gradient steady at 1008.4 hPa'));

  // Dynamic Bento values
  const currentWindSpeed = scrubbedPoint 
    ? scrubbedPoint.windSpeed 
    : (liveWeather ? liveWeather.windSpeed : (mostSevereCell ? mostSevereCell.speedKmh : 24));
  const currentWindDir = scrubbedPoint ? scrubbedPoint.windDir : (liveWeather ? liveWeather.windDirectionText : (mostSevereCell ? mostSevereCell.directionText : 'SW'));

  const currentCape = scrubbedPoint 
    ? Math.round(1800 + Math.sin((currentHourIndex + 4) * 0.5) * 1400)
    : (liveWeather ? liveWeather.capeJouleKg : (mostSevereCell?.capeJouleKg || 3200));

  const currentHumidity = scrubbedPoint 
    ? Math.min(95, Math.max(50, 78 + (scrubbedPoint.pop > 50 ? 12 : -6)))
    : (liveWeather ? liveWeather.humidity : 78);

  const currentPressure = scrubbedPoint 
    ? Number((1012 - (scrubbedPoint.pop > 60 ? 7.8 : 3.2)).toFixed(1))
    : (liveWeather ? liveWeather.pressure : 1004.2);

  // Radar timestamp label passed to WeatherMap HUD
  const forecastTimeLabel = isScrubbed
    ? `+${currentHourIndex}h FORECAST (${scrubbedPoint.timeLabel} IST)`
    : '● LIVE DOPPLER RADAR';

  return (
    <div className="min-h-full flex flex-col justify-between p-2.5 sm:p-3 gap-2.5 max-w-[1920px] mx-auto select-none font-sans text-zinc-100 bg-transparent">
      
      {/* 1. TOP STRIP: Slim, Single-Line Threat Alert Banner */}
      <div 
        className={`w-full px-3 py-1.5 rounded-xl ios-glass-card flex items-center justify-between gap-2 shrink-0 text-xs font-mono border border-white/[0.08] ${
          mostSevereCell?.severity === 'CRITICAL'
            ? isLight
              ? 'bg-rose-50/90 border-rose-300 text-rose-950'
              : 'bg-rose-950/25 border-rose-500/30 text-white'
            : isLight
            ? 'bg-white/80 border-slate-200 text-slate-800'
            : 'bg-[#121316]/75 border-white/[0.08] text-zinc-200'
        }`}
      >
        {/* Left: Alert Tag & Kinematics */}
        <div className="flex items-center space-x-2 min-w-0 flex-1 truncate">
          <div className={`p-1 rounded-md flex items-center justify-center shrink-0 ${
            mostSevereCell?.severity === 'CRITICAL'
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>

          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
            mostSevereCell?.severity === 'CRITICAL'
              ? 'bg-rose-500 text-white'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {mostSevereCell ? `${mostSevereCell.severity} THREAT` : 'NORMAL'}
          </span>

          {mostSevereCell ? (
            <div className="flex items-center space-x-1.5 truncate text-[11px] min-w-0">
              <span className="font-semibold text-white truncate">
                Target: <b className="text-rose-400">{mostSevereCell.targetLocation}</b>
              </span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-400 hidden md:inline">
                Heading: <b className="text-zinc-200">{mostSevereCell.speedKmh} km/h {mostSevereCell.directionText}</b>
              </span>
              <span className="text-zinc-600 hidden lg:inline">•</span>
              <span className="text-zinc-400 hidden lg:inline">
                Core: <b className="text-amber-400">{mostSevereCell.reflectivityDbz} dBZ</b>
              </span>
            </div>
          ) : (
            <span className="text-zinc-400 text-[11px] truncate">
              National Radar Network Active • All Civil Air Sectors Operational
            </span>
          )}
        </div>

        {/* Right: ETA & Quick Action Button */}
        <div className="flex items-center space-x-2 shrink-0">
          {mostSevereCell && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-[10px]">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>ETA {mostSevereCell.etaMinutes}m</span>
            </div>
          )}

          {mostSevereCell && (
            <button
              onClick={() => onSelectCell(mostSevereCell)}
              className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-white text-[10px] font-medium transition-all hidden sm:inline-block cursor-pointer"
            >
              Focus
            </button>
          )}

          {userLocation && onToggleFilterScope && (
            <button
              onClick={() => onToggleFilterScope(isLocalActive ? 'ALL_INDIA' : 'LOCAL')}
              className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] font-medium text-zinc-300 transition-all cursor-pointer"
            >
              {isLocalActive ? 'All India' : `Sector (${userLocation.city || 'Local'})`}
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN COCKPIT: Split View (Map / Telemetry Stack) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        
        {/* LEFT COLUMN (50%–55% desktop width): Prominent Balanced Map Viewport */}
        <div className="lg:col-span-7 xl:col-span-6 min-h-[380px] lg:min-h-[440px] h-[400px] lg:h-full rounded-2xl overflow-hidden relative border border-white/[0.08]">
          <WeatherMap
            stormCells={stormCells}
            radarStations={radarStations}
            airports={airports}
            lightningStrikes={lightningStrikes}
            nowcastGrid={nowcastGrid}
            timelineStep={timelineStep}
            selectedCell={selectedCell}
            userLocation={userLocation}
            onRequestLocation={onRequestLocation}
            onFlyToLocation={onFlyToLocation}
            flyToCoords={flyToCoords}
            forecastTimeLabel={forecastTimeLabel}
            onSelectCell={onSelectCell}
            onSelectRadar={onSelectRadar}
            onSelectAirport={onSelectAirport}
            onOpenInfo={onOpenInfo}
          />
        </div>

        {/* RIGHT COLUMN (45%–50% desktop width): Full Weather Telemetry Stack */}
        <div className="lg:col-span-5 xl:col-span-6 flex flex-col justify-between gap-2 min-h-0">
          
          {/* A. Hero Tile: Large primary temperature, feels like, phrase, H/L ranges */}
          <div className="p-3 sm:p-3.5 ios-glass-card shrink-0 space-y-2">
            {/* Header: GPS Location Badge & Live Status */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400 font-semibold">
                  <span className={`w-1.5 h-1.5 rounded-full ${isScrubbed ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                  <span>{isScrubbed ? `T+${currentHourIndex}h FORECAST` : 'LIVE TELEMETRY'}</span>
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-[10px] font-mono text-zinc-500">1.5 km Sounding Mesh</span>
              </div>

              {/* Location Badge */}
              <div className="flex items-center space-x-1 font-mono text-xs">
                {userLocation ? (
                  <button
                    onClick={() => onFlyToLocation ? onFlyToLocation(userLocation.lat, userLocation.lng) : onRequestLocation?.()}
                    className="flex items-center space-x-1 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2 py-0.5 rounded-md border border-white/[0.06] text-[10px] cursor-pointer transition-all"
                    title="Click to zoom map to my location"
                  >
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span className="font-semibold text-white">{userLocation.city || 'My Coordinates'}</span>
                  </button>
                ) : (
                  <button
                    onClick={onRequestLocation}
                    disabled={isLoadingLocation}
                    className="flex items-center space-x-1 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 transition-all text-[10px] font-mono cursor-pointer"
                  >
                    <LocateFixed className="w-3 h-3" />
                    <span>{isLoadingLocation ? 'Locating...' : 'Detect GPS'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Core Hero Temperature & Condition */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-white">
                    <AnimatedCounter value={currentTemp} />°
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-400">C</span>
                </div>
                
                <p className="text-xs font-medium text-zinc-300 mt-0.5 leading-relaxed line-clamp-2">
                  {currentPhrase}
                </p>
              </div>

              {/* Thermal Breakdown Micro-Tile */}
              <div className="text-right font-mono text-xs space-y-0.5 bg-white/[0.02] p-2 rounded-xl border border-white/[0.04] shrink-0">
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Feels Like</div>
                <div className="text-sm font-bold text-white">
                  <AnimatedCounter value={currentFeelsLike} />°C
                </div>
                <div className="text-[9px] text-zinc-500 pt-0.5 border-t border-white/[0.04]">
                  H: <b className="text-zinc-200">{currentTemp + 3}°</b> • L: <b className="text-zinc-200">{currentTemp - 4}°</b>
                </div>
              </div>
            </div>
          </div>

          {/* B. Bento Telemetry Grid: 4 distinct cards for Wind, CAPE, Humidity, Barometer */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            {/* Tile 1: Wind Velocity */}
            <div className="p-2.5 ios-glass-card space-y-0.5">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="flex items-center space-x-1 font-medium uppercase text-[9px] tracking-wider text-zinc-400">
                  <Wind className="w-3 h-3 text-emerald-400" />
                  <span>Wind Velocity</span>
                </span>
                <span className="font-mono text-[9px] text-emerald-400 font-semibold">{currentWindDir}</span>
              </div>
              <div className="text-xl font-black font-mono text-white tracking-tight">
                <AnimatedCounter value={currentWindSpeed} /> <span className="text-[10px] text-zinc-500 font-normal">km/h</span>
              </div>
              <div className="text-[9px] font-mono text-zinc-500">
                Gusts: <b className="text-zinc-300">{Math.round(currentWindSpeed * 1.45)} km/h</b>
              </div>
            </div>

            {/* Tile 2: CAPE Energy */}
            <div className="p-2.5 ios-glass-card space-y-0.5">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="flex items-center space-x-1 font-medium uppercase text-[9px] tracking-wider text-zinc-400">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>CAPE Energy</span>
                </span>
                {onOpenInfo && <InfoButton infoId="SOUNDING_CAPE" onOpenInfo={onOpenInfo} size="xs" />}
              </div>
              <div className="text-xl font-black font-mono text-white tracking-tight">
                <AnimatedCounter value={currentCape} /> <span className="text-[10px] text-zinc-500 font-normal">J/kg</span>
              </div>
              <div className="text-[9px] font-mono text-amber-400 font-medium">
                {currentCape > 2500 ? 'Extreme Instability' : 'Moderate Lift'}
              </div>
            </div>

            {/* Tile 3: Relative Humidity */}
            <div className="p-2.5 ios-glass-card space-y-0.5">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="flex items-center space-x-1 font-medium uppercase text-[9px] tracking-wider text-zinc-400">
                  <Droplets className="w-3 h-3 text-zinc-300" />
                  <span>Humidity</span>
                </span>
                <span className="font-mono text-[9px] text-zinc-400 font-semibold">Dew {Math.round(currentTemp - (100 - currentHumidity) / 5)}°</span>
              </div>
              <div className="text-xl font-black font-mono text-white tracking-tight">
                <AnimatedCounter value={currentHumidity} />%
              </div>
              <div className="text-[9px] font-mono text-zinc-500">
                Boundary: <b className="text-zinc-300">{currentHumidity > 75 ? 'Saturated' : 'Nominal'}</b>
              </div>
            </div>

            {/* Tile 4: Barometric Pressure */}
            <div className="p-2.5 ios-glass-card space-y-0.5">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span className="flex items-center space-x-1 font-medium uppercase text-[9px] tracking-wider text-zinc-400">
                  <Gauge className="w-3 h-3 text-zinc-300" />
                  <span>Barometer</span>
                </span>
                <span className="font-mono text-[9px] text-rose-400 font-semibold">Falling</span>
              </div>
              <div className="text-xl font-black font-mono text-white tracking-tight">
                <AnimatedCounter value={currentPressure} decimals={1} /> <span className="text-[10px] text-zinc-500 font-normal">hPa</span>
              </div>
              <div className="text-[9px] font-mono text-zinc-500">
                Gradient: <b className="text-zinc-300">-2.4 hPa/hr</b>
              </div>
            </div>
          </div>

          {/* C. Bottom Threat Matrix: Sector threat cards (active storm cells, distance, ETA) */}
          <div className="p-3 ios-glass-card flex-1 min-h-[140px] max-h-[220px] flex flex-col space-y-1.5 overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 shrink-0">
              <h3 className="font-semibold text-[11px] uppercase tracking-wider flex items-center space-x-1.5 text-zinc-300 font-mono">
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>{isLocalActive ? `Sector Threats (${userLocation?.city || 'Local'})` : 'Active Convective Threats'}</span>
              </h3>
              
              <div className="flex items-center space-x-2 font-mono text-[9px]">
                <span className="text-zinc-400 px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06]">
                  {displayedStormCells.length} Tracked
                </span>
              </div>
            </div>

            {/* Scrollable Storm Cells List */}
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
              {displayedStormCells.length === 0 ? (
                <div className="p-3 rounded-lg border border-white/[0.04] text-center space-y-1 bg-white/[0.01]">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                  <div className="text-xs font-semibold text-white">No Active Storms in Sector</div>
                  <p className="text-[9px] text-zinc-500">
                    Atmospheric soundings indicate convective stability.
                  </p>
                </div>
              ) : (
                displayedStormCells.map((cell) => {
                  const isCritical = cell.severity === 'CRITICAL';
                  const isSevere = cell.severity === 'SEVERE';
                  const isSelected = selectedCell?.id === cell.id;

                  return (
                    <div
                      key={cell.id}
                      onClick={() => onSelectCell(cell)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer space-y-1 font-mono ${
                        isSelected
                          ? 'bg-white/[0.1] border-emerald-400 shadow-md ring-1 ring-emerald-400/30'
                          : isCritical
                          ? 'bg-rose-950/20 border-rose-500/25 hover:bg-rose-950/30'
                          : isSevere
                          ? 'bg-amber-950/20 border-amber-500/25 hover:bg-amber-950/30'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                      }`}
                    >
                      {/* Top: Severity Badge, ID, Target & ETA */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1">
                            <span
                              className={`text-[7px] font-bold uppercase px-1 py-0.2 rounded shrink-0 ${
                                isCritical 
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                                  : isSevere 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {cell.severity}
                            </span>
                            <span className="font-bold text-xs text-white">{cell.id}</span>
                            <span className="text-[9px] text-zinc-500 truncate">• {cell.speedKmh} km/h</span>
                          </div>
                          
                          <div className="text-[11px] font-medium mt-0.5 text-zinc-200 truncate font-sans">
                            {cell.targetLocation}
                          </div>
                          
                          {cell.distanceKm !== undefined && (
                            <div className="text-[9px] text-zinc-500">
                              📍 {cell.distanceKm} km from {userLocation?.city || 'you'}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-rose-300 font-bold text-[11px] flex items-center justify-end space-x-1">
                            <Clock className="w-2.5 h-2.5 text-rose-400" />
                            <span>ETA {cell.etaMinutes}m</span>
                          </div>
                          <div className="text-[9px] text-zinc-400 mt-0.5">
                            {cell.reflectivityDbz} dBZ Core
                          </div>
                        </div>
                      </div>

                      {/* Micro Hazard Breakdown Progress Bars */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[7px] pt-1 border-t border-white/[0.04]">
                        <div>
                          <div className="flex justify-between text-zinc-500 mb-0.5">
                            <span>LTG</span>
                            <span className="text-emerald-400">{cell.probLightning}%</span>
                          </div>
                          <div className="w-full bg-white/[0.06] rounded-full h-0.5 overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${cell.probLightning}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-zinc-500 mb-0.5">
                            <span>HAIL</span>
                            <span className="text-zinc-300">{cell.probHail}%</span>
                          </div>
                          <div className="w-full bg-white/[0.06] rounded-full h-0.5 overflow-hidden">
                            <div className="bg-zinc-300 h-full rounded-full" style={{ width: `${cell.probHail}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-zinc-500 mb-0.5">
                            <span>WIND</span>
                            <span className="text-amber-400">{cell.probDownburst}%</span>
                          </div>
                          <div className="w-full bg-white/[0.06] rounded-full h-0.5 overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${cell.probDownburst}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-zinc-500 mb-0.5">
                            <span>BURST</span>
                            <span className="text-rose-400">{cell.probCloudburst}%</span>
                          </div>
                          <div className="w-full bg-white/[0.06] rounded-full h-0.5 overflow-hidden">
                            <div className="bg-rose-400 h-full rounded-full" style={{ width: `${cell.probCloudburst}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM FOOTER (100% full width): Pinned 24-hour Nowcast scrub ribbon */}
      <div className="w-full shrink-0">
        <HourlyScrubRibbon
          onScrubHour={handleScrubHour}
          baseTemp={liveWeather?.temperature || 29}
          isSevere={stormCells.some(c => c.severity === 'CRITICAL')}
          customHourlyData={liveWeather?.hourlyForecast}
        />
      </div>
    </div>
  );
};
