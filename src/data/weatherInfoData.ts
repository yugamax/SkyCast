export interface MetricInfo {
  id: string;
  title: string;
  category: 'RADAR' | 'SATELLITE' | 'LIGHTNING' | 'NOWCAST' | 'HAZARDS' | 'AVIATION' | 'AGRICULTURE' | 'DISASTER' | 'AI_ENGINE';
  shortDescription: string;
  scientificDefinition: string;
  units?: string;
  thresholds: Array<{
    range: string;
    label: string;
    color: string;
    impact: string;
  }>;
  operationalImpact: string;
  formulaOrSensor?: string;
  actionGuideline: string;
}

export const WEATHER_INFO_REGISTRY: Record<string, MetricInfo> = {
  // RADAR PRODUCTS
  RADAR_REFLECTIVITY: {
    id: 'RADAR_REFLECTIVITY',
    title: 'Radar Reflectivity Factor (Z / dBZ)',
    category: 'RADAR',
    shortDescription: 'Measures power returned to Doppler Weather Radar by precipitation particles.',
    scientificDefinition: 'Proportional to the 6th power of hydrometeor diameter (Z = ∑ D⁶). Higher dBZ values indicate denser concentrations of large raindrops, graupel, or hail.',
    units: 'dBZ (Decibels of Reflectivity)',
    thresholds: [
      { range: '< 20 dBZ', label: 'Light Drizzle / Fog', color: 'bg-blue-400 text-black', impact: 'Negligible surface impact.' },
      { range: '20 – 35 dBZ', label: 'Moderate Rain', color: 'bg-green-500 text-white', impact: 'General precipitation; wet roadways.' },
      { range: '35 – 50 dBZ', label: 'Heavy Rain / Thunderstorm', color: 'bg-yellow-400 text-black', impact: 'Local waterlogging, gusty winds, lightning.' },
      { range: '50 – 60 dBZ', label: 'Very Severe Thunderstorm', color: 'bg-orange-500 text-white', impact: 'Downburst gusts, small hail, flash flooding.' },
      { range: '> 60 dBZ', label: 'Destructive Convective Core / Hail', color: 'bg-red-600 text-white', impact: 'Large hail (>2.5 cm), extreme downbursts, roof damage.' }
    ],
    operationalImpact: 'Primary trigger for severe convective cell detection, hail tracking, and aerodrome ground stop warnings.',
    formulaOrSensor: 'Z = ∫ N(D) D⁶ dD (IMD C-Band / S-Band / X-Band Doppler Weather Radars)',
    actionGuideline: 'Values >50 dBZ require immediate automated civil defense notifications and terminal aviation runway hold.'
  },

  RADAR_VELOCITY: {
    id: 'RADAR_VELOCITY',
    title: 'Doppler Radial Velocity (V)',
    category: 'RADAR',
    shortDescription: 'Radial velocity of hydrometeors moving toward or away from the radar antenna.',
    scientificDefinition: 'Calculated from the Doppler phase shift of backscattered radar microwave pulses. Green indicates inbound motion toward the radar; red indicates outbound motion away.',
    units: 'm/s or knots',
    thresholds: [
      { range: '< 15 m/s', label: 'Normal Ambient Flow', color: 'bg-blue-400 text-black', impact: 'Standard wind speeds.' },
      { range: '15 – 25 m/s', label: 'Strong Inflow / Outflow', color: 'bg-yellow-400 text-black', impact: 'Tree branch breakage, turbulence on approach.' },
      { range: '> 25 m/s', label: 'Severe Microburst / Mesocyclone', color: 'bg-red-600 text-white', impact: 'Extreme Low-Level Wind Shear (LLWS), structural roof damage.' }
    ],
    operationalImpact: 'Detects microbursts, gust fronts, and tornado vortex signatures (TVS) before ground impact.',
    formulaOrSensor: 'v_r = - (λ / 2) · Δf_D (Doppler Phase Shift)',
    actionGuideline: 'Couplet velocity differences >30 m/s trigger immediate airport microburst alarms and wind shear divergence alerts.'
  },

  RADAR_ZDR: {
    id: 'RADAR_ZDR',
    title: 'Differential Reflectivity (Z_DR)',
    category: 'RADAR',
    shortDescription: 'Dual-polarization ratio between horizontal and vertical reflectivity pulses.',
    scientificDefinition: 'Describes the physical shape (oblate vs spherical) of precipitation. Large raindrops flatten as they fall (positive Z_DR), while tumbling hail stones appear roughly spherical (near-zero or negative Z_DR).',
    units: 'dB',
    thresholds: [
      { range: '< 0.2 dB with high dBZ', label: 'Hail / Graupel Core', color: 'bg-red-600 text-white', impact: 'Tumbling, non-spherical hail.' },
      { range: '0.5 – 2.5 dB', label: 'Moderate to Heavy Raindrops', color: 'bg-green-500 text-white', impact: 'Standard flattened liquid raindrops.' },
      { range: '> 3.5 dB', label: 'Giant Oblate Drops / Biological', color: 'bg-purple-500 text-white', impact: 'Sparse large drops or insects/birds in boundary layer.' }
    ],
    operationalImpact: 'Allows unambiguous differentiation between catastrophic hail and heavy tropical rainfall.',
    formulaOrSensor: 'Z_DR = 10 · log₁₀(Z_H / Z_V)',
    actionGuideline: 'Combine high dBZ (>55) with near-zero Z_DR to issue high-confidence hail alerts.'
  },

  RADAR_VIL: {
    id: 'RADAR_VIL',
    title: 'Vertically Integrated Liquid (VIL)',
    category: 'RADAR',
    shortDescription: 'Total estimated liquid water mass contained within a vertical atmospheric column.',
    scientificDefinition: 'Calculated by vertically integrating radar reflectivity across all elevation angles throughout the troposphere.',
    units: 'kg/m²',
    thresholds: [
      { range: '< 20 kg/m²', label: 'Light to Moderate Rain', color: 'bg-blue-400 text-black', impact: 'Low water concentration.' },
      { range: '20 – 45 kg/m²', label: 'Heavy Convective Core', color: 'bg-yellow-400 text-black', impact: 'Potential local flash flooding.' },
      { range: '> 50 kg/m²', label: 'Severe Hail / Cloudburst Column', color: 'bg-red-600 text-white', impact: 'High kinetic energy core; impending downburst or cloudburst.' }
    ],
    operationalImpact: 'VIL spikes followed by rapid drops indicate core collapse and imminent surface downbursts.',
    formulaOrSensor: 'VIL = 3.44 × 10⁻⁶ ∫ Z^{4/7} dh',
    actionGuideline: 'Monitor VIL density (VIL / Echo Top); values >3.5 g/m³ indicate >90% hail probability.'
  },

  // SATELLITE CHANNELS
  INSAT_CTBT: {
    id: 'INSAT_CTBT',
    title: 'Cloud-Top Brightness Temperature (CTBT)',
    category: 'SATELLITE',
    shortDescription: 'Radiometric temperature at the uppermost boundary of convective clouds.',
    scientificDefinition: 'Measured by INSAT-3D/3DR 10.8 µm thermal infrared sensor. Colder cloud tops indicate deeper vertical updrafts penetrating into the cold upper troposphere and tropopause.',
    units: 'Kelvin (K) or Celsius (°C)',
    thresholds: [
      { range: '> 240 K (-33°C)', label: 'Low / Mid Clouds', color: 'bg-slate-400 text-black', impact: 'Non-severe stratiform cloud deck.' },
      { range: '220 – 240 K', label: 'Deep Convective Storm', color: 'bg-yellow-400 text-black', impact: 'Active convective development.' },
      { range: '205 – 220 K', label: 'Severe Convective Tower', color: 'bg-orange-500 text-white', impact: 'Intense updraft; heavy rain and lightning.' },
      { range: '< 195 K (-78°C)', label: 'Overshooting Top (OT)', color: 'bg-fuchsia-600 text-white', impact: 'Tropopause penetration; severe hail and supercell dynamics.' }
    ],
    operationalImpact: 'Provides early warning of storm intensification across radar-gap regions in India.',
    formulaOrSensor: 'INSAT-3D / 3DR Imager TIR-1 (10.8 µm) & TIR-2 (12.0 µm)',
    actionGuideline: 'Cooling rates >4 K/15 min identify rapid convective intensification.'
  },

  INSAT_WV: {
    id: 'INSAT_WV',
    title: 'Water Vapor Absorption Channel (6.7 µm)',
    category: 'SATELLITE',
    shortDescription: 'Middle to upper tropospheric moisture patterns and jet stream dynamics.',
    scientificDefinition: 'Sensitive to moisture between 300 hPa and 600 hPa altitude. Dark regions indicate dry air subsidence; bright regions denote moisture pluming and vertical motion.',
    units: 'Brightness Temp (K)',
    thresholds: [
      { range: 'Bright White', label: 'Deep Tropospheric Moisture', color: 'bg-blue-400 text-black', impact: 'Strong upper-level divergence and moisture.' },
      { range: 'Dark Gray / Black', label: 'Dry Upper Air Intrusion', color: 'bg-slate-700 text-white', impact: 'Potential dry slot creating convective instability.' }
    ],
    operationalImpact: 'Identifies upper-level troughs, shortwaves, and jet streaks triggering Indian severe weather.',
    formulaOrSensor: 'INSAT-3D / 3DR Water Vapor Channel (6.5 – 7.1 µm)',
    actionGuideline: 'Look for dry air boundaries intersecting moist low-level monsoonal flows.'
  },

  // LIGHTNING METRICS
  LIGHTNING_CG: {
    id: 'LIGHTNING_CG',
    title: 'Cloud-to-Ground (CG) Lightning',
    category: 'LIGHTNING',
    shortDescription: 'Electrical discharges between cloud charge centers and ground targets.',
    scientificDefinition: 'Lethal atmospheric electrical discharge. Measured via magnetic direction finders and Time-of-Arrival (TOA) sensor networks.',
    units: 'Strokes / min & kA',
    thresholds: [
      { range: '< 10 kA', label: 'Low Current Discharge', color: 'bg-yellow-400 text-black', impact: 'Standard strike risk.' },
      { range: '10 – 50 kA', label: 'Moderate CG Stroke', color: 'bg-orange-500 text-white', impact: 'High casualty and power grid disruption risk.' },
      { range: '> 100 kA', label: 'Superbolt Positive CG', color: 'bg-red-600 text-white', impact: 'Extreme surge, wildfire initiation, equipment destruction.' }
    ],
    operationalImpact: 'Direct hazard to human life in agriculture fields, outdoor construction, and aviation refueling.',
    formulaOrSensor: 'IITM Damini / ISRO Lightning Detection Network (VLF/LF sensors)',
    actionGuideline: 'When strikes are detected within 10 km, outdoor workers must take shelter immediately (30/30 rule).'
  },

  LIGHTNING_IC: {
    id: 'LIGHTNING_IC',
    title: 'Intra-Cloud (IC) / Cloud-to-Cloud Lightning',
    category: 'LIGHTNING',
    shortDescription: 'Electrical discharges occurring entirely within or between cloud layers.',
    scientificDefinition: 'Precedes Cloud-to-Ground strikes by 10–25 minutes. A sudden jump in IC rate (lightning jump) directly correlates with severe updraft strengthening and impending hail.',
    units: 'Flashes / min',
    thresholds: [
      { range: '< 20 /min', label: 'Moderate Convective Cloud', color: 'bg-blue-400 text-black', impact: 'Standard thunderstorm development.' },
      { range: '> 60 /min', label: 'Lightning Jump (Severe Alert)', color: 'bg-purple-600 text-white', impact: 'Impending severe hail, downburst, or tornado within 15-30m.' }
    ],
    operationalImpact: 'Primary AI feature for 15-45 minute advance tornado and hail warnings.',
    formulaOrSensor: 'Total Lightning Network / VHF Interferometry (ISRO/IITM)',
    actionGuideline: 'A detected lightning jump triggers proactive tier-1 hazard alarms.'
  },

  // SEVERE HAZARDS
  HAZARD_CLOUDBURST: {
    id: 'HAZARD_CLOUDBURST',
    title: 'Cloudburst & Flash Deluge (>100 mm/h)',
    category: 'HAZARDS',
    shortDescription: 'Extreme concentrated rainfall exceeding 100 mm per hour over a localized area.',
    scientificDefinition: 'Intense orographic or multi-cell convective precipitation caused by massive warm-cloud coalescence and sudden updraft collapse over steep valleys or urban basins.',
    units: 'Rainfall Rate (mm/h)',
    thresholds: [
      { range: '< 30 mm/h', label: 'Moderate / Heavy Rain', color: 'bg-blue-400 text-black', impact: 'Standard monsoon downpours.' },
      { range: '50 – 100 mm/h', label: 'Very Heavy Rain', color: 'bg-orange-500 text-white', impact: 'Urban waterlogging, highway submergence.' },
      { range: '> 100 mm/h', label: 'IMD Defined Cloudburst', color: 'bg-red-600 text-white', impact: 'Debris flows, flash mudslides, catastrophic urban flooding.' }
    ],
    operationalImpact: 'Life safety warning for Himalayan districts, Western Ghats, and dense coastal metros (Kolkata, Mumbai).',
    formulaOrSensor: 'Z-R Relation: Z = a · R^b (Marshall-Palmer & Tropical Z=300R^1.4)',
    actionGuideline: 'Immediate evacuation of low-lying river catchments and staging of NDRF rescue motorboats.'
  },

  HAZARD_HAIL: {
    id: 'HAZARD_HAIL',
    title: 'Severe Convective Hail & MESH',
    category: 'HAZARDS',
    shortDescription: 'Solid ice hydrometeors formed in intense updrafts above the freezing level (0°C).',
    scientificDefinition: 'Maximum Estimated Size of Hail (MESH) calculated from the depth and intensity of reflectivity cores above the wet-bulb zero height.',
    units: 'Hail Diameter (cm)',
    thresholds: [
      { range: '< 1.0 cm', label: 'Pea / Marble Hail', color: 'bg-blue-400 text-black', impact: 'Minor foliage stripping.' },
      { range: '1.5 – 2.5 cm', label: 'Severe Hail (Coin size)', color: 'bg-orange-500 text-white', impact: 'Severe crop loss, dented automobile sheet metal.' },
      { range: '> 3.0 cm', label: 'Destructive Large Hail (Golf ball+)', color: 'bg-red-600 text-white', impact: 'Smashed windshields, solar panel damage, greenhouse destruction.' }
    ],
    operationalImpact: 'Destroys standing fruit crops, horticultures, solar power parks, and parked aircraft.',
    formulaOrSensor: 'MESH = 2.54 · (SHI)^0.5 where SHI = Severe Hail Index from DWR Z profiles',
    actionGuideline: 'Deploy anti-hail net arrays in orchards and move aircraft into hangar bays.'
  },

  HAZARD_DOWNBURST: {
    id: 'HAZARD_DOWNBURST',
    title: 'Downburst / Microburst & Wind Squall',
    category: 'HAZARDS',
    shortDescription: 'Sudden, powerful downward convective draft that spreads outward destructively at ground level.',
    scientificDefinition: 'Caused by evaporative cooling of precipitation beneath the cloud base and precipitation drag. Divergent straight-line winds can exceed 100 km/h.',
    units: 'Peak Gust (km/h or knots)',
    thresholds: [
      { range: '< 50 km/h', label: 'Moderate Wind Gusts', color: 'bg-blue-400 text-black', impact: 'Dust movement, fluttering signs.' },
      { range: '60 – 85 km/h', label: 'Severe Squall', color: 'bg-orange-500 text-white', impact: 'Felled tree branches, hoarding collapses, aviation crosswind holds.' },
      { range: '> 90 km/h', label: 'Destructive Microburst', color: 'bg-red-600 text-white', impact: 'Uprooted banyan trees, overturned trucks, power transmission tower collapse.' }
    ],
    operationalImpact: 'Primary cause of aviation takeoff/landing accidents and urban power grid blackouts.',
    formulaOrSensor: 'WINDEX (Wind Index) = 5 · [H_m · R_Q · (Γ² - 30 + Q_l - 2·Q_m)]^{0.5}',
    actionGuideline: 'Halt outdoor cranes, issue runway wind-shear alerts, and secure temporary construction scaffolding.'
  },

  // NOWCAST & AI ENGINE
  AI_CONVLSTM: {
    id: 'AI_CONVLSTM',
    title: '0–6h Spatiotemporal AI Nowcast Backbone',
    category: 'AI_ENGINE',
    shortDescription: 'Deep learning architecture for non-linear convective advection, initiation, and decay.',
    scientificDefinition: 'Combines 3D Convolutional Long Short-Term Memory (ConvLSTM) cells with Multi-Head Axial Self-Attention Transformers. Outperforms classical Eulerian radar optical flow beyond +30 minutes.',
    units: 'Lead Time (T+0 to T+360 min) on 1.5 km Mesh',
    thresholds: [
      { range: 'T+0 to T+30m', label: 'Kinematic Optical Flow Dominant', color: 'bg-emerald-500 text-white', impact: 'CSI > 0.72 (High Precision Extrapolation).' },
      { range: 'T+30m to T+120m', label: 'AI Non-linear Growth / Decay', color: 'bg-cyan-500 text-black', impact: 'Accurate storm merging, splitting, and dissipation.' },
      { range: 'T+120m to T+360m', label: 'Deep Learning + NWP Fusion', color: 'bg-purple-500 text-white', impact: 'Mesoscale convective cluster evolution across 6 hours.' }
    ],
    operationalImpact: 'Extends actionable civil defense and aviation lead times from 15 minutes to over 3 hours.',
    formulaOrSensor: 'Spatiotemporal Vision Transformer + 3D ConvLSTM trained on 8-year Indian convective archive',
    actionGuideline: 'Review probabilistic confidence intervals alongside deterministic radar extrapolation.'
  },

  // AVIATION METRICS
  AVIATION_FLIGHT_CAT: {
    id: 'AVIATION_FLIGHT_CAT',
    title: 'ICAO Aerodrome Flight Category (VFR / IFR)',
    category: 'AVIATION',
    shortDescription: 'Flight operating rules determined by cloud ceiling height and surface visibility.',
    scientificDefinition: 'Standard international categorization determining whether aircraft can operate under Visual Flight Rules (VFR) or must rely on Instrument Flight Rules (IFR).',
    units: 'Ceiling (ft) & Visibility (km/sm)',
    thresholds: [
      { range: 'VFR (Green)', label: 'Visual Flight Rules', color: 'bg-emerald-600 text-white', impact: 'Ceiling >3,000 ft and Visibility >5 km. Normal ops.' },
      { range: 'MVFR (Blue)', label: 'Marginal VFR', color: 'bg-blue-600 text-white', impact: 'Ceiling 1,000–3,000 ft or Visibility 3–5 km. Increased separation.' },
      { range: 'IFR (Orange)', label: 'Instrument Flight Rules', color: 'bg-orange-600 text-white', impact: 'Ceiling 500–1,000 ft or Visibility 1.5–3 km. Precision approaches only.' },
      { range: 'LIFR (Red)', label: 'Low IFR / CAT-II/III', color: 'bg-red-600 text-white', impact: 'Ceiling <500 ft or Visibility <1.5 km. Delays, diversions, ground stops.' }
    ],
    operationalImpact: 'Dictates airport acceptance rate (AAR), flight holding patterns, and airport diversions.',
    formulaOrSensor: 'Automated Weather Observing System (AWOS) / Runway Visual Range (RVR) transmissometers',
    actionGuideline: 'Rapid descent into LIFR accompanied by convective cells triggers ground stop directives.'
  }
};
