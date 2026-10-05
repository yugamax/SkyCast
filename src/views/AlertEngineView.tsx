import React, { useState } from 'react';
import { 
  BellRing, 
  CheckCircle2, 
  Eye, 
  Share2, 
  Clock, 
  Sliders, 
  Volume2, 
  AlertCircle,
  ShieldAlert,
  Info
} from 'lucide-react';
import { AlertItem, HazardLevel, AlertThresholdConfig } from '../types/weather';
import { audioAlerts } from '../services/simulationEngine';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface AlertEngineViewProps {
  alerts: AlertItem[];
  thresholds: AlertThresholdConfig;
  onAcknowledgeAlert: (id: string) => void;
  onFocusAlertOnMap: (alert: AlertItem) => void;
  onShareAlert: (alert: AlertItem) => void;
  onOpenThresholdSettings: () => void;
  onOpenInfo?: (infoId: string) => void;
}

export const AlertEngineView: React.FC<AlertEngineViewProps> = ({
  alerts,
  thresholds,
  onAcknowledgeAlert,
  onFocusAlertOnMap,
  onShareAlert,
  onOpenThresholdSettings,
  onOpenInfo
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedFilter, setSelectedFilter] = useState<HazardLevel | 'ALL'>('ALL');

  const filteredAlerts = alerts.filter(
    a => selectedFilter === 'ALL' || a.level === selectedFilter
  );

  return (
    <div className="p-2.5 sm:p-3 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs bg-transparent text-zinc-100 min-h-full">
      {/* Top Banner & Trigger Controls */}
      <div className="p-3.5 rounded-2xl ios-glass-card flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white truncate">
                Automated Prototype Alert Engine & Civil Defense Center
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold shrink-0">
                {alerts.length} Warnings Active
              </span>
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400 truncate">
              Deterministic & Probabilistic Multi-Hazard Warning Dispatch
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => audioAlerts.playAlertTone('CRITICAL')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl font-bold transition-colors shadow-xs bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Test Siren</span>
          </button>

          <button
            onClick={onOpenThresholdSettings}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-colors shadow-md bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-zinc-100 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Edit Thresholds</span>
          </button>
        </div>
      </div>

      {/* Official Prototype Threshold Disclaimer Banner */}
      <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-amber-200 flex items-start space-x-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <b className="font-bold text-amber-300">PROTOTYPE ALERT THRESHOLDS:</b> Values and triggers displayed here are part of the SKYCAST research nowcasting demonstration and do not constitute official severe weather warnings issued by the India Meteorological Department (IMD).
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-2.5 rounded-2xl ios-glass-card flex flex-wrap items-center justify-between gap-2 border border-white/[0.08]">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none max-w-full">
          <span className="text-[10px] font-bold uppercase mr-2 text-zinc-400 shrink-0">Severity Filter:</span>
          {(['ALL', 'CRITICAL', 'SEVERE', 'MODERATE', 'ADVISORY'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedFilter(lvl)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedFilter === lvl
                  ? 'bg-emerald-400 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
              }`}
            >
              {lvl} ({lvl === 'ALL' ? alerts.length : alerts.filter(a => a.level === lvl).length})
            </button>
          ))}
        </div>

        <div className="text-[11px] text-zinc-400 hidden sm:block">
          Active Criteria: Hail &ge; {thresholds.hailProb}% | Cloudburst &ge; {thresholds.cloudburstProb}% | dBZ &ge; {thresholds.dbzThreshold}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.level === 'CRITICAL';
          const isSevere = alert.level === 'SEVERE';

          return (
            <div
              key={alert.id}
              className={`rounded-2xl p-4 border transition-all space-y-3 flex flex-col justify-between ${
                alert.acknowledged
                  ? 'bg-[#121316]/50 border-white/[0.04] opacity-75'
                  : isCritical
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-xl shadow-rose-950/30'
                  : isSevere
                  ? 'bg-amber-950/20 border-amber-500/35 shadow-xl shadow-amber-950/30'
                  : 'bg-[#121316]/80 border-white/[0.08]'
              }`}
            >
              <div className="space-y-2.5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                          isCritical 
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40' 
                            : isSevere 
                            ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {alert.level}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">{alert.id}</span>
                      {onOpenInfo && (
                        <InfoButton infoId={`HAZARD_${alert.hazardType}`} onOpenInfo={onOpenInfo} size="xs" />
                      )}
                    </div>

                    <h3 className="text-sm font-bold mt-1 leading-snug text-white font-sans">
                      {alert.locationName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-rose-400 font-bold text-xs flex items-center justify-end space-x-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ETA {alert.etaMinutes}m</span>
                    </div>
                    <div className="text-[9px] mt-0.5 text-zinc-500">Valid: {alert.validUntil}</div>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-zinc-300 font-sans">
                  {alert.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-zinc-500">Wind Gust</span>
                    <div className="text-amber-400 font-bold mt-0.5">{alert.windGustKmh} km/h</div>
                  </div>
                  <div className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-zinc-500">Rain Rate</span>
                    <div className="text-rose-400 font-bold mt-0.5">{alert.rainRateMmHr} mm/h</div>
                  </div>
                  <div className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <span className="text-zinc-500">Hail Size</span>
                    <div className="text-zinc-200 font-bold mt-0.5">{alert.hailSizeCm} cm</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => onFocusAlertOnMap(alert)}
                  className="flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-colors bg-emerald-400 hover:bg-emerald-300 text-zinc-950 cursor-pointer shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View on Map</span>
                </button>

                <button
                  onClick={() => onShareAlert(alert)}
                  className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer"
                  title="Export Dispatch"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {!alert.acknowledged && (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] text-white font-bold transition-colors cursor-pointer"
                    title="Acknowledge Warning"
                  >
                    Ack
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
