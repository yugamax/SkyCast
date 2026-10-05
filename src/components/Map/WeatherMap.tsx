import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  RefreshCw,
  Sliders, 
  Radio, 
  Zap, 
  Plane,
  CloudRain,
  Eye,
  MapPin,
  Navigation,
  Crosshair,
  LocateFixed,
  Satellite,
  Activity,
  ChevronDown,
  Check
} from 'lucide-react';
import { 
  StormCell, 
  RadarStation, 
  AirportStation, 
  LightningStrike, 
  GridForecastPoint, 
  TimelineStep 
} from '../../types/weather';
import { REGION_BOUNDS } from '../../data/mockData';
import { KEY_INDIAN_STATES } from '../../data/indiaGeoData';
import { useTheme } from '../../context/ThemeContext';
import { InfoButton } from '../Common/InfoButton';
import { liveWeatherService, RainViewerMetadata } from '../../services/liveWeatherService';

export type MapActiveLayer = 
  | 'RADAR_REFLECTIVITY'
  | 'RADAR_VELOCITY'
  | 'INSAT_SATELLITE_IR'
  | 'CLOUD_TOP_TEMP'
  | 'LIGHTNING_DENSITY'
  | 'RAINFALL_RATE'
  | 'CONVECTIVE_INITIATION'
  | 'PROB_THUNDERSTORM'
  | 'PROB_HAIL'
  | 'PROB_DOWNBURST'
  | 'PROB_CLOUDBURST'
  | 'STORM_ARRIVAL_TIME';

export type BasemapProvider = 
  | 'GOOGLE_HYBRID' 
  | 'GOOGLE_SATELLITE' 
  | 'DARK_MATTER' 
  | 'DARK_NOLABELS' 
  | 'VOYAGER' 
  | 'GOOGLE_TERRAIN' 
  | 'OSM' 
  | 'OSM_HOT' 
  | 'POSITRON' 
  | 'TOPO';

export interface BasemapConfig {
  name: string;
  category: 'SATELLITE' | 'TACTICAL' | 'STREETS' | 'TERRAIN';
  url: string;
  subdomains?: string;
  attribution: string;
  icon: string;
  maxNativeZoom?: number;
  maxZoom?: number;
}

const BASEMAP_CONFIGS: Record<BasemapProvider, BasemapConfig> = {
  GOOGLE_HYBRID: {
    name: 'High-Res Aerial Satellite',
    category: 'SATELLITE',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: '0123',
    maxNativeZoom: 20,
    maxZoom: 21,
    attribution: '&copy; Google Satellite Imagery, Roads & Borders',
    icon: '🛰️'
  },
  GOOGLE_SATELLITE: {
    name: 'Pure Optical Satellite',
    category: 'SATELLITE',
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    subdomains: '0123',
    maxNativeZoom: 20,
    maxZoom: 21,
    attribution: '&copy; Google Earth Satellite',
    icon: '🌍'
  },
  DARK_MATTER: {
    name: 'Tactical Dark Matter',
    category: 'TACTICAL',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxNativeZoom: 19,
    maxZoom: 20,
    attribution: '&copy; CARTO, OpenStreetMap',
    icon: '🌙'
  },
  DARK_NOLABELS: {
    name: 'Pitch Black Radar Canvas',
    category: 'TACTICAL',
    url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxNativeZoom: 19,
    maxZoom: 20,
    attribution: '&copy; CARTO, OpenStreetMap',
    icon: '⬛'
  },
  VOYAGER: {
    name: 'Voyager Navigation Map',
    category: 'STREETS',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxNativeZoom: 19,
    maxZoom: 20,
    attribution: '&copy; CARTO, OpenStreetMap',
    icon: '🧭'
  },
  GOOGLE_TERRAIN: {
    name: '3D Topographic Relief',
    category: 'TERRAIN',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: '0123',
    maxNativeZoom: 18,
    maxZoom: 20,
    attribution: '&copy; Google Terrain & Elevation',
    icon: '🏔️'
  },
  OSM: {
    name: 'OpenStreetMap Standard',
    category: 'STREETS',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxNativeZoom: 19,
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap contributors',
    icon: '🗺️'
  },
  OSM_HOT: {
    name: 'Humanitarian Disaster Ops',
    category: 'STREETS',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxNativeZoom: 19,
    maxZoom: 20,
    attribution: '&copy; OpenStreetMap Humanitarian & Relief',
    icon: '🚨'
  },
  POSITRON: {
    name: 'Clean Positron Light',
    category: 'STREETS',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxNativeZoom: 19,
    maxZoom: 20,
    attribution: '&copy; CARTO, OpenStreetMap',
    icon: '☀️'
  },
  TOPO: {
    name: 'OpenTopo Elevation Contours',
    category: 'TERRAIN',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxNativeZoom: 16,
    maxZoom: 19,
    attribution: '&copy; OpenTopoMap',
    icon: '⛰️'
  }
};

