import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Wind, 
  CloudRain, 
  Zap, 
  Activity, 
  MapPin, 
  Flame, 
  TrendingUp, 
  Layers, 
  ChevronRight,
  Info 
} from 'lucide-react';
import { WeatherMap } from '../components/Map/WeatherMap';
import { 
  StormCell, 
  RadarStation, 
  AirportStation, 
  LightningStrike, 
  GridForecastPoint, 
  TimelineStep 
} from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface HazardsViewProps {
  stormCells: StormCell[];
  radarStations: RadarStation[];
  airports: AirportStation[];
  lightningStrikes: LightningStrike[];
  nowcastGrid: GridForecastPoint[];
  timelineStep: TimelineStep;
  selectedCell: StormCell | null;
  userLocation?: { lat: number; lng: number; city?: string; accuracy?: number } | null;
  onRequestLocation?: () => void;
  onFlyToLocation?: (lat: number, lng: number) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  onSelectCell: (cell: StormCell) => void;
  onSelectRadar: (radar: RadarStation) => void;
  onSelectAirport: (airport: AirportStation) => void;
  onOpenInfo?: (infoId: string) => void;
}

export const HazardsView: React.FC<HazardsViewProps> = ({
  stormCells,
  radarStations,
  airports,
  lightningStrikes,
  nowcastGrid,
  timelineStep,
  selectedCell,
  userLocation,
  onRequestLocation,
  onFlyToLocation,
  flyToCoords,
  onSelectCell,
  onSelectRadar,
  onSelectAirport,
  onOpenInfo
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeHazardTab, setActiveHazardTab] = useState<
    'CLOUDBURST' | 'HAIL' | 'DOWNBURST' | 'LIGHTNING' | 'THUNDERSTORM'
  >('CLOUDBURST');

  const hazardTabs = [
    { id: 'CLOUDBURST', label: 'Cloudburst Risk', infoKey: 'HAZARD_CLOUDBURST' },
    { id: 'HAIL', label: 'Severe Hail Risk', infoKey: 'HAZARD_HAIL' },
    { id: 'DOWNBURST', label: 'Downburst / Wind', infoKey: 'HAZARD_DOWNBURST' },
    { id: 'LIGHTNING', label: 'Lightning Activity', infoKey: 'LIGHTNING_CG' },
    { id: 'THUNDERSTORM', label: 'Thunderstorm Matrix', infoKey: 'AI_CONVLSTM' }
  ];

  return (
    <div className="p-2.5 sm:p-3 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs bg-transparent text-zinc-100 min-h-full">
      {/* Top Hazard Summary Header */}
      <div className="p-3.5 rounded-2xl ios-glass-card flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Convective Hazard Assessment & Impact Matrix
              </h2>
              {onOpenInfo && <InfoButton infoId={`HAZARD_${activeHazardTab}`} onOpenInfo={onOpenInfo} size="xs" />}
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400">
              Multi-Hazard 1.5 km Risk Scoring & District Vulnerability Analysis
            </p>
          </div>
        </div>

        {/* Hazard Selector */}
        <div className="flex items-center rounded-xl p-1 space-x-1 border border-white/[0.08] bg-[#121316]/90">
          {hazardTabs.map((h) => (
            <button
              key={h.id}
              onClick={() => setActiveHazardTab(h.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeHazardTab === h.id
                  ? 'bg-amber-400 text-zinc-950 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
              }`}
            >
              <span>{h.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left: GIS Map with Selected Hazard Layer (8 cols) */}
        <div className="xl:col-span-8 space-y-2.5">
          <div className="h-[580px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08]">
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
              activeLayer={
                activeHazardTab === 'CLOUDBURST'
                  ? 'PROB_CLOUDBURST'
                  : activeHazardTab === 'HAIL'
                  ? 'PROB_HAIL'
                  : activeHazardTab === 'DOWNBURST'
                  ? 'PROB_DOWNBURST'
                  : activeHazardTab === 'LIGHTNING'
                  ? 'LIGHTNING_DENSITY'
                  : 'PROB_THUNDERSTORM'
              }
            />
          </div>
        </div>

        {/* Right: District Vulnerability Index & Severe Threat Corridors (4 cols) */}
        <div className="xl:col-span-4 space-y-3">
          <div className="p-4 rounded-2xl ios-glass-card space-y-3 shadow-sm border border-white/[0.08]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-white">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Critical District Vulnerability</span>
              </h3>
              <span className="text-rose-400 font-bold text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30">
                HIGH THREAT
              </span>
            </div>

            <div className="space-y-2 text-[11px] max-h-[510px] overflow-y-auto pr-1 scrollbar-thin">
              {[
                { district: 'Kolkata Urban (WB)', pop: '14.9M', score: 96, hazard: 'Cloudburst & 96 km/h Squall' },
                { district: 'Kamrup Metro (Assam)', pop: '1.2M', score: 94, hazard: 'Flash Cloudburst & Deluge' },
                { district: 'New Delhi & Gurugram (NCR)', pop: '32.9M', score: 91, hazard: 'Microburst & Dust Storm' },
                { district: 'Bengaluru South (KA)', pop: '13.2M', score: 89, hazard: 'Damaging Large Hail (3.2cm)' },
                { district: 'Siliguri & Jalpaiguri (WB)', pop: '2.1M', score: 93, hazard: 'Teesta Basin Flash Runoff' }
              ].map((d, i) => (
                <div 
                  key={i} 
                  className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all space-y-1"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-white">{d.district}</span>
                    <span className="text-rose-400 font-bold font-mono">Score: {d.score}/100</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Exposure: {d.pop}</span>
                    <span className="text-amber-400 font-medium">{d.hazard}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
