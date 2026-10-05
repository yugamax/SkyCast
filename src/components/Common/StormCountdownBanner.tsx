import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Compass, 
  ExternalLink, 
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { StormCell } from '../../types/weather';
import { useTheme } from '../../context/ThemeContext';
import { InfoButton } from './InfoButton';

interface StormCountdownBannerProps {
  cell: StormCell | null;
  localScope?: boolean;
  userCity?: string;
  onFocusCell: (cell: StormCell) => void;
  onOpenCellDetails: (cell: StormCell) => void;
  onOpenInfo?: (infoId: string) => void;
  onSwitchToAllIndia?: () => void;
}

export const StormCountdownBanner: React.FC<StormCountdownBannerProps> = ({
  cell,
  localScope = false,
  userCity,
  onFocusCell,
  onOpenCellDetails,
  onOpenInfo,
  onSwitchToAllIndia
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    if (cell) {
      setSecondsRemaining(cell.etaMinutes * 60);
    }
  }, [cell?.id, cell?.etaMinutes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!cell) {
    if (localScope) {
      return (
        <div
          className={`w-full rounded-2xl border p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 editorial-bento-card ${
            isLight 
              ? 'bg-white border-slate-200 text-slate-800' 
              : ''
          }`}
        >
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-200">
                  Local Sector Clear
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  • {userCity || 'Your Location'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                No active convective storm cells detected within 450 km. Doppler soundings show stable regional conditions.
              </p>
            </div>
          </div>

          {onSwitchToAllIndia && (
            <button
              onClick={onSwitchToAllIndia}
              className="tactile-btn px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 shrink-0 self-end sm:self-center"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>View All-India Cells</span>
            </button>
          )}
        </div>
      );
    }
    return null;
  }

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = cell.severity === 'CRITICAL';

  return (
    <div
      className={`w-full rounded-2xl border transition-all relative overflow-hidden editorial-bento-card ${
        isCritical
          ? 'border-rose-500/30'
          : 'border-amber-500/30'
      }`}
    >
      <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Emergency Alert & Telemetry */}
        <div className="flex items-start space-x-3 min-w-0">
          <div
            className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              isCritical
                ? 'bg-rose-500/15 text-rose-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            {/* Header Tagline */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span
                className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded ${
                  isCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {cell.severity} Cell Detected
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {cell.id}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                • {cell.radarSource}
              </span>
              {onOpenInfo && (
                <InfoButton infoId="RADAR_REFLECTIVITY" onOpenInfo={onOpenInfo} size="xs" />
              )}
            </div>

            {/* Target Area Location */}
            <h3 className="text-sm sm:text-base font-semibold text-white truncate mt-1">
              Target Area: <span className="text-slate-200 font-bold">{cell.targetLocation}</span>
            </h3>

            {/* Telemetry Metrics Row */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs mt-1 font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>{cell.directionText} @ {cell.speedKmh} km/h</span>
              </span>
              <span className="text-slate-600">•</span>
              <span>Reflectivity: <b className="text-slate-200">{cell.reflectivityDbz} dBZ</b></span>
              <span className="text-slate-600">•</span>
              <span>Echo Top: <b className="text-slate-200">{cell.echoTopKm} km</b></span>
              <span className="text-slate-600">•</span>
              <span>Gusts: <b className="text-slate-200">{cell.maxWindGustKmh} km/h</b></span>
            </div>
          </div>
        </div>

        {/* Center: Live Countdown Clock */}
        <div className="flex items-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0">
          <div className="text-center">
            <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-medium flex items-center justify-center space-x-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Estimated Arrival</span>
            </div>
            <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight mt-0.5 ${
              isCritical ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {formattedCountdown}
            </div>
          </div>
        </div>

        {/* Right: Tactile Probability Meters & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
          {/* 4 Probability Mini Progress Meters */}
          <div className="grid grid-cols-4 gap-1.5 font-mono text-[9px]">
            <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
              <div className="text-slate-500 font-medium">LTG</div>
              <div className="text-slate-200 font-semibold mt-0.5">{cell.probLightning}%</div>
              <div className="w-7 h-1 bg-white/[0.08] rounded-full mx-auto mt-1 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${cell.probLightning}%` }} />
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
              <div className="text-slate-500 font-medium">HAIL</div>
              <div className="text-slate-200 font-semibold mt-0.5">{cell.probHail}%</div>
              <div className="w-7 h-1 bg-white/[0.08] rounded-full mx-auto mt-1 overflow-hidden">
                <div className="bg-slate-300 h-full rounded-full" style={{ width: `${cell.probHail}%` }} />
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
              <div className="text-slate-500 font-medium">WIND</div>
              <div className="text-slate-200 font-semibold mt-0.5">{cell.probDownburst}%</div>
              <div className="w-7 h-1 bg-white/[0.08] rounded-full mx-auto mt-1 overflow-hidden">
                <div className="bg-slate-300 h-full rounded-full" style={{ width: `${cell.probDownburst}%` }} />
              </div>
            </div>

            <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
              <div className="text-slate-500 font-medium">BURST</div>
              <div className="text-slate-200 font-semibold mt-0.5">{cell.probCloudburst}%</div>
              <div className="w-7 h-1 bg-white/[0.08] rounded-full mx-auto mt-1 overflow-hidden">
                <div className="bg-rose-400 h-full rounded-full" style={{ width: `${cell.probCloudburst}%` }} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onFocusCell(cell)}
              className="tactile-btn-primary px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-center space-x-1"
            >
              <span>Track Cell</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </button>

            <button
              onClick={() => onOpenCellDetails(cell)}
              className="tactile-btn p-2 text-xs rounded-lg text-slate-300 hover:text-white"
              title="Open Cell Details"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
