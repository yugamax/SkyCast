import React from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Server, 
  Wifi, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Info 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface SystemHealthViewProps {
  onOpenInfo?: (infoId: string) => void;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({ onOpenInfo }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="p-2.5 sm:p-3 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs bg-transparent text-zinc-100 min-h-full">
      {/* Top Banner */}
      <div className="p-3.5 rounded-2xl ios-glass-card flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white truncate">
                SKYCAST Operational Infrastructure & System Health
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                SYSTEM HEALTH: 99.98% OPTIMAL
              </span>
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400 truncate">
              GPU inference cluster, WebSocket broker, Redis buffer, and failover health
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] px-3 py-2 rounded-xl border border-white/[0.08] bg-[#121316]/90 shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-zinc-400">Cluster Status:</span>
          <span className="text-emerald-400 font-bold font-mono">4 Nodes Active</span>
        </div>
      </div>

      {/* Cluster Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* GPU Cluster */}
        <div className="p-4 rounded-2xl ios-glass-card space-y-3.5 shadow-sm border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase text-white font-sans">AI Inference Cluster</h3>
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">● Online</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-400">Hardware:</span>
              <span className="font-bold text-white">4x NVIDIA A100 (80GB)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">GPU Utilization:</span>
              <span className="font-bold text-emerald-400 font-mono">64.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Batch Latency:</span>
              <span className="text-emerald-400 font-bold font-mono">14.2s (0-6h Run)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">VRAM Allocated:</span>
              <span className="font-bold text-zinc-300 font-mono">48.5 GB / 80 GB</span>
            </div>
          </div>
        </div>

        {/* Message Broker & Redis */}
        <div className="p-4 rounded-2xl ios-glass-card space-y-3.5 shadow-sm border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase text-white font-sans">Redis Ingest Queue</h3>
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">● Optimal</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-400">Queue Depth:</span>
              <span className="text-emerald-400 font-bold font-mono">12 pkts (Low)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Throughput:</span>
              <span className="font-bold text-white font-mono">18.4 MB/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Memory Footprint:</span>
              <span className="font-bold text-zinc-300 font-mono">3.2 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Uptime:</span>
              <span className="font-bold text-zinc-300 font-mono">42d 18h 12m</span>
            </div>
          </div>
        </div>

        {/* WebSocket Real-time Broadcaster */}
        <div className="p-4 rounded-2xl ios-glass-card space-y-3.5 shadow-sm border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-xs uppercase text-white font-sans">WebSocket Engine</h3>
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">● Connected</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-400">Client Rooms:</span>
              <span className="text-white font-bold font-mono">142 Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Push Latency:</span>
              <span className="text-emerald-400 font-bold font-mono">&lt; 18 ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">TLS Security:</span>
              <span className="font-bold text-zinc-300 font-mono">WSS / TLS 1.3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Drop Rate:</span>
              <span className="font-bold text-emerald-400 font-mono">0.00%</span>
            </div>
          </div>
        </div>

        {/* PostGIS Database */}
        <div className="p-4 rounded-2xl ios-glass-card space-y-3.5 shadow-sm border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-xs uppercase text-white font-sans">PostGIS Storage</h3>
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">● Synced</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-400">Spatial QPS:</span>
              <span className="text-amber-400 font-bold font-mono">320 QPS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Spatial Index:</span>
              <span className="font-bold text-zinc-300 font-mono">R-Tree / GIST</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Storage Used:</span>
              <span className="font-bold text-zinc-300 font-mono">1.4 TB / 10 TB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Replication Lag:</span>
              <span className="text-emerald-400 font-bold font-mono">0.4 ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
