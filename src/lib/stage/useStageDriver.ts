"use client";

import { useEffect, useRef, type RefObject } from "react";
import { clamp } from "@/lib/scene/choreography";
import { INTRO_DURATION, INTRO_SKIP_DURATION } from "@/lib/scene/intro";
import { createFrameRenderer } from "@/lib/scene/render";
import { createStage, type Stage } from "@/lib/scene/stage";
import { INTRO_SEEN_KEY } from "./constants";
import { prefersReducedMotion, readSceneProgress } from "./scroll";
import type { StageFrame } from "./frame";

/** Exponential follow — scroll input never snaps the camera. */
const SMOOTHING = 0.085;

/** A stalled tab must not hand the intro a delta that jumps it to the end. */
const MAX_FRAME_DELTA = 0.1;

const SKIP_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/** Properties `applyPanelStyle` writes, and so the ones a downgrade returns. */
const PANEL_PROPERTIES = ["opacity", "translate", "visibility"];

const THEME_PROPERTIES = ["--ink", "--bg", "--vignette"];

function rememberIntro() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    return;
  }
}

export function useStageDriver(
  containerRef: RefObject<HTMLElement | null>,
  emit: (frame: StageFrame) => void,
) {
  const latest = useRef(emit);
  useEffect(() => {
    latest.current = emit;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%";
    container.append(canvas);

    const root = document.documentElement;
    let live = true;

    /**
     * Hand the page back to the stacked fallback layout. Whatever the loop has
     * already written has to be undone first, or the fallback inherits a scene
     * frozen mid-move: inline styles beat the stylesheet, so a panel left at
     * `opacity: 0` stays invisible in a layout built to show it, a half-mixed
     * paper theme outlives the scene that mixed it, and a counter caught at the
     * bottom of its count keeps claiming nothing reaches the target site.
     */
    function downgrade(reason: string, error?: unknown) {
      if (!live) return;
      live = false;
      console.warn(reason, error);
      root.dataset.stage = "fallback";
      delete root.dataset.intro;
      for (const property of THEME_PROPERTIES) {
        root.style.removeProperty(property);
      }
      for (const node of document.querySelectorAll<HTMLElement>(
        ".stage-layer",
      )) {
        for (const property of PANEL_PROPERTIES) {
          node.style.removeProperty(property);
        }
      }
      for (const node of document.querySelectorAll<HTMLElement>(
        "[data-settled]",
      )) {
        node.textContent = node.dataset.settled ?? node.textContent;
      }
      canvas.remove();
    }

    let stage: Stage;
    try {
      stage = createStage(canvas);
    } catch (error) {
      downgrade("WebGL stage unavailable; falling back to static layout", error);
      return;
    }

    const stop = () => stage.renderer.setAnimationLoop(null);
    const onContextLost = () => {
      stop();
      downgrade("WebGL context lost; falling back to static layout");
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const reduceMotion = prefersReducedMotion();
    const renderFrame = createFrameRenderer(stage, reduceMotion);
    const rootStyle = root.style;

    let introProgress = root.dataset.intro === "run" ? 0 : 1;
    let introSeconds = INTRO_DURATION;
    let previous = -1;
    if (introProgress < 1) window.scrollTo(0, 0);

    /** Any deliberate input outranks the flight; run out the rest of it fast. */
    const skipIntro = () => {
      introSeconds = INTRO_SKIP_DURATION;
    };

    let target = readSceneProgress();
    let smoothed = target;
    const onScroll = () => {
      target = readSceneProgress();
    };
    const onResize = () => {
      stage.resize();
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (introProgress < 1) {
      for (const type of SKIP_EVENTS) {
        window.addEventListener(type, skipIntro, { passive: true });
      }
    }

    let ink = "";
    let bg = "";
    let vignette = -1;

    stage.renderer.setAnimationLoop((ms) => {
      const time = ms / 1000;
      const delta = previous < 0 ? 0 : Math.min(time - previous, MAX_FRAME_DELTA);
      previous = time;

      try {
        if (introProgress < 1) {
          introProgress = clamp(introProgress + delta / introSeconds, 0, 1);
          if (introProgress >= 1) {
            rememberIntro();
            delete root.dataset.intro;
          }
        }

        smoothed += (target - smoothed) * SMOOTHING;
        const { theme, labels, ui } = renderFrame(smoothed, time, introProgress);

        if (theme.ink !== ink) rootStyle.setProperty("--ink", (ink = theme.ink));
        if (theme.bg !== bg) rootStyle.setProperty("--bg", (bg = theme.bg));
        if (theme.vignette !== vignette) {
          vignette = theme.vignette;
          rootStyle.setProperty("--vignette", vignette.toFixed(3));
        }

        latest.current({ p: smoothed, time, intro: introProgress, ui, labels });
      } catch (error) {
        stop();
        downgrade("Stage render failed; falling back to static layout", error);
      }
    });

    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      for (const type of SKIP_EVENTS) {
        window.removeEventListener(type, skipIntro);
      }
      stage.dispose();
      canvas.remove();
    };
  }, [containerRef]);
}
