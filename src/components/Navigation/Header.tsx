import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Clock, 
  Bell, 
  Search, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Activity, 
  Key, 
  LocateFixed,
  Command,
  ChevronDown,
  Sparkles,
  Zap,
  CloudRain,
  CloudLightning,
  Wind,
  CheckCircle2,
  Volume1,
  Menu,
  X
} from 'lucide-react';
import { 
  simulationEngine, 
  WeatherScenarioId, 
  WeatherScenarioConfig, 
  WEATHER_SCENARIOS 
} from '../../services/simulationEngine';
import { ambientAudio } from '../../services/ambientAudioService';
import { MAJOR_CITIES } from '../../data/indiaGeoData';
import { useTheme } from '../../context/ThemeContext';

export type OperationalMode = 'STANDARD' | 'AVIATION' | 'AGRICULTURE' | 'DISASTER_MANAGEMENT';

interface HeaderProps {
  operationalMode: OperationalMode;
  onSelectOperationalMode: (mode: OperationalMode) => void;
  onSearchSelectLocation: (lat: number, lng: number, zoom: number, name: string) => void;
  onLocateUser?: () => void;
  onOpenSettings: () => void;
  onOpenApiKeys: () => void;
  onOpenAlertsDrawer: () => void;
  onReplayIntro?: () => void;
  onOpenInfo?: (infoId: string) => void;
  unreadAlertCount: number;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  operationalMode,
  onSelectOperationalMode,
  onSearchSelectLocation,
  onLocateUser,
  onOpenSettings,
  onOpenApiKeys,
  onOpenAlertsDrawer,
  unreadAlertCount,
  onToggleMobileMenu
}) => {
  const { theme } = useTheme();
  const isLight = false;

  const [time, setTime] = useState<Date>(new Date());
  const [isDemo, setIsDemo] = useState<boolean>(simulationEngine.isDemo());
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(ambientAudio.isMuted());
  const [audioVolume, setAudioVolume] = useState<number>(ambientAudio.getVolume());
  const [currentScenario, setCurrentScenario] = useState<WeatherScenarioConfig>(simulationEngine.getCurrentScenario());
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState<boolean>(false);
  const [isAudioPopoverOpen, setIsAudioPopoverOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);

  const scenarioMenuRef = useRef<HTMLDivElement>(null);
  const audioPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync ambient audio state
  useEffect(() => {
    const unsub = ambientAudio.subscribe((muted, _running, vol) => {
      setIsAudioMuted(muted);
      setAudioVolume(vol);
    });
    return unsub;
  }, []);

  // Sync simulation scenario updates
  useEffect(() => {
    const unsub = simulationEngine.subscribe(() => {
      setCurrentScenario(simulationEngine.getCurrentScenario());
    });
    return unsub;
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (scenarioMenuRef.current && !scenarioMenuRef.current.contains(e.target as Node)) {
        setIsScenarioMenuOpen(false);
      }
      if (audioPopoverRef.current && !audioPopoverRef.current.contains(e.target as Node)) {
        setIsAudioPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K or Ctrl+K) for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        if (input) input.focus();
        else setIsMobileSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleDemo = () => {
    const next = !isDemo;
    setIsDemo(next);
    simulationEngine.setDemoMode(next);
  };

  const handleToggleAudio = () => {
    const nextMuted = ambientAudio.toggleMute();
    setIsAudioMuted(nextMuted);
  };

  const handleSelectScenario = (scenarioId: WeatherScenarioId) => {
    simulationEngine.setWeatherScenario(scenarioId);
    setCurrentScenario(simulationEngine.getCurrentScenario());
    ambientAudio.unmute();
    setIsScenarioMenuOpen(false);
  };

  const handleVolumeChange = (vol: number) => {
    setAudioVolume(vol);
    ambientAudio.setVolume(vol);
    if (isAudioMuted && vol > 0) {
      ambientAudio.unmute();
    }
  };

  const filteredCities = searchQuery.trim() === '' 
    ? [] 
    : MAJOR_CITIES.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.state.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const istTimeStr = time.toLocaleTimeString('en-GB', { 
    timeZone: 'Asia/Kolkata', 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const modeLabels: Record<OperationalMode, string> = {
    STANDARD: 'Operations',
    AVIATION: 'Aviation',
    AGRICULTURE: 'Agriculture',
    DISASTER_MANAGEMENT: 'NDRF Matrix'
  };

  const scenariosList = simulationEngine.getAllScenarios();

  return (
    <header 
      className={`h-12 px-2.5 sm:px-4 border-b flex items-center justify-between z-50 select-none transition-all duration-200 gap-2 sm:gap-3 ios-glass-header ${
        isLight 
          ? 'bg-white/85 border-slate-200 shadow-sm' 
          : 'bg-[#0B0C0E]/85 border-white/[0.08] shadow-md'
      }`}
      style={{
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)'
      }}
    >
      {/* =========================================================================
          ZONE 1 (LEFT): Mobile Hamburger + Brand Emblem + Mode Label
          ========================================================================= */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Mobile Hamburger Toggle Button (< md) */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Open Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-1.5 sm:space-x-2 group cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-zinc-100 shadow-xs group-hover:border-emerald-500/40 transition-colors">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-3.5 h-3.5 text-zinc-200"
            >
              <circle cx="12" cy="12" r="9" strokeOpacity="0.3" strokeDasharray="3 2" />
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 1 1-7.54-7.54C12.92 3.04 12.46 3 12 3z" />
              <circle cx="12" cy="12" r="1.5" fill="#10B981" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span 
              className={`font-mono text-xs sm:text-[13px] font-medium tracking-[0.18em] uppercase ${
                isLight ? 'text-slate-900' : 'text-zinc-100'
              }`}
            >
              SKYCAST
            </span>
          </div>
        </div>

        <span className="text-zinc-700 text-xs font-light hidden sm:inline">/</span>

        <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 font-medium truncate max-w-[80px] sm:max-w-none">
          {modeLabels[operationalMode]}
        </span>
      </div>

      {/* =========================================================================
          ZONE 2 (CENTER): Operational Mode Track + Minimalist Search Bar (Desktop)
          ========================================================================= */}
      <div className="hidden md:flex items-center space-x-2.5 flex-1 max-w-xl justify-center">
        {/* Segmented Operational Mode Track */}
        <div className="tactile-segmented-track hidden xl:inline-flex p-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
          {(['STANDARD', 'AVIATION', 'AGRICULTURE', 'DISASTER_MANAGEMENT'] as OperationalMode[]).map((mode) => {
            const labels: Record<OperationalMode, string> = {
              STANDARD: 'Operations',
              AVIATION: 'Aviation',
              AGRICULTURE: 'Agri',
              DISASTER_MANAGEMENT: 'NDRF'
            };
            const isSelected = operationalMode === mode;
            return (
              <button
                key={mode}
                onClick={() => onSelectOperationalMode(mode)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'bg-white/[0.12] text-zinc-100 shadow-xs font-semibold'
                    : isLight
                    ? 'text-slate-500 hover:text-slate-800'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>

        {/* Minimalist Translucent Search Bar */}
        <div className="relative w-40 sm:w-48 lg:w-52">
          <div 
            className={`flex items-center rounded-lg px-2.5 py-1 border transition-all ${
              isLight
                ? 'bg-slate-100/80 border-slate-200 focus-within:border-slate-400 focus-within:bg-white'
                : 'bg-white/[0.03] border-white/[0.08] focus-within:border-white/[0.2] focus-within:bg-white/[0.06]'
            }`}
          >
            <Search className="w-3.5 h-3.5 mr-2 shrink-0 text-zinc-500" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search city, radar..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className={`bg-transparent text-xs placeholder-zinc-500 focus:outline-none w-full font-sans ${
                isLight ? 'text-slate-900' : 'text-zinc-100'
              }`}
            />
            <kbd className={`text-[9px] font-mono px-1 py-0.2 rounded border ml-1 shrink-0 ${
              isLight ? 'bg-slate-200/80 border-slate-300 text-slate-600' : 'bg-white/[0.04] border-white/[0.08] text-zinc-400'
            }`}>
              ⌘K
            </kbd>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && filteredCities.length > 0 && (
            <div 
              className={`absolute top-9 left-0 w-full rounded-xl shadow-2xl p-1.5 z-50 max-h-56 overflow-y-auto border backdrop-blur-2xl ${
                isLight ? 'bg-white/95 border-slate-200' : 'bg-[#121316]/95 border-white/[0.1]'
              }`}
            >
              {filteredCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    onSearchSelectLocation(city.lat, city.lng, 9, city.name);
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    isLight 
                      ? 'hover:bg-slate-100 text-slate-800' 
                      : 'hover:bg-white/[0.06] text-zinc-200'
                  }`}
                >
                  <span className="font-medium">{city.name}</span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>{city.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Quick-Locate Button */}
        {onLocateUser && (
          <button
            onClick={onLocateUser}
            className={`h-8 px-2.5 rounded-lg border flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${
              isLight 
                ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100' 
                : 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20 hover:border-sky-500/50'
            }`}
            title="Auto-Detect & Zoom to My Location"
          >
            <LocateFixed className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-mono font-semibold hidden lg:inline">Locate</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          ZONE 3 (RIGHT): Weather Scenario + Audio + Mobile Search + Tools
          ========================================================================= */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        
        {/* Mobile Search Button (< md) */}
        <button
          onClick={() => setIsMobileSearchOpen(true)}
          className="md:hidden w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
          title="Search City or Radar"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Mobile GPS Quick Locate (< md) */}
        {onLocateUser && (
          <button
            onClick={onLocateUser}
            className="md:hidden w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-sky-500/30 bg-sky-500/10 flex items-center justify-center text-sky-400 cursor-pointer"
            title="Locate GPS"
          >
            <LocateFixed className="w-3.5 h-3.5" />
          </button>
        )}

        {/* PROMINENT WEATHER SCENARIO SELECTOR */}
        <div className="relative" ref={scenarioMenuRef}>
          <button
            onClick={() => {
              setIsScenarioMenuOpen(!isScenarioMenuOpen);
              setIsAudioPopoverOpen(false);
            }}
            className={`h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg border flex items-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer shadow-xs ${
              isLight 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/50'
            }`}
            title="Switch Weather Scenario (Simulation Presets for Judges)"
          >
            <span className="text-xs sm:text-sm">{currentScenario.icon}</span>
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight hidden sm:inline max-w-[90px] md:max-w-[130px] truncate">
              {currentScenario.name.split('&')[0].trim()}
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 hidden lg:inline">
              {currentScenario.baseDbz} dBZ
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isScenarioMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Scenario Selection Popover (Mobile Responsive) */}
          {isScenarioMenuOpen && (
            <div 
              className={`fixed inset-x-3 top-13 sm:absolute sm:top-10 sm:right-0 sm:left-auto sm:w-96 rounded-2xl p-2.5 z-50 border shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-150 max-w-[calc(100vw-24px)] ${
                isLight 
                  ? 'bg-white/95 border-slate-200 text-slate-800' 
                  : 'bg-[#121316]/95 border-white/[0.12] text-zinc-100'
              }`}
              style={{
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-white/[0.08]">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                    Weather Scenarios (Judge Demo)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">6 Presets</span>
              </div>

              <div className="space-y-1.5 max-h-[50vh] sm:max-h-[360px] overflow-y-auto pr-0.5">
                {scenariosList.map((sc) => {
                  const isSelected = currentScenario.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleSelectScenario(sc.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start space-x-2.5 sm:space-x-3 cursor-pointer ${
                        isSelected
                          ? isLight
                            ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                            : 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                          : isLight
                          ? 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/90'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="text-xl sm:text-2xl pt-0.5 shrink-0">{sc.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold truncate ${isSelected ? 'text-emerald-400' : ''}`}>
                            {sc.name}
                          </span>
                          <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ml-1.5 ${
                            sc.condition === 'STORM' 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                              : sc.condition === 'RAIN'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {sc.baseDbz} dBZ
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                          {sc.tagline}
                        </p>
                        <div className="flex items-center space-x-2 mt-1 text-[9px] font-mono text-zinc-500">
                          <span>Clouds: {sc.cloudCover}%</span>
                          <span>•</span>
                          <span>Wind: {sc.windSpeed} km/h</span>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-zinc-400 px-1 font-mono">
                <span>⚡ Procedural Audio & Physics Synced</span>
                <button
                  onClick={() => setIsScenarioMenuOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PROCEDURAL AMBIENT SOUND MASTER CONTROLLER */}
        <div className="relative" ref={audioPopoverRef}>
          <button
            onClick={() => {
              setIsAudioPopoverOpen(!isAudioPopoverOpen);
              setIsScenarioMenuOpen(false);
              ambientAudio.unlock();
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              !isAudioMuted
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-xs'
                : 'bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'
            }`}
            title="Ambient Weather Sound Synthesizer"
          >
            {!isAudioMuted ? (
              <div className="flex items-end space-x-0.5 h-3.5 w-3.5 py-0.5">
                <span className="w-1 bg-emerald-400 rounded-full animate-[equalizerWave_0.9s_ease-in-out_infinite]" />
                <span className="w-1 bg-emerald-300 rounded-full animate-[equalizerWave_0.7s_ease-in-out_infinite_0.2s]" />
                <span className="w-1 bg-emerald-400 rounded-full animate-[equalizerWave_1.1s_ease-in-out_infinite_0.4s]" />
              </div>
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </button>

          {/* Sound Controls Popover (Mobile Responsive) */}
          {isAudioPopoverOpen && (
            <div 
              className={`fixed inset-x-3 top-13 sm:absolute sm:top-10 sm:right-0 sm:left-auto sm:w-72 rounded-2xl p-3.5 z-50 border shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-150 max-w-[calc(100vw-24px)] ${
                isLight 
                  ? 'bg-white/95 border-slate-200 text-slate-800' 
                  : 'bg-[#121316]/95 border-white/[0.12] text-zinc-100'
              }`}
              style={{
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center space-x-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-mono">Ambient Audio Synthesizer</span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  !isAudioMuted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {!isAudioMuted ? 'LIVE' : 'MUTED'}
                </span>
              </div>

              <div className="mt-3">
                <button
                  onClick={handleToggleAudio}
                  className={`w-full py-2 rounded-xl border flex items-center justify-center space-x-2 font-semibold text-xs transition-all cursor-pointer ${
                    !isAudioMuted
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-white/[0.05] border-white/[0.1] text-zinc-300 hover:bg-white/[0.1]'
                  }`}
                >
                  {!isAudioMuted ? (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>Procedural Audio Active</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 text-rose-400" />
                      <span>Sound Muted (Click to Unmute)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400 flex items-center space-x-1">
                    <Volume1 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Master Output Gain:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {Math.round(audioVolume * 100)}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={audioVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 rounded-lg bg-white/[0.08]"
                />
              </div>

              <div className="mt-3.5 pt-3 border-t border-white/[0.08] space-y-1.5">
                <div className="text-[10px] font-mono text-zinc-400 font-semibold mb-1">
                  Instant Synthesizer Audition:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      ambientAudio.unmute();
                      ambientAudio.triggerLightning(1.2);
                    }}
                    className="py-1.5 px-2 rounded-lg border border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 text-[10px] font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>⚡ Test Lightning</span>
                  </button>
                  <button
                    onClick={() => {
                      ambientAudio.unmute();
                      ambientAudio.setWeatherState('RAIN', 24, 0.9);
                    }}
                    className="py-1.5 px-2 rounded-lg border border-sky-500/30 bg-sky-950/30 hover:bg-sky-900/40 text-sky-300 text-[10px] font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span>🌧️ Natural Rain</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabular Time Indicator (Desktop Large) */}
        <div className="hidden 2xl:flex items-center space-x-1.5 font-mono text-[11px] text-zinc-400 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="text-zinc-200 font-medium">{istTimeStr}</span>
          <span className="text-zinc-600 text-[9px]">IST</span>
        </div>

        {/* Sim/Live Switch */}
        <button
          onClick={handleToggleDemo}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            isDemo
              ? 'bg-white/[0.04] text-zinc-400 border-white/[0.08]'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}
          title={isDemo ? 'Mode: Simulated Ingest (Click for Live)' : 'Mode: Live Real-Time Ingest'}
        >
          <Activity className="w-3.5 h-3.5" />
        </button>

        {/* API Keys */}
        <button
          onClick={onOpenApiKeys}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="API Keys & Data Pipelines"
        >
          <Key className="w-3.5 h-3.5" />
        </button>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlertsDrawer}
          className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Active Hazard Warnings"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadAlertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-mono font-bold text-white">
              {unreadAlertCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer hidden sm:flex"
          title="Threshold Settings"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* =========================================================================
          MOBILE SEARCH MODAL OVERLAY (< md)
          ========================================================================= */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 p-4 bg-black/80 backdrop-blur-xl flex flex-col md:hidden animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.1]">
            <div className="flex items-center space-x-2 flex-1 mr-2">
              <Search className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search city, radar station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none w-full font-sans"
              />
            </div>
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 space-y-1 overflow-y-auto flex-1">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    onSearchSelectLocation(city.lat, city.lng, 9, city.name);
                    setSearchQuery('');
                    setIsMobileSearchOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold text-white text-sm">{city.name}</span>
                  <span className="text-xs font-mono text-emerald-400">{city.state}</span>
                </button>
              ))
            ) : searchQuery.trim() !== '' ? (
              <div className="p-4 text-center text-xs text-zinc-500 font-mono">
                No matching cities or radar stations found.
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-zinc-500 font-mono">
                Type a city name (e.g. New Delhi, Mumbai, Kolkata, Bengaluru)
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
