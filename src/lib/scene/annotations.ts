import * as THREE from "three";
import { PALETTE, color } from "./palette";

const point = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);

/** Engineering-drawing overlay: centreline plus the size-0 length dimension. */
export function createAnnotations() {
  const group = new THREE.Group();

  const dashed = new THREE.LineDashedMaterial({
    color: color(PALETTE.edgePaper),
    dashSize: 0.09,
    gapSize: 0.06,
    transparent: true,
    opacity: 0,
  });
  const solid = new THREE.LineBasicMaterial({
    color: color(PALETTE.edgePaper),
    transparent: true,
    opacity: 0,
  });

  const line = (a: THREE.Vector3, b: THREE.Vector3, material: THREE.Material) =>
    new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), material);

  const centreline = line(point(-2.6, 0), point(3.0, 0), dashed);
  centreline.computeLineDistances();
  group.add(centreline);

  for (const x of [-1.43, 1.565]) {
    group.add(line(point(x, -1.05), point(x, 1.05), solid));
  }
  group.add(line(point(-1.43, -0.95), point(1.565, -0.95), solid));

  function setOpacity(weight: number) {
    dashed.opacity = weight * 0.85;
    solid.opacity = weight * 0.7;
  }

  function dispose() {
    group.traverse((node) => {
      if (node instanceof THREE.Line) node.geometry.dispose();
    });
    dashed.dispose();
    solid.dispose();
  }

  return { group, setOpacity, dispose };
}

export type Annotations = ReturnType<typeof createAnnotations>;
