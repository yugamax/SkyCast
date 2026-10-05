import React, { useState } from 'react';
import { 
  Compass, 
  Wind, 
  Droplets, 
  Sun, 
  Activity, 
  Flame, 
  Gauge
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { StormCell } from '../../types/weather';

interface BentoMetricsGridProps {
  activeCell: StormCell | null;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: string;
  pressure?: number;
  uvIndex?: number;
  aqi?: number;
  onOpenInfo?: (infoId: string) => void;
}

export const BentoMetricsGrid: React.FC<BentoMetricsGridProps> = ({
  activeCell,
  temperature = 29,
  humidity = 78,
  windSpeed = 22,
  windDirection = 'SW',
  pressure = 1008.2,
  uvIndex = 6.4,
  aqi = 68,
  onOpenInfo
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // State for interactive compass rotation hover
  const [compassAngle, setCompassAngle] = useState<number>(224); // SW in degrees

  const effectiveWindSpeed = activeCell ? activeCell.speedKmh : windSpeed;
  const effectiveGustSpeed = Math.round(effectiveWindSpeed * 1.45);
  const effectiveAqi = activeCell ? 42 : aqi;
  const effectiveUv = activeCell ? 2.8 : uvIndex;

  // AQI status calculation
  const getAqiStatus = (val: number) => {
    if (val <= 50) return { label: 'Good (Clean Air)', dotColor: 'bg-teal-400' };
    if (val <= 100) return { label: 'Moderate Quality', dotColor: 'bg-slate-300' };
    if (val <= 200) return { label: 'Sensitive Watch', dotColor: 'bg-amber-400' };
    return { label: 'Severe Alert', dotColor: 'bg-rose-500' };
  };

  const aqiInfo = getAqiStatus(effectiveAqi);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 select-none">
      {/* 1. Wind Vector & 360° Compass Dial (4 cols on LG) */}
      <div className="lg:col-span-4 rounded-2xl p-5 border editorial-bento-card flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center space-x-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
              Wind Vector & Heading
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400/60">
            Beaufort F4
          </span>
        </div>

        {/* Circular Compass Dial Display */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-32 h-32 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center shadow-inner">
            {/* Compass Cardinal Marks */}
            <span className="absolute top-1.5 text-[9px] font-mono font-semibold text-cyan-400">N</span>
            <span className="absolute right-2 text-[9px] font-mono text-slate-500/50">E</span>
            <span className="absolute bottom-1.5 text-[9px] font-mono text-slate-500/50">S</span>
            <span className="absolute left-2 text-[9px] font-mono text-slate-500/50">W</span>

            {/* Inner Ring with degree ticks */}
            <div className="w-20 h-20 rounded-full border border-dashed border-white/[0.06] flex items-center justify-center">
              {/* Rotating Arrow Needle */}
              <div 
                className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${compassAngle}deg)` }}
              >
                <div className="w-0.5 h-12 bg-gradient-to-t from-transparent via-cyan-400 to-teal-300 rounded-full relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-300 absolute -top-0.5 -left-0.5 ring-1 ring-cyan-400/50" />
                </div>
              </div>
            </div>

            {/* Center Core Speed Metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-mono text-lg font-bold text-white">{effectiveWindSpeed}</span>
              <span className="text-[8px] font-mono text-slate-400/50 uppercase">km/h</span>
            </div>
          </div>
        </div>

        {/* Bottom Telemetry Ticker */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-white/[0.06]">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Vector</div>
            <div className="font-semibold text-slate-200">{windDirection} @ 224°</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Peak Gusts</div>
            <div className="font-semibold text-slate-200">{effectiveGustSpeed} km/h</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Knots</div>
            <div className="font-semibold text-slate-300/70">{Math.round(effectiveWindSpeed * 0.54)} kts</div>
          </div>
        </div>
      </div>

      {/* 2. Air Quality Index (AQI) (4 cols on LG) */}
      <div className="lg:col-span-4 rounded-2xl p-5 border editorial-bento-card flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
              Air Quality & Particulates
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-300 flex items-center space-x-1">
            <span className={`w-1.5 h-1.5 rounded-full ${aqiInfo.dotColor} inline-block mr-1`} />
            <span>{aqiInfo.label}</span>
          </span>
        </div>

        {/* Circular SVG Semi-Gauge */}
        <div className="flex items-center justify-between py-1">
          <div className="space-y-1">
            <div className="text-4xl font-semibold font-display text-white">
              {effectiveAqi}
            </div>
            <div className="text-xs font-mono text-slate-400/60">
              US-EPA Standard (0–500)
            </div>
            <p className="text-[11px] font-sans text-slate-400/70 max-w-[190px]">
              {effectiveAqi <= 50 ? 'Air quality is satisfactory for all outdoor operations.' : 'Moderate air quality in coastal urban basin.'}
            </p>
          </div>

          {/* Semi-Arc Gauge Visual */}
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="#2dd4bf" 
                strokeWidth="6" 
                fill="none" 
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (effectiveAqi / 300) * 251.2}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-medium text-slate-300">
              AQI
            </div>
          </div>
        </div>

        {/* Pollutants Matrix Bar */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono pt-2 border-t border-white/[0.06]">
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[8px] text-slate-400/50">PM2.5</div>
            <div className="font-semibold text-teal-300">18.2 µg</div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[8px] text-slate-400/50">PM10</div>
            <div className="font-semibold text-slate-300">34.6 µg</div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[8px] text-slate-400/50">NO₂</div>
            <div className="font-semibold text-slate-300">12 ppb</div>
          </div>
          <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[8px] text-slate-400/50">O₃</div>
            <div className="font-semibold text-slate-300">22 ppb</div>
          </div>
        </div>
      </div>

      {/* 3. Convective Instability & CAPE Updraft (4 cols on LG) */}
      <div className="lg:col-span-4 rounded-2xl p-5 border editorial-bento-card flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center space-x-2">
            <Flame className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
              Atmospheric Sounding & CAPE
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
            <span className={`w-1.5 h-1.5 rounded-full ${activeCell ? 'bg-cyan-400 animate-pulse' : 'bg-slate-400'} inline-block mr-1`} />
            <span>{activeCell ? 'Convective Updraft' : 'Stable Profile'}</span>
          </span>
        </div>

        <div className="space-y-2.5 py-1">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">
              {activeCell ? '2,850' : '1,420'} <span className="text-xs text-slate-400/50 font-normal">J/kg</span>
            </span>
            <span className="text-xs font-mono text-slate-400/70">
              Lifted Index: <b className="text-indigo-300">-6.2 K</b>
            </span>
          </div>

          {/* Instability progress spectrum */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-slate-400/50">
              <span>Stable</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 transition-all duration-700" 
                style={{ width: activeCell ? '85%' : '48%' }} 
              />
            </div>
          </div>
        </div>

        {/* Micro-Sounding Indices Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-white/[0.06]">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">CIN Barrier</div>
            <div className="font-semibold text-cyan-300">-15 J/kg</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">K-Index</div>
            <div className="font-semibold text-slate-200">38.4</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Total Totals</div>
            <div className="font-semibold text-slate-200">52.1 TT</div>
          </div>
        </div>
      </div>

      {/* 4. UV Solar Index (4 cols on LG) */}
      <div className="lg:col-span-4 rounded-2xl p-5 border editorial-bento-card flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center space-x-2">
            <Sun className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
              Solar Radiation (UV)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400/50">
            Solar Noon 12:15
          </span>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-3xl font-bold font-display text-white">
              {effectiveUv.toFixed(1)} <span className="text-xs font-mono text-slate-400/50">UVI</span>
            </div>
            <div className="text-xs font-mono text-slate-400/60 mt-0.5">
              Moderate Level
            </div>
            <p className="text-[11px] font-sans text-slate-400/70 mt-0.5">
              SPF 30+ recommended during peak noon.
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
            <Sun className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-2 border-t border-white/[0.06]">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Peak Today</div>
            <div className="font-semibold text-slate-200">8.2 UVI</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Cloud Attenuation</div>
            <div className="font-semibold text-slate-400/70">42% Reflection</div>
          </div>
        </div>
      </div>

      {/* 5. Barometric Altimetry & Tendency (4 cols on LG) */}
      <div className="lg:col-span-4 rounded-2xl p-5 border editorial-bento-card flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center space-x-2">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
              Barometric Altimetry
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block mr-1" />
            <span>Tendency -1.8</span>
          </span>
        </div>

        <div className="space-y-1.5 py-1">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">
              {pressure} <span className="text-xs font-normal text-slate-400/50">hPa</span>
            </span>
            <span className="text-xs font-mono text-cyan-300">
              ↓ 1.8 hPa / 3h
            </span>
          </div>
          <p className="text-[11px] font-sans text-slate-400/70">
            Gradual barometric falling ahead of regional sea-breeze trough.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-2 border-t border-white/[0.06]">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Sea Level Corrected</div>
            <div className="font-semibold text-slate-200">1009.1 QNH</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Station Elevation</div>
            <div className="font-semibold text-slate-400/70">9 m MSL</div>
          </div>
        </div>
      </div>

      {/* 6. Humidity, Dew Point & Cloud Ceiling (4 cols on LG) */}
      <div className="lg:col-span-4 rounded-2xl p-5 border editorial-bento-card flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center space-x-2">
            <Droplets className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-sans">
              Vapor Saturation & Dew Point
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400/50">
            LCL 650m
          </span>
        </div>

        <div className="space-y-1.5 py-1">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white">
              {humidity}% <span className="text-xs font-normal text-slate-400/50">RH</span>
            </span>
            <span className="text-xs font-mono text-teal-300">
              Dew Pt: <b className="text-white">24.2°C</b>
            </span>
          </div>
          <p className="text-[11px] font-sans text-slate-400/70">
            Dew point depression indicates low cloud condensation layer.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-2 border-t border-white/[0.06]">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Cloud Ceiling</div>
            <div className="font-semibold text-slate-200">750 m AGL</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[9px] text-slate-400/50">Horizontal Vis</div>
            <div className="font-semibold text-teal-300">7.5 km</div>
          </div>
        </div>
      </div>
    </div>
  );
};
