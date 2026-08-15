"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { LabelPlacement } from "@/lib/scene/render";

export interface StageFrame {
  p: number;
  time: number;
  intro: number;
  ui: number;
  labels: readonly LabelPlacement[];
}

export type FrameListener = (frame: StageFrame) => void;
type Subscribe = (listener: FrameListener) => () => void;

export const StageFrameContext = createContext<Subscribe | null>(null);

/**
 * Subscribe an overlay to the render loop. Listeners mutate their own DOM node
 * directly: driving 60fps updates through React state would thrash the tree.
 */
export function useStageFrame(listener: FrameListener) {
  const subscribe = useContext(StageFrameContext);
  const latest = useRef(listener);

  useEffect(() => {
    latest.current = listener;
  });

  useEffect(() => subscribe?.((frame) => latest.current(frame)), [subscribe]);
}
