import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  BarChart2, 
  Layers, 
  Sliders,
  Info 
} from 'lucide-react';
import { VERIFICATION_METRICS } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface HistoricalViewProps {
  onOpenInfo?: (infoId: string) => void;
}

export const HistoricalView: React.FC<HistoricalViewProps> = ({ onOpenInfo }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedLeadTime, setSelectedLeadTime] = useState<string>('+30m');
  const [splitPosition, setSplitPosition] = useState<number>(50);

  const activeMetric = VERIFICATION_METRICS.find(m => m.leadTime === selectedLeadTime) || VERIFICATION_METRICS[1];

  return (
    <div className="p-2.5 sm:p-3 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs bg-transparent text-zinc-100 min-h-full">
      {/* Top Banner with Verification Badge */}
      <div className="p-3.5 rounded-2xl ios-glass-card flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-zinc-300">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Model Verification & Historical Post-Event Evaluation
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                VERIFICATION BENCHMARK
              </span>
              {onOpenInfo && <InfoButton infoId="AI_CONVLSTM" onOpenInfo={onOpenInfo} size="xs" />}
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400">
              Quantitative verification scorecards (POD, FAR, CSI, ETS, RMSE) on 14,200 convective test cases
            </p>
          </div>
        </div>

        {/* Lead time switcher */}
        <div className="flex items-center rounded-xl p-1 space-x-1 border border-white/[0.08] bg-[#121316]/90">
          {VERIFICATION_METRICS.map((m) => (
            <button
              key={m.leadTime}
              onClick={() => setSelectedLeadTime(m.leadTime)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedLeadTime === m.leadTime
                  ? 'bg-emerald-400 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
              }`}
            >
              {m.leadTime}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left: Interactive Observed vs AI Nowcast Split Viewer (7 cols) */}
        <div className="xl:col-span-7 p-4 rounded-2xl ios-glass-card space-y-3 flex flex-col justify-between shadow-sm border border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-white">
            <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Observed DWR vs AI Predicted Radar Echo ({selectedLeadTime})</span>
            </h3>
            <span className="text-amber-400 font-bold text-[10px]">VERIFICATION SPLIT</span>
          </div>

          {/* Split Screen Simulator Visualizer */}
          <div className="relative h-80 rounded-2xl overflow-hidden border border-white/[0.08] bg-[#07080A] flex items-center justify-center">
            {/* Left half: Ground Truth Observed Radar */}
            <div
              className="absolute inset-y-0 left-0 bg-radial from-red-600/40 via-yellow-500/20 to-transparent flex items-center justify-center overflow-hidden border-r-2 border-emerald-400 z-10"
              style={{ width: `${splitPosition}%` }}
            >
              <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                ● OBSERVED DWR TRUTH (68.5 dBZ)
              </div>
              <div className="w-40 h-40 rounded-full border-4 border-red-500 bg-red-600/30 shadow-[0_0_50px_rgba(239,68,68,0.7)] flex items-center justify-center">
                <span className="text-white font-black text-lg">68 dBZ</span>
              </div>
            </div>

            {/* Right half: AI Nowcast Model Predicted */}
            <div className="absolute inset-0 bg-radial from-red-600/30 via-orange-500/20 to-transparent flex items-center justify-center">
              <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 border border-amber-500/30">
                ● AI NOWCAST PREDICTION (65.2 dBZ)
              </div>
              <div className="w-36 h-36 rounded-full border-4 border-orange-500 bg-orange-600/30 shadow-[0_0_40px_rgba(249,115,22,0.6)] flex items-center justify-center">
                <span className="text-white font-black text-lg">65 dBZ</span>
              </div>
            </div>

            {/* Split Slider Handle */}
            <div
              className="absolute inset-y-0 w-0.5 bg-emerald-400 cursor-ew-resize z-20 flex items-center justify-center shadow-[0_0_15px_#34D399]"
              style={{ left: `${splitPosition}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center text-zinc-950 font-bold text-[9px] shadow-lg">
                ↔
              </div>
            </div>
          </div>

          {/* Split position slider control */}
          <div className="flex items-center space-x-3 pt-2">
            <span className="text-[10px] uppercase font-bold shrink-0 text-zinc-400">Compare Split:</span>
            <input
              type="range"
              min="10"
              max="90"
              value={splitPosition}
              onChange={(e) => setSplitPosition(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 rounded-lg bg-white/[0.08]"
            />
            <span className="font-bold w-12 text-right text-emerald-400">{splitPosition}%</span>
          </div>
        </div>

        {/* Right: Verification Scorecards (5 cols) */}
        <div className="xl:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl ios-glass-card space-y-3 shadow-sm border border-white/[0.08]">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-white">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Skill Scores for Lead Time {selectedLeadTime}</span>
              </h3>
              <span className="text-[10px] text-zinc-500">N = {activeMetric.sampleCount.toLocaleString()}</span>
            </div>

            {/* Scorecard grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
                <div className="text-zinc-400 text-[10px] font-bold">PROB OF DETECTION (POD)</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">
                  {(activeMetric.pod * 100).toFixed(1)}%
                </div>
                <div className="text-[9px] mt-1 text-zinc-500">Hit Rate / True Positive</div>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-950/10">
                <div className="text-zinc-400 text-[10px] font-bold">FALSE ALARM RATE (FAR)</div>
                <div className="text-xl font-black text-rose-400 mt-0.5">
                  {(activeMetric.far * 100).toFixed(1)}%
                </div>
                <div className="text-[9px] mt-1 text-zinc-500">Lower is better</div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <div className="text-zinc-400 text-[10px] font-bold">CRITICAL SUCCESS INDEX</div>
                <div className="text-xl font-black mt-0.5 text-white">
                  {activeMetric.csi.toFixed(2)}
                </div>
                <div className="text-[9px] mt-1 text-zinc-500">Threat Score (0 to 1)</div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/10">
                <div className="text-zinc-400 text-[10px] font-bold">REFLECTIVITY RMSE</div>
                <div className="text-xl font-black text-amber-300 mt-0.5">
                  {activeMetric.rmseDbz.toFixed(1)} dBZ
                </div>
                <div className="text-[9px] mt-1 text-zinc-500">Root Mean Square Error</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
