# Granule Biosciences

An animation-driven landing page for a fictional biotechnology company that
engineers oral capsules for targeted drug delivery.

The whole page is a single continuous camera move through one 3D object. You
scroll; a size-0 capsule rotates into view, is measured against an engineering
drawing, splits at the seam, pours its granules, and one of those granules
becomes the tracer atom the impact figures are measured with. There are no
stacked page sections behind it

---

## Stack

|           |                                                    |
| --------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                 |
| Language  | TypeScript                                         |
| Styling   | Tailwind CSS v4 (CSS-first config)                 |
| 3D        | Three.js (`MeshToonMaterial`, hand-built geometry) |
| Fonts     | Sora (display), JetBrains Mono (UI lettering)      |

No animation library. The scroll choreography is ~110 lines of easing functions
in `src/lib/scene/choreography.ts`; GSAP or Framer Motion would have added a
dependency to do less than the render loop already needs to do per frame.

## Getting started

Requires **Node.js 20.9+**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Design approach

**Two worlds, one object.** The page moves between a dark studio and a pale
blueprint. Dark is the product: warm key light, deep cobalt, heavy vignette.
Paper is the engineering behind it.. flat ambient light, dashed centreline,
dimension lines across the capsule's 21.7 mm length. Scrolling crosses between
them twice. The palette is a bone shell (`#e6dfd2`) against cobalt (`#3556c8`)
on near-black (`#1c1b1a`), inverting to `#dcd8d0` paper. Both the 3D materials
and the page's `--ink` / `--bg` custom properties are driven from one `paper`
weight, so the HTML and the WebGL scene cross-fade as one surface rather than as
a canvas sitting on a page.

**Type does two jobs.** Sora carries the argument, tight tracking, heavy
weights, large sizes. JetBrains Mono carries the instrumentation: section tags,
specs, the scene counter, the stat labels. Letter-spacing is a named scale
(`--tracking-spec` through `--tracking-loud`) rather than ad-hoc values, and the
two families move in opposite directions, mono opens up as it gets smaller and
louder, display tightens as it scales.

**Restraint on the copy.** Each scene gets one heading and at most one
paragraph. The object is doing the explaining.

## Animation approach

**One timeline.** `SCENE_COUNT = 7`. An invisible spacer (`ScrollTrack`) of
seven 135vh sections defines the scroll range; everything reads a single
normalised position `p ∈ [0, 7]` derived from `scrollY`. Nothing uses
`IntersectionObserver` or scroll-linked CSS.

**One render loop, no React re-renders.** `useStageDriver` owns
`renderer.setAnimationLoop`. Each frame it smooths `p`, renders the scene, and
emits a `StageFrame` to subscribers via context. Overlays (`HeroPanel`,
`CaptionPanel`, `StatGrid`, `SiteNav`, `AtomLabels`, `StageHud`) subscribe with
`useStageFrame` and mutate their own DOM node directly. Driving 60–120fps
updates through React state would rebuild the tree every frame.

**Keyframes, not tweens.** Camera pose and capsule rotation are arrays of eight
keys interpolated with a quintic smoothstep, so scrubbing backwards is exactly
symmetric. Everything else is a named weight in `phase`, `paper`, `open`,
`pour`, `atom`, `rise`, `annotations`, `labels`, `counters`, each a smoothstep
over an explicit scroll window. Retiming a beat means moving two numbers.

**Cost control.** `createFrameRenderer` allocates nothing per frame: scratch
vectors live in the closure. The 190 granules are two `InstancedMesh` batches.
The stat counters skip repaints below a visible-change epsilon, and the theme
only writes a CSS custom property when its value actually changes.

**The intro.** A 3.2s flight from inside the capsule out to the hero framing,
with the shell scaling up and unwinding three turns. It hands off to scene 0, so
the first scroll continues the same move rather than starting a new one.

## Progressive enhancement

`.stage-layer` panels are positioned and hidden by default, and an inline script
sets `data-stage="live"` before first paint. If the WebGL context can't be
created the driver sets `data-stage="fallback"` instead; with JavaScript off the
attribute is never set at all. Both cases hit the same CSS branch: the panels
leave their fixed positions, the canvas-dependent chrome drops out, and the page
reads as an ordinary stacked document with every heading, paragraph, spec and
statistic intact.

`prefers-reduced-motion` is honoured in both layers, CSS collapses transitions
and the drift animation, and the scene freezes camera drift, capsule idle,
nucleus rotation and electron orbits, skips the intro flight, and switches
in-page navigation from smooth to instant.

## Accessibility

- Skip link, visible `:focus-visible` ring, `<main>` / `<nav>` / `<footer>` landmarks
- One `<h1>`, one `<h2>` per section, each panel `aria-labelledby` its heading
- Offscreen panels get `visibility: hidden`, so they leave the tab order and the
  accessibility tree instead of sitting invisibly on top of the page
- Nav marks the current scene with `aria-current`; the mobile menu closes on
  Escape and returns focus to its trigger
- The canvas, the decorative vignette and the projected atom callouts are `aria-hidden`

## Structure

```
src/
  app/            layout, page, 404, icon
  content/        all copy and scene positions
  components/     overlays that subscribe to the frame loop
    ui/           Button, Panel, Tag, Chip primitives
  lib/
    stage/        driver, frame context, scroll mapping
    scene/        Three.js scene — capsule, granules, atom, annotations,
                  palette, choreography, per-frame renderer
```

Copy and timeline positions live in `src/content/sections.ts`, so re-scoring the
narrative doesn't mean touching a component.