export interface WeatherMapProps {
  stormCells: StormCell[];
  radarStations: RadarStation[];
  airports: AirportStation[];
  lightningStrikes: LightningStrike[];
  nowcastGrid: GridForecastPoint[];
  timelineStep: TimelineStep;
  selectedCell: StormCell | null;
  userLocation?: { lat: number; lng: number; city?: string; accuracy?: number } | null;
  onRequestLocation?: () => void;
  onFlyToLocation?: (lat: number, lng: number) => void;
  onSelectCell: (cell: StormCell) => void;
  onSelectRadar?: (station: RadarStation) => void;
  onSelectAirport?: (airport: AirportStation) => void;
  onOpenInfo?: (infoId: string) => void;
  activeLayer?: MapActiveLayer;
  onChangeActiveLayer?: (layer: MapActiveLayer) => void;
  flyToCoords?: { lat: number; lng: number; zoom?: number } | null;
  forecastTimeLabel?: string;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  stormCells,
  radarStations,
  airports,
  lightningStrikes,
  nowcastGrid,
  timelineStep,
  selectedCell,
  userLocation,
  onRequestLocation,
  onFlyToLocation,
  onSelectCell,
  onSelectRadar,
  onSelectAirport,
  onOpenInfo,
  activeLayer = 'RADAR_REFLECTIVITY',
  onChangeActiveLayer,
  flyToCoords,
  forecastTimeLabel
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const weatherOverlayLayerRef = useRef<L.TileLayer | null>(null);
  const hasAutoCenteredToUserRef = useRef<boolean>(false);

  const layerGroupsRef = useRef<{
    radarRings: L.LayerGroup;
    radarStations: L.LayerGroup;
    stormCells: L.LayerGroup;
    lightning: L.LayerGroup;
    airports: L.LayerGroup;
    stateBorders: L.LayerGroup;
    nowcastGridLayer: L.LayerGroup;
    userLocationGroup: L.LayerGroup;
  } | null>(null);

  const [currentLayer, setCurrentLayer] = useState<MapActiveLayer>(activeLayer);
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapProvider>('GOOGLE_HYBRID');
  const [isBasemapMenuOpen, setIsBasemapMenuOpen] = useState<boolean>(false);
  const [showRadarRings, setShowRadarRings] = useState<boolean>(true);
  const [showAirports, setShowAirports] = useState<boolean>(true);
  const [showLightningFlashes, setShowLightningFlashes] = useState<boolean>(true);
  const [showCellVectors, setShowCellVectors] = useState<boolean>(true);
  const [showLiveRadarTiles, setShowLiveRadarTiles] = useState<boolean>(true);
  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL_INDIA');
  const [rainViewerMeta, setRainViewerMeta] = useState<RainViewerMetadata | null>(liveWeatherService.getRainViewerMeta());

