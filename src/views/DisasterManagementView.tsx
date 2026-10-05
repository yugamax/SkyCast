import React from 'react';
import { 
  ShieldAlert, 
  Users, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  PhoneCall, 
  Activity, 
  CheckCircle2,
  Info 
} from 'lucide-react';
import { WeatherMap } from '../components/Map/WeatherMap';
import { 
  StormCell, 
  RadarStation, 
  AirportStation, 
  LightningStrike, 
  GridForecastPoint, 
  TimelineStep, 
  AlertItem 
} from '../types/weather';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface DisasterManagementViewProps {
  stormCells: StormCell[];
  radarStations: RadarStation[];
  airports: AirportStation[];
  lightningStrikes: LightningStrike[];
  nowcastGrid: GridForecastPoint[];
  alerts: AlertItem[];
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

export const DisasterManagementView: React.FC<DisasterManagementViewProps> = ({
  stormCells,
  radarStations,
  airports,
  lightningStrikes,
  nowcastGrid,
  alerts,
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

  return (
    <div className="p-2.5 sm:p-3 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs bg-transparent text-zinc-100 min-h-full">
      {/* Top Banner */}
      <div className="p-3.5 rounded-2xl ios-glass-card flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                NDMA & State Disaster Response (SDRF) Command Terminal
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                CIVIL DEFENSE OPS
              </span>
              {onOpenInfo && <InfoButton infoId="HAZARD_CLOUDBURST" onOpenInfo={onOpenInfo} size="xs" />}
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400">
              Real-time population exposure assessment, shelter locations, and evacuation corridor management
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all shadow-md bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Civil Defense PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left: GIS Map with Severe Cloudburst & Downburst Corridors (7 cols) */}
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
              activeLayer="PROB_CLOUDBURST"
            />
          </div>
        </div>

        {/* Right: Population Exposure & Vulnerable Infrastructure (5 cols) */}
        <div className="xl:col-span-5 space-y-3">
          {/* Population Exposure Breakdown */}
          <div className="p-4 rounded-2xl ios-glass-card space-y-3 shadow-sm border border-white/[0.08]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-white">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Immediate Population at High Risk</span>
              </h3>
              <span className="text-rose-400 text-[10px] font-bold font-mono">TOTAL: ~49.8M</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-3 rounded-xl border border-rose-500/25 bg-rose-950/15 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-white font-sans">Kolkata & Howrah Urban Basin</span>
                  <span className="text-rose-400 font-mono">14.9M Exposed (ETA: 24m)</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-sans">
                  Critical Cloudburst & 96 km/h squall. Activate 18 high-capacity municipal pumping stations.
                </div>
              </div>

              <div className="p-3 rounded-xl border border-amber-500/25 bg-amber-950/15 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-white font-sans">New Delhi & NCR Expressway Corridor</span>
                  <span className="text-amber-400 font-mono">32.9M Exposed (ETA: 36m)</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-sans">
                  Severe Downburst & tree fall danger along major expressways.
                </div>
              </div>

              <div className="p-3 rounded-xl border border-rose-500/25 bg-rose-950/15 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-white font-sans">Guwahati & Kamrup Valley</span>
                  <span className="text-rose-400 font-mono">1.2M Exposed (ETA: 18m)</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-sans">
                  Orographic flash flood risk in low-lying residential wards.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reaction Teams & Emergency Lines */}
          <div className="p-4 rounded-2xl ios-glass-card space-y-3 shadow-sm border border-white/[0.08]">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-2 text-white">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>SDRF Battalions & Shelter Readiness</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <span className="text-zinc-400 font-semibold">NDRF 2nd Bn (Kolkata):</span>
                <div className="text-emerald-400 font-bold mt-0.5 font-mono">READY (4 Teams Staged)</div>
              </div>
              <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <span className="text-zinc-400 font-semibold">SDRF Assam (Guwahati):</span>
                <div className="text-emerald-400 font-bold mt-0.5 font-mono">ALERT (Inflatable Boats)</div>
              </div>
              <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <span className="text-zinc-400 font-semibold">Delhi Fire & Police:</span>
                <div className="text-emerald-400 font-bold mt-0.5 font-mono">HIGH SQUALL VIGIL</div>
              </div>
              <div className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <span className="text-zinc-400 font-semibold">Flood Shelter Capacity:</span>
                <div className="text-zinc-200 font-bold mt-0.5 font-mono">240 Shelters Prepared</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
