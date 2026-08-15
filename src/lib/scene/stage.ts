import * as THREE from "three";
import { createAnnotations } from "./annotations";
import { createAtom } from "./atom";
import { createCapsule } from "./capsule";
import { createGranules } from "./granules";
import { lerp } from "./choreography";
import { PALETTE, color, createMaterials, disposeMaterials } from "./palette";

const DARK_BG = color(PALETTE.darkBg);
const PAPER_BG = color(PALETTE.paperBg);
const EDGE_DARK = color(PALETTE.edgeDark);
const EDGE_PAPER = color(PALETTE.edgePaper);
const INK_DARK = color(PALETTE.inkDark);
const INK_PAPER = color(PALETTE.inkPaper);

export interface Theme {
  ink: string;
  bg: string;
  vignette: number;
}

const STACKED_BELOW = 1024;

export function createStage(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(DARK_BG.clone().getHex(), 0.042);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  const key = new THREE.DirectionalLight("#ffc9a8", 2.6);
  key.position.set(-4, 6, -3.5);
  const fill = new THREE.DirectionalLight("#7284a8", 0.35);
  fill.position.set(3, -1, 4);
  const ambient = new THREE.AmbientLight("#ffffff", 0.14);
  scene.add(key, fill, ambient);

  const materials = createMaterials();
  const capsule = createCapsule(materials);
  const granules = createGranules(materials);
  const atom = createAtom(materials);
  const annotations = createAnnotations();
  scene.add(capsule.group, ...granules.meshes, atom.group, annotations.group);

  const heroMaterial = new THREE.MeshToonMaterial({
    color: color(PALETTE.granuleA),
    gradientMap: materials.gradientMap,
    emissive: color("#101f52"),
    transparent: true,
  });
  const hero = new THREE.Mesh(
    new THREE.SphereGeometry(0.062, 28, 20),
    heroMaterial,
  );
  scene.add(hero);

  let stacked = false;

  function resize() {
    const { innerWidth: width, innerHeight: height } = window;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    stacked = width < STACKED_BELOW;
    camera.updateProjectionMatrix();
  }
  resize();

  function applyTheme(paper: number, annotationWeight: number): Theme {
    const background = DARK_BG.clone().lerp(PAPER_BG, paper);
    const fog = scene.fog as THREE.FogExp2;
    fog.color.copy(background);
    fog.density = lerp(0.042, 0.012, paper);

    key.intensity = lerp(2.6, 0.12, paper);
    fill.intensity = lerp(0.35, 0.05, paper);
    ambient.intensity = lerp(0.14, 3.3, paper);

    for (const material of materials.shaded) {
      material.color.lerpColors(material.userData.base, PAPER_BG, paper * 0.96);
    }
    const edge = EDGE_DARK.clone().lerp(EDGE_PAPER, paper);
    materials.edge.color.copy(edge);
    materials.edge.opacity = lerp(0.3, 1.0, paper);
    materials.outline.color.copy(edge);
    annotations.setOpacity(paper * annotationWeight);

    return {
      ink: `#${INK_DARK.clone().lerp(INK_PAPER, paper).getHexString()}`,
      bg: `#${background.getHexString()}`,
      vignette: lerp(0.75, 0.1, paper),
    };
  }

  function project(world: THREE.Vector3, out: THREE.Vector3) {
    out.copy(world).project(camera);
    return {
      x: (out.x * 0.5 + 0.5) * window.innerWidth,
      y: (-out.y * 0.5 + 0.5) * window.innerHeight,
    };
  }

  function dispose() {
    renderer.setAnimationLoop(null);
    renderer.forceContextLoss();
    capsule.dispose();
    granules.dispose();
    atom.dispose();
    annotations.dispose();
    hero.geometry.dispose();
    heroMaterial.dispose();
    disposeMaterials(materials);
    renderer.dispose();
  }

  return {
    renderer,
    scene,
    camera,
    capsule,
    granules,
    atom,
    hero,
    heroMaterial,
    get stacked() {
      return stacked;
    },
    resize,
    applyTheme,
    project,
    dispose,
  };
}

export type Stage = ReturnType<typeof createStage>;
