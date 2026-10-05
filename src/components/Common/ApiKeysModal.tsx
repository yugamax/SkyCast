import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Satellite, 
  Radar, 
  CloudRain, 
  Save, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { apiClient } from '../../services/apiClient';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Primary Universal OpenWeather Key
  const [openWeatherKey, setOpenWeatherKey] = useState<string>('');
  const [testResult, setTestResult] = useState<{ testing: boolean; success?: boolean; message?: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copiedEnv, setCopiedEnv] = useState<boolean>(false);

  // Optional Advanced secondary keys
  const [mapboxKey, setMapboxKey] = useState<string>('');
  const [isroKey, setIsroKey] = useState<string>('');

  useEffect(() => {
    // Load existing key from env or localStorage
    const existingKey = 
      import.meta.env.VITE_OPENWEATHER_API_KEY ||
      import.meta.env.VITE_OPENWEATHERMAP_API_KEY ||
      localStorage.getItem('skycast_api_key_OPENWEATHER') ||
      '';
    setOpenWeatherKey(existingKey);

    setMapboxKey(localStorage.getItem('skycast_api_key_MAPBOX') || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '');
    setIsroKey(localStorage.getItem('skycast_api_key_ISRO') || import.meta.env.VITE_ISRO_MOSDAC_KEY || '');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestResult({ testing: true });
    const res = await apiClient.testOpenWeatherConnection(openWeatherKey);
    setTestResult({ testing: false, success: res.success, message: res.message });
  };

  const handleSave = () => {
    localStorage.setItem('skycast_api_key_OPENWEATHER', openWeatherKey.trim());
    if (mapboxKey) localStorage.setItem('skycast_api_key_MAPBOX', mapboxKey.trim());
    if (isroKey) localStorage.setItem('skycast_api_key_ISRO', isroKey.trim());

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopyEnv = () => {
    const envContent = `# SkyCast Convective Nowcast Universal Configuration\nVITE_OPENWEATHER_API_KEY="${openWeatherKey || 'your_openweathermap_api_key_here'}"\nVITE_MAPBOX_ACCESS_TOKEN="${mapboxKey}"\n`;
    navigator.clipboard.writeText(envContent);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none font-mono text-xs animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0a0a0e] border-[#262633]'
        }`}
      >
        {/* Header */}
        <div 
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101015] border-[#22222d]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                API & Live Data Stream Center
              </h3>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Simplified 1-Key Universal Atmospheric Feed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-[#1a1a24] text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Universal Single Key Callout Banner */}
          <div 
            className={`p-3.5 rounded-xl border space-y-2 ${
              isLight 
                ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
                : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-xs uppercase tracking-wide">
                Single Universal Key Architecture
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              You do <b>not</b> need to register for multiple complex APIs! A single free <b>OpenWeatherMap API key</b> powers live surface telemetry, radar precipitation sweeps, satellite cloud layers, and convective nowcasts across India.
            </p>
          </div>

          {/* Primary Key Input Card */}
          <div 
            className={`p-4 rounded-xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101015] border-[#22222d]'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-amber-400 flex items-center space-x-1.5">
                <CloudRain className="w-4 h-4 text-amber-400" />
                <span>OpenWeatherMap API Key (Primary)</span>
              </label>
              <a 
                href="https://openweathermap.org/api" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-amber-400 hover:underline flex items-center space-x-1"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="text"
                value={openWeatherKey}
                onChange={(e) => setOpenWeatherKey(e.target.value)}
                placeholder="e.g. 6a668b52367d5842925dac4bfb053c57"
                className={`w-full p-2.5 rounded-lg border font-mono text-xs focus:outline-none transition-all ${
                  isLight 
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500' 
                    : 'bg-[#08080b] border-[#2b2b38] text-amber-300 focus:border-amber-400'
                }`}
              />
            </div>

            {/* Test Connection Button & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                onClick={handleTestConnection}
                disabled={testResult?.testing || !openWeatherKey}
                className="uiverse-btn-dark px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Activity className={`w-3.5 h-3.5 ${testResult?.testing ? 'animate-spin' : 'text-amber-400'}`} />
                <span>{testResult?.testing ? 'Testing Feed...' : 'Test Live Connection'}</span>
              </button>

              {testResult && (
                <div className={`text-[11px] font-bold flex items-center space-x-1.5 ${
                  testResult.success ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span className="truncate max-w-[280px]">{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Zero-Key Standalone Guarantee */}
          <div 
            className={`p-3 rounded-xl border flex items-start space-x-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d0d12] border-[#1e1e28]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400">
              <span className="font-bold text-slate-200">Zero-Key Fallback: </span>
              If no API key is provided, SkyCast’s built-in physics simulation engine generates realistic Doppler radar sweeps, satellite radiance, and convective storm tracks automatically.
            </div>
          </div>

          {/* Optional Advanced Keys Accordion */}
          <div className="border border-[#22222d] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full p-3 flex items-center justify-between text-xs font-bold transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-[#101015] hover:bg-[#15151e] text-slate-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>Optional Advanced Feeds (Mapbox / ISRO NetCDF)</span>
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="p-3.5 space-y-3 bg-[#08080b] border-t border-[#22222d]">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Mapbox Access Token (Custom Aerials):</span>
                    <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">mapbox.com</a>
                  </div>
                  <input
                    type="text"
                    value={mapboxKey}
                    onChange={(e) => setMapboxKey(e.target.value)}
                    placeholder="pk.eyJ1..."
                    className="w-full p-2 rounded border border-[#2b2b38] bg-[#101015] text-xs text-slate-200 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>ISRO MOSDAC User Token (NetCDF HDF5):</span>
                    <a href="https://www.mosdac.gov.in" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">mosdac.gov.in</a>
                  </div>
                  <input
                    type="text"
                    value={isroKey}
                    onChange={(e) => setIsroKey(e.target.value)}
                    placeholder="ISRO Token"
                    className="w-full p-2 rounded border border-[#2b2b38] bg-[#101015] text-xs text-slate-200 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div 
          className={`p-3.5 border-t flex items-center justify-between gap-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101015] border-[#22222d]'
          }`}
        >
          <button
            onClick={handleCopyEnv}
            className="uiverse-btn-dark px-3 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5"
          >
            {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedEnv ? 'Copied .env Template!' : 'Copy to .env'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {savedSuccess && (
              <span className="text-emerald-400 font-bold text-[11px] flex items-center space-x-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            )}

            <button
              onClick={handleSave}
              className="uiverse-btn-amber px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Active Keys</span>
            </button>

            <button
              onClick={onClose}
              className="uiverse-btn-dark px-3 py-2 rounded-xl font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
