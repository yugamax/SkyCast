import React from 'react';
import { 
  LayoutDashboard, 
  Radar, 
  Satellite, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  BellRing, 
  History, 
  BrainCircuit, 
  Database, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  X,
  Plane,
  Sprout,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { OperationalMode } from './Header';

export type ActiveView = 
  | 'COMMAND_CENTER'
  | 'RADAR'
  | 'SATELLITE'
  | 'LIGHTNING'
  | 'NOWCAST'
  | 'HAZARDS'
  | 'ALERTS'
  | 'HISTORICAL'
  | 'AI_ARCHITECTURE'
  | 'DATA_SOURCES'
  | 'SYSTEM_HEALTH';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeAlertCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  operationalMode?: OperationalMode;
  onSelectOperationalMode?: (mode: OperationalMode) => void;
}

interface NavSection {
  title?: string;
  items: Array<{
    id: ActiveView;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  activeAlertCount,
  isMobileOpen = false,
  onCloseMobile,
  operationalMode = 'STANDARD',
  onSelectOperationalMode
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const navSections: NavSection[] = [
    {
      title: 'Surveillance & Sensors',
      items: [
        {
          id: 'COMMAND_CENTER',
          label: 'Command Center',
          icon: <LayoutDashboard className="w-4 h-4" />
        },
        {
          id: 'RADAR',
          label: 'Doppler Radar (DWR)',
          icon: <Radar className="w-4 h-4" />
        },
        {
          id: 'SATELLITE',
          label: 'Satellite (INSAT-3D)',
          icon: <Satellite className="w-4 h-4" />
        },
        {
          id: 'LIGHTNING',
          label: 'Lightning Sensor Mesh',
          icon: <Zap className="w-4 h-4" />
        }
      ]
    },
    {
      title: 'Nowcast & Hazards',
      items: [
        {
          id: 'NOWCAST',
          label: '0–6h AI Nowcast',
          icon: <TrendingUp className="w-4 h-4" />,
          badge: '1.5km'
        },
        {
          id: 'HAZARDS',
          label: 'Hazard Matrix',
          icon: <AlertTriangle className="w-4 h-4" />
        },
        {
          id: 'ALERTS',
          label: 'Severe Alert Engine',
          icon: <BellRing className="w-4 h-4" />,
          badge: activeAlertCount > 0 ? activeAlertCount : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300'
        }
      ]
    },
    {
      title: 'Intelligence & Core',
      items: [
        {
          id: 'AI_ARCHITECTURE',
          label: 'AI Model Architecture',
          icon: <BrainCircuit className="w-4 h-4" />
        },
        {
          id: 'HISTORICAL',
          label: 'Verification & Skill',
          icon: <History className="w-4 h-4" />
        },
        {
          id: 'DATA_SOURCES',
          label: 'Ingest Pipelines',
          icon: <Database className="w-4 h-4" />
        },
        {
          id: 'SYSTEM_HEALTH',
          label: 'System & Telemetry',
          icon: <Activity className="w-4 h-4" />
        }
      ]
    }
  ];

  const handleMobileSelect = (view: ActiveView) => {
    onSelectView(view);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const operationalModes: Array<{ mode: OperationalMode; label: string; icon: React.ReactNode }> = [
    { mode: 'STANDARD', label: 'Operations', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { mode: 'AVIATION', label: 'Aviation', icon: <Plane className="w-3.5 h-3.5" /> },
    { mode: 'AGRICULTURE', label: 'Agri', icon: <Sprout className="w-3.5 h-3.5" /> },
    { mode: 'DISASTER_MANAGEMENT', label: 'NDRF', icon: <ShieldAlert className="w-3.5 h-3.5" /> }
  ];

  return (
    <>
      {/* =========================================================================
          1. DESKTOP / LAPTOP STATIC SIDEBAR (Preserved Exactly for >= md screens)
          ========================================================================= */}
      <aside
        className={`hidden md:flex h-[calc(100vh-3rem)] border-r flex-col justify-between transition-all duration-200 z-40 select-none shrink-0 ${
          isCollapsed ? 'w-14' : 'w-56'
        } ${
          isLight 
            ? 'bg-slate-50/80 border-slate-200 text-slate-800' 
            : 'bg-[#0E0F12] border-white/[0.08] text-zinc-300'
        }`}
      >
        {/* Navigation Sections */}
        <div className="p-2 space-y-3.5 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {!isCollapsed && section.title && (
                <div className="px-2 pt-1 pb-0.5 text-[9px] font-sans font-semibold uppercase tracking-wider text-zinc-500">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`w-full flex items-center rounded-lg px-2.5 py-1.5 text-xs transition-all group relative cursor-pointer ${
                      isActive
                        ? isLight
                          ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200'
                          : 'bg-white/[0.08] text-white font-medium shadow-xs border border-white/[0.08]'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Monochrome Icon with subtle green active color */}
                    <div className={`shrink-0 transition-colors ${
                      isActive 
                        ? isLight ? 'text-slate-900' : 'text-emerald-400' 
                        : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}>
                      {item.icon}
                    </div>

                    {!isCollapsed && (
                      <div className="ml-2.5 flex items-center justify-between w-full truncate font-sans">
                        <span className="truncate text-xs">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-medium uppercase tracking-tight ml-1 ${
                              item.badgeColor || (isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/[0.06] text-zinc-400 border border-white/[0.08]')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Subtle Left Border Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Collapse Toggle */}
        <div className={`p-2 border-t ${isLight ? 'border-slate-200 bg-white/40' : 'border-white/[0.06] bg-black/20'}`}>
          <button
            onClick={onToggleCollapse}
            className="tactile-btn w-full flex items-center justify-center p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE SLIDE-OUT OVERLAY DRAWER (< md screens)
          ========================================================================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" 
            onClick={onCloseMobile}
          />

          {/* Drawer Sheet */}
          <div 
            className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full shadow-2xl flex flex-col justify-between z-50 border-r select-none animate-in slide-in-from-left duration-250 ${
              isLight 
                ? 'bg-white/95 border-slate-200 text-slate-800' 
                : 'bg-[#0E0F12]/95 border-white/[0.12] text-zinc-200 backdrop-blur-2xl'
            }`}
          >
            {/* Mobile Drawer Header */}
            <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-emerald-400">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-xs font-bold tracking-wider uppercase text-white">
                  SKYCAST NAVIGATION
                </span>
              </div>

              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Operational Mode Switcher */}
            {onSelectOperationalMode && (
              <div className="p-2.5 border-b border-white/[0.08] bg-white/[0.02]">
                <div className="text-[9px] font-sans font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 px-1">
                  Operational Sector Mode
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {operationalModes.map((om) => {
                    const isSelected = operationalMode === om.mode;
                    return (
                      <button
                        key={om.mode}
                        onClick={() => {
                          onSelectOperationalMode(om.mode);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                            : 'bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {om.icon}
                        <span className="truncate">{om.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Navigation List */}
            <div className="p-2.5 space-y-3.5 overflow-y-auto flex-1">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-0.5">
                  {section.title && (
                    <div className="px-2 pt-1 pb-0.5 text-[9px] font-sans font-semibold uppercase tracking-wider text-zinc-500">
                      {section.title}
                    </div>
                  )}

                  {section.items.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMobileSelect(item.id)}
                        className={`w-full flex items-center rounded-xl px-3 py-2 text-xs transition-all group relative cursor-pointer ${
                          isActive
                            ? isLight
                              ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200'
                              : 'bg-white/[0.1] text-white font-semibold shadow-sm border border-white/[0.12]'
                            : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className={`shrink-0 transition-colors ${
                          isActive 
                            ? isLight ? 'text-slate-900' : 'text-emerald-400' 
                            : 'text-zinc-500 group-hover:text-zinc-300'
                        }`}>
                          {item.icon}
                        </div>

                        <div className="ml-3 flex items-center justify-between w-full truncate font-sans">
                          <span className="truncate text-xs">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-medium uppercase tracking-tight ml-1 ${
                                item.badgeColor || (isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/[0.06] text-zinc-400 border border-white/[0.08]')
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {isActive && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mobile Footer with Live Time */}
            <div className="p-3 border-t border-white/[0.08] bg-black/20 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
              <span>SKYCAST v1.0 • India Sector</span>
              <span className="text-emerald-400 font-bold">LIVE ONLINE</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
