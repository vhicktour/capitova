import * as THREE from "three";
import { PALETTE, addOutline, color, type Materials } from "./palette";
import { lerp, smoother } from "./choreography";

/** Where the hero granule settles, and where the atom blooms out of it. */
export const ATOM_ANCHOR = new THREE.Vector3(0.5, -1.7, 0.4);

const NUCLEON_COUNT = 13;
const SHELLS = [
  { radius: 0.72, tilt: [1.1, 0.2], speed: 0.9, electrons: 2 },
  { radius: 1.06, tilt: [0.5, 1.2], speed: -0.6, electrons: 3 },
  { radius: 1.4, tilt: [1.9, 2.3], speed: 0.45, electrons: 2 },
] as const;

const PAPER_EDGE = color(PALETTE.edgePaper);
const RING_BLUE = color(PALETTE.ring);

/**
 * Cobaltrium-64 tracer. Its materials are deliberately kept out of the shared
 * `shaded` list so the atom stays in colour when the scene turns to paper.
 */
export function createAtom(materials: Materials) {
  const group = new THREE.Group();
  group.position.copy(ATOM_ANCHOR);
  group.visible = false;

  const toon = (hex: string) =>
    new THREE.MeshToonMaterial({ color: color(hex), gradientMap: materials.gradientMap });
  const proton = toon(PALETTE.cobalt);
  const neutron = toon("#b9ad97");
  const electron = toon(PALETTE.granuleA);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: RING_BLUE.clone(),
    transparent: true,
    opacity: 0,
  });

  const nucleus = new THREE.Group();
  group.add(nucleus);
  const nucleonGeometry = new THREE.SphereGeometry(0.12, 24, 18);
  for (let i = 0; i < NUCLEON_COUNT; i++) {
    const nucleon = new THREE.Mesh(nucleonGeometry, i % 2 ? proton : neutron);
    addOutline(nucleon, materials, 1.07);
    nucleon.position
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize()
      .multiplyScalar(0.21 * Math.cbrt(Math.random()));
    nucleus.add(nucleon);
  }

  const electronGeometry = new THREE.SphereGeometry(0.07, 14, 10);
  const orbits = SHELLS.map(({ radius, tilt, speed, electrons }) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.012, 8, 96),
      ringMaterial,
    );
    ring.rotation.set(tilt[0], tilt[1], 0);
    group.add(ring);

    const bodies = Array.from({ length: electrons }, (_, index) => {
      const mesh = new THREE.Mesh(electronGeometry, electron);
      addOutline(mesh, materials, 1.12);
      ring.add(mesh);
      return { mesh, offset: (index / electrons) * Math.PI * 2 };
    });
    return { ring, bodies, radius, speed };
  });

  const outerOrbit = orbits[orbits.length - 1];
  const labelAnchor = new THREE.Vector3(
    Math.cos(0.5) * outerOrbit.radius,
    Math.sin(0.5) * outerOrbit.radius,
    0,
  );

  function update(weight: number, time: number, paper: number, still: boolean) {
    group.visible = weight > 0.002;
    if (!group.visible) return;

    group.scale.setScalar(lerp(0.06, 1, smoother(weight)));
    // Reduced motion freezes the nucleus at its t=0 pose, as it does the orbits.
    const clock = still ? 0 : time;
    nucleus.rotation.y = clock * 0.25;
    nucleus.rotation.x = Math.sin(clock * 0.17) * 0.3;
    ringMaterial.opacity = lerp(0.5, 0.85, paper) * weight;
    ringMaterial.color.lerpColors(RING_BLUE, PAPER_EDGE, paper);

    for (const orbit of orbits) {
      for (const body of orbit.bodies) {
        const theta = (still ? 0 : time * orbit.speed) + body.offset;
        body.mesh.position.set(
          Math.cos(theta) * orbit.radius,
          Math.sin(theta) * orbit.radius,
          0,
        );
      }
    }
  }

  /** World-space anchors for the two projected HTML callouts. */
  function anchors(nucleusOut: THREE.Vector3, electronOut: THREE.Vector3) {
    nucleusOut.set(0.2, 0.16, 0).applyMatrix4(group.matrixWorld);
    electronOut.copy(labelAnchor).applyMatrix4(outerOrbit.ring.matrixWorld);
  }

  function dispose() {
    nucleonGeometry.dispose();
    electronGeometry.dispose();
    for (const orbit of orbits) orbit.ring.geometry.dispose();
    for (const material of [proton, neutron, electron, ringMaterial]) material.dispose();
  }

  return { group, update, anchors, dispose };
}

export type Atom = ReturnType<typeof createAtom>;