  // Listen to RainViewer live updates
  useEffect(() => {
    const unsub = liveWeatherService.subscribe(() => {
      setRainViewerMeta(liveWeatherService.getRainViewerMeta());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (activeLayer) {
      setCurrentLayer(activeLayer);
    }
  }, [activeLayer]);

  // Helper to construct TileLayer with correct native zoom constraints to prevent "zoom level not supported" errors
  const createBasemapTileLayer = (provider: BasemapProvider) => {
    const conf = BASEMAP_CONFIGS[provider] || BASEMAP_CONFIGS.GOOGLE_HYBRID;
    return L.tileLayer(conf.url, {
      attribution: conf.attribution,
      subdomains: conf.subdomains || 'abc',
      maxNativeZoom: conf.maxNativeZoom || 19,
      maxZoom: conf.maxZoom || 20
    });
  };

  // Handle Basemap Change
  const handleBasemapChange = (provider: BasemapProvider) => {
    setSelectedBasemap(provider);
    setIsBasemapMenuOpen(false);

    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newTile = createBasemapTileLayer(provider);
      newTile.addTo(mapInstanceRef.current);
      newTile.bringToBack();
      tileLayerRef.current = newTile;
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map instance centered on user location or India
    const initialCenter = userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : REGION_BOUNDS.ALL_INDIA.center;
    const initialZoom = userLocation ? 9 : REGION_BOUNDS.ALL_INDIA.zoom;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 3,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true
    });

    const initialTile = createBasemapTileLayer(selectedBasemap).addTo(map);
    tileLayerRef.current = initialTile;

    // Initialize Layer Groups
    const layerGroups = {
      radarRings: L.layerGroup().addTo(map),
      radarStations: L.layerGroup().addTo(map),
      stormCells: L.layerGroup().addTo(map),
      lightning: L.layerGroup().addTo(map),
      airports: L.layerGroup().addTo(map),
      stateBorders: L.layerGroup().addTo(map),
      nowcastGridLayer: L.layerGroup().addTo(map),
      userLocationGroup: L.layerGroup().addTo(map)
    };

    layerGroupsRef.current = layerGroups;
    mapInstanceRef.current = map;

    // ResizeObserver to automatically resize map whenever container box changes dimensions
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    // Initial resize invalidation to ensure crystal clear tile rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Mouse coordinate tracker
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Math.round(e.latlng.lat * 10000) / 10000,
        lng: Math.round(e.latlng.lng * 10000) / 10000
      });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Render Indian state boundary outlines in clean tactical styling
    KEY_INDIAN_STATES.forEach(state => {
      L.polygon(state.points, {
        color: isLight ? 'rgba(217, 119, 6, 0.4)' : 'rgba(245, 158, 11, 0.25)',
        weight: 1,
        fillColor: isLight ? 'rgba(217, 119, 6, 0.02)' : 'rgba(245, 158, 11, 0.02)',
        fillOpacity: 0.1,
        dashArray: '3, 4'
      }).addTo(layerGroups.stateBorders);
    });

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 1. Automatic Zoom into Current Location on Discovery
  useEffect(() => {
    if (userLocation && mapInstanceRef.current && !hasAutoCenteredToUserRef.current) {
      hasAutoCenteredToUserRef.current = true;
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.flyTo(
        [userLocation.lat, userLocation.lng], 
        9, 
        { 
          animate: true, 
          duration: 2.2, 
          easeLinearity: 0.25 
        }
      );
    }
  }, [userLocation]);

  // 2. Handle external flyTo requests smoothly
  useEffect(() => {
    if (flyToCoords && mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.flyTo(
        [flyToCoords.lat, flyToCoords.lng], 
        flyToCoords.zoom || 9, 
        { 
          animate: true, 
          duration: 2.2, 
          easeLinearity: 0.25 
        }
      );
    }
  }, [flyToCoords]);

  // 3. Update Real-World RainViewer Doppler Radar & Satellite Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing weather tile overlay if any
    if (weatherOverlayLayerRef.current) {
      map.removeLayer(weatherOverlayLayerRef.current);
      weatherOverlayLayerRef.current = null;
    }

    if (!showLiveRadarTiles) return;

    const host = rainViewerMeta?.host || 'https://tilecache.rainviewer.com';

    if (currentLayer === 'RADAR_REFLECTIVITY' || currentLayer === 'RAINFALL_RATE') {
      const ts = rainViewerMeta?.radarTimestamp;
      if (ts) {
        // RainViewer 5-minute Real Doppler Radar Composite Tiles
        const radarTile = L.tileLayer(`${host}/v2/radar/${ts}/256/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.82,
          maxZoom: 18,
          zIndex: 15,
          attribution: 'RainViewer Live Doppler'
        });
        radarTile.addTo(map);
        weatherOverlayLayerRef.current = radarTile;
      }
    } else if (currentLayer === 'INSAT_SATELLITE_IR' || currentLayer === 'CLOUD_TOP_TEMP') {
      const satTs = rainViewerMeta?.satelliteTimestamp;
      if (satTs) {
        // RainViewer Real-time Infrared Satellite Tiles
        const satTile = L.tileLayer(`${host}/v2/satellite/${satTs}/256/{z}/{x}/{y}/0/0_0.png`, {
          opacity: 0.78,
          maxZoom: 18,
          zIndex: 15,
          attribution: 'RainViewer IR Satellite'
        });
        satTile.addTo(map);
        weatherOverlayLayerRef.current = satTile;
      }
    }
  }, [currentLayer, rainViewerMeta, showLiveRadarTiles]);

  // Update User GPS Location Marker with minimal iOS-style pulse
  const updateUserLocationLayer = useCallback(() => {
    if (!layerGroupsRef.current) return;
    const { userLocationGroup } = layerGroupsRef.current;
    userLocationGroup.clearLayers();

    if (userLocation) {
      const userMarkerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <!-- Soft Expanding Single-Ripple Wave -->
          <div class="w-8 h-8 rounded-full bg-sky-400/25 border border-sky-400/40 animate-[pulseRipple_2.2s_cubic-bezier(0,0,0.2,1)_infinite] absolute pointer-events-none"></div>
          
          <!-- Crisp 6px Solid Cyan Dot (#38BDF8) with White Hairline Ring -->
          <div class="w-2.5 h-2.5 rounded-full bg-[#38BDF8] border-[1.5px] border-white shadow-[0_0_10px_rgba(56,189,248,0.95)] z-10"></div>
          
          <!-- City Label Minimal Badge -->
          <div class="absolute -bottom-5 bg-slate-900/85 backdrop-blur-md text-[9px] font-mono font-medium text-sky-200 px-2 py-0.5 rounded-full border border-white/10 shadow-lg whitespace-nowrap pointer-events-none z-20 flex items-center space-x-1">
            <span class="w-1 h-1 rounded-full bg-[#38BDF8]"></span>
            <span>${userLocation.city || 'My Coordinates'}</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-user-icon',
        html: userMarkerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], { icon })
        .bindPopup(`
          <div class="p-2 font-mono text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}">
            <div class="font-bold text-sky-400 text-xs flex items-center space-x-1">
              <span>📍 Your GPS Position (Locked)</span>
            </div>
            <div class="mt-1 font-bold ${isLight ? 'text-slate-900' : 'text-white'} text-sm">
              ${userLocation.city || 'Detected Coordinates'}
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">
              Lat: ${userLocation.lat.toFixed(4)}°N • Lng: ${userLocation.lng.toFixed(4)}°E
            </div>
            <div class="text-[10px] text-sky-400 mt-1 flex items-center space-x-1">
              <span>• Sensor Accuracy: ±${userLocation.accuracy || 15}m</span>
            </div>
          </div>
        `);

      userLocationGroup.addLayer(marker);
    }
  }, [userLocation, isLight]);

  // Update Radar Stations & Range Rings
  const updateRadarStationsLayer = useCallback(() => {
    if (!layerGroupsRef.current) return;
    const { radarStations: stationGroup, radarRings: ringsGroup } = layerGroupsRef.current;

    stationGroup.clearLayers();
    ringsGroup.clearLayers();

    radarStations.forEach((st) => {
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-4 h-4 rounded-full ${
            isLight ? 'bg-white border-2 border-teal-600 shadow-xs' : 'bg-[#0b1124] border-2 border-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.4)]'
          } flex items-center justify-center group-hover:scale-125 transition-transform">
            <span class="w-1.5 h-1.5 rounded-full ${isLight ? 'bg-teal-600' : 'bg-teal-400'}"></span>
          </div>
          <div class="absolute -bottom-3.5 ${
            isLight ? 'bg-white/95 text-slate-900 border border-slate-300' : 'bg-[#0b1124]/95 text-teal-300 border border-teal-500/30'
          } text-[8px] font-mono font-bold px-1 py-0.2 rounded whitespace-nowrap shadow-xs pointer-events-none">
            ${st.code}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-radar-icon',
        html: markerHtml,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([st.lat, st.lng], { icon })
        .bindPopup(`
          <div class="p-2.5 font-mono text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}">
            <div class="font-bold ${isLight ? 'text-teal-700' : 'text-teal-300'} text-xs flex items-center justify-between">
              <span>${st.name}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded ${isLight ? 'bg-teal-50 text-teal-800' : 'bg-teal-950/60 text-teal-300'} border border-teal-500/30 font-bold">${st.band}</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${st.state} • ${st.region} Region</div>
            <div class="grid grid-cols-2 gap-1.5 mt-2 text-[9px] ${isLight ? 'bg-slate-100' : 'bg-[#0e1426]'} p-2 rounded">
              <div>Status: <b class="text-teal-400">${st.status}</b></div>
              <div>Frequency: <b>${st.frequencyGhz} GHz</b></div>
              <div>Max Range: <b>${st.rangeKm} km</b></div>
              <div>Power: <b>${st.peakPowerKw} kW</b></div>
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectRadar) onSelectRadar(st);
      });

      stationGroup.addLayer(marker);

      if (showRadarRings) {
        L.circle([st.lat, st.lng], {
          radius: 100000,
          color: isLight ? 'rgba(217, 119, 6, 0.25)' : 'rgba(245, 158, 11, 0.18)',
          weight: 0.8,
          dashArray: '3, 4',
          fillColor: 'transparent',
          interactive: false
        }).addTo(ringsGroup);

        L.circle([st.lat, st.lng], {
          radius: 250000,
          color: isLight ? 'rgba(217, 119, 6, 0.15)' : 'rgba(245, 158, 11, 0.1)',
          weight: 0.8,
          fillColor: isLight ? 'rgba(217, 119, 6, 0.01)' : 'rgba(245, 158, 11, 0.01)',
          interactive: false
        }).addTo(ringsGroup);
      }
    });
  }, [radarStations, showRadarRings, onSelectRadar, isLight]);

  // Update Storm Cells, Trajectories & Cone of Uncertainty
  const updateStormCellsLayer = useCallback(() => {
    if (!layerGroupsRef.current) return;
    const { stormCells: cellGroup } = layerGroupsRef.current;
    cellGroup.clearLayers();

    stormCells.forEach((cell) => {
      const isSelected = selectedCell?.id === cell.id;
      const isCritical = cell.severity === 'CRITICAL';
      const isSevere = cell.severity === 'SEVERE';

      const colorHex = isCritical ? '#EF4444' : isSevere ? '#F59E0B' : '#2DD4BF';

      // Outer Convective Aura Ring
      L.circle([cell.lat, cell.lng], {
        radius: (cell.radiusKm || 18) * 1000,
        color: colorHex,
        weight: isSelected ? 2 : 1,
        fillColor: colorHex,
        fillOpacity: isSelected ? 0.22 : 0.12,
        interactive: false
      }).addTo(cellGroup);

      // Severe Convective Core
      L.circle([cell.lat, cell.lng], {
        radius: ((cell.radiusKm || 18) * 0.45) * 1000,
        color: colorHex,
        weight: 1.2,
        fillColor: colorHex,
        fillOpacity: 0.4,
        interactive: false
      }).addTo(cellGroup);

      // Interactive Cell Reticle Marker
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-115 ${
            isCritical ? 'animate-pulse' : ''
          }" style="background-color: ${colorHex}33; border: 1.5px solid ${colorHex}; box-shadow: 0 0 12px ${colorHex}88;">
            <span class="text-[9px] font-mono font-bold text-white">${Math.round(cell.reflectivityDbz)}</span>
          </div>
          ${isSelected ? `
            <div class="absolute -top-4 bg-[#060608]/95 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shadow-md whitespace-nowrap" style="border-color: ${colorHex}; color: ${colorHex};">
              ${cell.id} • ${cell.speedKmh}kph
            </div>
          ` : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-storm-icon',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([cell.lat, cell.lng], { icon });
      marker.on('click', () => onSelectCell(cell));
      cellGroup.addLayer(marker);

      // Storm Trajectory Vectors with Soft Cone of Uncertainty Fan & Heading Arrow
      if (showCellVectors && cell.trajectory && cell.trajectory.length > 1) {
        const p0 = cell.trajectory[0];
        const pEnd = cell.trajectory[cell.trajectory.length - 1];
        
        const dLat = pEnd[0] - p0[0];
        const dLng = pEnd[1] - p0[1];
        const dist = Math.sqrt(dLat * dLat + dLng * dLng) || 0.001;

        // Angle in degrees for compass heading
        const headingDeg = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;

        // Cone of uncertainty geometry
        const spread = dist * 0.22;
        const perpLat = -dLng / dist;
        const perpLng = dLat / dist;

        const leftPoint: [number, number] = [pEnd[0] + perpLat * spread, pEnd[1] + perpLng * spread];
        const rightPoint: [number, number] = [pEnd[0] - perpLat * spread, pEnd[1] - perpLng * spread];

        // 1. Render Soft Cone of Uncertainty Polygon
        const conePolygon = L.polygon([p0, leftPoint, pEnd, rightPoint], {
          color: colorHex,
          fillColor: colorHex,
          fillOpacity: isSelected ? 0.16 : 0.07,
          weight: 0.8,
          dashArray: '2, 4',
          opacity: 0.35,
          interactive: false
        });
        cellGroup.addLayer(conePolygon);

        // 2. Dashed Trajectory Core Vector
        const polyline = L.polyline(cell.trajectory, {
          color: colorHex,
          weight: isSelected ? 2.5 : 1.8,
          dashArray: '5, 6',
          opacity: isSelected ? 0.95 : 0.75
        });
        cellGroup.addLayer(polyline);

        // 3. Directional Heading Arrow & Speed Readout Badge
        const arrowHtml = `
          <div class="relative flex items-center justify-center pointer-events-none">
            <div class="flex items-center space-x-1 px-1.5 py-0.5 rounded-full backdrop-blur-md shadow-lg border text-[8px] font-mono font-bold whitespace-nowrap ${
              isSelected 
                ? 'bg-slate-900/95 border-teal-400 text-teal-300' 
                : 'bg-slate-950/80 border-white/10 text-slate-200'
            }">
              <svg class="w-2.5 h-2.5 text-cyan-400 inline-block shrink-0" style="transform: rotate(${headingDeg}deg);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
              <span>${cell.speedKmh} km/h ${cell.directionText || 'NE'}</span>
            </div>
          </div>
        `;

        const arrowIcon = L.divIcon({
          className: 'custom-heading-arrow',
          html: arrowHtml,
          iconSize: [68, 18],
          iconAnchor: [34, 9]
        });

        L.marker(pEnd, { icon: arrowIcon, interactive: false }).addTo(cellGroup);

        // Target Impact Marker if selected
        if (cell.targetLat && cell.targetLng && isSelected) {
          const targetHtml = `
            <div class="bg-rose-950/90 border border-rose-500 text-[9px] font-mono font-bold text-rose-200 px-1.5 py-0.5 rounded shadow-md flex items-center space-x-1">
              <span>ETA ${cell.etaMinutes}m</span>
            </div>
          `;
          const targetIcon = L.divIcon({
            className: 'custom-target-icon',
            html: targetHtml,
            iconSize: [52, 18],
            iconAnchor: [26, 9]
          });
          L.marker([cell.targetLat, cell.targetLng], { icon: targetIcon, interactive: false }).addTo(cellGroup);
        }
      }
    });
  }, [stormCells, selectedCell, showCellVectors, onSelectCell]);

  // Update Lightning Strikes Layer
  const updateLightningLayer = useCallback(() => {
    if (!layerGroupsRef.current || !showLightningFlashes) return;
    const { lightning: ltgGroup } = layerGroupsRef.current;
    ltgGroup.clearLayers();

    lightningStrikes.slice(0, 40).forEach((strike, idx) => {
      const isCG = strike.type === 'CG';

      const flashHtml = `
        <div class="relative flex items-center justify-center pointer-events-none">
          <div class="w-2.5 h-2.5 rounded-full ${
            isCG ? 'bg-amber-400' : 'bg-yellow-200'
          } ${idx < 6 ? 'animate-ping' : ''} opacity-80"></div>
          <div class="absolute w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-lightning-icon',
        html: flashHtml,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });

      const marker = L.marker([strike.lat, strike.lng], { icon });
      ltgGroup.addLayer(marker);
    });
  }, [lightningStrikes, showLightningFlashes]);

  // Update Airports Layer
  const updateAirportsLayer = useCallback(() => {
    if (!layerGroupsRef.current || !showAirports) return;
    const { airports: airportGroup } = layerGroupsRef.current;
    airportGroup.clearLayers();

    airports.forEach((apt) => {
      const isCritical = apt.convectiveThreat === 'CRITICAL';
      const isSevere = apt.convectiveThreat === 'SEVERE';

      const dotColor = isCritical ? 'bg-rose-500' : isSevere ? 'bg-amber-400' : 'bg-teal-400';

      const airportHtml = `
        <div class="relative flex items-center space-x-1 cursor-pointer group bg-[#0b1124]/90 border border-white/[0.08] px-1.5 py-0.5 rounded shadow-xs">
          <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
          <span class="text-[8px] font-mono font-bold text-slate-300">${apt.code}</span>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-airport-icon',
        html: airportHtml,
        iconSize: [38, 16],
        iconAnchor: [19, 8]
      });

      const marker = L.marker([apt.lat, apt.lng], { icon })
        .bindPopup(`
          <div class="p-2.5 font-mono text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}">
            <div class="font-bold ${isLight ? 'text-teal-700' : 'text-teal-300'} text-xs flex items-center justify-between">
              <span>${apt.name} (${apt.code})</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded font-bold ${
                apt.flightCategory === 'VFR' ? 'bg-teal-950/60 text-teal-300' : 'bg-rose-950/60 text-rose-300'
              }">${apt.flightCategory}</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${apt.city}, ${apt.state}</div>
            <div class="mt-2 text-[9px] ${isLight ? 'bg-slate-100' : 'bg-[#0e1426]'} p-2 rounded space-y-0.5">
              <div>Surface Wind: <b>${apt.windDirDeg}° at ${apt.windKts} kts (G: ${apt.gustKts} kts)</b></div>
              <div>Visibility: <b>${apt.visibilityKm} km</b></div>
              <div>Convective Threat: <b class="${isCritical ? 'text-rose-400' : 'text-teal-400'}">${apt.convectiveThreat}</b></div>
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectAirport) onSelectAirport(apt);
      });

      airportGroup.addLayer(marker);
    });
  }, [airports, showAirports, onSelectAirport, isLight]);

  // Sync Layers on State Update
  useEffect(() => {
    updateRadarStationsLayer();
    updateStormCellsLayer();
    updateLightningLayer();
    updateAirportsLayer();
    updateUserLocationLayer();
  }, [updateRadarStationsLayer, updateStormCellsLayer, updateLightningLayer, updateAirportsLayer, updateUserLocationLayer]);

  // Handle Region Jumps
  const handleRegionChange = (regionKey: string) => {
    setSelectedRegion(regionKey);
    const region = REGION_BOUNDS[regionKey as keyof typeof REGION_BOUNDS];
    if (region && mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.flyTo(region.center, region.zoom, { duration: 1.8, easeLinearity: 0.25 });
    }
  };

  const handleRecenterUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 9, {
        animate: true,
        duration: 1.8,
        easeLinearity: 0.25
      });
    } else if (onRequestLocation) {
      onRequestLocation();
    } else {
      handleRegionChange('ALL_INDIA');
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetView = () => {
    handleRegionChange('ALL_INDIA');
  };

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-white/[0.08] border-t-white/[0.16] bg-[#0E0F12] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
      {/* Main Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-10 rounded-2xl" />

      {/* Top Floating Control Ribbon */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none gap-1.5 flex-nowrap max-w-[calc(100%-20px)]">
        {/* Left: Region Selector */}
        <div className="flex items-center space-x-1 pointer-events-auto shrink min-w-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-0.5 p-0.5 sm:p-1 rounded-xl bg-[#121316]/90 border border-white/[0.08] backdrop-blur-xl shadow-lg">
            {Object.entries(REGION_BOUNDS).map(([key]) => {
              const labelMap: Record<string, string> = {
                ALL_INDIA: 'ALL',
                NORTH_INDIA: 'NORTH',
                EAST_INDIA: 'EAST',
                SOUTH_INDIA: 'SOUTH',
                WEST_INDIA: 'WEST',
                NORTHEAST: 'NE'
              };
              return (
                <button
                  key={key}
                  onClick={() => handleRegionChange(key)}
                  className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedRegion === key
                      ? isLight
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'bg-white/[0.14] text-zinc-100 font-semibold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {labelMap[key] || key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Layer Readout & Basemap + Filter Controls */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 pointer-events-auto shrink-0 ml-auto">
          {/* Live Doppler Radar Overlay Badge */}
          {rainViewerMeta && (
            <div 
              className={`hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded-xl border text-[10px] font-mono shadow-md backdrop-blur-xl ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE DOPPLER FEED</span>
            </div>
          )}

          {/* Active Product Layer Tag */}
          <div 
            className={`hidden md:flex items-center space-x-1.5 px-2 py-1 rounded-xl border text-[10px] font-mono shadow-md backdrop-blur-xl ${
              isLight ? 'bg-white/95 border-slate-200 text-slate-700' : 'bg-[#121316]/85 border-white/[0.08] text-zinc-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-zinc-500">LAYER:</span>
            <span className="font-semibold text-zinc-200 max-w-[110px] truncate">{currentLayer.replace(/_/g, ' ')}</span>
            {onOpenInfo && (
              <InfoButton infoId={currentLayer} onOpenInfo={onOpenInfo} size="xs" />
            )}
          </div>

          {/* Basemap Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setIsBasemapMenuOpen(!isBasemapMenuOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1 text-[10px] sm:text-[11px] font-mono rounded-xl bg-[#121316]/90 border border-white/[0.08] backdrop-blur-xl text-zinc-200 hover:bg-white/[0.08] shadow-md transition-colors cursor-pointer"
              title="Select Map Viewing Style"
            >
              <span className="text-sm">{BASEMAP_CONFIGS[selectedBasemap]?.icon || '🛰️'}</span>
              <span className="hidden sm:inline font-semibold">{BASEMAP_CONFIGS[selectedBasemap]?.name || 'Satellite'}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${isBasemapMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBasemapMenuOpen && (
              <div 
                className={`absolute right-0 top-9 w-72 sm:w-80 rounded-xl border shadow-2xl p-2 z-50 backdrop-blur-2xl font-mono text-xs max-h-[82vh] overflow-y-auto ${
                  isLight ? 'bg-white/98 border-slate-200 text-slate-800' : 'bg-[#121316]/98 border-white/[0.12] text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 mb-2 px-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Map Viewing Styles</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">10 Options</span>
                </div>

                {/* Grouped by Category */}
                {(['SATELLITE', 'TACTICAL', 'STREETS', 'TERRAIN'] as const).map((cat) => {
                  const catTitle = {
                    SATELLITE: '🛰️ Satellite & Aerial Imagery',
                    TACTICAL: '🌙 Tactical & Radar Canvas',
                    STREETS: '🧭 Navigation & Streets',
                    TERRAIN: '🏔️ Topography & Elevation'
                  }[cat];

                  const items = (Object.keys(BASEMAP_CONFIGS) as BasemapProvider[]).filter(
                    (k) => BASEMAP_CONFIGS[k].category === cat
                  );

                  return (
                    <div key={cat} className="mb-2 last:mb-0">
                      <div className="text-[9px] uppercase font-bold text-zinc-500 px-1.5 py-0.5 tracking-wider">
                        {catTitle}
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {items.map((key) => {
                          const conf = BASEMAP_CONFIGS[key];
                          const isSelected = selectedBasemap === key;
                          return (
                            <button
                              key={key}
                              onClick={() => handleBasemapChange(key)}
                              className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? isLight 
                                    ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300 shadow-sm' 
                                    : 'bg-white/[0.12] text-white font-semibold border border-white/[0.18] shadow-sm'
                                  : isLight 
                                    ? 'hover:bg-slate-100/80 text-slate-700' 
                                    : 'hover:bg-white/[0.06] text-zinc-300'
                              }`}
                            >
                              <span className="flex items-center space-x-2 min-w-0">
                                <span className="text-base shrink-0">{conf.icon}</span>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-medium leading-tight truncate">{conf.name}</div>
                                  <div className="text-[9px] text-zinc-500 tracking-tight truncate">{conf.attribution.replace(/&copy;/g, '©')}</div>
                                </div>
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Layer Filter Drawer Trigger */}
          <button
            onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
            className={`flex items-center space-x-1 px-2 py-1 text-[10px] sm:text-[11px] font-mono rounded-xl border shadow-md transition-colors backdrop-blur-xl cursor-pointer ${
              isLayerDrawerOpen
                ? 'bg-zinc-100 text-zinc-950 border-white font-semibold'
                : 'bg-[#121316]/90 border-white/[0.08] text-zinc-300 hover:bg-white/[0.08]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
          </button>
        </div>
      </div>

      {/* Slide-out Layer & Sensor Filter Drawer */}
      {isLayerDrawerOpen && (
        <div 
          className={`absolute top-12 right-2.5 w-68 max-w-[calc(100%-20px)] rounded-xl border p-3 z-40 shadow-2xl backdrop-blur-2xl font-mono text-xs animate-in fade-in duration-150 ${
            isLight ? 'bg-white/98 border-slate-200 text-slate-800' : 'bg-[#121316]/95 border-white/[0.1] text-zinc-200'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2">
            <span className="font-semibold text-xs text-zinc-200 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Layer & Sensor Telemetry</span>
            </span>
            <button 
              onClick={() => setIsLayerDrawerOpen(false)}
              className="text-zinc-500 hover:text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-white/[0.08] cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
              <span className="flex items-center space-x-2 text-[11px]">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>RainViewer Doppler Overlay</span>
              </span>
              <input 
                type="checkbox" 
                checked={showLiveRadarTiles} 
                onChange={(e) => setShowLiveRadarTiles(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
              <span className="flex items-center space-x-2 text-[11px]">
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>Radar Range Rings</span>
              </span>
              <input 
                type="checkbox" 
                checked={showRadarRings} 
                onChange={(e) => setShowRadarRings(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
              <span className="flex items-center space-x-2 text-[11px]">
                <Compass className="w-3 h-3 text-emerald-400" />
                <span>Cell Motion Vectors</span>
              </span>
              <input 
                type="checkbox" 
                checked={showCellVectors} 
                onChange={(e) => setShowCellVectors(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
              <span className="flex items-center space-x-2 text-[11px]">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Lightning Strike Flashes</span>
              </span>
              <input 
                type="checkbox" 
                checked={showLightningFlashes} 
                onChange={(e) => setShowLightningFlashes(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
              <span className="flex items-center space-x-2 text-[11px]">
                <Plane className="w-3 h-3 text-emerald-400" />
                <span>Airport Station Waypoints</span>
              </span>
              <input 
                type="checkbox" 
                checked={showAirports} 
                onChange={(e) => setShowAirports(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer" 
              />
            </label>
          </div>
        </div>
      )}

      {/* Floating Bottom Map HUD: Telemetry Coordinates & Recenter Controls */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none gap-2">
        {/* Telemetry Coordinate Box */}
        {cursorCoords ? (
          <div 
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-2.5 py-1 rounded-xl border text-[9px] font-mono shadow-md backdrop-blur-xl pointer-events-auto max-w-[65%] sm:max-w-none truncate ${
              isLight ? 'bg-white/90 border-slate-200 text-slate-700' : 'bg-[#121316]/85 border-white/[0.08] text-zinc-300'
            }`}
          >
            <span>LAT: <b className="text-emerald-400">{cursorCoords.lat.toFixed(4)}°</b></span>
            <span className="text-zinc-600">|</span>
            <span>LNG: <b className="text-emerald-400">{cursorCoords.lng.toFixed(4)}°</b></span>
            <span className="text-zinc-600">|</span>
            <span>ZOOM: <b className="text-white">{currentZoom}x</b></span>
            {userLocation && (
              <>
                <span className="text-zinc-600 hidden md:inline">|</span>
                <span className="hidden md:inline text-sky-400 font-semibold truncate">📍 {userLocation.city || 'My GPS'}</span>
              </>
            )}
          </div>
        ) : <div />}

        {/* Zoom & Recenter Buttons with Icon-Only Floating Crosshair */}
        <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-[#121316]/85 border border-white/[0.08] backdrop-blur-xl shadow-lg pointer-events-auto shrink-0">
          {/* Recenter to User Location Crosshair */}
          <button
            onClick={handleRecenterUser}
            className="p-1.5 rounded-lg hover:bg-white/[0.1] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            title="Auto-Locate & Zoom to My Location"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Reset Map to All India"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
