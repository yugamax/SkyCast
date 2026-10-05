import React from 'react';
import { 
  Database, 
  Radar, 
  Satellite, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Radio, 
  ShieldCheck,
  Key,
  Info 
} from 'lucide-react';
import { DATA_SOURCES_STATUS } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface DataSourcesViewProps {
  onOpenApiKeys?: () => void;
  onOpenInfo?: (infoId: string) => void;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({
  onOpenApiKeys,
  onOpenInfo
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="p-2.5 sm:p-3 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs bg-transparent text-zinc-100 min-h-full">
      {/* Top Banner */}
      <div className="p-3.5 rounded-2xl ios-glass-card flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white truncate">
                Multi-Sensor Ingestion Pipeline & Telemetry Status
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                5 INGESTION FEEDS ONLINE
              </span>
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400 truncate">
              National radar, satellite, lightning, surface AWS, and numerical weather prediction pipelines
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onOpenApiKeys && (
            <button
              onClick={onOpenApiKeys}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-zinc-100 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Configure API Keys</span>
            </button>
          )}

          <div className="flex items-center space-x-2 text-[11px] px-3 py-2 rounded-xl border border-white/[0.08] bg-[#121316]/90">
            <span className="text-zinc-400">Total Bandwidth:</span>
            <span className="text-emerald-400 font-bold font-mono">6,220 packets/s</span>
          </div>
        </div>
      </div>

      {/* Ingestion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {DATA_SOURCES_STATUS.map((src) => {
          const isRadar = src.category === 'RADAR';
          const isSat = src.category === 'SATELLITE';
          const isLtg = src.category === 'LIGHTNING';

          return (
            <div
              key={src.id}
              className="p-4 rounded-2xl ios-glass-card transition-all space-y-3.5 flex flex-col justify-between border border-white/[0.08]"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.04]">
                      {isRadar ? (
                        <Radar className="w-5 h-5 text-emerald-400" />
                      ) : isSat ? (
                        <Satellite className="w-5 h-5 text-sky-400" />
                      ) : isLtg ? (
                        <Zap className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Database className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs leading-snug text-white font-sans">{src.name}</h3>
                      <p className="text-[10px] mt-0.5 text-zinc-400 font-sans">{src.provider}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    ● {src.status}
                  </span>
                </div>

                <p className="text-[11px] p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-300 font-sans">
                  {src.coverage}
                </p>

                {/* Key specs */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-zinc-500">Update Frequency:</span>
                    <div className="font-bold mt-0.5 text-zinc-200">{src.updateFrequency}</div>
                  </div>
                  <div className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-zinc-500">Spatial Resolution:</span>
                    <div className="font-bold mt-0.5 text-zinc-200 truncate">{src.spatialResolution}</div>
                  </div>
                  <div className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-zinc-500">Pipeline Latency:</span>
                    <div className="font-bold mt-0.5 text-emerald-400 font-mono">{src.latencySeconds} seconds</div>
                  </div>
                  <div className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-zinc-500">Active Sensors:</span>
                    <div className="font-bold mt-0.5 text-zinc-200 font-mono">{src.activeSensors} / {src.totalSensors}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
                <span className="text-zinc-400">Quality Score: <b className="text-emerald-400">{src.qualityScore}%</b></span>
                <span className="text-zinc-500">Packet Rate: <b className="text-zinc-300 font-mono">{src.packetRatePerSec} /s</b></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
