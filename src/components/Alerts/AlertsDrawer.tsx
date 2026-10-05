import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Share2, 
  Eye, 
  Compass, 
  ShieldAlert,
  Wind,
  CloudRain,
  Zap,
  Info
} from 'lucide-react';
import { AlertItem, HazardLevel } from '../../types/weather';
import { useTheme } from '../../context/ThemeContext';
import { InfoButton } from '../Common/InfoButton';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onFocusAlertOnMap: (alert: AlertItem) => void;
  onShareAlert: (alert: AlertItem) => void;
  onOpenInfo?: (infoId: string) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
  onFocusAlertOnMap,
  onShareAlert,
  onOpenInfo
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [filterLevel, setFilterLevel] = useState<HazardLevel | 'ALL'>('ALL');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(a => filterLevel === 'ALL' || a.level === filterLevel);

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full sm:w-[500px] border-l backdrop-blur-2xl shadow-2xl z-50 flex flex-col justify-between font-mono text-xs overflow-hidden select-none transition-colors ${
        isLight ? 'bg-white/98 border-slate-200 text-slate-800' : 'bg-[#070b14]/95 border-cyan-500/30 text-slate-100'
      }`}
    >
      {/* Header */}
      <div 
        className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'bg-rose-50 border-rose-200' : 'bg-[#0b1220] border-cyan-500/20'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div 
            className={`p-2 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'bg-rose-950 border border-rose-500/40 text-rose-400'
            }`}
          >
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-base font-bold font-heading tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Active Prototype Alerts
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold shadow-xs">
                {alerts.length} Active
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Convective hazard early warnings across India
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-2 rounded-xl transition-colors ${
            isLight ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div 
        className={`p-3 border-b flex items-center space-x-1.5 overflow-x-auto ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0c1222] border-cyan-500/15'
        }`}
      >
        {(['ALL', 'CRITICAL', 'SEVERE', 'MODERATE', 'ADVISORY'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all shrink-0 ${
              filterLevel === lvl
                ? isLight
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                : isLight
                ? 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Scrollable Alert List */}
      <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
            <p>No active alerts for selected severity filter.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.level === 'CRITICAL';
            const isSevere = alert.level === 'SEVERE';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  alert.acknowledged
                    ? isLight ? 'bg-slate-100/80 border-slate-300 opacity-80' : 'bg-[#0a0f1d]/70 border-slate-700/50 opacity-80'
                    : isCritical
                    ? isLight ? 'bg-rose-50 border-rose-300 shadow-md shadow-rose-200/40' : 'bg-[#18080c]/90 border-red-500/50 shadow-lg shadow-red-500/10'
                    : isSevere
                    ? isLight ? 'bg-amber-50 border-amber-300 shadow-md shadow-amber-200/40' : 'bg-[#181008]/90 border-orange-500/50'
                    : isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1222] border-cyan-500/20'
                }`}
              >
                {/* Alert Top Meta */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isCritical ? 'bg-red-600 text-white' : isSevere ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-black'
                        }`}
                      >
                        {alert.level}
                      </span>
                      <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{alert.id}</span>
                      {onOpenInfo && (
                        <InfoButton infoId={`HAZARD_${alert.hazardType}`} onOpenInfo={onOpenInfo} size="xs" />
                      )}
                    </div>
                    <h4 className={`text-sm font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {alert.locationName}
                    </h4>
                    <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {alert.state} • {alert.hazardType.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-red-500 font-bold text-xs flex items-center justify-end space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ETA {alert.etaMinutes}m</span>
                    </div>
                    <div className={`text-[9px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Valid: {alert.validUntil}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-[11px] leading-relaxed p-2.5 rounded-xl border ${
                  isLight ? 'bg-white/80 border-slate-200 text-slate-700' : 'bg-[#070b14]/70 border-slate-800 text-slate-300'
                }`}>
                  {alert.description}
                </p>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className={`p-2 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#070b14] border-cyan-500/10'}`}>
                    <span className="text-slate-500 dark:text-slate-400">Wind Gust</span>
                    <div className="text-orange-500 font-bold mt-0.5">{alert.windGustKmh} km/h</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#070b14] border-cyan-500/10'}`}>
                    <span className="text-slate-500 dark:text-slate-400">Rain Rate</span>
                    <div className="text-red-500 font-bold mt-0.5">{alert.rainRateMmHr} mm/h</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-[#070b14] border-cyan-500/10'}`}>
                    <span className="text-slate-500 dark:text-slate-400">Hail Size</span>
                    <div className="text-sky-600 dark:text-cyan-300 font-bold mt-0.5">{alert.hailSizeCm} cm</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => onFocusAlertOnMap(alert)}
                    className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center space-x-1 transition-colors ${
                      isLight ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Map</span>
                  </button>

                  <button
                    onClick={() => onShareAlert(alert)}
                    className={`px-3 py-1.5 rounded-xl border transition-colors ${
                      isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title="Export Alert"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                      title="Acknowledge Warning"
                    >
                      Ack
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div 
        className={`p-4 border-t flex items-center justify-between ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0c1222] border-cyan-500/20'
        }`}
      >
        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Audio siren beacons active for tier-1 critical alerts
        </span>
        <button
          onClick={onClose}
          className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-colors ${
            isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};
