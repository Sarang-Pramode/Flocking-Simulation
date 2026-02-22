import type { Boid } from '../simulation/boid.ts';

export class SpatialGrid {
  private cellSize = 50;
  private cells = new Map<number, Boid[]>();
  private cols = 0;
  private rows = 0;

  clear(cellSize: number, width: number, height: number, depth: number): void {
    this.cellSize = Math.max(cellSize, 1);
    this.cols = Math.ceil(width / this.cellSize) + 1;
    this.rows = Math.ceil(height / this.cellSize) + 1;
    void depth;
    this.cells.clear();
  }

  insert(boid: Boid): void {
    const key = this.keyFor(boid.x, boid.y, boid.z);
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = [];
      this.cells.set(key, bucket);
    }
    bucket.push(boid);
  }

  query(
    boid: Boid,
    radius: number,
    maxNeighbors: number,
    out: Boid[],
  ): number {
    const r2 = radius * radius;
    const cx = Math.floor(boid.x / this.cellSize);
    const cy = Math.floor(boid.y / this.cellSize);
    const cz = Math.floor(boid.z / this.cellSize);
    const colsRows = this.cols * this.rows;
    let count = 0;

    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const key = (cz + dz) * colsRows + (cy + dy) * this.cols + (cx + dx);
          const bucket = this.cells.get(key);
          if (!bucket) continue;
          for (let i = 0; i < bucket.length; i++) {
            const other = bucket[i];
            if (other === boid) continue;
            const ddx = other.x - boid.x;
            const ddy = other.y - boid.y;
            const ddz = other.z - boid.z;
            const dist2 = ddx * ddx + ddy * ddy + ddz * ddz;
            if (dist2 < r2) {
              out[count++] = other;
              if (count >= maxNeighbors) return count;
            }
          }
        }
      }
    }
    return count;
  }

  getCellSize(): number {
    return this.cellSize;
  }

  getCols(): number {
    return this.cols;
  }

  getRows(): number {
    return this.rows;
  }

  private keyFor(x: number, y: number, z: number): number {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    return cz * this.cols * this.rows + cy * this.cols + cx;
  }
}
