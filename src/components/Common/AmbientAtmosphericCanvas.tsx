import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { ambientAudio } from '../../services/ambientAudioService';
import { Sun, Cloud, CloudRain, CloudLightning, Wind, Eye, Sparkles } from 'lucide-react';

export type AtmosphericCondition = 'SUNNY' | 'CLEAR' | 'HAZE' | 'MIST' | 'OVERCAST' | 'CLOUDY' | 'RAIN' | 'STORM';
export type TimeOfDay = 'AUTO' | 'DAY' | 'SUNSET' | 'NIGHT' | 'DAWN';

export interface AmbientAtmosphericCanvasProps {
  condition?: AtmosphericCondition;
  input_CloudCoverPercentage?: number; // 0 to 100
  input_WindVelocity?: number; // km/h (e.g. 0 to 120)
  humidity?: number; // 0 to 100%
  timeOfDay?: TimeOfDay;
  isLight?: boolean;
  showControlsWidget?: boolean;
}

// Particle & Entity Interfaces
interface RainStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  thickness: number;
  layer: number; // 0: background, 1: mid, 2: foreground
}

interface SplashRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  droplets: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[];
}

interface MistParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  phase: number;
}

interface ProceduralCloudPuff {
  relX: number; // 0 to 1 relative to cloud bank
  relY: number;
  radius: number;
  opacity: number;
  shade: number; // 0 (dark) to 1 (light top)
}

interface ProceduralCloudBank {
  x: number;
  y: number;
  width: number;
  height: number;
  speedMultiplier: number;
  layer: number; // 0: high altostratus, 1: mid cumulus, 2: low nimbostratus
  opacity: number;
  puffs: ProceduralCloudPuff[];
}

