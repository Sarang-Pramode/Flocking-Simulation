export interface Boid {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  dx: number;
  dy: number;
  dz: number;
}

export function createBoids(
  count: number,
  width: number,
  height: number,
  depth: number,
  minSpeed: number,
  maxSpeed: number,
  is3D: boolean,
): Boid[] {
  const boids: Boid[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

    let vx: number, vy: number, vz: number;
    if (is3D) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const sinPhi = Math.sin(phi);
      vx = Math.cos(theta) * sinPhi * speed;
      vy = Math.sin(theta) * sinPhi * speed;
      vz = Math.cos(phi) * speed;
    } else {
      const angle = Math.random() * Math.PI * 2;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
      vz = 0;
    }

    boids[i] = {
      x: Math.random() * width,
      y: Math.random() * height,
      z: is3D ? Math.random() * depth : 0,
      vx, vy, vz,
      dx: 0, dy: 0, dz: 0,
    };
  }
  return boids;
}
