import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Database, 
  Cpu, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  ChevronRight, 
  Sliders, 
  Zap, 
  Radio, 
  Satellite,
  Info 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { InfoButton } from '../components/Common/InfoButton';

interface StageCard {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  inputs: string[];
  outputs: string[];
  techStack: string;
  tensorShape: string;
  description: string;
}

interface AiArchitectureViewProps {
  onOpenInfo?: (infoId: string) => void;
}

export const AiArchitectureView: React.FC<AiArchitectureViewProps> = ({ onOpenInfo }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [selectedStageId, setSelectedStageId] = useState<string>('STAGE-AI-BACKBONE');

  const stages: StageCard[] = [
    {
      id: 'STAGE-INGESTION',
      stepNumber: 1,
      title: 'Multi-Source Sensor Ingestion',
      subtitle: 'Raw heterogenous telemetry ingest',
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      inputs: ['37 IMD DWR Volumetric Scans (Z, V, W, ZDR)', 'INSAT-3D/3DR Multispectral (TIR1, WV, VIS)', 'IITM/ISRO Lightning TOA Strikes', '3,840 Surface AWS Telemetry', 'NCUM 3km NWP Prognostic Fields'],
      outputs: ['Normalized sensor telemetry streams'],
      techStack: 'FastAPI / Apache Kafka / Redis Ingestion Buffer',
      tensorShape: 'Raw bytes / NetCDF4 / HDF5 streams',
      description: 'Asynchronous streaming ingestion pipeline handling Doppler radar sweeps every 5 minutes, INSAT rapid scans, real-time lightning packets (<2s latency), and surface meteorological observations.'
    },
    {
      id: 'STAGE-QC',
      stepNumber: 2,
      title: 'Quality Control & Clutter Filtering',
      subtitle: 'Speckle removal & attenuation correction',
      icon: <ShieldAlert className="w-5 h-5 text-zinc-300" />,
      inputs: ['Raw radar reflectivity arrays', 'Satellite brightness temperatures'],
      outputs: ['Despeckled, beam-blockage corrected grids'],
      techStack: 'Py-ART / OpenRadar / CUDA Filtering Kernels',
      tensorShape: '[Batch, Elevation_Sweeps, Azimuth(360), Range(1000)]',
      description: 'Applies polarimetric texture analysis, sun-strobe removal, anomalous propagation (AP) filtering, and attenuation correction using differential phase (KDP).'
    },
    {
      id: 'STAGE-ALIGNMENT',
      stepNumber: 3,
      title: '4D Spatial & Temporal Alignment',
      subtitle: 'Unified convective grid projection',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      inputs: ['Polar radar coordinates', 'Geostationary satellite projections', 'Point AWS/Lightning coordinates'],
      outputs: ['4D Uniform Geospatial Tensor at 1.5 km / 5 min'],
      techStack: 'WGS84 Equidistant Projection / PyTorch Interpolation',
      tensorShape: '[B, Channels(24), Time(T-12 to T0), H(512), W(512)]',
      description: 'Re-grids all disparate observation sources into a unified 1.5 km regular Cartesian domain spanning the Indian subcontinent with 5-minute temporal sampling.'
    },
    {
      id: 'STAGE-FUSION',
      stepNumber: 4,
      title: 'Multi-Modal Feature Fusion',
      subtitle: 'Cross-attention transformer fusion',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      inputs: ['Radar kinematics (Z, VIL, Echo Top)', 'Satellite cloud-top cooling rate', 'Lightning density matrix', 'NWP CAPE/CIN/Shear background'],
      outputs: ['Latent convective feature embedding'],
      techStack: 'Multi-Head Axial Attention / 3D-ResNet Encoders',
      tensorShape: '[B, Hidden_Dim(384), H/4, W/4]',
      description: 'Multimodal cross-attention layers combine vertical radar volume structure with satellite upper-tropospheric moisture divergence and surface thermodynamics.'
    },
    {
      id: 'STAGE-CI',
      stepNumber: 5,
      title: 'Convective Initiation (CI) Subnet',
      subtitle: 'Pre-radar storm genesis detection',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      inputs: ['10.8µm - 6.7µm split-window difference', 'Cloud-top cooling rates (> 4K/15min)', 'Surface moisture convergence'],
      outputs: ['CI Trigger Probability Surface (0–100%)'],
      techStack: 'U-Net CI Head with Focal Loss',
      tensorShape: '[B, 1, H, W]',
      description: 'Detects developing convective cloud elements 30–45 minutes before the first radar echo (>35 dBZ) appears, enabling true genesis nowcasting.'
    },
    {
      id: 'STAGE-AI-BACKBONE',
      stepNumber: 6,
      title: 'Spatiotemporal AI Core (ConvLSTM + Transformer)',
      subtitle: 'MetNet-3 inspired temporal rollout',
      icon: <BrainCircuit className="w-5 h-5 text-emerald-400" />,
      inputs: ['Fused latent representations across past 60 mins'],
      outputs: ['Autoregressive 0–6 hour future latent rollout'],
      techStack: 'PyTorch / Spatiotemporal Vision Transformer + 3D ConvLSTM',
      tensorShape: '[B, Lead_Times(12), Channels(64), H, W]',
      description: 'High-capacity neural spatiotemporal forecasting backbone trained on 8 years of Indian convective events. Captures advection, non-linear cloud growth, and rapid dissipation dynamics.'
    },
    {
      id: 'STAGE-HAZARD-HEADS',
      stepNumber: 7,
      title: '0–6h Multi-Hazard Probabilistic Heads',
      subtitle: 'Deterministic & probabilistic hazard grids',
      icon: <TrendingUp className="w-5 h-5 text-rose-400" />,
      inputs: ['Predicted latent tensors across lead times'],
      outputs: ['dBZ Reflectivity, Lightning %, Hail %, Downburst %, Cloudburst %, Heavy Rain mm/h'],
      techStack: 'Multi-Task Convolutional Decoders with CRPS Loss',
      tensorShape: '[B, Lead_Steps(10), Hazard_Types(6), H, W]',
      description: 'Dedicated prediction heads produce calibrated probability distributions and physical parameter forecasts for thunderstorms, hail size, downburst wind gusts, and cloudburst rainfall.'
    },
    {
      id: 'STAGE-GIS-ALERT',
      stepNumber: 8,
      title: 'GIS Rendering & Alert Engine',
      subtitle: 'Automated early warning dispatch',
      icon: <Radio className="w-5 h-5 text-emerald-400" />,
      inputs: ['Hazard probability surfaces + Cell vector tracking'],
      outputs: ['Interactive Map Layers, ETA Countdowns, Prototype Warnings, GeoJSON'],
      techStack: 'Leaflet / WebSockets / Web Audio API',
      tensorShape: 'GeoJSON polygons, Canvas rasters & Alert objects',
      description: 'Renders real-time vector cell tracks, computes live countdown arrival times for Indian metropolitan centers, and dispatches automated prototype early warnings.'
    }
  ];

  const activeStage = stages.find(s => s.id === selectedStageId) || stages[5];

  return (
    <div className="p-2.5 sm:p-3 space-y-3 max-w-[1920px] mx-auto select-none font-mono text-xs bg-transparent text-zinc-100 min-h-full">
      {/* Top Architecture Header */}
      <div className="p-3.5 rounded-2xl ios-glass-card flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white truncate">
                SKYCAST AI Pipeline & Deep Learning Architecture
              </h2>
              {onOpenInfo && <InfoButton infoId="AI_CONVLSTM" onOpenInfo={onOpenInfo} size="xs" />}
            </div>
            <p className="text-[11px] mt-0.5 text-zinc-400 truncate">
              Multi-Source Data Ingestion &rarr; 4D Fusion &rarr; Spatiotemporal AI Backbone &rarr; 0–6h Hazard Forecast
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] px-3 py-2 rounded-xl border border-white/[0.08] bg-[#121316]/90 shrink-0">
          <span className="text-zinc-400">GPU Cluster:</span>
          <span className="font-bold text-emerald-400 font-mono">NVIDIA A100 Tensor Core (Batch Latency: 14.2s)</span>
        </div>
      </div>

      {/* Interactive Flowchart Pipeline Map */}
      <div className="p-4 rounded-2xl ios-glass-card space-y-3 shadow-sm border border-white/[0.08]">
        <h3 className="font-bold text-xs uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-white">
          <span>End-to-End Deep Learning Architecture Flowchart</span>
          <span className="text-[10px] font-bold text-emerald-400">CLICK STAGE TO INSPECT TENSORS</span>
        </h3>

        {/* 8-Stage Flowchart Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {stages.map((stage) => {
            const isSelected = selectedStageId === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white/[0.1] border-emerald-400 shadow-lg ring-1 ring-emerald-400/40 scale-[1.01]'
                    : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/[0.08] bg-white/[0.04] text-zinc-300">
                      STEP 0{stage.stepNumber}
                    </span>
                    {stage.icon}
                  </div>

                  <h4 className="font-bold text-xs leading-snug text-white font-sans">
                    {stage.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-sans">{stage.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] text-zinc-500">
                  <span>{stage.techStack.split('/')[0]}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Selected Stage Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left: Stage Deep-Dive Card (7 cols) */}
        <div className="xl:col-span-7 p-4 rounded-2xl ios-glass-card space-y-3.5 shadow-sm border border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-white">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                STAGE 0{activeStage.stepNumber}
              </span>
              <h3 className="font-bold text-sm font-sans">{activeStage.title}</h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">PRODUCTION READY</span>
          </div>

          <p className="text-xs leading-relaxed font-sans text-zinc-300">
            {activeStage.description}
          </p>

          <div className="space-y-2 pt-1">
            <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Input Data Channels:</span>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 text-zinc-200 font-sans">
                {activeStage.inputs.map((inp, idx) => (
                  <li key={idx}>{inp}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Output Products & Tensors:</span>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 font-bold text-emerald-300 font-sans">
                {activeStage.outputs.map((out, idx) => (
                  <li key={idx}>{out}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Technical Hyperparameters & Tensor Shapes (5 cols) */}
        <div className="xl:col-span-5 p-4 rounded-2xl ios-glass-card space-y-3.5 shadow-sm border border-white/[0.08]">
          <h3 className="font-bold text-xs uppercase tracking-wider border-b border-white/[0.06] pb-2.5 text-white">
            Model Specifications & Hyperparameters
          </h3>

          <div className="space-y-2 text-[11px]">
            <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
              <span className="text-zinc-400 text-[10px]">PyTorch Tensor Shape:</span>
              <div className="text-amber-400 font-mono font-bold text-xs break-all">{activeStage.tensorShape}</div>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
              <span className="text-zinc-400 text-[10px]">Compute & Framework Stack:</span>
              <div className="font-bold text-zinc-200">{activeStage.techStack}</div>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
              <span className="text-zinc-400 text-[10px]">Loss Function:</span>
              <div className="font-bold text-zinc-200">Multi-Scale Balanced MSE + CRPS + Focal Loss</div>
            </div>

            <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
              <span className="text-zinc-400 text-[10px]">Inference Throughput:</span>
              <div className="text-emerald-400 font-bold">42 patches / sec (14.2s per national run)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
