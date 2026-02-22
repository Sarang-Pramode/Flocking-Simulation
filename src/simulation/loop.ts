import type { Boid } from './boid.ts';
import type { Settings } from '../settings.ts';
import type { SpatialGrid } from '../spatial/grid.ts';
import { computeSteering, integrate } from './steering.ts';
import { applyBounds } from './bounds.ts';

export interface MouseState {
  x: number;
  y: number;
  z: number;
  force: number;
}

const neighborsBuffer: Boid[] = new Array(64);
const outDx = { v: 0 };
const outDy = { v: 0 };
const outDz = { v: 0 };

export function tick(
  boids: Boid[],
  grid: SpatialGrid,
  settings: Settings,
  dt: number,
  width: number,
  height: number,
  depth: number,
  mouse: MouseState,
): void {
  grid.clear(settings.visionRadius, width, height, depth);
  for (let i = 0; i < boids.length; i++) {
    grid.insert(boids[i]);
  }

  for (let i = 0; i < boids.length; i++) {
    const boid = boids[i];
    const count = grid.query(boid, settings.visionRadius, settings.movementAccuracy, neighborsBuffer);

    computeSteering(
      boid, neighborsBuffer, count, settings,
      mouse.x, mouse.y, mouse.z, mouse.force,
      outDx, outDy, outDz,
    );
    boid.dx = outDx.v;
    boid.dy = outDy.v;
    boid.dz = outDz.v;

    integrate(boid, outDx.v, outDy.v, outDz.v, settings, dt);
    applyBounds(boid, width, height, depth, settings.bounceEdges);
  }
}

export function applyExplosion(
  boids: Boid[],
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  strength: number,
): void {
  for (let i = 0; i < boids.length; i++) {
    const b = boids[i];
    const ddx = b.x - cx;
    const ddy = b.y - cy;
    const ddz = b.z - cz;
    const dist = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz) + 0.0001;
    if (dist < radius) {
      const factor = strength * (1 - dist / radius);
      b.vx += (ddx / dist) * factor;
      b.vy += (ddy / dist) * factor;
      b.vz += (ddz / dist) * factor;
    }
  }
}
