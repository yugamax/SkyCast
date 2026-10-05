import React from 'react';
import { 
  AlertTriangle, 
  X, 
  Compass, 
  Wind, 
  Zap, 
  CloudRain, 
  Layers, 
  ShieldAlert, 
  MapPin
} from 'lucide-react';
import { StormCell } from '../../types/weather';
import { useTheme } from '../../context/ThemeContext';
import { InfoButton } from '../Common/InfoButton';

interface StormCellInspectorProps {
  cell: StormCell | null;
  onClose: () => void;
  onTrackOnMap?: (cell: StormCell) => void;
  onOpenInfo?: (infoId: string) => void;
}

export const StormCellInspector: React.FC<StormCellInspectorProps> = ({
  cell,
  onClose,
  onTrackOnMap,
  onOpenInfo
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!cell) return null;

  const isCritical = cell.severity === 'CRITICAL';
  const isSevere = cell.severity === 'SEVERE';

  const severityBadgeClass = isCritical 
    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
    : isSevere 
    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30';

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full sm:w-[440px] border-l shadow-2xl z-50 flex flex-col justify-between font-mono text-xs overflow-hidden transition-all backdrop-blur-2xl ${
        isLight 
          ? 'bg-white/98 border-slate-200 text-slate-800' 
          : 'bg-[#0b1124]/95 border-white/[0.08] text-slate-100'
      }`}
    >
      {/* Header */}
      <div 
        className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div 
            className={`p-2.5 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-teal-600 text-white' : 'bg-white/[0.06] border border-white/[0.08] text-teal-400'
            }`}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${severityBadgeClass}`}>
                {cell.severity} CELL
              </span>
              <span className={`font-bold text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {cell.id}
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400/80'}`}>{cell.name}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-2 rounded-xl transition-colors ${
            isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/[0.08]'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Core Physical Telemetry Card */}
        <div 
          className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className={`font-bold uppercase text-[10px] tracking-wider flex items-center space-x-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              <span>Radar & Kinematics Telemetry</span>
              {onOpenInfo && (
                <InfoButton infoId="RADAR_REFLECTIVITY" onOpenInfo={onOpenInfo} size="xs" />
              )}
            </h4>
            <span className={`text-[10px] font-bold ${isLight ? 'text-teal-700' : 'text-teal-400'}`}>{cell.radarSource}</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Reflectivity</div>
              <div className="text-base font-black text-rose-400 mt-1 font-mono">{cell.reflectivityDbz} dBZ</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Echo Top</div>
              <div className={`text-base font-black mt-1 font-mono ${isLight ? 'text-teal-700' : 'text-teal-300'}`}>{cell.echoTopKm} km</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">VIL Density</div>
              <div className="text-base font-black text-amber-400 mt-1 font-mono">{cell.vertIntegratedLiquidKgM2} kg/m²</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className={`flex justify-between p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <span className="text-slate-400">Velocity:</span>
              <span className="font-bold text-white">{cell.speedKmh} km/h ({cell.directionText})</span>
            </div>
            <div className={`flex justify-between p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <span className="text-slate-400">CAPE Index:</span>
              <span className="font-bold text-amber-400">{cell.capeJouleKg || 3200} J/kg</span>
            </div>
          </div>
        </div>

        {/* Multi-Hazard Probability Breakdown */}
        <div 
          className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className={`font-bold uppercase text-[10px] tracking-wider flex items-center space-x-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
              <span>Convective Hazard Probabilities</span>
            </h4>
            <span className="text-[10px] text-teal-400 font-bold">Confidence: {cell.confidence}%</span>
          </div>

          <div className="space-y-3">
            {/* Lightning */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-teal-400 flex items-center space-x-1.5 font-semibold">
                  <Zap className="w-3 h-3" />
                  <span>Severe Lightning Activity</span>
                </span>
                <span className="font-bold text-teal-300">{cell.probLightning}%</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-400 h-full rounded-full transition-all" style={{ width: `${cell.probLightning}%` }} />
              </div>
            </div>

            {/* Hail */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-cyan-400 flex items-center space-x-1.5 font-semibold">
                  <span>❄ Severe Hail (Est. {cell.hailDiameterCm || 2.5} cm)</span>
                </span>
                <span className="font-bold text-cyan-300">{cell.probHail}%</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full transition-all" style={{ width: `${cell.probHail}%` }} />
              </div>
            </div>

            {/* Downburst */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-amber-400 flex items-center space-x-1.5 font-semibold">
                  <Wind className="w-3 h-3" />
                  <span>Downburst / Wind Gust ({cell.maxWindGustKmh} km/h)</span>
                </span>
                <span className="font-bold text-amber-300">{cell.probDownburst}%</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${cell.probDownburst}%` }} />
              </div>
            </div>

            {/* Cloudburst */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-rose-400 flex items-center space-x-1.5 font-semibold">
                  <CloudRain className="w-3 h-3" />
                  <span>Cloudburst & Deluge ({cell.predictedRainRateMmHr} mm/h)</span>
                </span>
                <span className="font-bold text-rose-300">{cell.probCloudburst}%</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-400 h-full rounded-full transition-all" style={{ width: `${cell.probCloudburst}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Target Location ETA Card */}
        <div 
          className={`p-4 rounded-2xl border space-y-2 ${
            isLight ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-rose-950/20 border-rose-500/20 text-rose-200'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs uppercase flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Direct Impact Corridor</span>
            </span>
            <span className="text-xs font-black text-rose-300 font-mono">ETA {cell.etaMinutes} mins</span>
          </div>
          <div className="text-sm font-bold text-white">
            {cell.targetLocation}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Automated civil warning dispatch active for local municipal authorities and emergency responders.
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div 
        className={`p-4 border-t flex items-center space-x-2.5 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/[0.02] border-white/[0.06]'
        }`}
      >
        {onTrackOnMap && (
          <button
            onClick={() => onTrackOnMap(cell)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
              isLight 
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs' 
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md font-semibold'
            }`}
          >
            Center on Map
          </button>
        )}
        <button
          onClick={onClose}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors ${
            isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/[0.08]'
          }`}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
