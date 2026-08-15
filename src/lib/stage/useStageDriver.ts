"use client";

import { useEffect, useRef, type RefObject } from "react";
import { clamp } from "@/lib/scene/choreography";
import { INTRO_DURATION } from "@/lib/scene/intro";
import { createFrameRenderer } from "@/lib/scene/render";
import { createStage, type Stage } from "@/lib/scene/stage";
import { prefersReducedMotion, readSceneProgress } from "./scroll";
import type { StageFrame } from "./frame";

/** Exponential follow — scroll input never snaps the camera. */
const SMOOTHING = 0.085;

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

    let stage: Stage;
    try {
      stage = createStage(canvas);
    } catch (error) {
      console.warn(
        "WebGL stage unavailable; falling back to static layout",
        error,
      );
      document.documentElement.dataset.stage = "fallback";
      canvas.remove();
      return;
    }

    const reduceMotion = prefersReducedMotion();
    const renderFrame = createFrameRenderer(stage, reduceMotion);
    const rootStyle = document.documentElement.style;

    let introProgress = reduceMotion ? 1 : 0;
    let introStart = -1;
    if (introProgress < 1) {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    }

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

    let ink = "";
    let bg = "";
    let vignette = -1;

    stage.renderer.setAnimationLoop((ms) => {
      const time = ms / 1000;
      if (introProgress < 1) {
        if (introStart < 0) introStart = time;
        introProgress = clamp((time - introStart) / INTRO_DURATION, 0, 1);
        if (introProgress >= 1) document.body.style.overflow = "";
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
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
      stage.dispose();
      canvas.remove();
    };
  }, [containerRef]);
}
