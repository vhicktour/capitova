import * as THREE from "three";
import { PALETTE, addEdges, addOutline, type Materials } from "./palette";

/** Size 0 shell, modelled along +X with the mouth at `MOUTH_X`. */
export const BODY_RADIUS = 0.58;
export const CAP_RADIUS = 0.645;
export const MOUTH_X = 0.85;

const HALF_TURN = Math.PI / 2;

function buildBody(materials: Materials) {
  const body = new THREE.Group();

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(BODY_RADIUS, BODY_RADIUS, 1.7, 48, 1, true),
    materials.body,
  );
  wall.rotation.z = HALF_TURN;

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(BODY_RADIUS, 48, 24, 0, Math.PI * 2, 0, HALF_TURN),
    materials.body,
  );
  dome.rotation.z = HALF_TURN;
  dome.position.x = -0.85;

  const groove = new THREE.Mesh(
    new THREE.TorusGeometry(BODY_RADIUS + 0.004, 0.016, 12, 64),
    materials.inner,
  );
  groove.rotation.y = HALF_TURN;
  groove.position.x = 0.52;

  const lip = new THREE.Mesh(
    new THREE.RingGeometry(BODY_RADIUS - 0.055, BODY_RADIUS, 48),
    materials.body,
  );
  lip.rotation.y = HALF_TURN;
  lip.position.x = MOUTH_X + 0.001;

  // Backface-only so the camera can look down the open bore.
  const boreMaterial = materials.toon(PALETTE.inner);
  boreMaterial.side = THREE.BackSide;
  const bore = new THREE.Mesh(
    new THREE.CylinderGeometry(
      BODY_RADIUS - 0.055,
      BODY_RADIUS - 0.055,
      0.42,
      48,
      1,
      true,
    ),
    boreMaterial,
  );
  bore.rotation.z = HALF_TURN;
  bore.position.x = MOUTH_X - 0.21;

  addEdges(wall, materials, 35);
  addEdges(dome, materials, 60);
  addEdges(lip, materials, 10);
  addOutline(wall, materials, 1.018);
  addOutline(dome, materials, 1.03);

  body.add(wall, dome, groove, lip, bore);
  return body;
}

function buildCap(materials: Materials) {
  const cap = new THREE.Group();

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(CAP_RADIUS, CAP_RADIUS, 1.0, 48, 1, true),
    materials.cap,
  );
  wall.rotation.z = HALF_TURN;
  wall.position.x = 0.42;

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(CAP_RADIUS, 48, 24, 0, Math.PI * 2, 0, HALF_TURN),
    materials.cap,
  );
  dome.rotation.z = -HALF_TURN;
  dome.position.x = 0.92;

  const rim = new THREE.Mesh(
    new THREE.RingGeometry(BODY_RADIUS + 0.005, CAP_RADIUS, 48),
    materials.cap,
  );
  rim.rotation.y = -HALF_TURN;
  rim.position.x = -0.08;

  addEdges(wall, materials, 35);
  addEdges(dome, materials, 60);
  addEdges(rim, materials, 10);
  addOutline(wall, materials, 1.018);
  addOutline(dome, materials, 1.03);
  cap.add(wall, dome, rim);

  // The two ridge rings that hold the seam under tension.
  for (const x of [0.06, 0.2]) {
    const ridge = new THREE.Mesh(
      new THREE.TorusGeometry(CAP_RADIUS + 0.006, 0.018, 12, 64),
      materials.ridge,
    );
    ridge.rotation.y = HALF_TURN;
    ridge.position.x = x;
    cap.add(ridge);
  }

  return cap;
}

export function createCapsule(materials: Materials) {
  const group = new THREE.Group();
  const cap = buildCap(materials);
  group.add(buildBody(materials), cap);

  /** Slide the cap straight off the axis, then swing it aside once clear. */
  function setOpen(weight: number) {
    const slide = Math.min(weight / 0.55, 1);
    const swing = Math.max(0, Math.min((weight - 0.5) / 0.5, 1));
    const eased = swing * swing * (3 - 2 * swing);
    cap.position.set(
      slide * slide * (3 - 2 * slide) * 1.25 + eased * 0.55,
      eased * 1.7,
      0,
    );
    cap.rotation.z = eased * 0.75;
  }

  function dispose() {
    group.traverse((node) => {
      if (node instanceof THREE.Mesh || node instanceof THREE.LineSegments) {
        node.geometry.dispose();
      }
    });
  }

  return { group, setOpen, dispose };
}

export type Capsule = ReturnType<typeof createCapsule>;
