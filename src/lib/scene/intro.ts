import {
  interpolateKeys,
  smoother,
  smoothstep,
  type CameraPose,
} from "./choreography";

export const INTRO_DURATION = 3.2;

export const INTRO_SCALE = 0.16;

export const CONTENTS_VISIBLE_AT = 0.92;

/** Flies from inside the capsule out to the hero framing (which is scene 0). */
const INTRO_KEYS: readonly CameraPose[] = [
  { x: 0.25, y: -0.5, z: 3.4, tx: 0, ty: 0, tz: 0, fov: 42 },
  { x: 2.6, y: 2.1, z: 2.7, tx: 0, ty: 0, tz: 0, fov: 37 },
  { x: 4.4, y: 1.5, z: 5.4, tx: 0, ty: 0, tz: 0, fov: 34 },
];

export const introCameraAt = (u: number) =>
  interpolateKeys(INTRO_KEYS, u * (INTRO_KEYS.length - 1));

/** Weights derived from intro progress `u` in [0, 1]. */
export const intro = {
  grow: (u: number) => smoother(smoothstep(0.3, 0.96, u)),
  spin: (u: number) => Math.PI * 6 * (1 - Math.pow(1 - u, 2.4)),
  ui: (u: number) => smoothstep(0.88, 1, u),
  loader: (u: number) => 1 - smoothstep(0.86, 0.98, u),
} as const;
