import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  ShieldCheck, 
  Volume2, 
  RotateCcw, 
  Save, 
  AlertCircle,
  Zap,
  Wind,
  CloudRain,
  Key
} from 'lucide-react';
import { AlertThresholdConfig } from '../../types/weather';
import { DEFAULT_ALERT_THRESHOLDS } from '../../data/mockData';
import { audioAlerts } from '../../services/simulationEngine';
import { useTheme } from '../../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: AlertThresholdConfig;
  onSaveThresholds: (thresholds: AlertThresholdConfig) => void;
  onOpenApiKeys?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSaveThresholds,
  onOpenApiKeys
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [localThresholds, setLocalThresholds] = useState<AlertThresholdConfig>({ ...thresholds });

  if (!isOpen) return null;

  const handleReset = () => {
    setLocalThresholds({ ...DEFAULT_ALERT_THRESHOLDS });
    audioAlerts.playAlertTone('BEEP');
  };

  const handleSave = () => {
    onSaveThresholds(localThresholds);
    audioAlerts.playAlertTone('BEEP');
    onClose();
  };

  const handleTestSiren = () => {
    audioAlerts.playAlertTone('CRITICAL');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none font-mono animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors ${
          isLight 
            ? 'bg-white border-sky-300/80 text-slate-800 shadow-slate-300/50' 
            : 'bg-[#070b14] border-cyan-500/40 text-slate-100 shadow-black/80'
        }`}
      >
        {/* Modal Header */}
        <div 
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-sky-50 border-sky-200' : 'bg-[#0b1220] border-cyan-500/20'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div 
              className={`p-2.5 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'bg-cyan-950 border border-cyan-500/30 text-cyan-400'
              }`}
            >
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold font-heading tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Prototype Alert Thresholds & Engine Settings
              </h3>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Configure automated convective early-warning trigger criteria
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isLight ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Official Disclaimer Banner */}
          <div 
            className={`p-3.5 rounded-xl border flex items-start space-x-2.5 ${
              isLight ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            }`}
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <b className="font-bold text-amber-600 dark:text-amber-300">PROTOTYPE ALERT THRESHOLDS:</b> These parameters govern algorithmic early-warning prototype logic for convective nowcasting research and operational drill demonstrations. Not official meteorological warning criteria issued by the India Meteorological Department.
            </div>
          </div>

          {/* Quick API Keys Button Banner */}
          {onOpenApiKeys && (
            <div 
              className={`p-3 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0c1222] border-cyan-500/20'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-sky-500 dark:text-cyan-400" />
                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  External Meteorological API Keys Setup:
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenApiKeys();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isLight ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900'
                }`}
              >
                Manage API Keys &rarr;
              </button>
            </div>
          )}

          {/* Probability Sliders */}
          <div 
            className={`p-4 rounded-2xl border space-y-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c1222] border-cyan-500/20'
            }`}
          >
            <h4 className={`font-bold uppercase text-[11px] tracking-wider flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-cyan-400'}`}>
              <span>Hazard Probability Triggers</span>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>1.5 km Cell Minimums</span>
            </h4>

            {/* Cloudburst Probability */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-red-500" />
                  <span>Cloudburst Probability Trigger:</span>
                </span>
                <span className="font-bold text-red-500">{localThresholds.cloudburstProb}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={localThresholds.cloudburstProb}
                onChange={(e) => setLocalThresholds({ ...localThresholds, cloudburstProb: Number(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
            </div>

            {/* Hail Probability */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>❄ Severe Hail Probability Trigger:</span>
                <span className="font-bold text-sky-600 dark:text-cyan-400">{localThresholds.hailProb}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                step="5"
                value={localThresholds.hailProb}
                onChange={(e) => setLocalThresholds({ ...localThresholds, hailProb: Number(e.target.value) })}
                className="w-full accent-sky-500 dark:accent-cyan-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
            </div>

            {/* Downburst Probability */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Wind className="w-3.5 h-3.5 text-orange-500" />
                  <span>Downburst / Microburst Probability:</span>
                </span>
                <span className="font-bold text-orange-500">{localThresholds.downburstProb}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={localThresholds.downburstProb}
                onChange={(e) => setLocalThresholds({ ...localThresholds, downburstProb: Number(e.target.value) })}
                className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
            </div>

            {/* Lightning Probability */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Severe Lightning Probability Trigger:</span>
                </span>
                <span className="font-bold text-amber-500">{localThresholds.lightningProb}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={localThresholds.lightningProb}
                onChange={(e) => setLocalThresholds({ ...localThresholds, lightningProb: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Physical Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div 
              className={`p-3.5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c1222] border-cyan-500/20'
              }`}
            >
              <label className="text-slate-700 dark:text-slate-300 block font-semibold text-[11px]">
                Reflectivity Core Cutoff (dBZ)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="40"
                  max="70"
                  value={localThresholds.dbzThreshold}
                  onChange={(e) => setLocalThresholds({ ...localThresholds, dbzThreshold: Number(e.target.value) })}
                  className={`border rounded-lg px-3 py-1.5 font-bold w-24 text-center text-sm ${
                    isLight 
                      ? 'bg-white border-slate-300 text-slate-900' 
                      : 'bg-[#070b14] border-cyan-500/30 text-slate-100'
                  }`}
                />
                <span className="text-slate-500">dBZ</span>
              </div>
            </div>

            <div 
              className={`p-3.5 rounded-2xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c1222] border-cyan-500/20'
              }`}
            >
              <label className="text-slate-700 dark:text-slate-300 block font-semibold text-[11px]">
                Wind Gust Warning Cutoff
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="45"
                  max="120"
                  value={localThresholds.windGustKmh}
                  onChange={(e) => setLocalThresholds({ ...localThresholds, windGustKmh: Number(e.target.value) })}
                  className={`border rounded-lg px-3 py-1.5 font-bold w-24 text-center text-sm ${
                    isLight 
                      ? 'bg-white border-slate-300 text-slate-900' 
                      : 'bg-[#070b14] border-cyan-500/30 text-slate-100'
                  }`}
                />
                <span className="text-slate-500">km/h</span>
              </div>
            </div>
          </div>

          {/* Audio siren test */}
          <div 
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c1222] border-cyan-500/20'
            }`}
          >
            <div>
              <div className="font-bold flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 text-sky-500 dark:text-cyan-400" />
                <span>Tactical Warning Audio Beacon</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Synthesizes tactical warning frequencies via Web Audio API
              </p>
            </div>

            <button
              onClick={handleTestSiren}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors shadow-xs ${
                isLight 
                  ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300' 
                  : 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900'
              }`}
            >
              Test Siren
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          className={`p-4 border-t flex items-center justify-between ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0b1220] border-cyan-500/20'
          }`}
        >
          <button
            onClick={handleReset}
            className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl transition-colors ${
                isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-colors shadow-md ${
                isLight 
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/30' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Thresholds</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
