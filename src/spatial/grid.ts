import type { Boid } from '../simulation/boid.ts';

export class SpatialGrid {
  private cellSize = 50;
  private cells = new Map<number, Boid[]>();
  private cols = 0;

  clear(cellSize: number, width: number): void {
    this.cellSize = Math.max(cellSize, 1);
    this.cols = Math.ceil(width / this.cellSize) + 1;
    this.cells.clear();
  }

  insert(boid: Boid): void {
    const key = this.keyFor(boid.x, boid.y);
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
    let count = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const key = (cy + dy) * this.cols + (cx + dx);
        const bucket = this.cells.get(key);
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const other = bucket[i];
          if (other === boid) continue;
          const ddx = other.x - boid.x;
          const ddy = other.y - boid.y;
          const dist2 = ddx * ddx + ddy * ddy;
          if (dist2 < r2) {
            out[count++] = other;
            if (count >= maxNeighbors) return count;
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

  getOccupiedCells(): IterableIterator<number> {
    return this.cells.keys();
  }

  private keyFor(x: number, y: number): number {
    return Math.floor(y / this.cellSize) * this.cols + Math.floor(x / this.cellSize);
  }
}
