import * as THREE from 'three';
import type { Boid } from '../simulation/boid.ts';
import type { Settings } from '../settings.ts';

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _mat = new THREE.Matrix4();
const _forward = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _color = new THREE.Color();
const _defaultDir = new THREE.Vector3(1, 0, 0);

function hslToColor(h: number, s: number, l: number, target: THREE.Color): THREE.Color {
  return target.setHSL(h / 360, s, l);
}

export class BoidsView {
  private mesh: THREE.InstancedMesh;
  private geometry: THREE.ConeGeometry;
  private material: THREE.MeshPhongMaterial;
  private maxCount: number;

  constructor(private scene: THREE.Scene, initialCount: number) {
    this.maxCount = Math.max(initialCount, 100);
    this.geometry = new THREE.ConeGeometry(2, 8, 4);
    this.geometry.rotateZ(-Math.PI / 2);
    this.material = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      flatShading: true,
    });

    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.maxCount);
    this.mesh.count = initialCount;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(this.maxCount * 3),
      3,
    );
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.mesh);
  }

  syncCount(count: number): void {
    if (count > this.maxCount) {
      this.scene.remove(this.mesh);
      this.mesh.dispose();
      this.maxCount = Math.ceil(count * 1.5);
      this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.maxCount);
      this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(this.maxCount * 3),
        3,
      );
      this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
      this.scene.add(this.mesh);
    }
    this.mesh.count = count;
  }

  update(boids: Boid[], settings: Settings): void {
    this.mesh.visible = !settings.hideBoids;
    if (settings.hideBoids) return;

    const speedRange = settings.maxSpeed - settings.minSpeed + 0.001;
    const useHue = settings.hueBySpeed;

    for (let i = 0; i < boids.length; i++) {
      const b = boids[i];
      _pos.set(b.x, b.y, b.z);

      const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
      if (speed > 0.001) {
        _forward.set(b.vx / speed, b.vy / speed, b.vz / speed);
      } else {
        _forward.copy(_defaultDir);
      }
      _quat.setFromUnitVectors(_defaultDir, _forward);

      const s = settings.boidSize;
      _scale.set(s, s, s);
      _mat.compose(_pos, _quat, _scale);
      this.mesh.setMatrixAt(i, _mat);

      if (useHue) {
        const t = Math.min(Math.max((speed - settings.minSpeed) / speedRange, 0), 1);
        hslToColor(240 - t * 240, 0.9, 0.55, _color);
      } else {
        _color.setHex(0x88ccff);
      }
      this.mesh.setColorAt(i, _color);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  destroy(): void {
    this.scene.remove(this.mesh);
    this.mesh.dispose();
    this.geometry.dispose();
    this.material.dispose();
  }
}
