export interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dx: number;
  dy: number;
}

export function createBoids(
  count: number,
  width: number,
  height: number,
  minSpeed: number,
  maxSpeed: number,
): Boid[] {
  const boids: Boid[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    boids[i] = {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      dx: 0,
      dy: 0,
    };
  }
  return boids;
}
