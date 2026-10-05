import React from 'react';
import { 
  Sprout, 
  CloudRain, 
  Wind, 
  ShieldAlert, 
  MapPin, 
  Activity, 
  AlertTriangle,
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

interface AgricultureViewProps {
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
  onSelectAirport: (airport: AirportStation) => void;
  onSelectRadar: (radar: RadarStation) => void;
  onOpenInfo?: (infoId: string) => void;
}

export const AgricultureView: React.FC<AgricultureViewProps> = ({
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
            <Sprout className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Agro-Meteorological Nowcast & Crop Protection Warning Center
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                KVK & ICAR ADVISORY NETWORK
              </span>
              {onOpenInfo && <InfoButton infoId="HAZARD_HAIL" onOpenInfo={onOpenInfo} size="xs" />}
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400">
              High-resolution convective hail, flash waterlogging, and high-velocity wind lodging damage forecasts
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] px-3 py-2 rounded-xl border border-white/[0.08] bg-[#121316]/90">
          <span className="text-zinc-400">Zones at Risk:</span>
          <span className="text-amber-400 font-bold font-mono">4 Major Crop Belts</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left: GIS Map with Hail & Heavy Rain (7 cols) */}
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
              activeLayer="PROB_HAIL"
            />
          </div>
        </div>

        {/* Right: Agricultural Advisories & Crop Stage Vulnerability (5 cols) */}
        <div className="xl:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl ios-glass-card space-y-3 shadow-sm border border-white/[0.08]">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-white">
              <span className="flex items-center space-x-1.5">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>Crop Belts Vulnerability & Urgent Directives</span>
              </span>
              <span className="text-amber-400 text-[10px] font-bold">CURRENT SEASON</span>
            </h3>

            <div className="space-y-2.5 max-h-[360px] sm:max-h-[510px] overflow-y-auto pr-1 scrollbar-thin">
              {[
                {
                  belt: 'Bengal & Assam Lower Brahmaputra Basin',
                  crops: 'Summer Boro Paddy & Jute Seedlings',
                  risk: 'CRITICAL: Severe Cloudburst Waterlogging (118 mm/h)',
                  advisory: 'Ensure drainage channels and sluices are unblocked immediately. Suspend agrochemical spraying and harvest mature standing paddy promptly.'
                },
                {
                  belt: 'South Karnataka & Hosur Horticulture Belt',
                  crops: 'Greenhouse Roses, Mango Orchards & Pomegranate',
                  risk: 'SEVERE: Large Hail (3.2 cm) & 82 km/h Wind Squall',
                  advisory: 'Deploy anti-hail net protection over fruit orchards. Secure polytunnel greenhouse frames and anchor young saplings.'
                },
                {
                  belt: 'Delhi NCR & Haryana Gangetic Margins',
                  crops: 'Vegetables & Mustard Harvest Bundles',
                  risk: 'SEVERE: Downburst Wind Lodging (88 km/h Gusts)',
                  advisory: 'Move harvested produce into covered warehouses. Cease high-pressure irrigation to prevent stem-breakage and crop lodging.'
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-white font-sans">{item.belt}</span>
                  </div>
                  <div className="text-[11px] text-emerald-300 font-sans">Crops: <b>{item.crops}</b></div>
                  <div className="text-rose-400 font-bold text-[10px] font-mono">{item.risk}</div>
                  <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-[10px] leading-relaxed text-zinc-300 font-sans">
                    <b className="text-emerald-400 font-mono">KVK Directive:</b> {item.advisory}
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
