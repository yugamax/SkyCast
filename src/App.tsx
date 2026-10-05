import React, { useState, useEffect } from 'react';
import { Header, OperationalMode } from './components/Navigation/Header';
import { Sidebar, ActiveView } from './components/Navigation/Sidebar';
import { StormCellInspector } from './components/Radar/StormCellInspector';
import { AlertsDrawer } from './components/Alerts/AlertsDrawer';
import { SettingsModal } from './components/Alerts/SettingsModal';
import { ShareAlertModal } from './components/Alerts/ShareAlertModal';
import { WeatherInfoModal } from './components/Common/WeatherInfoModal';
import { ApiKeysModal } from './components/Common/ApiKeysModal';
import { AtmosphericCloudIntro } from './components/Common/AtmosphericCloudIntro';
import { AmbientAtmosphericCanvas } from './components/Common/AmbientAtmosphericCanvas';
import { UserLocationData, LocationPermissionState } from './components/Common/NearbyFindingsBanner';
import { useTheme } from './context/ThemeContext';

// Views
import { CommandCenterView } from './views/CommandCenterView';
import { RadarView } from './views/RadarView';
import { SatelliteView } from './views/SatelliteView';
import { LightningView } from './views/LightningView';
import { NowcastView } from './views/NowcastView';
import { HazardsView } from './views/HazardsView';
import { AlertEngineView } from './views/AlertEngineView';
import { HistoricalView } from './views/HistoricalView';
import { AiArchitectureView } from './views/AiArchitectureView';
import { DataSourcesView } from './views/DataSourcesView';
import { SystemHealthView } from './views/SystemHealthView';
import { AviationView } from './views/AviationView';
import { AgricultureView } from './views/AgricultureView';
import { DisasterManagementView } from './views/DisasterManagementView';

// Services & Mock Data
import { simulationEngine } from './services/simulationEngine';
import { liveWeatherService, LiveWeatherData } from './services/liveWeatherService';
import { 
  StormCell, 
  RadarStation, 
  AirportStation, 
  LightningStrike, 
  AlertItem, 
  TimelineStep, 
  GridForecastPoint, 
  AlertThresholdConfig 
} from './types/weather';
import { INITIAL_RADAR_STATIONS, INITIAL_AIRPORTS } from './data/mockData';

