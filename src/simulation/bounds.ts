import type { Boid } from './boid.ts';

export function applyBounds(boid: Boid, width: number, height: number, bounce: boolean): void {
  if (bounce) {
    if (boid.x < 0) { boid.x = 0; boid.vx = Math.abs(boid.vx); }
    else if (boid.x > width) { boid.x = width; boid.vx = -Math.abs(boid.vx); }
    if (boid.y < 0) { boid.y = 0; boid.vy = Math.abs(boid.vy); }
    else if (boid.y > height) { boid.y = height; boid.vy = -Math.abs(boid.vy); }
  } else {
    if (boid.x < 0) boid.x += width;
    else if (boid.x > width) boid.x -= width;
    if (boid.y < 0) boid.y += height;
    else if (boid.y > height) boid.y -= height;
  }
}
