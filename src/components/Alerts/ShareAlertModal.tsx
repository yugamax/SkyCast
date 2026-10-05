import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Send, 
  ShieldAlert 
} from 'lucide-react';
import { AlertItem } from '../../types/weather';
import { useTheme } from '../../context/ThemeContext';

interface ShareAlertModalProps {
  alert: AlertItem | null;
  onClose: () => void;
}

export const ShareAlertModal: React.FC<ShareAlertModalProps> = ({
  alert,
  onClose
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [copied, setCopied] = useState<boolean>(false);

  if (!alert) return null;

  const briefingText = `[SKYCAST PROTOTYPE EARLY WARNING ALERT]
ID: ${alert.id}
LEVEL: ${alert.level}
HAZARD: ${alert.hazardType.replace(/_/g, ' ')}
LOCATION: ${alert.locationName} (${alert.state})
DETECTED AT: ${alert.detectedAt} | ETA: ${alert.etaMinutes} mins | VALID UNTIL: ${alert.validUntil}
CONFIDENCE: ${alert.confidence}%
AFFECTED DISTRICTS: ${alert.affectedDistricts.join(', ')}
PEAK WIND GUST: ${alert.windGustKmh} km/h | MAX RAIN RATE: ${alert.rainRateMmHr} mm/h | HAIL SIZE: ${alert.hailSizeCm} cm

SUMMARY:
${alert.description}

RECOMMENDED CIVIL DEFENSE ACTION:
${alert.recommendedAction}

DISCLAIMER: This is a generated prototype alert demonstration from the SKYCAST Convective Nowcasting System.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(briefingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [alert.lng, alert.lat]
          },
          properties: {
            id: alert.id,
            level: alert.level,
            hazard: alert.hazardType,
            location: alert.locationName,
            etaMinutes: alert.etaMinutes,
            confidence: alert.confidence,
            windGustKmh: alert.windGustKmh,
            rainRateMmHr: alert.rainRateMmHr,
            affectedDistricts: alert.affectedDistricts,
            source: alert.source
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKYCAST_ALERT_${alert.id}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintBriefing = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none font-mono text-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border transition-colors ${
          isLight 
            ? 'bg-white border-sky-300/80 text-slate-800 shadow-slate-300/50' 
            : 'bg-[#070b14] border-cyan-500/40 text-slate-100 shadow-black/80'
        }`}
      >
        {/* Header */}
        <div 
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-sky-50 border-sky-200' : 'bg-[#0b1220] border-cyan-500/20'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div 
              className={`p-2 rounded-xl flex items-center justify-center ${
                isLight ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'bg-cyan-950 border border-cyan-500/30 text-cyan-400'
              }`}
            >
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold font-heading tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Export & Dispatch Early Warning
              </h3>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{alert.id} • {alert.locationName}</p>
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

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          <div 
            className={`p-3.5 rounded-2xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0c1222] border-cyan-500/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">Standard Disaster Message Format</span>
              <button
                onClick={handleCopyText}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  isLight 
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs' 
                    : 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={briefingText}
              rows={8}
              className={`w-full rounded-xl p-3 text-[11px] font-mono resize-none focus:outline-none border ${
                isLight 
                  ? 'bg-white border-slate-300 text-slate-800' 
                  : 'bg-[#050810] border-slate-700 text-slate-200'
              }`}
            />
          </div>

          {/* Export formats */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadGeoJSON}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all group ${
                isLight 
                  ? 'bg-slate-50 hover:bg-sky-50 border-slate-200 hover:border-sky-300 text-slate-800' 
                  : 'bg-[#0c1222] hover:bg-[#121c32] border-cyan-500/25 text-white'
              }`}
            >
              <div>
                <div className="font-bold flex items-center space-x-1.5">
                  <Download className="w-4 h-4 text-sky-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Export GeoJSON</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>For QGIS, ArcGIS & NDRF GIS</div>
              </div>
            </button>

            <button
              onClick={handlePrintBriefing}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all group ${
                isLight 
                  ? 'bg-slate-50 hover:bg-amber-50 border-slate-200 hover:border-amber-300 text-slate-800' 
                  : 'bg-[#0c1222] hover:bg-[#121c32] border-cyan-500/25 text-white'
              }`}
            >
              <div>
                <div className="font-bold flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>Print PDF Briefing</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Standard NDMA Format</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div 
          className={`p-4 border-t flex justify-end ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0c1222] border-cyan-500/20'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
