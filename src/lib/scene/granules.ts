import * as THREE from "three";
import { BODY_RADIUS, MOUTH_X } from "./capsule";
import type { Materials } from "./palette";

const TOTAL = 190;
const RELEASE_SPAN = 0.34;

interface Seed {
  local: THREE.Vector3;
  order: number;
  spreadY: number;
  spreadZ: number;
  scale: number;
  spin: number;
}

/** Rejection-sample a packed fill that settles below the resting waterline. */
function makeSeeds(count: number): Seed[] {
  const seeds: Seed[] = [];
  for (let guard = 0; seeds.length < count && guard < count * 60; guard++) {
    const x = 0.72 - Math.random() * 1.44;
    const taper = x < -0.65 ? Math.cos((x + 0.65) / 0.22) : 1;
    const angle = Math.random() * Math.PI * 2;
    const radius =
      Math.sqrt(Math.random()) * Math.max((BODY_RADIUS - 0.11) * taper, 0.05);
    const y = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    if (y > 0.26 - x * 0.1) continue;

    seeds.push({
      local: new THREE.Vector3(x, y, z),
      order: Math.pow(Math.random(), 1.25) * 0.62,
      spreadY: (Math.random() - 0.5) * 0.9,
      spreadZ: (Math.random() - 0.5) * 0.9,
      scale: 0.75 + Math.random() * 0.5,
      spin: Math.random() * 6,
    });
  }
  return seeds;
}

class PourFrame {
  readonly mouth = new THREE.Vector3();
  private readonly axis = new THREE.Vector3();
  private readonly across = new THREE.Vector3();
  private readonly up = new THREE.Vector3();

  sync(capsule: THREE.Object3D) {
    this.mouth.set(MOUTH_X, 0, 0).applyMatrix4(capsule.matrixWorld);
    this.axis.set(1, 0, 0).transformDirection(capsule.matrixWorld);
    this.across.set(0, 1, 0).cross(this.axis).normalize();
    if (this.across.lengthSq() < 0.01) this.across.set(1, 0, 0);
    this.up.crossVectors(this.axis, this.across).normalize();
  }

  trace(out: THREE.Vector3, travel: number, spreadY: number, spreadZ: number) {
    out
      .copy(this.mouth)
      .addScaledVector(this.axis, 0.22 + 2.3 * travel)
      .addScaledVector(this.across, spreadY * travel * 0.85)
      .addScaledVector(this.up, spreadZ * travel * 0.85);
    out.y -= 2.4 * travel * travel;
    return out;
  }
}

export function createGranules(materials: Materials) {
  const geometry = new THREE.SphereGeometry(0.052, 10, 8);
  const frame = new PourFrame();
  const scratch = new THREE.Vector3();
  const transform = new THREE.Object3D();

  const build = (material: THREE.Material, count: number) => {
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    return { mesh, seeds: makeSeeds(count) };
  };

  const batches = [
    build(materials.granuleA, Math.floor(TOTAL * 0.45)),
    build(materials.granuleB, Math.ceil(TOTAL * 0.55)),
  ];

  function update(capsule: THREE.Object3D, pour: number) {
    frame.sync(capsule);
    for (const { mesh, seeds } of batches) {
      seeds.forEach((seed, index) => {
        if (pour <= seed.order) {
          scratch.copy(seed.local).applyMatrix4(capsule.matrixWorld);
          transform.rotation.set(seed.spin, seed.spin * 1.3, 0);
        } else {
          const travel = Math.min((pour - seed.order) / RELEASE_SPAN, 1.7);
          frame.trace(scratch, travel, seed.spreadY, seed.spreadZ);
          transform.rotation.set(
            seed.spin + travel * 4,
            seed.spin * 1.3 + travel * 3,
            0,
          );
        }
        transform.position.copy(scratch);
        transform.scale.setScalar(seed.scale);
        transform.updateMatrix();
        mesh.setMatrixAt(index, transform.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  return {
    meshes: batches.map((batch) => batch.mesh),
    frame,
    update,
    setVisible: (visible: boolean) => {
      for (const { mesh } of batches) mesh.visible = visible;
    },
    dispose: () => {
      geometry.dispose();
      for (const { mesh } of batches) mesh.dispose();
    },
  };
}

export type Granules = ReturnType<typeof createGranules>;
