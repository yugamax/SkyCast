import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Flame, 
  Clock, 
  Radio,
  MapPin,
  LocateFixed
} from 'lucide-react';
import { WeatherMap } from '../components/Map/WeatherMap';
import { 
  RadarStation, 
  StormCell, 
  AirportStation, 
  LightningStrike, 
  GridForecastPoint, 
  TimelineStep 
} from '../types/weather';
import { simulationEngine } from '../services/simulationEngine';
import { ambientAudio } from '../services/ambientAudioService';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface LightningViewProps {
  radarStations: RadarStation[];
  stormCells: StormCell[];
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

export const LightningView: React.FC<LightningViewProps> = ({
  radarStations,
  stormCells,
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

  const [strikeFilter, setStrikeFilter] = useState<'ALL' | 'CG' | 'IC'>('ALL');
  const stats = simulationEngine.getLightningStats();

  const filteredStrikes = lightningStrikes.filter(
    s => strikeFilter === 'ALL' || s.type === strikeFilter
  );

  return (
    <div className="p-2.5 sm:p-3 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs bg-transparent text-zinc-100 min-h-full">
      {/* Top Statistics Bar in Obsidian Liquid Glass */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl ios-glass-card flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">Real-Time Strike Rate</div>
              <div className="text-xl font-black text-white font-mono mt-0.5">
                {stats.strikesPerMin} <span className="text-xs text-amber-400 font-medium">/ min</span>
              </div>
            </div>
          </div>
          {onOpenInfo && <InfoButton infoId="LIGHTNING_CG" onOpenInfo={onOpenInfo} size="xs" />}
        </div>

        <div className="p-3.5 rounded-2xl ios-glass-card flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">10-Min Accumulation</div>
              <div className="text-xl font-black font-mono mt-0.5 text-white">
                {stats.strikeCountLast10Min} <span className="text-xs text-zinc-400 font-normal">strikes</span>
              </div>
            </div>
          </div>
          {onOpenInfo && <InfoButton infoId="LIGHTNING_IC" onOpenInfo={onOpenInfo} size="xs" />}
        </div>

        <div className="p-3.5 rounded-2xl ios-glass-card flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">Peak Current</div>
              <div className="text-xl font-black text-white font-mono mt-0.5">
                {stats.maxPeakCurrentKa} <span className="text-xs text-rose-400 font-normal">kA</span>
              </div>
            </div>
          </div>
          {onOpenInfo && <InfoButton infoId="LIGHTNING_CG" onOpenInfo={onOpenInfo} size="xs" />}
        </div>

        <div className="p-3.5 rounded-2xl ios-glass-card flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-zinc-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">CG vs IC Ratio</div>
              <div className="text-xl font-black text-white font-mono mt-0.5">
                {stats.cgRatio}% <span className="text-xs text-emerald-400 font-normal">CG</span>
              </div>
            </div>
          </div>
          {onOpenInfo && <InfoButton infoId="LIGHTNING_IC" onOpenInfo={onOpenInfo} size="xs" />}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left: GIS Lightning Strike & Density Map (8 cols) */}
        <div className="xl:col-span-8 space-y-2.5">
          <div className="h-[340px] sm:h-[460px] lg:h-[580px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08]">
            <WeatherMap
              stormCells={stormCells}
              radarStations={radarStations}
              airports={airports}
              lightningStrikes={filteredStrikes}
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
              activeLayer="LIGHTNING_DENSITY"
            />
          </div>

          {/* Type Filter Controls */}
          <div className="p-3 rounded-2xl ios-glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto max-w-full scrollbar-none">
              <span className="text-[10px] uppercase font-bold text-zinc-400 shrink-0">Stroke Filter:</span>
              <button
                onClick={() => setStrikeFilter('ALL')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  strikeFilter === 'ALL'
                    ? 'bg-emerald-400 text-zinc-950 font-semibold shadow-md'
                    : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
              >
                All ({lightningStrikes.length})
              </button>
              <button
                onClick={() => setStrikeFilter('CG')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  strikeFilter === 'CG'
                    ? 'bg-amber-400 text-zinc-950 font-semibold shadow-md'
                    : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
              >
                CG
              </button>
              <button
                onClick={() => setStrikeFilter('IC')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  strikeFilter === 'IC'
                    ? 'bg-sky-400 text-zinc-950 font-semibold shadow-md'
                    : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
              >
                IC
              </button>
            </div>

            <div className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold hidden sm:block">
              IITM / ISRO TOA Network • 250m Precision
            </div>
          </div>
        </div>

        {/* Right: Recent High-Current Strikes Table (4 cols) */}
        <div className="xl:col-span-4 space-y-3">
          <div className="p-4 rounded-2xl ios-glass-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-white">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Recent Strike Telemetry</span>
              </h3>
              <button
                onClick={() => {
                  ambientAudio.unmute();
                  ambientAudio.triggerLightning(1.2);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                title="Play Natural Lightning & Thunder Audio"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Play Strike Audio</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] sm:max-h-[510px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredStrikes.slice(0, 10).map((strike) => (
                <div 
                  key={strike.id}
                  className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all space-y-1"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center space-x-1.5">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        strike.type === 'CG' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}>
                        {strike.type}
                      </span>
                      <span className="text-white">{strike.region}</span>
                    </span>
                    <span className="text-rose-400 font-mono">{strike.peakCurrentKa} kA ({strike.polarity})</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Time: {strike.timestamp}</span>
                    <span>Confidence: <b className="text-emerald-400">{strike.confidence}%</b></span>
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
