import * as THREE from "three";
import { ATOM_ANCHOR } from "./atom";
import {
  cameraAt,
  fitFov,
  lerp,
  phase,
  rotationAt,
  smoother,
  smoothstep,
  type CameraPose,
} from "./choreography";
import {
  CONTENTS_VISIBLE_AT,
  INTRO_SCALE,
  intro,
  introCameraAt,
} from "./intro";
import type { Stage, Theme } from "./stage";

export interface LabelPlacement {
  x: number;
  y: number;
  opacity: number;
}

export interface FrameSnapshot {
  theme: Theme;
  ui: number;
  labels: readonly LabelPlacement[];
}

const HERO_RELEASE = 0.04;
const HERO_SPAN = 0.34;

const HERO_LIFT_FRACTION = 0.14;

/**
 * Drives the whole scene from a scroll position and an intro progress. Scratch
 * vectors live in the closure so a frame allocates nothing.
 */
export function createFrameRenderer(stage: Stage, reduceMotion: boolean) {
  const point = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const nucleusAnchor = new THREE.Vector3();
  const electronAnchor = new THREE.Vector3();
  const labels: LabelPlacement[] = [
    { x: 0, y: 0, opacity: 0 },
    { x: 0, y: 0, opacity: 0 },
  ];
  const drift = reduceMotion ? 0 : 1;

  function heroLift(pose: CameraPose, fov: number) {
    const distance = Math.hypot(
      pose.x - pose.tx,
      pose.y - pose.ty,
      pose.z - pose.tz,
    );
    return HERO_LIFT_FRACTION * 2 * distance * Math.tan((fov * Math.PI) / 360);
  }

  /** During the intro the flight overrides the scroll timeline entirely. */
  function placeCamera(p: number, time: number, introProgress: number) {
    const pose = introProgress < 1 ? introCameraAt(introProgress) : cameraAt(p);
    stage.camera.position.set(
      pose.x + Math.sin(time * 0.23) * 0.06 * drift,
      pose.y + Math.sin(time * 0.31 + 1.7) * 0.05 * drift,
      pose.z + Math.cos(time * 0.19) * 0.06 * drift,
    );
    const fov = fitFov(pose.fov, stage.camera.aspect);
    stage.camera.fov = fov;
    stage.camera.updateProjectionMatrix();

    const lift = stage.stacked
      ? heroLift(pose, fov) * (1 - smoothstep(0, 1, p))
      : 0;
    stage.camera.lookAt(pose.tx, pose.ty - lift, pose.tz);
  }

  function placeCapsule(
    p: number,
    time: number,
    rise: number,
    grow: number,
    spin: number,
  ) {
    const rotation = rotationAt(p);
    const idle = reduceMotion ? 0 : Math.sin(time * 0.12) * 0.02;
    stage.capsule.group.rotation.set(
      rotation.x,
      rotation.y + spin + idle,
      rotation.z,
    );
    stage.capsule.group.scale.setScalar(lerp(INTRO_SCALE, 1, grow));
    stage.capsule.group.position.y = rise * 6.5;
    stage.capsule.setOpen(phase.open(p));
    stage.capsule.group.updateMatrixWorld(true);
  }

  function placeHero(p: number, pour: number, grown: boolean) {
    if (pour <= HERO_RELEASE) {
      point.set(0.7, 0, 0).applyMatrix4(stage.capsule.group.matrixWorld);
    } else {
      const travel = Math.min((pour - HERO_RELEASE) / HERO_SPAN, 1.7);
      stage.granules.frame.trace(point, travel, 0.12, -0.1);
    }
    point.lerp(ATOM_ANCHOR, smoothstep(0.3, 0.62, pour));
    stage.hero.position.copy(point);
    stage.hero.rotation.set(pour * 5, pour * 3.4, 0);
    stage.hero.scale.setScalar(1 + smoother(smoothstep(4.95, 5.35, p)) * 24);
    stage.heroMaterial.opacity = 1 - smoothstep(5.3, 5.6, p);
    stage.hero.visible =
      grown && p < 5.65 && stage.heroMaterial.opacity > 0.002;
  }

  function placeLabels(p: number, weight: number) {
    const opacity = weight * phase.labels(p);
    if (opacity <= 0.002) {
      for (const label of labels) label.opacity = 0;
      return;
    }
    stage.atom.anchors(nucleusAnchor, electronAnchor);
    const anchors = [nucleusAnchor, electronAnchor];
    const scales = [0.9, 0.75];
    labels.forEach((label, index) => {
      const screen = stage.project(anchors[index], projected);
      label.x = screen.x;
      label.y = screen.y - 8;
      label.opacity = opacity * scales[index];
    });
  }

  return function renderFrame(
    p: number,
    time: number,
    introProgress: number,
  ): FrameSnapshot {
    const running = introProgress < 1;
    const grow = running ? intro.grow(introProgress) : 1;
    const grown = grow > CONTENTS_VISIBLE_AT;
    const paper = phase.paper(p);
    const pour = phase.pour(p);
    const rise = phase.rise(p);

    placeCamera(p, time, introProgress);
    placeCapsule(p, time, rise, grow, running ? intro.spin(introProgress) : 0);

    const macroVisible = rise < 0.98;
    stage.capsule.group.visible = macroVisible;
    stage.granules.setVisible(macroVisible && grown);
    stage.granules.update(stage.capsule.group, pour);
    placeHero(p, pour, grown);

    const atomWeight = phase.atom(p);
    stage.atom.update(atomWeight, time, paper, reduceMotion);

    const theme = stage.applyTheme(paper, phase.annotations(p));
    stage.renderer.render(stage.scene, stage.camera);

    placeLabels(p, atomWeight);
    return { theme, labels, ui: running ? intro.ui(introProgress) : 1 };
  };
}
