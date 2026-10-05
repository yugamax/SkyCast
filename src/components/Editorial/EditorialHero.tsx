import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Wind, 
  Droplets, 
  Activity, 
  Flame, 
  Clock, 
  MapPin
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { UserLocationData } from '../Common/NearbyFindingsBanner';
import { StormCell } from '../../types/weather';

interface EditorialHeroProps {
  userLocation: UserLocationData | null;
  activeCell: StormCell | null;
  temperature?: number;
  conditionPhrase?: string;
  isLight?: boolean;
  selectedHour?: number;
  onLocateUser?: () => void;
}

export const EditorialHero: React.FC<EditorialHeroProps> = ({
  userLocation,
  activeCell,
  temperature = 29,
  conditionPhrase,
  isLight = false,
  selectedHour,
  onLocateUser
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cityName = userLocation?.city || (activeCell ? activeCell.targetLocation : 'Kolkata Sector');
  const lat = userLocation?.lat ?? (activeCell?.lat ?? 22.5726);
  const lng = userLocation?.lng ?? (activeCell?.lng ?? 88.3639);

  const utcString = currentTime.toLocaleTimeString('en-GB', {
    timeZone: 'UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const istString = currentTime.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const localTimeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const isLive = selectedHour === undefined;

  // Dynamic editorial phrase generator if not supplied
  const phrase = conditionPhrase || (
    activeCell 
      ? `Severe convective supercell (${activeCell.id}) advancing ${activeCell.directionText} at ${activeCell.speedKmh} km/h • High lightning flash rate`
      : `Atmospheric moisture convergence along coastal trough • Barometric gradient steady at 1008.4 hPa`
  );

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border editorial-bento-card transition-all duration-200">
      {/* Top Telemetry Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5 mb-5">
        <div className="flex items-center space-x-2 text-xs font-mono">
          {/* Luminous Aurora Status Dot */}
          <span className="flex items-center space-x-1.5 text-xs text-teal-300 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-teal-400 animate-pulse' : 'bg-cyan-400'} inline-block`} />
            <span>{isLive ? 'LIVE TELEMETRY' : `FORECAST MODEL (T+${selectedHour}h)`}</span>
          </span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span className="text-slate-400/60 hidden sm:inline">DOPPLER COMPOSITE MESH (1.5 KM)</span>
        </div>

        {/* Live Coordinates Ticker & Clocks */}
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="hidden md:inline text-slate-300/80">
            {lat.toFixed(4)}°N {lng.toFixed(4)}°E
          </span>
          <span className="hidden lg:inline text-white/10">|</span>
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400/80" />
            <span className="text-slate-200 font-medium">{localTimeStr}</span>
          </span>
          <span className="hidden sm:flex items-center space-x-1">
            <span className="text-slate-400/50 text-[10px]">IST</span>
            <span className="text-teal-300 font-medium">{istString}</span>
          </span>
          <span className="hidden lg:flex items-center space-x-1">
            <span className="text-slate-400/50 text-[10px]">UTC</span>
            <span className="text-slate-300/70">{utcString}</span>
          </span>
        </div>
      </div>

      {/* Main Editorial Body: Asymmetrical Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        {/* Left: Dominant 96px+ Temperature & Sector Identity (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center space-x-2 text-xs font-mono flex-wrap gap-y-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200 font-bold tracking-wide uppercase">{cityName}</span>
            <span className="text-white/20">•</span>
            {/* Minimalist status tag */}
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
              <span>{userLocation ? 'GPS Calibrated' : 'Primary Sector'}</span>
            </span>
            {selectedHour !== undefined && (
              <span className="text-cyan-400 text-[11px] font-medium ml-1">
                (T+{selectedHour}h Model)
              </span>
            )}
          </div>

          <div className="flex items-baseline space-x-4">
            <div className="font-display text-8xl sm:text-9xl font-semibold tracking-tighter text-white select-none">
              {temperature}°
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400/70">Celsius</div>
              <div className="text-xs font-mono font-medium text-slate-300">
                {activeCell ? (
                  <span className="text-cyan-300">{activeCell.severity} CONVECTION</span>
                ) : (
                  <span className="text-slate-300">STABLE AIRMASS</span>
                )}
              </div>
              <div className="text-xs font-mono text-slate-400/50">
                Feels {temperature + 3}°C • Dew Pt 24°C
              </div>
            </div>
          </div>

          {/* Editorial Atmospheric Condition Phrase */}
          <div className="pt-1">
            <p className="font-display text-base sm:text-lg text-slate-300 font-normal leading-relaxed tracking-tight max-w-2xl">
              "{phrase}"
            </p>
          </div>
        </div>

        {/* Right: Unified Recessed Bento Grid of Frosted Metric Tiles (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
          {/* Wind */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400/80 uppercase">
              <span>Wind Velocity</span>
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-semibold font-mono text-white tracking-tight">
                {activeCell ? `${activeCell.speedKmh} km/h` : '18.4 km/h'}
              </div>
              <div className="text-[10px] font-mono text-slate-400/50">
                {activeCell ? activeCell.directionText : 'SW @ 224°'} • Gusts {activeCell ? Math.round(activeCell.speedKmh * 1.4) : 26} km/h
              </div>
            </div>
          </div>

          {/* CAPE Energy */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400/80 uppercase">
              <span>CAPE Sounding</span>
              <Flame className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <div className={`text-lg font-semibold font-mono tracking-tight ${activeCell && activeCell.reflectivityDbz > 50 ? 'text-cyan-300' : 'text-white'}`}>
                {activeCell ? (activeCell.reflectivityDbz > 50 ? '2,850 J/kg' : '1,940 J/kg') : '1,220 J/kg'}
              </div>
              <div className="text-[10px] font-mono text-slate-400/50">
                {activeCell ? 'High Updraft Core' : 'Moderate Sounding'}
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400/80 uppercase">
              <span>Relative Humidity</span>
              <Droplets className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div>
              <div className="text-lg font-semibold font-mono text-white tracking-tight">
                {activeCell ? '84%' : '72%'}
              </div>
              <div className="text-[10px] font-mono text-slate-400/50">
                Condensation 680m
              </div>
            </div>
          </div>

          {/* Barometer */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400/80 uppercase">
              <span>Baro Pressure</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-semibold font-mono text-white tracking-tight">
                1008.2 <span className="text-xs text-slate-400/50 font-normal">hPa</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400/50">
                ↓ 1.8 hPa / 3h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
