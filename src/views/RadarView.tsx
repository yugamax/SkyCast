import React, { useState } from 'react';
import { 
  Radar, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Layers, 
  Compass, 
  Activity, 
  Eye,
  TrendingUp,
  Cpu,
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

interface RadarViewProps {
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

export const RadarView: React.FC<RadarViewProps> = ({
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

  const [selectedStationId, setSelectedStationId] = useState<string>('DWR-CCU');
  const [selectedProduct, setSelectedProduct] = useState<'Z' | 'V' | 'W' | 'ZDR' | 'VIL' | 'ET'>('Z');
  const [elevationAngle, setElevationAngle] = useState<number>(0.5);
  const [isPlayingLoop, setIsPlayingLoop] = useState<boolean>(true);
  const [loopFrame, setLoopFrame] = useState<number>(4);

  const activeStation = radarStations.find(r => r.id === selectedStationId) || radarStations[0];

  const radarProducts = [
    { id: 'Z', label: 'Reflectivity (Z)', desc: 'dBZ', infoKey: 'RADAR_REFLECTIVITY' },
    { id: 'V', label: 'Radial Velocity (V)', desc: 'm/s', infoKey: 'RADAR_VELOCITY' },
    { id: 'ZDR', label: 'Diff Reflectivity (ZDR)', desc: 'Hydrometeors', infoKey: 'RADAR_ZDR' },
    { id: 'VIL', label: 'VIL Density', desc: 'kg/m²', infoKey: 'RADAR_VIL' }
  ];

  return (
    <div className="p-2.5 sm:p-3.5 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs text-zinc-100 bg-transparent min-h-full">
      {/* Top Station Selector & Dual-Pol Console Bar */}
      <div 
        className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-md ios-glass-card transition-colors ${
          isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-[#121316]/80 border-white/[0.08] text-zinc-200'
        }`}
      >
        {/* Left: Station Dropdown */}
        <div className="flex items-center space-x-3">
          <div 
            className={`p-2 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-slate-900 text-white' : 'bg-white/[0.06] border border-white/[0.1] text-emerald-400'
            }`}
          >
            <Radar className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Selected DWR Site:</span>
              {onOpenInfo && <InfoButton infoId="RADAR_REFLECTIVITY" onOpenInfo={onOpenInfo} size="xs" />}
            </div>
            <select
              value={selectedStationId}
              onChange={(e) => {
                setSelectedStationId(e.target.value);
                const st = radarStations.find(r => r.id === e.target.value);
                if (st) onSelectRadar(st);
              }}
              className={`block font-bold text-sm rounded-xl px-3 py-1.5 focus:outline-none border mt-0.5 cursor-pointer ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500' 
                  : 'bg-[#121316] border-white/[0.1] text-white focus:border-emerald-500/40'
              }`}
            >
              {radarStations.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#121316] text-white">
                  {st.name} ({st.band} • {st.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Dual-Pol Products Switcher */}
        <div 
          className={`flex items-center rounded-xl p-0.5 sm:p-1 space-x-1 border overflow-x-auto max-w-full scrollbar-none ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.03] border-white/[0.06]'
          }`}
        >
          {radarProducts.map((prod) => (
            <div key={prod.id} className="flex items-center shrink-0">
              <button
                onClick={() => setSelectedProduct(prod.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedProduct === prod.id
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                      : 'bg-white/[0.14] text-white border border-white/[0.16] shadow-sm font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {prod.label}
              </button>
            </div>
          ))}
        </div>

        {/* Right: Elevation Angle Selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Elevation:</span>
          <div 
            className={`flex items-center space-x-1 p-0.5 sm:p-1 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.03] border-white/[0.06]'
            }`}
          >
            {[0.5, 1.5, 3.0, 4.5, 6.0].map((deg) => (
              <button
                key={deg}
                onClick={() => setElevationAngle(deg)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  elevationAngle === deg
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'bg-white/[0.14] text-white border border-white/[0.16]'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left: GIS Map with Radar Range Rings & Dual-Pol Echoes (8 cols) */}
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
              activeLayer={selectedProduct === 'V' ? 'RADAR_VELOCITY' : 'RADAR_REFLECTIVITY'}
            />
          </div>

          {/* Radar Animation Loop Control Bar */}
          <div 
            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ios-glass-card ${
              isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-[#121316]/80 border-white/[0.08] text-zinc-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlayingLoop(!isPlayingLoop)}
                className="px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] text-white cursor-pointer shadow-xs"
              >
                {isPlayingLoop ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isPlayingLoop ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={() => setLoopFrame(0)}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
                }`}
                title="Rewind to First Frame"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-1 max-w-lg mx-2 sm:mx-4 overflow-x-auto scrollbar-none">
              {['T-30m', 'T-20m', 'T-10m', 'T-5m', 'NOW'].map((frame, idx) => (
                <button
                  key={frame}
                  onClick={() => setLoopFrame(idx)}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-center text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    loopFrame === idx
                      ? isLight
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white/[0.14] text-white border border-white/[0.18]'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                      : 'bg-white/[0.02] text-zinc-400 hover:text-zinc-200 border border-white/[0.04]'
                  }`}
                >
                  {frame}
                </button>
              ))}
            </div>

            <div className={`text-[10px] font-mono hidden md:block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Volume Scan: <b className="text-emerald-400">5-Min Polarimetric</b>
            </div>
          </div>
        </div>

        {/* Right: Active DWR Radar Station Health & Telemetry Specs (4 cols) */}
        <div className="xl:col-span-4 space-y-3">
          <div 
            className={`p-3.5 rounded-2xl border space-y-3 shadow-md ios-glass-card ${
              isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-[#121316]/80 border-white/[0.08] text-zinc-200'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200' : 'border-white/[0.06]'}`}>
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-2 text-zinc-100">
                <Radar className="w-4 h-4 text-emerald-400" />
                <span>Station Hardware Telemetry</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ● {activeStation.status}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Station Name:</span>
                <span className="font-bold text-white">{activeStation.name}</span>
              </div>
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Transmitter Band:</span>
                <span className="font-bold text-emerald-400">{activeStation.band} (Dual-Pol)</span>
              </div>
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Doppler Max Range:</span>
                <span className="font-bold text-white">{activeStation.rangeKm} km</span>
              </div>
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Peak RF Power:</span>
                <span className="font-bold text-white">{activeStation.peakPowerKw} kW</span>
              </div>
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Carrier Frequency:</span>
                <span className="font-bold text-white">{activeStation.frequencyGhz} GHz</span>
              </div>
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Scan Elevation:</span>
                <span className="font-bold text-white">{activeStation.elevationAngleDeg}°</span>
              </div>
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Coordinates:</span>
                <span className="font-mono text-white">{activeStation.lat.toFixed(4)}°N, {activeStation.lng.toFixed(4)}°E</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
