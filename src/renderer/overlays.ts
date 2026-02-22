import * as THREE from 'three';
import type { Boid } from '../simulation/boid.ts';
import type { Settings } from '../settings.ts';

const MAX_OVERLAY_BOIDS = 80;

export class Overlays {
  private fpsEl: HTMLDivElement;
  private frameTimesMs: number[] = [];
  private frameIdx = 0;

  private boundingBox: THREE.LineSegments | null = null;
  private directionLines: THREE.LineSegments | null = null;
  private visionSpheres: THREE.LineSegments | null = null;

  constructor(private scene: THREE.Scene) {
    this.fpsEl = document.createElement('div');
    this.fpsEl.id = 'fps-overlay';
    Object.assign(this.fpsEl.style, {
      position: 'fixed',
      top: '10px',
      left: '10px',
      color: '#aaa',
      fontFamily: 'monospace',
      fontSize: '14px',
      pointerEvents: 'none',
      zIndex: '1000',
      display: 'none',
    });
    document.body.appendChild(this.fpsEl);
  }

  update(
    boids: Boid[],
    settings: Settings,
    width: number,
    height: number,
    depth: number,
    deltaMs: number,
  ): void {
    this.updateFps(deltaMs, settings.showDebugInfo, boids.length);
    this.updateBoundingBox(settings.showSpatialSubdivision, width, height, depth);
    this.updateDirectionLines(boids, settings);
    this.updateVisionSpheres(boids, settings);
  }

  private updateFps(deltaMs: number, show: boolean, boidCount: number): void {
    this.fpsEl.style.display = show ? 'block' : 'none';
    if (!show) return;

    if (this.frameTimesMs.length < 60) {
      this.frameTimesMs.push(deltaMs);
    } else {
      this.frameTimesMs[this.frameIdx % 60] = deltaMs;
    }
    this.frameIdx++;

    const avg = this.frameTimesMs.reduce((a, b) => a + b, 0) / this.frameTimesMs.length;
    const fps = Math.round(1000 / avg);
    this.fpsEl.textContent = `${fps} fps | ${boidCount} boids`;
  }

  private updateBoundingBox(show: boolean, w: number, h: number, d: number): void {
    if (show && !this.boundingBox) {
      const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
      const mat = new THREE.LineBasicMaterial({ color: 0x334466, opacity: 0.4, transparent: true });
      this.boundingBox = new THREE.LineSegments(geo, mat);
      this.boundingBox.position.set(w / 2, h / 2, d / 2);
      this.scene.add(this.boundingBox);
    } else if (!show && this.boundingBox) {
      this.scene.remove(this.boundingBox);
      this.boundingBox.geometry.dispose();
      (this.boundingBox.material as THREE.Material).dispose();
      this.boundingBox = null;
    }
  }

  private updateDirectionLines(boids: Boid[], settings: Settings): void {
    if (this.directionLines) {
      this.scene.remove(this.directionLines);
      this.directionLines.geometry.dispose();
      (this.directionLines.material as THREE.Material).dispose();
      this.directionLines = null;
    }

    if (!settings.showDesiredDirections) return;

    const limit = Math.min(boids.length, MAX_OVERLAY_BOIDS);
    const positions = new Float32Array(limit * 6);
    for (let i = 0; i < limit; i++) {
      const b = boids[i];
      const s = 20;
      const off = i * 6;
      positions[off] = b.x;
      positions[off + 1] = b.y;
      positions[off + 2] = b.z;
      positions[off + 3] = b.x + b.dx * s;
      positions[off + 4] = b.y + b.dy * s;
      positions[off + 5] = b.z + b.dz * s;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0xff6644, opacity: 0.5, transparent: true });
    this.directionLines = new THREE.LineSegments(geo, mat);
    this.scene.add(this.directionLines);
  }

  private updateVisionSpheres(boids: Boid[], settings: Settings): void {
    if (this.visionSpheres) {
      this.scene.remove(this.visionSpheres);
      this.visionSpheres.geometry.dispose();
      (this.visionSpheres.material as THREE.Material).dispose();
      this.visionSpheres = null;
    }

    if (!settings.showVisionOutlines && !settings.showVisionAreas) return;

    const limit = Math.min(boids.length, MAX_OVERLAY_BOIDS);
    const template = new THREE.SphereGeometry(settings.visionRadius, 8, 6);
    const edgesGeo = new THREE.EdgesGeometry(template);
    const verticesPerSphere = edgesGeo.attributes.position.count;
    const merged = new Float32Array(limit * verticesPerSphere * 3);

    for (let i = 0; i < limit; i++) {
      const b = boids[i];
      const baseOff = i * verticesPerSphere * 3;
      const arr = edgesGeo.attributes.position.array as Float32Array;
      for (let v = 0; v < verticesPerSphere * 3; v += 3) {
        merged[baseOff + v] = arr[v] + b.x;
        merged[baseOff + v + 1] = arr[v + 1] + b.y;
        merged[baseOff + v + 2] = arr[v + 2] + b.z;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(merged, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0x3366ff,
      opacity: settings.showVisionAreas ? 0.08 : 0.15,
      transparent: true,
    });
    this.visionSpheres = new THREE.LineSegments(geo, mat);
    this.scene.add(this.visionSpheres);
    template.dispose();
    edgesGeo.dispose();
  }
}
