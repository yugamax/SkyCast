import React from 'react';
import { 
  Info, 
  X, 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  Compass, 
  Sparkles, 
  ChevronRight,
  ExternalLink 
} from 'lucide-react';
import { MetricInfo, WEATHER_INFO_REGISTRY } from '../../data/weatherInfoData';
import { useTheme } from '../../context/ThemeContext';

interface WeatherInfoModalProps {
  infoId: string | null;
  onClose: () => void;
}

export const WeatherInfoModal: React.FC<WeatherInfoModalProps> = ({ infoId, onClose }) => {
  const { theme } = useTheme();

  if (!infoId) return null;

  const item: MetricInfo | undefined = WEATHER_INFO_REGISTRY[infoId] || {
    id: infoId,
    title: infoId.replace(/_/g, ' '),
    category: 'RADAR',
    shortDescription: 'Meteorological parameter and physical diagnostic metric used in the SKYCAST nowcasting system.',
    scientificDefinition: `Physical index quantifying atmospheric convective severity for ${infoId.replace(/_/g, ' ')}.`,
    units: 'Standard SI / Meteorological Units',
    thresholds: [
      { range: 'Nominal', label: 'Advisory Level', color: 'bg-cyan-500 text-black', impact: 'Monitored routine convective development.' },
      { range: 'High Risk', label: 'Severe / Warning', color: 'bg-red-600 text-white', impact: 'Automated early warning trigger.' }
    ],
    operationalImpact: 'Provides mission-critical situational awareness for aviation, disaster management, and agriculture.',
    formulaOrSensor: 'Multi-Sensor Ingestion (DWR / INSAT-3D / Lightning TOA)',
    actionGuideline: 'Check cell ETA and review automated safety alerts.'
  };

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none font-mono animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors ${
          isLight 
            ? 'bg-white border-sky-300/80 text-slate-800 shadow-slate-300/50' 
            : 'bg-[#070b14] border-cyan-500/40 text-slate-100 shadow-black/80'
        }`}
      >
        {/* Header */}
        <div 
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-sky-50 border-sky-200' : 'bg-[#0c1222] border-cyan-500/20'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div 
              className={`p-2 rounded-xl flex items-center justify-center ${
                isLight 
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                  : 'bg-cyan-950 border border-cyan-500/40 text-cyan-400'
              }`}
            >
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span 
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    isLight 
                      ? 'bg-sky-100 text-sky-800 border border-sky-300' 
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {item.category}
                </span>
                <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {item.units || 'Metric Guide'}
                </span>
              </div>
              <h3 className={`text-base font-bold font-heading tracking-wide mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {item.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isLight 
                ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs leading-relaxed">
          {/* Summary Callout */}
          <div 
            className={`p-3.5 rounded-xl border ${
              isLight 
                ? 'bg-sky-50/70 border-sky-200 text-sky-950' 
                : 'bg-[#0c1222] border-cyan-500/30 text-slate-200'
            }`}
          >
            <div className="font-semibold text-xs leading-relaxed">
              {item.shortDescription}
            </div>
          </div>

          {/* Scientific Definition */}
          <div className="space-y-1.5">
            <h4 className={`font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5 ${isLight ? 'text-sky-800' : 'text-cyan-400'}`}>
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scientific Principle & Physics</span>
            </h4>
            <div 
              className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#090e1a] border-slate-800 text-slate-300'
              }`}
            >
              {item.scientificDefinition}
            </div>
          </div>

          {/* Mathematical Formula / Sensor Origin */}
          {item.formulaOrSensor && (
            <div className="space-y-1.5">
              <h4 className={`font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5 ${isLight ? 'text-purple-800' : 'text-purple-400'}`}>
                <Activity className="w-3.5 h-3.5" />
                <span>Sensor Source / Governing Formula</span>
              </h4>
              <div 
                className={`p-3 rounded-xl border font-mono text-[11px] font-bold ${
                  isLight 
                    ? 'bg-purple-50 border-purple-200 text-purple-900' 
                    : 'bg-purple-950/40 border-purple-500/30 text-purple-300'
                }`}
              >
                {item.formulaOrSensor}
              </div>
            </div>
          )}

          {/* Severity Thresholds Table */}
          {item.thresholds && item.thresholds.length > 0 && (
            <div className="space-y-2">
              <h4 className={`font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5 ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Severity Scale & Meteorological Cutoffs</span>
              </h4>
              <div className="space-y-1.5">
                {item.thresholds.map((th, i) => (
                  <div 
                    key={i} 
                    className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] ${
                      isLight ? 'bg-white border-slate-200' : 'bg-[#090e1a] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase shadow-xs ${th.color}`}>
                        {th.label}
                      </span>
                      <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {th.range}
                      </span>
                    </div>
                    <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {th.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Guidelines */}
          <div 
            className={`p-3.5 rounded-xl border ${
              isLight 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="font-bold text-[11px] flex items-center space-x-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Recommended Operational Protocol:</span>
            </div>
            <div className="text-[11px] leading-relaxed">
              {item.actionGuideline}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className={`p-3.5 border-t flex items-center justify-between ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0c1222] border-cyan-500/20'
          }`}
        >
          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            SKYCAST Meteorological Reference Framework • IMD/ISRO Standards
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm ${
              isLight 
                ? 'bg-sky-600 hover:bg-sky-700 text-white' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
