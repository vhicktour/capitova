"use client";

import { useRef } from "react";
import { SCENE_COUNT, clamp, smoothstep } from "@/lib/scene/choreography";
import { useStageFrame } from "@/lib/stage/frame";

const pad = (value: number) => String(value).padStart(2, "0");

export default function StageHud() {
  const counter = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const lastIndex = useRef(-1);

  useStageFrame(({ p, ui }) => {
    const index = clamp(Math.round(p - 0.38) + 1, 1, SCENE_COUNT);
    if (index !== lastIndex.current && readout.current) {
      readout.current.textContent = pad(index);
      lastIndex.current = index;
    }
    if (counter.current) {
      const weight = 0.7 * (1 - smoothstep(6.45, 6.75, p)) * ui;
      counter.current.style.opacity = weight.toFixed(3);
    }
    if (hint.current) {
      hint.current.style.opacity = (
        0.56 *
        clamp(1 - p / 0.3, 0, 1) *
        ui
      ).toFixed(3);
    }
  });

  return (
    <>
      <div
        ref={counter}
        aria-hidden
        className="stage-only pointer-events-none fixed bottom-4.5 right-4.5 z-2 font-mono text-xs tracking-hud text-ink opacity-0 sm:bottom-6 sm:right-7"
      >
        <span ref={readout}>01</span> — {pad(SCENE_COUNT)}
      </div>
      <div
        ref={hint}
        aria-hidden
        className="stage-only pointer-events-none fixed bottom-6.5 left-1/2 z-2 -translate-x-1/2 font-mono text-[11px] tracking-loud text-ink opacity-0"
      >
        SCROLL
      </div>
    </>
  );
}
