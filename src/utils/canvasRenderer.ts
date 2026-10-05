// Canvas rendering utilities for realistic meteorological radar echoes, satellite cloud fields, and nowcast grids

export interface RenderRadarOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  cells: Array<{
    x: number;
    y: number;
    radius: number;
    dbz: number;
    severity: string;
  }>;
  showVelocity?: boolean;
  timeOffsetSec?: number;
}

// Convert dBZ to meteorological color
export function getDbzColor(dbz: number, alpha: number = 0.85): string {
  if (dbz < 15) return `rgba(40, 60, 90, ${alpha * 0.3})`;
  if (dbz < 20) return `rgba(30, 144, 255, ${alpha * 0.6})`;
  if (dbz < 25) return `rgba(0, 200, 255, ${alpha * 0.75})`;
  if (dbz < 30) return `rgba(0, 235, 140, ${alpha * 0.85})`;
  if (dbz < 35) return `rgba(0, 200, 0, ${alpha * 0.9})`;
  if (dbz < 40) return `rgba(160, 230, 0, ${alpha * 0.9})`;
  if (dbz < 45) return `rgba(255, 230, 0, ${alpha * 0.95})`;
  if (dbz < 50) return `rgba(255, 165, 0, ${alpha * 0.95})`;
  if (dbz < 55) return `rgba(255, 80, 0, ${alpha * 0.98})`;
  if (dbz < 60) return `rgba(235, 20, 20, ${alpha * 0.98})`;
  if (dbz < 65) return `rgba(190, 0, 80, ${alpha})`;
  return `rgba(255, 0, 255, ${alpha})`;
}

// Convert Satellite Brightness Temperature (Kelvin) to color
export function getCloudTopTempColor(kelvin: number, alpha: number = 0.8): string {
  if (kelvin > 273) return `rgba(30, 41, 59, ${alpha * 0.2})`; // Warm ground
  if (kelvin > 250) return `rgba(71, 85, 105, ${alpha * 0.4})`; // Low clouds
  if (kelvin > 235) return `rgba(56, 189, 248, ${alpha * 0.6})`; // Mid clouds
  if (kelvin > 220) return `rgba(234, 179, 8, ${alpha * 0.75})`; // Deep convective clouds
  if (kelvin > 205) return `rgba(239, 68, 68, ${alpha * 0.9})`; // Very high convective towers
  return `rgba(217, 70, 239, ${alpha * 0.95})`; // Overshooting top (<-68°C)
}

// Convert Probability (0-100%) to Hazard color
export function getProbabilityColor(prob: number, alpha: number = 0.75): string {
  if (prob < 20) return `rgba(56, 189, 248, ${alpha * 0.3})`;
  if (prob < 40) return `rgba(14, 165, 233, ${alpha * 0.5})`;
  if (prob < 60) return `rgba(234, 179, 8, ${alpha * 0.7})`;
  if (prob < 80) return `rgba(249, 115, 22, ${alpha * 0.85})`;
  return `rgba(239, 68, 68, ${alpha * 0.95})`;
}

// Render dynamic animated radar reflectivity field on canvas
export function renderRadarCanvas(options: RenderRadarOptions) {
  const { ctx, width, height, cells, showVelocity, timeOffsetSec = 0 } = options;

  ctx.clearRect(0, 0, width, height);

  cells.forEach(cell => {
    const coreX = cell.x;
    const coreY = cell.y;
    const maxRadius = cell.radius;

    // Outer echo gradient rings (dBZ decay)
    const layers = 6;
    for (let l = layers; l >= 1; l--) {
      const radius = (maxRadius * l) / layers;
      const layerDbz = cell.dbz * (l / layers);

      const grad = ctx.createRadialGradient(coreX, coreY, radius * 0.2, coreX, coreY, radius);
      
      if (showVelocity) {
        // Render Doppler dipole pattern (approaching/receding)
        const vGrad = ctx.createLinearGradient(coreX - radius, coreY, coreX + radius, coreY);
        vGrad.addColorStop(0, 'rgba(0, 255, 128, 0.75)'); // Inbound (green)
        vGrad.addColorStop(0.5, 'rgba(100, 100, 100, 0.2)'); // Zero line
        vGrad.addColorStop(1, 'rgba(255, 40, 80, 0.75)'); // Outbound (red)
        ctx.fillStyle = vGrad;
      } else {
        grad.addColorStop(0, getDbzColor(layerDbz, 0.85));
        grad.addColorStop(0.7, getDbzColor(layerDbz * 0.7, 0.6));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
      }

      ctx.beginPath();
      ctx.arc(coreX, coreY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add high-reflectivity core specks & textured echoes
    const particleCount = 12;
    for (let p = 0; p < particleCount; p++) {
      const angle = (p / particleCount) * Math.PI * 2 + (timeOffsetSec * 0.5);
      const dist = (maxRadius * 0.4) * (0.4 + 0.6 * Math.sin(p + timeOffsetSec));
      const px = coreX + Math.cos(angle) * dist;
      const py = coreY + Math.sin(angle) * dist;

      ctx.fillStyle = getDbzColor(cell.dbz, 0.9);
      ctx.beginPath();
      ctx.arc(px, py, maxRadius * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