export function App() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeView, setActiveView] = useState<ActiveView>('COMMAND_CENTER');
  const [operationalMode, setOperationalMode] = useState<OperationalMode>('STANDARD');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [showCloudIntro, setShowCloudIntro] = useState<boolean>(true);

  // Real-time Live Weather Telemetry & Simulation States
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(true);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(liveWeatherService.getLiveWeatherData());
  const [stormCells, setStormCells] = useState<StormCell[]>(liveWeatherService.getLiveStormCells().length > 0 ? liveWeatherService.getLiveStormCells() : simulationEngine.getCells());
  const [radarStations, setRadarStations] = useState<RadarStation[]>(INITIAL_RADAR_STATIONS);
  const [airports, setAirports] = useState<AirportStation[]>(liveWeatherService.getLiveAirports());
  const [lightningStrikes, setLightningStrikes] = useState<LightningStrike[]>(liveWeatherService.getLiveLightningStrikes().length > 0 ? liveWeatherService.getLiveLightningStrikes() : simulationEngine.getLightningStrikes());
  const [alerts, setAlerts] = useState<AlertItem[]>(liveWeatherService.getLiveAlerts().length > 0 ? liveWeatherService.getLiveAlerts() : simulationEngine.getAlerts());
  const [timelineStep, setTimelineStep] = useState<TimelineStep>('NOW');
  const [nowcastGrid, setNowcastGrid] = useState<GridForecastPoint[]>(simulationEngine.getNowcastGrid('NOW'));
  const [thresholds, setThresholds] = useState<AlertThresholdConfig>(simulationEngine.getThresholds());
  const [currentScenario, setCurrentScenario] = useState(simulationEngine.getCurrentScenario());

  // Selection & Modals
  const [selectedCell, setSelectedCell] = useState<StormCell | null>(null);
  const [selectedRadar, setSelectedRadar] = useState<RadarStation | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<AirportStation | null>(null);
  const [isCellInspectorOpen, setIsCellInspectorOpen] = useState<boolean>(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [shareModalAlert, setShareModalAlert] = useState<AlertItem | null>(null);

  // User Geolocation, Location Status & Map Navigation
  const [userLocation, setUserLocation] = useState<UserLocationData | null>(liveWeatherService.getUserLocation());
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<LocationPermissionState>('PROMPTING');
  const [filterScope, setFilterScope] = useState<'LOCAL' | 'ALL_INDIA'>('LOCAL');
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Global Interactive Info & API Key Modals
  const [activeInfoId, setActiveInfoId] = useState<string | null>(null);
  const [isApiKeysOpen, setIsApiKeysOpen] = useState<boolean>(false);

  // Multi-tier Auto Geolocation trigger (Browser GPS + Fallback IP Geolocation)
  const handleRequestLocation = async () => {
    setIsLoadingLocation(true);
    setLocationStatus('PROMPTING');

    try {
      const locData = await liveWeatherService.detectUserLocation();
      setUserLocation(locData);
      setLocationStatus('GRANTED');
      setFilterScope('LOCAL');
      setIsLoadingLocation(false);

      // Automatically fly & zoom into user coordinates on map
      setFlyToCoords({ lat: locData.lat, lng: locData.lng, zoom: 9 });
      setTimeout(() => setFlyToCoords(null), 3500);
    } catch (err) {
      console.warn('Geolocation detection error:', err);
      setLocationStatus('DENIED');
      setFilterScope('ALL_INDIA');
      setIsLoadingLocation(false);
    }
  };

  const handleFlyToLocation = (lat: number, lng: number) => {
    setFlyToCoords({ lat, lng, zoom: 9 });
    setTimeout(() => setFlyToCoords(null), 3500);
  };

  // Automatically detect location and fetch live weather when app opens
  useEffect(() => {
    handleRequestLocation();
  }, []);

  // Subscribe to live real-time meteorological stream
  useEffect(() => {
    const unsub = liveWeatherService.subscribe(() => {
      const live = liveWeatherService.getLiveWeatherData();
      if (live) setLiveWeather({ ...live });

      const loc = liveWeatherService.getUserLocation();
      if (loc && !userLocation) setUserLocation(loc);

      if (isLiveStreamActive) {
        const liveCells = liveWeatherService.getLiveStormCells();
        if (liveCells.length > 0) {
          setStormCells([...liveCells]);
          simulationEngine.setCells(liveCells);
        }
        setAirports([...liveWeatherService.getLiveAirports()]);
        setLightningStrikes([...liveWeatherService.getLiveLightningStrikes()]);
        const liveAlts = liveWeatherService.getLiveAlerts();
        if (liveAlts.length > 0) {
          setAlerts([...liveAlts]);
          simulationEngine.setAlerts(liveAlts);
        }
      }
    });

    return () => unsub();
  }, [isLiveStreamActive, userLocation]);

  // Location search jumps & activates local findings for the searched city
  const handleSearchSelectLocation = (lat: number, lng: number, zoom: number, name: string) => {
    const locData: UserLocationData = {
      lat,
      lng,
      city: name,
      accuracy: 500
    };
    setUserLocation(locData);
    liveWeatherService.setUserLocation(locData);
    setLocationStatus('GRANTED');
    setFilterScope('LOCAL');
    handleFlyToLocation(lat, lng);

    const nearest = stormCells.find(c => {
      const dLat = Math.abs(c.lat - lat);
      const dLng = Math.abs(c.lng - lng);
      return dLat < 1.2 && dLng < 1.2;
    });

    if (nearest) {
      setSelectedCell(nearest);
    }
  };

  // Subscribe to real-time simulation updates
  useEffect(() => {
    const unsubscribe = simulationEngine.subscribe(() => {
      setStormCells([...simulationEngine.getCells()]);
      setLightningStrikes([...simulationEngine.getLightningStrikes()]);
      setAlerts([...simulationEngine.getAlerts()]);
      setThresholds({ ...simulationEngine.getThresholds() });
      setNowcastGrid(simulationEngine.getNowcastGrid(timelineStep));
      setCurrentScenario(simulationEngine.getCurrentScenario());

      // Keep selected cell reference updated if open
      if (selectedCell) {
        const updated = simulationEngine.getCellById(selectedCell.id);
        if (updated) setSelectedCell(updated);
      }
    });

    return () => unsubscribe();
  }, [timelineStep, selectedCell]);

  // Handle timeline step change
  const handleTimelineStepChange = (newStep: TimelineStep) => {
    setTimelineStep(newStep);
    setNowcastGrid(simulationEngine.getNowcastGrid(newStep));
  };

  // Cell selection
  const handleSelectCell = (cell: StormCell) => {
    setSelectedCell(cell);
    setIsCellInspectorOpen(true);
  };

  // Open cell details modal from countdown banner
  const handleOpenCellDetails = (cell: StormCell) => {
    setSelectedCell(cell);
    setIsCellInspectorOpen(true);
  };

  const handleAcknowledgeAlert = (id: string) => {
    simulationEngine.acknowledgeAlert(id);
    setAlerts([...simulationEngine.getAlerts()]);
  };

  const handleFocusAlertOnMap = (alert: AlertItem) => {
    setIsAlertsDrawerOpen(false);
    if (alert.cellId) {
      const cell = stormCells.find(c => c.id === alert.cellId);
      if (cell) {
        setSelectedCell(cell);
      }
    }
  };

  const handleSaveThresholds = (newThresholds: AlertThresholdConfig) => {
    simulationEngine.updateThresholds(newThresholds);
    setThresholds({ ...newThresholds });
  };

  const unacknowledgedAlertCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className={`h-[100dvh] w-screen flex flex-col antialiased transition-colors duration-200 relative overflow-hidden ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0B0C0E] text-zinc-100'
    }`}>
      {/* Dynamic Full-Viewport Atmospheric Background Physics Engine */}
      <AmbientAtmosphericCanvas 
        condition={currentScenario.condition} 
        input_CloudCoverPercentage={currentScenario.cloudCover}
        input_WindVelocity={currentScenario.windSpeed}
        humidity={currentScenario.humidity}
        isLight={isLight}
        showControlsWidget={true}
      />

      {/* Subtle Fixed Film Noise Grain Texture Overlay */}
      <div className="grain-overlay pointer-events-none" />

      {/* Opening Atmospheric Cloud Intro Animation */}
      {showCloudIntro && (
        <AtmosphericCloudIntro onComplete={() => setShowCloudIntro(false)} />
      )}

      {/* Top Application Header */}
      <Header
        operationalMode={operationalMode}
        onSelectOperationalMode={(mode) => setOperationalMode(mode)}
        onSearchSelectLocation={handleSearchSelectLocation}
        onLocateUser={handleRequestLocation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenApiKeys={() => setIsApiKeysOpen(true)}
        onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
        onReplayIntro={() => setShowCloudIntro(true)}
        onOpenInfo={(infoId) => setActiveInfoId(infoId)}
        unreadAlertCount={unacknowledgedAlertCount}
        onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Nav Sidebar (Desktop + Mobile Drawer) */}
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => {
            setActiveView(view);
            if (operationalMode !== 'STANDARD') {
              setOperationalMode('STANDARD');
            }
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeAlertCount={unacknowledgedAlertCount}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          operationalMode={operationalMode}
          onSelectOperationalMode={(mode) => setOperationalMode(mode)}
        />

        {/* View Routing Center Panel */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden min-h-0 transition-colors ${
          isLight ? 'bg-slate-50/70' : 'bg-transparent'
        }`}>
          {/* Specialized Mode Views */}
          {operationalMode === 'AVIATION' ? (
            <AviationView
              airports={airports}
              stormCells={stormCells}
              radarStations={radarStations}
              lightningStrikes={lightningStrikes}
              nowcastGrid={nowcastGrid}
              timelineStep={timelineStep}
              selectedCell={selectedCell}
              userLocation={userLocation}
              flyToCoords={flyToCoords}
              onRequestLocation={handleRequestLocation}
              onFlyToLocation={handleFlyToLocation}
              onSelectCell={handleSelectCell}
              onSelectAirport={(apt) => setSelectedAirport(apt)}
              onSelectRadar={(rad) => setSelectedRadar(rad)}
              onOpenInfo={(infoId) => setActiveInfoId(infoId)}
            />
          ) : operationalMode === 'AGRICULTURE' ? (
            <AgricultureView
              stormCells={stormCells}
              radarStations={radarStations}
              airports={airports}
              lightningStrikes={lightningStrikes}
              nowcastGrid={nowcastGrid}
              timelineStep={timelineStep}
              selectedCell={selectedCell}
              userLocation={userLocation}
              flyToCoords={flyToCoords}
              onRequestLocation={handleRequestLocation}
              onFlyToLocation={handleFlyToLocation}
              onSelectCell={handleSelectCell}
              onSelectAirport={(apt) => setSelectedAirport(apt)}
              onSelectRadar={(rad) => setSelectedRadar(rad)}
              onOpenInfo={(infoId) => setActiveInfoId(infoId)}
            />
          ) : operationalMode === 'DISASTER_MANAGEMENT' ? (
            <DisasterManagementView
              stormCells={stormCells}
              radarStations={radarStations}
              airports={airports}
              lightningStrikes={lightningStrikes}
              nowcastGrid={nowcastGrid}
              alerts={alerts}
              timelineStep={timelineStep}
              selectedCell={selectedCell}
              userLocation={userLocation}
              flyToCoords={flyToCoords}
              onRequestLocation={handleRequestLocation}
              onFlyToLocation={handleFlyToLocation}
              onSelectCell={handleSelectCell}
              onSelectRadar={(rad) => setSelectedRadar(rad)}
              onSelectAirport={(apt) => setSelectedAirport(apt)}
              onOpenInfo={(infoId) => setActiveInfoId(infoId)}
            />
          ) : (
            /* Core 10 Operations Views */
            <>
              {activeView === 'COMMAND_CENTER' && (
                <CommandCenterView
                  stormCells={stormCells}
                  radarStations={radarStations}
                  airports={airports}
                  lightningStrikes={lightningStrikes}
                  nowcastGrid={nowcastGrid}
                  alerts={alerts}
                  timelineStep={timelineStep}
                  selectedCell={selectedCell}
                  userLocation={userLocation}
                  liveWeather={liveWeather}
                  isLoadingLocation={isLoadingLocation}
                  locationStatus={locationStatus}
                  filterScope={filterScope}
                  onToggleFilterScope={(scope) => setFilterScope(scope)}
                  onRequestLocation={handleRequestLocation}
                  onFlyToLocation={handleFlyToLocation}
                  flyToCoords={flyToCoords}
                  onSelectCell={handleSelectCell}
                  onOpenCellDetails={handleOpenCellDetails}
                  onSelectRadar={(rad) => setSelectedRadar(rad)}
                  onSelectAirport={(apt) => setSelectedAirport(apt)}
                  onOpenInfo={(infoId) => setActiveInfoId(infoId)}
                />
              )}

              {activeView === 'RADAR' && (
                <RadarView
                  radarStations={radarStations}
                  stormCells={stormCells}
                  airports={airports}
                  lightningStrikes={lightningStrikes}
                  nowcastGrid={nowcastGrid}
                  timelineStep={timelineStep}
                  selectedCell={selectedCell}
                  userLocation={userLocation}
                  flyToCoords={flyToCoords}
                  onRequestLocation={handleRequestLocation}
                  onFlyToLocation={handleFlyToLocation}
                  onSelectCell={handleSelectCell}
                  onSelectRadar={(rad) => setSelectedRadar(rad)}
                  onSelectAirport={(apt) => setSelectedAirport(apt)}
                  onOpenInfo={(infoId) => setActiveInfoId(infoId)}
                />
              )}

              {activeView === 'SATELLITE' && (
                <SatelliteView
                  radarStations={radarStations}
                  stormCells={stormCells}
                  airports={airports}
                  lightningStrikes={lightningStrikes}
                  nowcastGrid={nowcastGrid}
                  timelineStep={timelineStep}
                  selectedCell={selectedCell}
                  userLocation={userLocation}
                  flyToCoords={flyToCoords}
                  onRequestLocation={handleRequestLocation}
                  onFlyToLocation={handleFlyToLocation}
                  onSelectCell={handleSelectCell}
                  onSelectRadar={(rad) => setSelectedRadar(rad)}
                  onSelectAirport={(apt) => setSelectedAirport(apt)}
                  onOpenInfo={(infoId) => setActiveInfoId(infoId)}
                />
              )}

              {activeView === 'LIGHTNING' && (
                <LightningView
                  radarStations={radarStations}
                  stormCells={stormCells}
                  airports={airports}
                  lightningStrikes={lightningStrikes}
                  nowcastGrid={nowcastGrid}
                  timelineStep={timelineStep}
                  selectedCell={selectedCell}
                  userLocation={userLocation}
                  flyToCoords={flyToCoords}
                  onRequestLocation={handleRequestLocation}
                  onFlyToLocation={handleFlyToLocation}
                  onSelectCell={handleSelectCell}
                  onSelectRadar={(rad) => setSelectedRadar(rad)}
                  onSelectAirport={(apt) => setSelectedAirport(apt)}
                  onOpenInfo={(infoId) => setActiveInfoId(infoId)}
                />
              )}

              {activeView === 'NOWCAST' && (
                <NowcastView
                  radarStations={radarStations}
                  stormCells={stormCells}
                  airports={airports}
                  lightningStrikes={lightningStrikes}
                  nowcastGrid={nowcastGrid}
                  timelineStep={timelineStep}
                  onChangeTimelineStep={handleTimelineStepChange}
                  selectedCell={selectedCell}
                  userLocation={userLocation}
                  flyToCoords={flyToCoords}
                  onRequestLocation={handleRequestLocation}
                  onFlyToLocation={handleFlyToLocation}
                  onSelectCell={handleSelectCell}
                  onSelectRadar={(rad) => setSelectedRadar(rad)}
                  onSelectAirport={(apt) => setSelectedAirport(apt)}
                  onOpenInfo={(infoId) => setActiveInfoId(infoId)}
                />
              )}

              {activeView === 'HAZARDS' && (
                <HazardsView
                  stormCells={stormCells}
                  radarStations={radarStations}
                  airports={airports}
                  lightningStrikes={lightningStrikes}
                  nowcastGrid={nowcastGrid}
                  timelineStep={timelineStep}
                  selectedCell={selectedCell}
                  userLocation={userLocation}
                  flyToCoords={flyToCoords}
                  onRequestLocation={handleRequestLocation}
                  onFlyToLocation={handleFlyToLocation}
                  onSelectCell={handleSelectCell}
                  onSelectRadar={(rad) => setSelectedRadar(rad)}
                  onSelectAirport={(apt) => setSelectedAirport(apt)}
                  onOpenInfo={(infoId) => setActiveInfoId(infoId)}
                />
              )}

              {activeView === 'ALERTS' && (
                <AlertEngineView
                  alerts={alerts}
                  thresholds={thresholds}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onFocusAlertOnMap={handleFocusAlertOnMap}
                  onShareAlert={(alert) => setShareModalAlert(alert)}
                  onOpenThresholdSettings={() => setIsSettingsOpen(true)}
                  onOpenInfo={(infoId) => setActiveInfoId(infoId)}
                />
              )}

              {activeView === 'HISTORICAL' && (
                <HistoricalView onOpenInfo={(infoId) => setActiveInfoId(infoId)} />
              )}

              {activeView === 'AI_ARCHITECTURE' && (
                <AiArchitectureView onOpenInfo={(infoId) => setActiveInfoId(infoId)} />
              )}

              {activeView === 'DATA_SOURCES' && (
                <DataSourcesView 
                  onOpenApiKeys={() => setIsApiKeysOpen(true)}
                  onOpenInfo={(infoId) => setActiveInfoId(infoId)}
                />
              )}

              {activeView === 'SYSTEM_HEALTH' && (
                <SystemHealthView onOpenInfo={(infoId) => setActiveInfoId(infoId)} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Slide-in Drawers and Modals */}
      {isCellInspectorOpen && (
        <StormCellInspector
          cell={selectedCell}
          onClose={() => setIsCellInspectorOpen(false)}
          onTrackOnMap={(cell) => {
            setIsCellInspectorOpen(false);
            setSelectedCell(cell);
          }}
        />
      )}

      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onFocusAlertOnMap={handleFocusAlertOnMap}
        onShareAlert={(alert) => setShareModalAlert(alert)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        thresholds={thresholds}
        onSaveThresholds={handleSaveThresholds}
        onOpenApiKeys={() => setIsApiKeysOpen(true)}
      />

      <ShareAlertModal
        alert={shareModalAlert}
        onClose={() => setShareModalAlert(null)}
      />

      {/* Weather Meteorological Info Modal */}
      <WeatherInfoModal
        infoId={activeInfoId}
        onClose={() => setActiveInfoId(null)}
      />

      {/* Universal API Key Configuration Modal */}
      <ApiKeysModal
        isOpen={isApiKeysOpen}
        onClose={() => setIsApiKeysOpen(false)}
      />
    </div>
  );
}

export default App;