export const AmbientAtmosphericCanvas: React.FC<AmbientAtmosphericCanvasProps> = ({
  condition: propCondition = 'STORM',
  input_CloudCoverPercentage: propCloudCover,
  input_WindVelocity: propWindSpeed,
  humidity: _propHumidity = 78,
  timeOfDay: propTimeOfDay = 'AUTO',
  isLight = false,
  showControlsWidget = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Interactive Overrides / Sync State
  const [activeCondition, setActiveCondition] = useState<AtmosphericCondition>(propCondition);
  const [activeCloudCover, setActiveCloudCover] = useState<number>(
    propCloudCover !== undefined 
      ? propCloudCover 
      : (propCondition === 'STORM' ? 95 : propCondition === 'RAIN' ? 85 : propCondition === 'OVERCAST' || propCondition === 'CLOUDY' ? 75 : propCondition === 'HAZE' ? 50 : 20)
  );
  const [activeWindVelocity, setActiveWindVelocity] = useState<number>(
    propWindSpeed !== undefined ? propWindSpeed : (propCondition === 'STORM' ? 48 : propCondition === 'RAIN' ? 26 : 14)
  );
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);

  // Sync with prop changes if not manually overriding in widget
  useEffect(() => {
    setActiveCondition(propCondition);
    if (propCloudCover !== undefined) {
      setActiveCloudCover(propCloudCover);
    } else {
      setActiveCloudCover(
        propCondition === 'STORM' ? 95 : propCondition === 'RAIN' ? 85 : propCondition === 'OVERCAST' || propCondition === 'CLOUDY' ? 75 : propCondition === 'HAZE' ? 50 : 20
      );
    }
    if (propWindSpeed !== undefined) {
      setActiveWindVelocity(propWindSpeed);
    } else {
      setActiveWindVelocity(propCondition === 'STORM' ? 48 : propCondition === 'RAIN' ? 26 : 14);
    }
  }, [propCondition, propCloudCover, propWindSpeed]);

  // Derived Effective Time of Day
  const effectiveTimeOfDay = useMemo<TimeOfDay>(() => {
    if (propTimeOfDay !== 'AUTO') return propTimeOfDay;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return 'DAWN';
    if (hour >= 7 && hour < 17) return 'DAY';
    if (hour >= 17 && hour < 20) return 'SUNSET';
    return 'NIGHT';
  }, [propTimeOfDay]);

  // Audio synchronization with physics parameters
  useEffect(() => {
    const audioState = 
      activeCondition === 'STORM' ? 'STORM'
      : activeCondition === 'RAIN' ? 'RAIN'
      : (activeCondition === 'OVERCAST' || activeCondition === 'CLOUDY' || activeCondition === 'HAZE' || activeCondition === 'MIST') ? 'CLOUDY'
      : 'CLEAR';

    ambientAudio.setWeatherState(
      audioState, 
      activeWindVelocity, 
      activeCondition === 'STORM' ? 0.9 : activeCondition === 'RAIN' ? 0.6 : 0.1
    );
  }, [activeCondition, activeWindVelocity]);

  // Flash alpha ref for multi-strobe lightning animation
  const flashAlphaRef = useRef<number>(0);
  const lightningStrobeRef = useRef<{ active: boolean; sequence: number[]; index: number; nextTime: number }>({
    active: false,
    sequence: [],
    index: 0,
    nextTime: 0
  });

  // Offscreen Cloud Canvas Pattern Cache
  const cloudBankListRef = useRef<ProceduralCloudBank[]>([]);

  // Initialize Procedural Cloud Bank Formations
  const generateCloudBanks = useCallback((width: number, height: number, cloudCover: number): ProceduralCloudBank[] => {
    const effectiveCover = Math.max(15, cloudCover);
    const banks: ProceduralCloudBank[] = [];
    const isStormy = cloudCover >= 80;
    const isScattered = cloudCover >= 35 && cloudCover < 80;

    // Determine number of cloud clusters based on cloud cover percentage
    const bankCount = effectiveCover <= 30 
      ? Math.floor(4 + (effectiveCover / 30) * 3) // 4 to 7 floating cumulus clouds
      : isScattered
      ? Math.floor(7 + ((effectiveCover - 30) / 50) * 6) // 7 to 13 banks
      : Math.floor(12 + ((effectiveCover - 75) / 25) * 8); // 12 to 20 dense formations

    for (let b = 0; b < bankCount; b++) {
      const layer = b % 3; // 0: high altostratus (slow), 1: mid cumulus, 2: low dense nimbostratus
      const baseWidth = (width * (0.32 + Math.random() * 0.42)) * (layer === 0 ? 1.3 : layer === 1 ? 1.0 : 0.85);
      const baseHeight = (height * (0.18 + Math.random() * 0.24)) * (layer === 0 ? 0.75 : 1.1);

      // Distribute vertically based on layer
      const yMin = layer === 0 ? 0 : layer === 1 ? height * 0.05 : height * 0.12;
      const yMax = layer === 0 ? height * 0.42 : layer === 1 ? height * 0.65 : height * 0.78;
      const posY = yMin + Math.random() * (yMax - yMin);
      const posX = Math.random() * (width + baseWidth) - baseWidth * 0.5;

      // Generate organic procedural puffs for this bank
      const puffCount = Math.floor(14 + Math.random() * 20);
      const puffs: ProceduralCloudPuff[] = [];

      for (let p = 0; p < puffCount; p++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const normX = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2) * 0.35 + 0.5;
        const normY = (Math.random() * 0.6 + Math.sin(normX * Math.PI) * 0.4);

        const radius = (baseHeight * (0.28 + Math.random() * 0.45));
        const opacity = Math.min(1.0, 0.45 + Math.random() * 0.55);
        const shade = Math.min(1.0, Math.max(0.2, (1 - normY) * 0.8 + Math.random() * 0.2));

        puffs.push({
          relX: Math.max(0, Math.min(1, normX)),
          relY: Math.max(0, Math.min(1, normY)),
          radius,
          opacity,
          shade
        });
      }

      const speedMultiplier = layer === 0 ? 0.35 : layer === 1 ? 0.7 : 1.15;
      const bankOpacity = isStormy 
        ? (layer === 2 ? 0.85 : 0.65)
        : isScattered
        ? (layer === 0 ? 0.45 : 0.6)
        : 0.60; // Crisp, clearly visible, beautiful white clouds

      banks.push({
        x: posX,
        y: posY,
        width: baseWidth,
        height: baseHeight,
        speedMultiplier,
        layer,
        opacity: bankOpacity,
        puffs
      });
    }

    return banks;
  }, []);

  // Main Canvas Physics & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cloudBankListRef.current = generateCloudBanks(width, height, activeCloudCover);
    };

    window.addEventListener('resize', handleResize);

    // Initial Cloud Generation
    cloudBankListRef.current = generateCloudBanks(width, height, activeCloudCover);

    const isSunny = activeCondition === 'SUNNY' || activeCondition === 'CLEAR';
    const isRaining = activeCondition === 'RAIN' || activeCondition === 'STORM';
    const isStorm = activeCondition === 'STORM';
    const isHazy = activeCondition === 'HAZE' || activeCondition === 'MIST';
    const isOvercast = activeCondition === 'OVERCAST' || activeCondition === 'CLOUDY';

    // 1. Rain streaks initialization with physics layers
    const rainCount = isStorm ? 160 : isRaining ? 90 : 0;
    const rainStreaks: RainStreak[] = [];
    for (let i = 0; i < rainCount; i++) {
      const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.7 ? 1 : 2;
      const speed = layer === 0 ? (16 + Math.random() * 8) : layer === 1 ? (24 + Math.random() * 10) : (34 + Math.random() * 14);
      const length = layer === 0 ? (12 + Math.random() * 10) : layer === 1 ? (20 + Math.random() * 16) : (32 + Math.random() * 22);
      const alpha = layer === 0 ? 0.12 : layer === 1 ? 0.24 : 0.38;
      const thickness = layer === 0 ? 0.75 : layer === 1 ? 1.1 : 1.6;

      rainStreaks.push({
        x: Math.random() * (width + 400) - 200,
        y: Math.random() * height,
        length,
        speed,
        alpha,
        thickness,
        layer
      });
    }

    // 2. Splash ripples and bounce droplet sprites
    const splashes: SplashRipple[] = [];

    // 3. Ambient atmospheric mist / haze particles
    const mistCount = isHazy ? 90 : isRaining ? 25 : 30;
    const mistParticles: MistParticle[] = [];
    for (let i = 0; i < mistCount; i++) {
      mistParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.4) * 0.5 + (activeWindVelocity / 100) * 0.4,
        vy: (Math.random() - 0.5) * 0.2,
        size: isHazy ? Math.random() * 8 + 3 : Math.random() * 3 + 1,
        alpha: Math.random() * 0.18 + 0.04,
        baseAlpha: Math.random() * 0.18 + 0.04,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 4. Multi-Strobe Lightning Scheduler
    let lightningTimer: number | null = null;
    const triggerLightningStrobe = () => {
      lightningStrobeRef.current = {
        active: true,
        sequence: [0.35, 0.1, 0.45, 0.15, 0.05, 0.0],
        index: 0,
        nextTime: performance.now() + 50
      };
      flashAlphaRef.current = 0.35;
      ambientAudio.triggerLightning(1.0);
    };

    const scheduleNextLightning = () => {
      if (!isStorm) return;
      const delay = 22000 + Math.random() * 25000;
      lightningTimer = window.setTimeout(() => {
        triggerLightningStrobe();
        scheduleNextLightning();
      }, delay);
    };

    if (isStorm) {
      scheduleNextLightning();
    }

    let lastTime = performance.now();

    // -------------------------------------------------------------
    // MAIN RENDER LOOP (Smooth 60fps Hardware Accelerated)
    // -------------------------------------------------------------
    const render = (currentTime: number) => {
      const dt = Math.min(64, currentTime - lastTime);
      lastTime = currentTime;

      // -----------------------------------------------------------
      // Step A: Full Viewport Atmospheric Gradient
      // -----------------------------------------------------------
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      
      if (isRaining || isStorm) {
        // Moody slate-grey gradient blending into deep charcoal
        const topSlate = isStorm ? '#0E131C' : '#141822';
        const midSlate = isStorm ? '#141924' : '#1A202D';
        const botCharcoal = isStorm ? '#07080B' : '#0B0C0E';
        gradient.addColorStop(0, topSlate);
        gradient.addColorStop(0.55, midSlate);
        gradient.addColorStop(1, botCharcoal);
      } else if (isOvercast) {
        gradient.addColorStop(0, '#1E293B');
        gradient.addColorStop(0.5, '#334155');
        gradient.addColorStop(1, '#0F172A');
      } else if (isHazy) {
        gradient.addColorStop(0, '#1E2430');
        gradient.addColorStop(0.6, '#2D3748');
        gradient.addColorStop(1, '#11151C');
      } else if (isSunny) {
        // Radiant Daylight Blue Sky (Shown even in Dark Mode!)
        gradient.addColorStop(0, '#0284C7');     // Vivid deep sky azure
        gradient.addColorStop(0.35, '#0EA5E9');  // Radiant cerulean
        gradient.addColorStop(0.70, '#38BDF8');  // Bright day blue
        gradient.addColorStop(0.92, '#7DD3FC');  // Soft atmospheric cyan
        gradient.addColorStop(1, '#BAE6FD');     // Warm luminous horizon glow
      } else if (effectiveTimeOfDay === 'SUNSET') {
        gradient.addColorStop(0, '#1E1B4B');
        gradient.addColorStop(0.5, '#4C1D95');
        gradient.addColorStop(0.8, '#BE185D');
        gradient.addColorStop(1, '#F59E0B');
      } else if (effectiveTimeOfDay === 'NIGHT') {
        gradient.addColorStop(0, '#020617');
        gradient.addColorStop(0.6, '#0B0F19');
        gradient.addColorStop(1, '#020408');
      } else {
        // Default daylight blue
        gradient.addColorStop(0, '#0284C7');
        gradient.addColorStop(0.45, '#0EA5E9');
        gradient.addColorStop(0.8, '#38BDF8');
        gradient.addColorStop(1, '#BAE6FD');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // -----------------------------------------------------------
      // Step B: Radiant Sun Disk, Solar Corona & God Rays (Top-Left Sky)
      // -----------------------------------------------------------
      if (isSunny || (!isRaining && !isStorm && !isOvercast)) {
        const sunX = width * 0.22;
        const sunY = height * 0.20;
        const sunRadius = Math.min(width, height) * 0.55;
        const timePulse = 1 + Math.sin(currentTime * 0.0015) * 0.04;

        // 1. Wide Atmospheric Solar Radiance / Corona
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, sunRadius * timePulse);
        sunGlow.addColorStop(0, 'rgba(255, 255, 245, 0.75)');
        sunGlow.addColorStop(0.08, 'rgba(254, 240, 138, 0.55)');
        sunGlow.addColorStop(0.22, 'rgba(253, 224, 71, 0.32)');
        sunGlow.addColorStop(0.45, 'rgba(250, 204, 21, 0.14)');
        sunGlow.addColorStop(0.75, 'rgba(234, 179, 8, 0.04)');
        sunGlow.addColorStop(1, 'rgba(2, 132, 199, 0)');

        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, width, height);

        // 2. Soft Golden Crepuscular Sunbeams / God Rays
        ctx.save();
        ctx.translate(sunX, sunY);
        const rayCount = 8;
        for (let r = 0; r < rayCount; r++) {
          const angle = (r * (Math.PI * 2 / rayCount)) + (currentTime * 0.0001);
          const rayLength = sunRadius * 0.85;
          const rayWidth = 0.18;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, rayLength, angle - rayWidth * 0.5, angle + rayWidth * 0.5);
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 250, 200, ${0.06 + Math.sin(currentTime * 0.002 + r) * 0.02})`;
          ctx.fill();
        }
        ctx.restore();

        // 3. Brilliant White-Gold Core Solar Disk
        ctx.beginPath();
        ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFDF0';
        ctx.shadowColor = 'rgba(254, 240, 138, 0.95)';
        ctx.shadowBlur = 55;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // -----------------------------------------------------------
      // Step C: Procedural Volumetric Floating Cloudscape Engine
      // -----------------------------------------------------------
      if (cloudBankListRef.current.length > 0) {
        const windDriftBase = (activeWindVelocity / 3.6) * 0.08 * (dt / 16.6);

        for (let b = 0; b < cloudBankListRef.current.length; b++) {
          const bank = cloudBankListRef.current[b];
          
          // Drift smoothly from left to right based on wind velocity & parallax layer
          bank.x += windDriftBase * bank.speedMultiplier;

          // Seamless loop when drifted beyond right edge
          if (bank.x > width + bank.width * 0.5) {
            bank.x = -bank.width * 1.2;
            bank.y = Math.random() * (height * 0.65);
          }

          const isDarkStormCloud = isStorm || activeCloudCover >= 85;

          // Draw all procedural puffs within this bank
          for (let p = 0; p < bank.puffs.length; p++) {
            const puff = bank.puffs[p];
            const px = bank.x + puff.relX * bank.width;
            const py = bank.y + puff.relY * bank.height;

            if (px + puff.radius < -100 || px - puff.radius > width + 100) continue;

            const puffGrad = ctx.createRadialGradient(
              px, py - puff.radius * 0.25, puff.radius * 0.05,
              px, py, puff.radius
            );

            const effectiveAlpha = bank.opacity * puff.opacity;

            if (isDarkStormCloud) {
              const topVal = Math.round(45 + puff.shade * 35);
              const botVal = Math.round(18 + puff.shade * 15);
              puffGrad.addColorStop(0, `rgba(${topVal}, ${topVal + 4}, ${topVal + 8}, ${effectiveAlpha * 0.75})`);
              puffGrad.addColorStop(0.55, `rgba(${botVal + 10}, ${botVal + 12}, ${botVal + 16}, ${effectiveAlpha * 0.5})`);
              puffGrad.addColorStop(1, 'rgba(10, 12, 16, 0)');
            } else if (isHazy) {
              const shadeVal = Math.round(70 + puff.shade * 40);
              puffGrad.addColorStop(0, `rgba(${shadeVal}, ${shadeVal + 5}, ${shadeVal + 12}, ${effectiveAlpha * 0.45})`);
              puffGrad.addColorStop(0.65, `rgba(${shadeVal - 20}, ${shadeVal - 15}, ${shadeVal - 8}, ${effectiveAlpha * 0.2})`);
              puffGrad.addColorStop(1, 'rgba(15, 18, 24, 0)');
            } else {
              // Gorgeous, Brilliant White-Silver Fluffy Sunny Cumulus Clouds with 3D Depth
              const topBright = Math.round(245 + puff.shade * 10);
              const bottomShade = Math.round(205 + puff.shade * 35);
              puffGrad.addColorStop(0, `rgba(${topBright}, ${topBright}, 255, ${effectiveAlpha * 0.85})`);
              puffGrad.addColorStop(0.45, `rgba(${topBright - 15}, ${topBright - 10}, 250, ${effectiveAlpha * 0.65})`);
              puffGrad.addColorStop(0.80, `rgba(${bottomShade - 20}, ${bottomShade - 10}, 235, ${effectiveAlpha * 0.35})`);
              puffGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
            }

            ctx.fillStyle = puffGrad;
            ctx.beginPath();
            ctx.arc(px, py, puff.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // -----------------------------------------------------------
      // Step D: Haze / Fog Atmospheric Particle Layer
      // -----------------------------------------------------------
      if (isHazy || isRaining) {
        const fogGrad = ctx.createLinearGradient(0, height * 0.4, 0, height);
        const fogAlpha = isHazy ? 0.38 : 0.18;
        fogGrad.addColorStop(0, 'rgba(22, 27, 36, 0)');
        fogGrad.addColorStop(0.6, `rgba(28, 34, 46, ${fogAlpha * 0.6})`);
        fogGrad.addColorStop(1, `rgba(18, 22, 30, ${fogAlpha})`);
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, height * 0.4, width, height * 0.6);

        ctx.fillStyle = isLight ? 'rgba(180, 200, 220, 0.12)' : 'rgba(148, 163, 184, 0.08)';
        for (let i = 0; i < mistParticles.length; i++) {
          const m = mistParticles[i];
          m.x += m.vx * (dt / 16.6);
          m.y += m.vy * (dt / 16.6);
          m.phase += 0.015;

          if (m.x < -20) m.x = width + 20;
          if (m.x > width + 20) m.x = -20;
          if (m.y < -20) m.y = height + 20;
          if (m.y > height + 20) m.y = -20;

          const dynamicAlpha = m.baseAlpha * (0.7 + Math.sin(m.phase) * 0.3);
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // -----------------------------------------------------------
      // Step E: Slanted Rain Streaks with Wind Shear & Bottom Splashes
      // -----------------------------------------------------------
      if (isRaining && rainStreaks.length > 0) {
        const windSlant = (activeWindVelocity / 12) * 1.2;

        for (let layerIdx = 0; layerIdx < 3; layerIdx++) {
          ctx.beginPath();
          const layerColor = layerIdx === 0 
            ? 'rgba(148, 163, 184, 0.18)' 
            : layerIdx === 1 
            ? 'rgba(186, 230, 253, 0.28)' 
            : 'rgba(224, 242, 254, 0.42)';
          
          ctx.strokeStyle = layerColor;
          ctx.lineWidth = layerIdx === 0 ? 0.8 : layerIdx === 1 ? 1.2 : 1.6;

          for (let i = 0; i < rainStreaks.length; i++) {
            const r = rainStreaks[i];
            if (r.layer !== layerIdx) continue;

            const timeFactor = dt / 16.6;
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x + windSlant * 2.8, r.y + r.length);

            r.x += windSlant * (r.speed * 0.08) * timeFactor;
            r.y += r.speed * timeFactor;

            // Impact at bottom of viewport -> Spawn Splash Particle Sprites
            if (r.y >= height - 12) {
              if (splashes.length < 35 && Math.random() > 0.4) {
                const droplets = [];
                const dropletCount = Math.floor(2 + Math.random() * 3);
                for (let d = 0; d < dropletCount; d++) {
                  droplets.push({
                    x: r.x,
                    y: height - Math.random() * 8,
                    vx: (Math.random() - 0.5) * 2.2 + windSlant * 0.3,
                    vy: -(Math.random() * 2.5 + 1.2),
                    alpha: 0.6,
                    size: Math.random() * 1.2 + 0.6
                  });
                }

                splashes.push({
                  x: r.x,
                  y: height - Math.random() * 10,
                  radius: 1,
                  maxRadius: Math.random() * 9 + 4,
                  alpha: 0.45,
                  droplets
                });
              }

              r.y = -30;
              r.x = Math.random() * (width + 400) - 200;
            }
          }
          ctx.stroke();
        }

        // Render Bottom Splash Ripples & Bouncing Micro-Droplets
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          s.radius += 0.55 * (dt / 16.6);
          s.alpha *= 0.91;

          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 2.2, s.radius * 0.65, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(186, 230, 253, ${s.alpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();

          for (let d = 0; d < s.droplets.length; d++) {
            const drop = s.droplets[d];
            drop.x += drop.vx * (dt / 16.6);
            drop.y += drop.vy * (dt / 16.6);
            drop.vy += 0.15;
            drop.alpha *= 0.92;

            ctx.beginPath();
            ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(224, 242, 254, ${drop.alpha})`;
            ctx.fill();
          }

          if (s.alpha < 0.015 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
          }
        }
      }

      // -----------------------------------------------------------
      // Step F: Multi-Strobe Lightning Illumination Flicker
      // -----------------------------------------------------------
      if (lightningStrobeRef.current.active) {
        const strobe = lightningStrobeRef.current;
        if (currentTime >= strobe.nextTime) {
          strobe.index++;
          if (strobe.index < strobe.sequence.length) {
            flashAlphaRef.current = strobe.sequence[strobe.index];
            strobe.nextTime = currentTime + (Math.random() * 40 + 35);
          } else {
            strobe.active = false;
          }
        }
      }

      if (flashAlphaRef.current > 0.005) {
        ctx.fillStyle = `rgba(235, 245, 255, ${flashAlphaRef.current * 0.48})`;
        ctx.fillRect(0, 0, width, height);
        flashAlphaRef.current *= 0.86;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (lightningTimer) clearTimeout(lightningTimer);
    };
  }, [activeCondition, activeCloudCover, activeWindVelocity, effectiveTimeOfDay, generateCloudBanks, isLight]);

  // Re-generate clouds when cloudCover or condition changes
  const handleSetCondition = (c: AtmosphericCondition) => {
    setActiveCondition(c);
    const newCover = c === 'STORM' ? 95 : c === 'RAIN' ? 85 : c === 'OVERCAST' || c === 'CLOUDY' ? 75 : c === 'HAZE' ? 50 : 20;
    setActiveCloudCover(newCover);
    const newWind = c === 'STORM' ? 52 : c === 'RAIN' ? 28 : 14;
    setActiveWindVelocity(newWind);

    if (canvasRef.current) {
      cloudBankListRef.current = generateCloudBanks(canvasRef.current.width, canvasRef.current.height, newCover);
    }
  };

  const handleCloudCoverChange = (val: number) => {
    setActiveCloudCover(val);
    if (canvasRef.current) {
      cloudBankListRef.current = generateCloudBanks(canvasRef.current.width, canvasRef.current.height, val);
    }
  };

  return (
    <>
      {/* Full-Viewport Atmospheric Canvas rendered behind frosted glass UI */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 will-change-transform"
        style={{
          transform: 'translateZ(0)',
          imageRendering: 'auto'
        }}
      />

      {/* Optional Interactive Atmosphere Tuner HUD Widget */}
      {showControlsWidget && (
        <div className="fixed bottom-3 right-3 z-50 font-mono text-xs">
          {!isControlsOpen ? (
            <button
              onClick={() => setIsControlsOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl ios-glass-card border border-white/[0.1] text-zinc-300 hover:text-white shadow-2xl backdrop-blur-2xl transition-all cursor-pointer hover:scale-105"
              title="Atmosphere & Cloud Physics Studio"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span className="text-[11px] font-semibold">Sky Engine</span>
            </button>
          ) : (
            <div className="w-80 p-4 rounded-2xl ios-glass-card border border-white/[0.12] shadow-2xl backdrop-blur-2xl space-y-3.5 text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Atmospheric Engine Physics</span>
                </div>
                <button
                  onClick={() => setIsControlsOpen(false)}
                  className="text-zinc-400 hover:text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-white/[0.08] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Quick Weather Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'SUNNY', label: 'Sunny', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
                  { id: 'HAZE', label: 'Haze', icon: <Eye className="w-3.5 h-3.5 text-zinc-300" /> },
                  { id: 'RAIN', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5 text-sky-400" /> },
                  { id: 'STORM', label: 'Storm', icon: <CloudLightning className="w-3.5 h-3.5 text-rose-400" /> }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSetCondition(p.id as AtmosphericCondition)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                      activeCondition === p.id
                        ? 'bg-white/[0.15] border-emerald-400 font-bold shadow-md'
                        : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {p.icon}
                    <span className="text-[10px]">{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Slider 1: input_CloudCoverPercentage */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400 flex items-center space-x-1.5">
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cloud Density:</span>
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">{activeCloudCover}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeCloudCover}
                  onChange={(e) => handleCloudCoverChange(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 rounded-lg bg-white/[0.08]"
                />
                <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                  <span>0% Clear</span>
                  <span>25% Few</span>
                  <span>50% Scat</span>
                  <span>85%+ Storm</span>
                </div>
              </div>

              {/* Slider 2: input_WindVelocity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400 flex items-center space-x-1.5">
                    <Wind className="w-3.5 h-3.5 text-amber-400" />
                    <span>Wind Drift Speed:</span>
                  </span>
                  <span className="font-bold text-amber-400 font-mono">{activeWindVelocity} km/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="110"
                  value={activeWindVelocity}
                  onChange={(e) => setActiveWindVelocity(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 rounded-lg bg-white/[0.08]"
                />
              </div>

              {/* Trigger Lightning */}
              {activeCondition === 'STORM' && (
                <button
                  onClick={() => {
                    flashAlphaRef.current = 0.55;
                    ambientAudio.triggerLightning(1.2);
                  }}
                  className="w-full py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 font-semibold text-[11px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <CloudLightning className="w-3.5 h-3.5 text-rose-400" />
                  <span>Trigger Lightning Strike</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
