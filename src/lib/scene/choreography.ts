export const SCENE_COUNT = 7;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export interface CameraPose {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  fov: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

const CAMERA_KEYS: readonly CameraPose[] = [
  { x: 4.4, y: 1.5, z: 5.4, tx: 0, ty: 0, tz: 0, fov: 34 },
  { x: 2.7, y: 0.7, z: 3.5, tx: 0, ty: 0, tz: 0, fov: 32 },
  { x: 1.1, y: 0.4, z: 2.05, tx: 0.15, ty: 0, tz: 0, fov: 30 },
  { x: 0.0, y: 0.35, z: 7.2, tx: 0.05, ty: 0, tz: 0, fov: 23 },
  { x: 2.5, y: -0.5, z: 4.3, tx: 0.2, ty: -0.7, tz: 0, fov: 30 },
  { x: 1.5, y: -1.25, z: 2.7, tx: 0.5, ty: -1.6, tz: 0.4, fov: 29 },
  { x: 2.0, y: -1.1, z: 2.35, tx: 0.05, ty: -1.7, tz: 0.4, fov: 30 },
  { x: 3.1, y: -0.7, z: 4.3, tx: 0.05, ty: -2.0, tz: 0.4, fov: 36 },
];

/** z ≈ -90° tips the capsule mouth downward, ready to pour. */
const ROTATION_KEYS: readonly Rotation[] = [
  { x: 0.14, y: -0.55, z: -0.38 },
  { x: 0.1, y: 0.25, z: -0.52 },
  { x: 0.04, y: 0.95, z: -0.55 },
  { x: 0, y: 0, z: 0 },
  { x: 0.15, y: 0.25, z: -1.58 },
  { x: 0.22, y: 0.55, z: -1.72 },
  { x: 0.25, y: 0.7, z: -1.8 },
  { x: 0.25, y: 0.8, z: -1.85 },
];

export function interpolateKeys<T extends object>(
  keys: readonly T[],
  p: number,
): T {
  const index = clamp(Math.floor(p), 0, keys.length - 2);
  const t = smoother(clamp(p - index, 0, 1));
  const from = keys[index] as Record<string, number>;
  const to = keys[index + 1] as Record<string, number>;
  const out: Record<string, number> = {};
  for (const key of Object.keys(from)) out[key] = lerp(from[key], to[key], t);
  return out as T;
}

export const cameraAt = (p: number) => interpolateKeys(CAMERA_KEYS, p);
export const rotationAt = (p: number) => interpolateKeys(ROTATION_KEYS, p);

const DESIGN_ASPECT = 1.45;
const MAX_FOV = 78;

export function fitFov(fov: number, aspect: number) {
  if (aspect >= DESIGN_ASPECT) return fov;
  const half = Math.tan((fov * Math.PI) / 360) * (DESIGN_ASPECT / aspect);
  return Math.min((Math.atan(half) * 360) / Math.PI, MAX_FOV);
}

export const phase = {
  paper: (p: number) =>
    Math.max(
      smoothstep(2.2, 2.85, p) * (1 - smoothstep(3.25, 3.7, p)),
      smoothstep(5.25, 6.0, p),
    ),
  open: (p: number) => smoothstep(3.3, 3.85, p),
  pour: (p: number) => smoothstep(3.7, 4.95, p),
  atom: (p: number) => smoothstep(5.0, 6.2, p),
  rise: (p: number) => smoothstep(5.05, 5.85, p),
  annotations: (p: number) =>
    smoothstep(2.7, 3.05, p) * (1 - smoothstep(3.3, 3.6, p)),
  labels: (p: number) => smoothstep(6.5, 6.75, p),
  counters: (p: number) => smoother(smoothstep(5.7, 6.05, p)),
} as const;

export function captionAt(
  p: number,
  center: number,
  width: number,
  holdFromStart = false,
) {
  const relative = holdFromStart ? Math.max(0, p - center) : p - center;
  const weight = clamp(1 - Math.abs(relative) / width, 0, 1);
  return {
    opacity: smoother(weight),
    offsetY: clamp(relative, -0.52, 0.52) * -26,
  };
}
