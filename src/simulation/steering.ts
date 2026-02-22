import type { Boid } from './boid.ts';
import type { Settings } from '../settings.ts';

const EPS = 0.0001;

export function computeSteering(
  boid: Boid,
  neighbors: Boid[],
  neighborCount: number,
  settings: Settings,
  mouseX: number,
  mouseY: number,
  mouseForce: number,
  outDx: { v: number },
  outDy: { v: number },
): void {
  let sx = 0, sy = 0;
  let ax = 0, ay = 0;
  let cx = 0, cy = 0;

  if (!settings.particleMode && neighborCount > 0) {
    for (let i = 0; i < neighborCount; i++) {
      const n = neighbors[i];
      const ddx = boid.x - n.x;
      const ddy = boid.y - n.y;
      const dist2 = ddx * ddx + ddy * ddy + EPS;
      sx += ddx / dist2;
      sy += ddy / dist2;

      const nSpeed = Math.sqrt(n.vx * n.vx + n.vy * n.vy) + EPS;
      ax += n.vx / nSpeed;
      ay += n.vy / nSpeed;

      cx += n.x;
      cy += n.y;
    }

    const invN = 1 / neighborCount;
    const bSpeed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy) + EPS;

    ax = ax * invN - boid.vx / bSpeed;
    ay = ay * invN - boid.vy / bSpeed;

    cx = cx * invN - boid.x;
    cy = cy * invN - boid.y;
  }

  let ux = 0, uy = 0;

  if (!settings.particleMode && neighborCount > 0) {
    const sLen = Math.sqrt(sx * sx + sy * sy) + EPS;
    const aLen = Math.sqrt(ax * ax + ay * ay) + EPS;
    const cLen = Math.sqrt(cx * cx + cy * cy) + EPS;

    ux += settings.separationForce * (sx / sLen);
    uy += settings.separationForce * (sy / sLen);
    ux += settings.alignmentForce * (ax / aLen);
    uy += settings.alignmentForce * (ay / aLen);
    ux += settings.cohesionForce * (cx / cLen);
    uy += settings.cohesionForce * (cy / cLen);
  }

  if (settings.randomness > 0) {
    const angle = Math.random() * Math.PI * 2;
    ux += settings.randomness * Math.cos(angle);
    uy += settings.randomness * Math.sin(angle);
  }

  if (mouseForce !== 0) {
    const mdx = mouseX - boid.x;
    const mdy = mouseY - boid.y;
    const mDist = Math.sqrt(mdx * mdx + mdy * mdy) + EPS;
    if (mDist < settings.visionRadius * 4) {
      const strength = mouseForce * (1 - mDist / (settings.visionRadius * 4));
      ux += strength * (mdx / mDist);
      uy += strength * (mdy / mDist);
    }
  }

  const uLen = Math.sqrt(ux * ux + uy * uy);
  if (uLen > settings.steeringForce) {
    const scale = settings.steeringForce / uLen;
    ux *= scale;
    uy *= scale;
  }

  outDx.v = ux;
  outDy.v = uy;
}

export function integrate(boid: Boid, ux: number, uy: number, settings: Settings, dt: number): void {
  boid.vx += ux;
  boid.vy += uy;

  const dampening = 1 - settings.drag;
  boid.vx *= dampening;
  boid.vy *= dampening;

  let speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
  if (speed > settings.maxSpeed) {
    const scale = settings.maxSpeed / speed;
    boid.vx *= scale;
    boid.vy *= scale;
    speed = settings.maxSpeed;
  } else if (speed < settings.minSpeed && speed > EPS) {
    const scale = settings.minSpeed / speed;
    boid.vx *= scale;
    boid.vy *= scale;
  }

  boid.x += boid.vx * dt;
  boid.y += boid.vy * dt;
}
