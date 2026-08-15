"use client";

import { useCallback, useRef, type ReactNode } from "react";
import {
  StageFrameContext,
  type FrameListener,
  type StageFrame,
} from "@/lib/stage/frame";
import { useStageDriver } from "@/lib/stage/useStageDriver";

export default function StageCanvas({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listeners = useRef(new Set<FrameListener>());

  const subscribe = useCallback((listener: FrameListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const emit = useCallback((frame: StageFrame) => {
    for (const listener of listeners.current) listener(frame);
  }, []);

  useStageDriver(containerRef, emit);

  return (
    <StageFrameContext.Provider value={subscribe}>
      <div
        ref={containerRef}
        aria-hidden
        className="stage-only pointer-events-none fixed inset-0 z-1"
      />
      <div
        aria-hidden
        className="stage-only pointer-events-none fixed inset-0 z-1 opacity-(--vignette) bg-[radial-gradient(ellipse_at_50%_45%,transparent_42%,rgba(0,0,0,0.6)_100%)]"
      />
      {children}
    </StageFrameContext.Provider>
  );
}
