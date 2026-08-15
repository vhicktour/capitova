"use client";

import { useRef } from "react";
import { IMPACT_STATS } from "@/content/sections";
import { phase } from "@/lib/scene/choreography";
import { useStageFrame } from "@/lib/stage/frame";

/** Below this the counters would repaint without a visible change. */
const EPSILON = 0.0008;

const format = (stat: (typeof IMPACT_STATS)[number], weight: number) =>
  (stat.value * weight).toFixed(stat.decimals) + stat.suffix;

export default function StatGrid() {
  const values = useRef<(HTMLElement | null)[]>([]);
  const lastWeight = useRef(-1);

  useStageFrame(({ p }) => {
    const weight = phase.counters(p);
    if (Math.abs(weight - lastWeight.current) < EPSILON) return;
    lastWeight.current = weight;
    IMPACT_STATS.forEach((stat, index) => {
      const node = values.current[index];
      if (!node) return;
      node.textContent = format(stat, weight);
    });
  });

  return (
    <ul className="mt-6 grid gap-4">
      {IMPACT_STATS.map((stat, index) => (
        <li key={stat.label}>
          <b
            ref={(node) => {
              values.current[index] = node;
            }}
            data-settled={format(stat, 1)}
            className="block text-[clamp(24px,2.6vw,36px)] font-bold tracking-display tabular-nums"
          >
            {format(stat, 1)}
          </b>
          <span className="mt-1.5 block max-w-35 font-mono text-[11px] leading-[1.6] tracking-cta opacity-[0.72]">
            {stat.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
