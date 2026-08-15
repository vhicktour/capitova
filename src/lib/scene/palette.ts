import * as THREE from "three";

export const PALETTE = {
  darkBg: "#1c1b1a",
  paperBg: "#dcd8d0",
  bone: "#e6dfd2",
  cobalt: "#3556c8",
  cobaltDeep: "#27409a",
  inner: "#8d8577",
  granuleA: "#5d79e0",
  granuleB: "#cfc6b4",
  edgeDark: "#050506",
  edgePaper: "#3f3d38",
  inkDark: "#efe9df",
  inkPaper: "#2e2d2a",
  ring: "#8ba0f0",
} as const;

export const color = (hex: string) => new THREE.Color(hex);

function toonRamp() {
  const ramp = new THREE.DataTexture(
    new Uint8Array([40, 128, 230]),
    3,
    1,
    THREE.RedFormat,
  );
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}

/**
 * Every material registered through `toon()` is tracked in `shaded` so the
 * render loop can blend the whole model toward paper white in one pass.
 */
export function createMaterials() {
  const gradientMap = toonRamp();
  const shaded: THREE.MeshToonMaterial[] = [];

  const toon = (hex: string) => {
    const material = new THREE.MeshToonMaterial({
      color: color(hex),
      gradientMap,
    });
    material.userData.base = color(hex);
    shaded.push(material);
    return material;
  };

  return {
    gradientMap,
    shaded,
    toon,
    edge: new THREE.LineBasicMaterial({
      color: color(PALETTE.edgeDark),
      transparent: true,
      opacity: 0.3,
    }),
    outline: new THREE.MeshBasicMaterial({
      color: color(PALETTE.edgeDark),
      side: THREE.BackSide,
    }),
    body: toon(PALETTE.bone),
    cap: toon(PALETTE.cobalt),
    ridge: toon(PALETTE.cobaltDeep),
    inner: toon(PALETTE.inner),
    granuleA: toon(PALETTE.granuleA),
    granuleB: toon(PALETTE.granuleB),
  };
}

export type Materials = ReturnType<typeof createMaterials>;

export function addEdges(
  mesh: THREE.Mesh,
  materials: Materials,
  threshold = 24,
) {
  const edges = new THREE.EdgesGeometry(mesh.geometry, threshold);
  mesh.add(new THREE.LineSegments(edges, materials.edge));
}

export function addOutline(
  mesh: THREE.Mesh,
  materials: Materials,
  scale = 1.02,
) {
  const shell = new THREE.Mesh(mesh.geometry, materials.outline);
  shell.scale.setScalar(scale);
  mesh.add(shell);
}

export function disposeMaterials(materials: Materials) {
  materials.gradientMap.dispose();
  materials.edge.dispose();
  materials.outline.dispose();
  for (const material of materials.shaded) material.dispose();
}
