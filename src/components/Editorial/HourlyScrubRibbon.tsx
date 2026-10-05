import React, { useState, useRef, useMemo } from 'react';
import { 
  Clock, 
  Sun, 
  Moon, 
  CloudRain, 
  Zap,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface HourlyForecastPoint {
  hourIndex: number;
  timeLabel: string;
  temp: number;
  feelsLike: number;
  pop: number; // Probability of precipitation 0-100%
  condition: 'SUNNY' | 'PARTLY_CLOUDY' | 'OVERCAST' | 'RAIN' | 'THUNDERSTORM';
  conditionPhrase: string;
  windSpeed: number;
  windDir: string;
  isDaytime: boolean;
  reflectivityDbz: number;
}

interface HourlyScrubRibbonProps {
  onScrubHour?: (point: HourlyForecastPoint) => void;
  baseTemp?: number;
  isSevere?: boolean;
  customHourlyData?: HourlyForecastPoint[];
}

export const HourlyScrubRibbon: React.FC<HourlyScrubRibbonProps> = ({
  onScrubHour,
  baseTemp = 29,
  isSevere = true,
  customHourlyData
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeHourIndex, setActiveHourIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Generate continuous 24-hour nowcast interpolation or use live Open-Meteo data
  const hourlyData: HourlyForecastPoint[] = useMemo(() => {
    if (customHourlyData && customHourlyData.length > 0) {
      return customHourlyData;
    }
    const points: HourlyForecastPoint[] = [];
    const currentHour = new Date().getHours();

    for (let i = 0; i < 24; i++) {
      const h = (currentHour + i) % 24;
      const isDay = h >= 6 && h <= 18;
      
      // Temperature diurnal variation curve
      const diurnalOffset = Math.sin(((h - 9) / 24) * Math.PI * 2) * 5;
      const stormCooling = (i >= 2 && i <= 7 && isSevere) ? -4 : 0;
      const temp = Math.round(baseTemp + diurnalOffset + stormCooling);

      // Rain probability & condition progression
      let pop = 15;
      let condition: HourlyForecastPoint['condition'] = isDay ? 'PARTLY_CLOUDY' : 'OVERCAST';
      let phrase = 'Atmospheric moisture convergence with scattered cirrus';
      let dbz = 18;

      if (isSevere && i >= 1 && i <= 5) {
        pop = Math.min(95, 55 + i * 10);
        condition = i === 2 || i === 3 ? 'THUNDERSTORM' : 'RAIN';
        phrase = i === 2 
          ? 'Elevated precipitation bands with gust front • Heavy rain with active lightning' 
          : 'Precipitation bands advancing with moderate convective updraft';
        dbz = 48 + i * 2;
      } else if (h >= 11 && h <= 15) {
        pop = 35;
        condition = 'SUNNY';
        phrase = 'Solar thermal maximum • Convective initiation watch active';
        dbz = 24;
      } else if (!isDay) {
        pop = 20;
        condition = 'OVERCAST';
        phrase = 'Nocturnal boundary layer cooling • Low-level stability';
        dbz = 15;
      }

      const timeLabel = i === 0 ? 'NOW' : `${String(h).padStart(2, '0')}:00`;

      points.push({
        hourIndex: i,
        timeLabel,
        temp,
        feelsLike: temp + (pop > 50 ? 4 : 2),
        pop,
        condition,
        conditionPhrase: phrase,
        windSpeed: Math.round(14 + Math.sin(i * 0.8) * 8 + (condition === 'THUNDERSTORM' ? 22 : 0)),
        windDir: i % 2 === 0 ? 'SW' : 'SSW',
        isDaytime: isDay,
        reflectivityDbz: dbz
      });
    }

    return points;
  }, [baseTemp, isSevere]);

  // Seamless fluid scrubbing across the entire graph
  const handleSelectPoint = (point: HourlyForecastPoint) => {
    setActiveHourIndex(point.hourIndex);
    if (onScrubHour) {
      onScrubHour(point);
    }
  };

  const handleResetToLive = () => {
    handleSelectPoint(hourlyData[0]);
  };

  // Fluid mouse tracking over the entire canvas ribbon
  const handleGraphMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const fraction = relativeX / rect.width;
    const targetIdx = Math.min(23, Math.floor(fraction * 24));
    if (targetIdx !== activeHourIndex && hourlyData[targetIdx]) {
      handleSelectPoint(hourlyData[targetIdx]);
    }
  };

  // SVG dimensions for continuous smooth curve
  const svgWidth = 1200;
  const svgHeight = 56;
  const paddingX = 18;
  const minTemp = Math.min(...hourlyData.map(p => p.temp)) - 2;
  const maxTemp = Math.max(...hourlyData.map(p => p.temp)) + 2;
  const tempRange = Math.max(1, maxTemp - minTemp);

  const stepX = (svgWidth - paddingX * 2) / (hourlyData.length - 1);

  const curveCoordinates = hourlyData.map((p, idx) => {
    const x = paddingX + idx * stepX;
    const y = svgHeight - 12 - ((p.temp - minTemp) / tempRange) * (svgHeight - 24);
    return { x, y, point: p };
  });

  // Build cubic Bezier path
  const pathD = useMemo(() => {
    if (curveCoordinates.length === 0) return '';
    let d = `M ${curveCoordinates[0].x} ${curveCoordinates[0].y}`;

    for (let i = 0; i < curveCoordinates.length - 1; i++) {
      const p0 = curveCoordinates[i === 0 ? 0 : i - 1];
      const p1 = curveCoordinates[i];
      const p2 = curveCoordinates[i + 1];
      const p3 = curveCoordinates[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [curveCoordinates]);

  // Area fill below curve
  const areaD = `${pathD} L ${curveCoordinates[curveCoordinates.length - 1].x} ${svgHeight} L ${curveCoordinates[0].x} ${svgHeight} Z`;

  const activePoint = hourlyData[activeHourIndex] || hourlyData[0];
  const activeCoord = curveCoordinates[activeHourIndex] || curveCoordinates[0];

  return (
    <div className="rounded-2xl p-3 sm:p-3.5 ios-glass-card relative overflow-hidden transition-all duration-200 select-none">
      {/* Header & Scrub Status Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            24-Hour Nowcast Timeline
          </span>
          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
            (Hover to Scrub)
          </span>
        </div>

        {/* Active Scrub Telemetry Readout & Return to Live Button */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          {activeHourIndex !== 0 && (
            <button
              onClick={handleResetToLive}
              className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 text-[11px] font-medium transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Return to Live</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px]">
            {activeHourIndex === 0 ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>LIVE NOW</span>
              </span>
            ) : (
              <span>
                <b className="text-zinc-100">{activePoint.timeLabel}</b> <span className="text-zinc-500">(+ {activePoint.hourIndex}h)</span>
              </span>
            )}

            <span className="text-zinc-600">•</span>
            <span className="text-zinc-200 font-bold">{activePoint.temp}°C</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">
              Precip: <b className={activePoint.pop > 50 ? 'text-amber-400' : 'text-zinc-300'}>{activePoint.pop}%</b>
            </span>
          </div>
        </div>
      </div>

      {/* Fluid Interactive SVG Graph Container (Hoverable anywhere) */}
      <div 
        ref={containerRef}
        onMouseMove={handleGraphMouseMove}
        className="relative w-full cursor-ew-resize py-0.5"
      >
        {/* Continuous SVG Canvas Curve */}
        <div className="relative h-[48px] w-full">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            className="w-full h-full overflow-visible pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="obsidianCurveFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.16)" />
                <stop offset="60%" stopColor="rgba(16, 185, 129, 0.03)" />
                <stop offset="100%" stopColor="rgba(11, 12, 14, 0)" />
              </linearGradient>

              <linearGradient id="obsidianStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#E4E4E7" />
              </linearGradient>
            </defs>

            {/* Area Gradient */}
            <path d={areaD} fill="url(#obsidianCurveFill)" />

            {/* Temperature Curve Line */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="url(#obsidianStrokeGrad)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Active Playhead Guideline */}
            {activeCoord && (
              <g>
                <line 
                  x1={activeCoord.x} 
                  y1="0" 
                  x2={activeCoord.x} 
                  y2={svgHeight} 
                  stroke="#10B981" 
                  strokeWidth="1.5" 
                  strokeDasharray="2 2" 
                  opacity="0.85" 
                />
                <circle 
                  cx={activeCoord.x} 
                  cy={activeCoord.y} 
                  r="4" 
                  fill="#10B981" 
                  stroke="#0B0C0E" 
                  strokeWidth="1.5" 
                />
              </g>
            )}
          </svg>
        </div>

        {/* Minimalist 24-Hour Step Buttons - Well aligned & no overlap */}
        <div className="w-full overflow-x-auto scrollbar-none mt-1.5 pt-0.5">
          <div 
            className="w-full gap-0.5"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(24, minmax(28px, 1fr))',
              minWidth: '100%'
            }}
          >
            {hourlyData.map((pt) => {
              const isSelected = pt.hourIndex === activeHourIndex;
              const isThunder = pt.condition === 'THUNDERSTORM';
              const isRain = pt.condition === 'RAIN';

              return (
                <button
                  key={pt.hourIndex}
                  onClick={() => handleSelectPoint(pt)}
                  onMouseEnter={() => handleSelectPoint(pt)}
                  className={`flex flex-col items-center justify-between py-1 px-0.5 rounded-lg transition-all font-mono text-center cursor-pointer select-none min-w-0 ${
                    isSelected
                      ? isLight
                        ? 'bg-slate-900 text-white shadow-xs border border-slate-700'
                        : 'bg-white/[0.12] border border-white/[0.2] text-white shadow-sm ring-1 ring-white/10'
                      : isLight
                      ? 'bg-slate-100/80 border border-slate-200/80 hover:bg-slate-200 text-slate-700'
                      : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] text-zinc-400'
                  }`}
                >
                  <span className={`text-[8px] font-medium leading-tight truncate w-full ${
                    isSelected 
                      ? isLight ? 'text-white font-bold' : 'text-zinc-100 font-bold'
                      : isLight ? 'text-slate-500' : 'text-zinc-500'
                  }`}>
                    {pt.timeLabel}
                  </span>

                  {/* Weather Condition Icon */}
                  <div className="my-0.5 flex items-center justify-center h-3 w-3">
                    {isThunder ? (
                      <Zap className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    ) : isRain ? (
                      <CloudRain className={`w-2.5 h-2.5 shrink-0 ${isLight ? 'text-blue-500' : 'text-zinc-300'}`} />
                    ) : pt.isDaytime ? (
                      <Sun className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    ) : (
                      <Moon className={`w-2.5 h-2.5 shrink-0 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
                    )}
                  </div>

                  {/* Temperature */}
                  <span className={`text-[9px] leading-tight font-semibold ${
                    isSelected 
                      ? isLight ? 'text-white font-bold' : 'text-white font-bold' 
                      : isLight ? 'text-slate-800' : 'text-zinc-300'
                  }`}>
                    {pt.temp}°
                  </span>

                  {/* Rain Probability Tiny Bar */}
                  <div className="w-full mt-1 bg-white/[0.08] rounded-full h-0.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${pt.pop > 60 ? 'bg-amber-400' : isLight ? 'bg-blue-500' : 'bg-zinc-400'}`} 
                      style={{ width: `${pt.pop}%` }} 
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
