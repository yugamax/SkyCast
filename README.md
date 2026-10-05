# 🌩️ SKYCAST: 0–6h Convective Weather Nowcasting Platform

> **A High-Resolution Atmospheric Intelligence & Tactical Early Warning System for Severe Thunderstorms, Lightning, Cloudbursts, and Multi-Sector Hazards across India.**

[![React 19](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.x-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Leaflet GIS](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Smart India Hackathon](https://img.shields.io/badge/SIH-Convective_Nowcasting-emerald)](https://sih.gov.in/)

---

## ⚡ Overview

**SKYCAST** is an end-to-end tactical nowcasting platform engineered for the critical **0–6 hour forecasting window**. It addresses the limitations of traditional Numerical Weather Prediction (NWP) models by fusing real-time multi-sensor telemetry with deep learning spatiotemporal models to predict severe convective storms, flash floods, and lightning at **1.5 km resolution** every **5 minutes**.

### 🌟 Core Capabilities
- **📍 Multi-Tier Auto-Geolocation**: Instant browser GPS & IP fallback with automatic smooth camera fly-to and district-level sector filtering.
- **⏱️ Live Storm Arrival Countdown**: Real-time vector trajectory tracking that calculates second-by-second countdown to storm impact on your location.
- **📡 Doppler Radar (DWR) Suite**: 37+ IMD radar stations supporting Reflectivity ($Z$), Radial Velocity ($V$), Differential Reflectivity ($Z_{DR}$), and Vertically Integrated Liquid ($VIL$).
- **🛰️ INSAT-3D/3DR Satellite Radiance**: Real-time thermal infrared (TIR1) and water vapor (WV) loops with Hydro-Estimator rainfall rate overlays.
- **⚡ IITM Damini Lightning Mesh**: Real-time Cloud-to-Ground (CG) and Intra-Cloud (IC) strike maps with peak current ($\text{kA}$) and safety buffer radii.
- **🔮 0–6h AI Spatiotemporal Nowcast**: Interactive 7-step timeline scrubber (`NOW` to `+6h`) with uncertainty cone projections.
- **🚨 WMO/NDMA CAP Alert Engine**: Automated Common Alerting Protocol broadcast generator with geo-targeted siren triggers.
- **🔊 Procedural Web Audio Engine**: Zero-asset procedural synthesizer producing rain resonance, wind shear, and dBZ-synced thunderclaps.

---

## 🏗️ System Architecture

```
[37 IMD Radars + INSAT-3D + IITM Lightning + Surface AWS]
                         │
                         ▼
      [Py-ART Quality Control & 4D Tensor Alignment]
                         │
                         ▼
   [Spatiotemporal AI Backbone (ConvLSTM + Vision Transformer)]
   ├── Convective Initiation (CI) Subnet (Pre-radar genesis)
   └── Multi-Hazard Probabilistic Heads (dBZ, Deluge, Hail, Wind, Lightning)
                         │
                         ▼
 [React 19 Interactive GIS Engine + CAP Disaster Dispatch]
```

---

## 🖥️ Specialized Dashboards & Sector Modes

| Mode / View | Focus & Tactical Output |
|:------------|:------------------------|
| **Command Center** | Unified surveillance bento grid, 24h scrub ribbon, and live storm core inspector. |
| **Doppler Radar (DWR)** | Multi-product radar analysis ($Z, V, Z_{DR}, VIL$, Echo Tops) across 37 Indian radar stations. |
| **Satellite Radiance** | INSAT-3D/3DR multi-spectral infrared & visible cloud-top temperature loops. |
| **Lightning Network** | High-voltage CG/IC discharge mapping with $5/10/15\text{ km}$ safety buffer zones. |
| **0–6h AI Nowcast** | Neural convective extrapolation grid with 7-step lead-time slider (`NOW` to `+6h`). |
| **Aviation Matrix** | Aerodrome METAR/TAF decoders, crosswind limits, RVR, and terminal wind shear alerts. |
| **Agriculture Advisory** | Topsoil moisture saturation, hail threat index, and optimal spray window guidance. |
| **NDRF / SDMA Disaster** | Emergency CAP broadcast dispatch, shelter routing, and evacuation corridor mapping. |
| **Model Verification** | Split-screen ground truth vs AI nowcast comparison with quantitative POD/FAR/CSI metrics. |
| **AI Deep Learning** | 8-stage neural pipeline tensor inspector with hyperparameter breakdown. |

---

## 🌐 Live Data Feeds & API Directory

SKYCAST works **out of the box with zero configuration**, with optional enterprise API keys for extended live telemetry:

| Data Feed / Source | Status in App | Purpose / Coverage |
|:-------------------|:--------------|:-------------------|
| **Open-Meteo API** | `Default Active` | Live surface weather, CAPE soundings, pressure & wind gusts (No key needed). |
| **RainViewer API** | `Default Active` | Real-time composite Doppler radar sweeps & satellite infrared tiles (No key needed). |
| **OpenWeatherMap** | `Supported` | High-frequency global surface telemetry and radar layers. |
| **ISRO MOSDAC / Bhuvan** | `Supported` | INSAT-3D/3DR NetCDF feeds, Hydro-Estimator rainfall rate, and cloud-top temps. |
| **IMD Mausam Portal** | `Supported` | Real-time Indian Doppler Weather Radar (DWR) station data exchange. |
| **Mapbox Studio** | `Supported` | High-resolution custom vector basemaps and satellite aerial tiles. |
| **Tomorrow.io API** | `Supported` | Micro-convective indices (CAPE, CIN, surface wind shear). |
| **NOAA Aviation / CheckWX** | `Integrated` | Live METAR/TAF aerodrome feeds for Indian international airports. |
| **IITM Damini Network** | `Integrated` | Real-time lightning strike location network across India. |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm, pnpm, or yarn

```bash
# 1. Clone the repository
git clone https://github.com/yugamax/SkyCast.git
cd SIH

# 2. Install dependencies
npm install

# 3. Start the development server (runs immediately without any API keys)
npm run dev
```

Visit `http://localhost:5173` to launch the application.

---

## 🔑 Environment Configuration (`.env`)

Optional configuration file for connecting custom API keys:

```env
# API Keys (Optional - App runs out of the box with open feeds)
VITE_OPENWEATHER_API_KEY=""
VITE_MAPBOX_ACCESS_TOKEN=""
VITE_ISRO_MOSDAC_KEY=""
VITE_IMD_API_KEY=""
VITE_TOMORROW_API_KEY=""
VITE_AVIATION_API_KEY=""
VITE_LIGHTNING_API_KEY=""
VITE_API_URL="http://localhost:8000"
```

---

## 📄 License & Acknowledgments

- **Smart India Hackathon (SIH)**: Convective Weather Nowcasting & Early Warning Challenge.
- **Scientific Acknowledgment**: Built with reference to datasets and protocols from **IMD**, **ISRO MOSDAC**, **IITM Pune Damini**, **Open-Meteo**, **RainViewer**, and **NOAA**.
- **License**: MIT License. Open source for research, educational, and disaster mitigation use.
