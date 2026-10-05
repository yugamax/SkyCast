import React, { useState } from 'react';
import { 
  Satellite, 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Eye, 
  Activity, 
  Compass, 
  Flame, 
  CloudLightning,
  Sparkles,
  Info
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
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface SatelliteViewProps {
  radarStations: RadarStation[];
  stormCells: StormCell[];
  airports: AirportStation[];
  lightningStrikes: LightningStrike[];
  nowcastGrid: GridForecastPoint[];
  timelineStep: TimelineStep;
  selectedCell: StormCell | null;
  userLocation?: { lat: number; lng: number; city?: string; accuracy?: number } | null;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  onRequestLocation?: () => void;
  onFlyToLocation?: (lat: number, lng: number) => void;
  onSelectCell: (cell: StormCell) => void;
  onSelectRadar: (radar: RadarStation) => void;
  onSelectAirport: (airport: AirportStation) => void;
  onOpenInfo?: (infoId: string) => void;
}

export const SatelliteView: React.FC<SatelliteViewProps> = ({
  radarStations,
  stormCells,
  airports,
  lightningStrikes,
  nowcastGrid,
  timelineStep,
  selectedCell,
  userLocation,
  flyToCoords,
  onRequestLocation,
  onFlyToLocation,
  onSelectCell,
  onSelectRadar,
  onSelectAirport,
  onOpenInfo
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedChannel, setSelectedChannel] = useState<'TIR1' | 'TIR2' | 'WV' | 'MIR' | 'VIS' | 'CTBT'>('CTBT');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrame, setCurrentFrame] = useState<number>(4);

  const satelliteTimeline = ['T-60m', 'T-45m', 'T-30m', 'T-15m', 'NOW'];

  const satelliteChannels = [
    { id: 'CTBT', label: 'Cloud-Top Temp (K)', desc: 'Brightness Temp', infoKey: 'INSAT_CTBT' },
    { id: 'TIR1', label: 'TIR-1 (10.8 µm)', desc: 'Thermal IR', infoKey: 'INSAT_CTBT' },
    { id: 'WV', label: 'Water Vapor (6.7 µm)', desc: 'Upper Troposphere', infoKey: 'INSAT_WV' },
    { id: 'VIS', label: 'Visible (0.65 µm)', desc: '1km High-Res', infoKey: 'INSAT_CTBT' }
  ];

  return (
    <div className="p-2.5 sm:p-3.5 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs text-zinc-100 bg-transparent min-h-full">
      {/* Top INSAT Satellite Imager Bar */}
      <div 
        className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-md ios-glass-card transition-colors ${
          isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-[#121316]/80 border-white/[0.08] text-zinc-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div 
            className={`p-2 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-slate-900 text-white' : 'bg-white/[0.06] border border-white/[0.1] text-emerald-400'
            }`}
          >
            <Satellite className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                INSAT-3D / 3DR Imager Suite
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                GEO 74°E / 82°E
              </span>
              {onOpenInfo && <InfoButton infoId="INSAT_CTBT" onOpenInfo={onOpenInfo} size="xs" />}
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400">
              ISRO Space Applications Centre / IMD Satellite Division
            </p>
          </div>
        </div>

        {/* Channel Switcher */}
        <div 
          className={`flex items-center rounded-xl p-0.5 sm:p-1 space-x-1 border overflow-x-auto max-w-full scrollbar-none ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.03] border-white/[0.06]'
          }`}
        >
          {satelliteChannels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id as any)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                selectedChannel === ch.id
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                    : 'bg-white/[0.14] text-white border border-white/[0.16] shadow-sm font-semibold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Rapid Scan Status */}
        <div 
          className={`flex items-center space-x-2 text-[11px] px-2.5 py-1.5 rounded-xl border shrink-0 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.03] border-white/[0.06]'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-zinc-400">Rapid-Scan:</span>
          <span className="text-emerald-400 font-bold">5-Min Cadence</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left: Interactive GIS Satellite Map & Loop Player (8 cols) */}
        <div className="xl:col-span-8 space-y-2.5">
          <div className="h-[340px] sm:h-[460px] lg:h-[540px] w-full rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg">
            <WeatherMap
              stormCells={stormCells}
              radarStations={radarStations}
              airports={airports}
              lightningStrikes={lightningStrikes}
              nowcastGrid={nowcastGrid}
              timelineStep={timelineStep}
              selectedCell={selectedCell}
              userLocation={userLocation}
              flyToCoords={flyToCoords}
              onRequestLocation={onRequestLocation}
              onSelectCell={onSelectCell}
              onSelectRadar={onSelectRadar}
              onSelectAirport={onSelectAirport}
              onOpenInfo={onOpenInfo}
              activeLayer={selectedChannel === 'CTBT' ? 'CLOUD_TOP_TEMP' : 'INSAT_SATELLITE_IR'}
            />
          </div>

          {/* Timeline Animation Player */}
          <div 
            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ios-glass-card ${
              isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-[#121316]/80 border-white/[0.08] text-zinc-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] text-white cursor-pointer shadow-xs"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => setCurrentFrame(0)}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
                }`}
                title="Rewind"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-1 max-w-xl mx-2 sm:mx-4 overflow-x-auto scrollbar-none">
              {satelliteTimeline.map((step, idx) => (
                <button
                  key={step}
                  onClick={() => setCurrentFrame(idx)}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-center text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    currentFrame === idx
                      ? isLight
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white/[0.14] text-white border border-white/[0.18]'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                      : 'bg-white/[0.02] text-zinc-400 hover:text-zinc-200 border border-white/[0.04]'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>

            <div className={`text-[10px] font-mono hidden md:block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Resolution: <b className="text-emerald-400">1.0 km TIR</b>
            </div>
          </div>
        </div>

        {/* Right: Cloud-Top Cooling Rate & Deep Convection Analysis (4 cols) */}
        <div className="xl:col-span-4 space-y-3">
          <div 
            className={`p-3.5 rounded-2xl border space-y-3 shadow-md ios-glass-card ${
              isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-[#121316]/80 border-white/[0.08] text-zinc-200'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-white/[0.06]'}`}>
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-2 text-zinc-100">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Deep Convection Detection</span>
              </h3>
              <span className="text-amber-400 font-bold text-[10px]">OVERSHOOTING TOPS</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className={`p-2.5 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-300">Minimum Cloud-Top Temp:</span>
                  <span className="text-fuchsia-400 font-mono">188.4 K (-84.7°C)</span>
                </div>
                <div className="text-[10px] text-zinc-400">Teesta Valley / Guwahati supercell core</div>
              </div>

              <div className={`p-2.5 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-300">15-Min Cloud Top Cooling:</span>
                  <span className="text-rose-400 font-mono">-7.2 K / 15m (EXPLOSIVE)</span>
                </div>
                <div className="text-[10px] text-zinc-400">Exceeds 4K/15m convective threshold</div>
              </div>

              <div className={`p-2.5 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-300">Split-Window Diff (TIR1 - WV):</span>
                  <span className="text-emerald-400 font-mono">+2.8 K</span>
                </div>
                <div className="text-[10px] text-zinc-400">Moisture pluming into upper troposphere</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
