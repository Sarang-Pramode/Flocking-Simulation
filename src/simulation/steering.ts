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
  mouseZ: number,
  mouseForce: number,
  outDx: { v: number },
  outDy: { v: number },
  outDz: { v: number },
  outCollX: { v: number },
  outCollY: { v: number },
  outCollZ: { v: number },
): void {
  let sx = 0, sy = 0, sz = 0;
  let ax = 0, ay = 0, az = 0;
  let cx = 0, cy = 0, cz = 0;
  let collX = 0, collY = 0, collZ = 0;

  const collDiam = settings.collisionRadius * 2;
  const collDiam2 = collDiam * collDiam;
  const hasCollision = settings.collisionForce > 0 && collDiam > EPS;

  if (neighborCount > 0) {
    for (let i = 0; i < neighborCount; i++) {
      const n = neighbors[i];
      const ddx = boid.x - n.x;
      const ddy = boid.y - n.y;
      const ddz = boid.z - n.z;
      const dist2 = ddx * ddx + ddy * ddy + ddz * ddz + EPS;

      if (!settings.particleMode) {
        sx += ddx / dist2;
        sy += ddy / dist2;
        sz += ddz / dist2;

        const nSpeed = Math.sqrt(n.vx * n.vx + n.vy * n.vy + n.vz * n.vz) + EPS;
        ax += n.vx / nSpeed;
        ay += n.vy / nSpeed;
        az += n.vz / nSpeed;

        cx += n.x;
        cy += n.y;
        cz += n.z;
      }

      if (hasCollision && dist2 < collDiam2) {
        const dist = Math.sqrt(dist2);
        const overlap = 1 - dist / collDiam;
        const repulse = settings.collisionForce * overlap * overlap;
        const invDist = 1 / dist;
        collX += ddx * invDist * repulse;
        collY += ddy * invDist * repulse;
        collZ += ddz * invDist * repulse;
      }
    }

    if (!settings.particleMode) {
      const invN = 1 / neighborCount;
      const bSpeed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy + boid.vz * boid.vz) + EPS;

      ax = ax * invN - boid.vx / bSpeed;
      ay = ay * invN - boid.vy / bSpeed;
      az = az * invN - boid.vz / bSpeed;

      cx = cx * invN - boid.x;
      cy = cy * invN - boid.y;
      cz = cz * invN - boid.z;
    }
  }

  let ux = 0, uy = 0, uz = 0;

  if (!settings.particleMode && neighborCount > 0) {
    const sLen = Math.sqrt(sx * sx + sy * sy + sz * sz) + EPS;
    const aLen = Math.sqrt(ax * ax + ay * ay + az * az) + EPS;
    const cLen = Math.sqrt(cx * cx + cy * cy + cz * cz) + EPS;

    ux += settings.separationForce * (sx / sLen);
    uy += settings.separationForce * (sy / sLen);
    uz += settings.separationForce * (sz / sLen);
    ux += settings.alignmentForce * (ax / aLen);
    uy += settings.alignmentForce * (ay / aLen);
    uz += settings.alignmentForce * (az / aLen);
    ux += settings.cohesionForce * (cx / cLen);
    uy += settings.cohesionForce * (cy / cLen);
    uz += settings.cohesionForce * (cz / cLen);
  }

  if (settings.randomness > 0) {
    if (settings.mode3D) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const sinPhi = Math.sin(phi);
      ux += settings.randomness * Math.cos(theta) * sinPhi;
      uy += settings.randomness * Math.sin(theta) * sinPhi;
      uz += settings.randomness * Math.cos(phi);
    } else {
      const angle = Math.random() * Math.PI * 2;
      ux += settings.randomness * Math.cos(angle);
      uy += settings.randomness * Math.sin(angle);
    }
  }

  if (mouseForce !== 0) {
    const mdx = mouseX - boid.x;
    const mdy = mouseY - boid.y;
    const mdz = mouseZ - boid.z;
    const mDist = Math.sqrt(mdx * mdx + mdy * mdy + mdz * mdz) + EPS;
    const range = settings.visionRadius * 4;
    if (mDist < range) {
      const strength = mouseForce * (1 - mDist / range);
      ux += strength * (mdx / mDist);
      uy += strength * (mdy / mDist);
      uz += strength * (mdz / mDist);
    }
  }

  const uLen = Math.sqrt(ux * ux + uy * uy + uz * uz);
  if (uLen > settings.steeringForce) {
    const scale = settings.steeringForce / uLen;
    ux *= scale;
    uy *= scale;
    uz *= scale;
  }

  if (!settings.mode3D) {
    uz = 0;
    collZ = 0;
  }

  outDx.v = ux;
  outDy.v = uy;
  outDz.v = uz;
  outCollX.v = collX;
  outCollY.v = collY;
  outCollZ.v = collZ;
}

export function integrate(boid: Boid, ux: number, uy: number, uz: number, settings: Settings, dt: number): void {
  boid.vx += ux;
  boid.vy += uy;
  boid.vz += uz;

  const dampening = 1 - settings.drag;
  boid.vx *= dampening;
  boid.vy *= dampening;
  boid.vz *= dampening;

  let speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy + boid.vz * boid.vz);
  if (speed > settings.maxSpeed) {
    const scale = settings.maxSpeed / speed;
    boid.vx *= scale;
    boid.vy *= scale;
    boid.vz *= scale;
  } else if (speed < settings.minSpeed && speed > EPS) {
    const scale = settings.minSpeed / speed;
    boid.vx *= scale;
    boid.vy *= scale;
    boid.vz *= scale;
  }

  if (!settings.mode3D) {
    boid.vz = 0;
    boid.z = 0;
  }

  boid.x += boid.vx * dt;
  boid.y += boid.vy * dt;
  boid.z += boid.vz * dt;
}
