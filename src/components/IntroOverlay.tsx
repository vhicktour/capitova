"use client";

import { useRef } from "react";
import { intro } from "@/lib/scene/intro";
import { useStageFrame } from "@/lib/stage/frame";

const pad = (value: number) => String(value).padStart(2, "0");

export default function IntroOverlay() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  const lastPercent = useRef(-1);

  useStageFrame(({ intro: progress }) => {
    const node = root.current;

    if (!node || progress >= 1) return;
    node.style.opacity = intro.loader(progress).toFixed(3);

    if (fill.current) fill.current.style.scale = `${progress.toFixed(3)} 1`;

    const value = Math.round(progress * 100);
    if (value !== lastPercent.current) {
      if (percent.current) percent.current.textContent = `${pad(value)}%`;
      bar.current?.setAttribute("aria-valuenow", String(value));
      lastPercent.current = value;
    }
  });

  return (
    <div
      ref={root}
      className="stage-only stage-loader pointer-events-none fixed inset-0 z-5 grid items-end justify-items-center pb-[12vh] text-center text-ink"
    >
      <div>
        <span className="font-mono text-[11px] tracking-loud opacity-70">
          00 / LOADING
        </span>
        <div
          ref={bar}
          role="progressbar"
          aria-label="Loading the capsule"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          className="mx-auto mb-2.5 mt-3.5 h-px w-35 bg-ink/20"
        >
          <span
            ref={fill}
            className="block h-full w-full origin-left scale-x-0 bg-current"
          />
        </div>
        <span
          ref={percent}
          className="block font-mono text-[11px] tracking-hud opacity-[0.72]"
        >
          00%
        </span>
      </div>
    </div>
  );
}
