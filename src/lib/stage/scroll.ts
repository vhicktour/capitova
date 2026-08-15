"use client";

import { useCallback } from "react";
import { SCENE_COUNT, clamp } from "@/lib/scene/choreography";
import { SCROLL_TRACK_ID } from "./constants";

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function trackLength() {
  const track = document.getElementById(SCROLL_TRACK_ID);
  return track ? track.offsetHeight - window.innerHeight : 0;
}

export function readSceneProgress() {
  const length = trackLength();
  if (length <= 0) return 0;
  return clamp((window.scrollY / length) * SCENE_COUNT, 0, SCENE_COUNT);
}

/** Jump to a scene index, or past the timeline to the footer with `"end"`. */
export function useScrollToScene() {
  return useCallback((target: number | "end") => {
    const top =
      target === "end"
        ? document.documentElement.scrollHeight
        : (target / SCENE_COUNT) * trackLength();
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);
}
