import React from 'react';
import { 
  Plane, 
  Wind, 
  AlertTriangle, 
  ShieldAlert, 
  Eye, 
  Compass, 
  Activity, 
  CloudRain,
  Zap,
  Info 
} from 'lucide-react';
import { WeatherMap } from '../components/Map/WeatherMap';
import { 
  AirportStation, 
  StormCell, 
  RadarStation, 
  LightningStrike, 
  GridForecastPoint, 
  TimelineStep 
} from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface AviationViewProps {
  airports: AirportStation[];
  stormCells: StormCell[];
  radarStations: RadarStation[];
  lightningStrikes: LightningStrike[];
  nowcastGrid: GridForecastPoint[];
  timelineStep: TimelineStep;
  selectedCell: StormCell | null;
  userLocation?: { lat: number; lng: number; city?: string; accuracy?: number } | null;
  onRequestLocation?: () => void;
  onFlyToLocation?: (lat: number, lng: number) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  onSelectCell: (cell: StormCell) => void;
  onSelectAirport: (airport: AirportStation) => void;
  onSelectRadar: (radar: RadarStation) => void;
  onOpenInfo?: (infoId: string) => void;
}

export const AviationView: React.FC<AviationViewProps> = ({
  airports,
  stormCells,
  radarStations,
  lightningStrikes,
  nowcastGrid,
  timelineStep,
  selectedCell,
  userLocation,
  onRequestLocation,
  onFlyToLocation,
  flyToCoords,
  onSelectCell,
  onSelectAirport,
  onSelectRadar,
  onOpenInfo
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="p-2.5 sm:p-3 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs bg-transparent text-zinc-100 min-h-full">
      {/* Top Banner */}
      <div className="p-3.5 rounded-2xl ios-glass-card flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Plane className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Aviation Weather Operations & Aerodrome Warning Console
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AIRPORT CONVECTIVE HAZARD MODE
              </span>
              {onOpenInfo && <InfoButton infoId="AVIATION_FLIGHT_CAT" onOpenInfo={onOpenInfo} size="xs" />}
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400">
              Runway microburst wind-shear, lightning radius warnings & terminal approach corridor interception
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#121316]/90">
          <span className="text-zinc-400">Runway Warnings:</span>
          <span className="text-rose-400 font-bold font-mono">2 Airports at Ground Stop / Warning</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left: GIS Map with Airports (7 cols) */}
        <div className="xl:col-span-7 space-y-2.5">
          <div className="h-[340px] sm:h-[460px] lg:h-[580px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08]">
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
              onSelectCell={onSelectCell}
              onSelectRadar={onSelectRadar}
              onSelectAirport={onSelectAirport}
              onOpenInfo={onOpenInfo}
              activeLayer="PROB_DOWNBURST"
            />
          </div>
        </div>

        {/* Right: Airports METAR & Runway Threat Matrix (5 cols) */}
        <div className="xl:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl ios-glass-card space-y-3 shadow-sm border border-white/[0.08]">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06] pb-3 text-white">
              <span className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-emerald-400" />
                <span>Major Indian Aerodromes Status</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 font-mono">{airports.length} Monitored</span>
            </h3>

            <div className="space-y-2 max-h-[360px] sm:max-h-[510px] overflow-y-auto pr-1 scrollbar-thin">
              {airports.map((apt) => {
                const isCritical = apt.convectiveThreat === 'CRITICAL';
                const isSevere = apt.convectiveThreat === 'SEVERE';

                return (
                  <div
                    key={apt.code}
                    onClick={() => onSelectAirport(apt)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : isSevere
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full text-white ${
                              isCritical ? 'bg-rose-600' : isSevere ? 'bg-amber-600' : 'bg-emerald-600'
                            }`}
                          >
                            {apt.flightCategory}
                          </span>
                          <span className="text-sm font-bold text-white font-mono">{apt.code}</span>
                          <span className="text-zinc-500 text-[11px] font-mono">({apt.icao})</span>
                        </div>
                        <h4 className="text-xs font-semibold mt-1 text-zinc-200 font-sans">{apt.name}</h4>
                        <div className="text-[10px] text-zinc-400 font-sans">{apt.city}, {apt.state}</div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                            apt.runwayStatus === 'GROUND_STOP'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                              : apt.runwayStatus === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {apt.runwayStatus.replace('_', ' ')}
                        </span>
                        <div className="text-[10px] mt-1 text-zinc-400">
                          Vis: <b className="text-white font-mono">{apt.visibilityKm} km</b>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-[10px] font-mono text-zinc-300">
                      <span className="text-emerald-400 font-bold">METAR:</span> {apt.metarSummary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
