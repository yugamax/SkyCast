import React, { useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Layers, 
  ShieldAlert, 
  Wind, 
  CloudRain, 
  Zap, 
  Activity,
  Sliders,
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

interface NowcastViewProps {
  radarStations: RadarStation[];
  stormCells: StormCell[];
  airports: AirportStation[];
  lightningStrikes: LightningStrike[];
  nowcastGrid: GridForecastPoint[];
  timelineStep: TimelineStep;
  onChangeTimelineStep: (step: TimelineStep) => void;
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

export const NowcastView: React.FC<NowcastViewProps> = ({
  radarStations,
  stormCells,
  airports,
  lightningStrikes,
  nowcastGrid,
  timelineStep,
  onChangeTimelineStep,
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

  const [selectedHazardLayer, setSelectedHazardLayer] = useState<
    'PROB_THUNDERSTORM' | 'PROB_HAIL' | 'PROB_DOWNBURST' | 'PROB_CLOUDBURST' | 'RAINFALL_RATE' | 'CONVECTIVE_INITIATION'
  >('PROB_CLOUDBURST');

  const steps: TimelineStep[] = ['NOW', '+15m', '+30m', '+45m', '+1h', '+2h', '+3h', '+4h', '+5h', '+6h'];

  const hazardTabs = [
    { id: 'PROB_CLOUDBURST', label: 'Cloudburst Prob', infoKey: 'HAZARD_CLOUDBURST' },
    { id: 'PROB_HAIL', label: 'Hail Prob', infoKey: 'HAZARD_HAIL' },
    { id: 'PROB_DOWNBURST', label: 'Downburst / Gusts', infoKey: 'HAZARD_DOWNBURST' },
    { id: 'PROB_THUNDERSTORM', label: 'Thunderstorm Prob', infoKey: 'AI_CONVLSTM' },
    { id: 'RAINFALL_RATE', label: 'Rain Rate (mm/h)', infoKey: 'HAZARD_CLOUDBURST' },
    { id: 'CONVECTIVE_INITIATION', label: 'Convective Initiation', infoKey: 'AI_CONVLSTM' }
  ];

  return (
    <div className="p-2.5 sm:p-3.5 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs text-zinc-100 bg-transparent min-h-full">
      {/* 0-6 Hour Forecast Engine Header & Timeline Controller */}
      <div 
        className={`p-3.5 rounded-2xl border space-y-3 shadow-md ios-glass-card transition-colors ${
          isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-[#121316]/80 border-white/[0.08] text-zinc-200'
        }`}
      >
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 ${isLight ? 'border-slate-200' : 'border-white/[0.06]'}`}>
          <div className="flex items-center space-x-3">
            <div 
              className={`p-2 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-slate-900 text-white' : 'bg-white/[0.06] border border-white/[0.1] text-emerald-400'
              }`}
            >
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  0–6h Convective Scale Nowcast Engine
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                  1.5 km Grid Resolution
                </span>
                {onOpenInfo && <InfoButton infoId="AI_CONVLSTM" onOpenInfo={onOpenInfo} size="xs" />}
              </div>
              <p className="text-[11px] mt-0.5 text-zinc-400">
                Spatiotemporal ConvLSTM + Transformer Multi-Source AI Diffusion
              </p>
            </div>
          </div>

          {/* Hazard Product Tabs */}
          <div 
            className={`flex items-center rounded-xl p-0.5 sm:p-1 gap-1 border overflow-x-auto max-w-full scrollbar-none ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.03] border-white/[0.06]'
            }`}
          >
            {hazardTabs.map((prod) => (
              <button
                key={prod.id}
                onClick={() => setSelectedHazardLayer(prod.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  selectedHazardLayer === prod.id
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                      : 'bg-white/[0.14] text-white border border-white/[0.16] shadow-sm font-semibold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <span>{prod.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 0-6 Hour Interactive Step Timeline Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase flex items-center space-x-1.5 text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Forecast Lead Time Step Selector:</span>
            </span>
            <span className="font-bold text-emerald-400 text-[10px] sm:text-[11px]">
              {timelineStep === 'NOW' ? 'Observed (T+0)' : `Lead: ${timelineStep}`}
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {steps.map((step) => {
              const isSelected = timelineStep === step;
              return (
                <button
                  key={step}
                  onClick={() => onChangeTimelineStep(step)}
                  className={`py-1.5 px-1 rounded-xl text-center font-mono font-bold text-xs transition-all relative overflow-hidden border cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-slate-900 text-white border-slate-700 shadow-xs'
                        : 'bg-white/[0.14] text-white border-white/[0.2] shadow-sm ring-1 ring-white/10'
                      : isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      : 'bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.06] border-white/[0.04]'
                  }`}
                >
                  <div>{step}</div>
                  <div className={`text-[9px] mt-0.5 ${isSelected ? 'font-extrabold text-white' : 'text-zinc-500'}`}>
                    {step === 'NOW' ? 'Observed' : 'Forecast'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + 1.5km Grid Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
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
              activeLayer={selectedHazardLayer}
            />
          </div>
        </div>

        {/* Right: AI Prediction Model Confidence & Verification (4 cols) */}
        <div className="xl:col-span-4 space-y-3">
          <div 
            className={`p-3.5 rounded-2xl border space-y-3 shadow-md ios-glass-card ${
              isLight ? 'bg-white/85 border-slate-200 text-slate-800' : 'bg-[#121316]/80 border-white/[0.08] text-zinc-200'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-200 text-slate-900' : 'border-white/[0.06] text-white'}`}>
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Spatiotemporal Diagnostics</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-400">STEP: {timelineStep}</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Diffusion Resolution:</span>
                <span className="font-bold text-white">1.5 km Continental Grid</span>
              </div>
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Forecast Horizon:</span>
                <span className="font-bold text-white">0 to 360 Minutes</span>
              </div>
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">CRPS Skill Score:</span>
                <span className="text-emerald-400 font-bold">0.89 (High Skill)</span>
              </div>
              <div className={`flex justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                <span className="text-zinc-400">Critical Success Index:</span>
                <span className="text-zinc-200 font-bold">CSI = 0.74 (+30m)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
