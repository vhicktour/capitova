"use client";

import { useRef } from "react";
import { useStageFrame } from "@/lib/stage/frame";

const LABELS = ["nucleus · 29 p⁺", "shell e⁻"];

export default function AtomLabels() {
  const nodes = useRef<(HTMLDivElement | null)[]>([]);

  useStageFrame(({ labels }) => {
    labels.forEach((label, index) => {
      const node = nodes.current[index];
      if (!node) return;
      node.style.opacity = label.opacity.toFixed(3);
      node.style.transform = `translate(${label.x.toFixed(1)}px, ${label.y.toFixed(1)}px)`;
    });
  });

  return (
    <div aria-hidden className="stage-only">
      {LABELS.map((text, index) => (
        <div
          key={text}
          ref={(node) => {
            nodes.current[index] = node;
          }}
          className="pointer-events-none fixed left-0 top-0 z-2 pl-9.5 font-mono text-[11px] tracking-tag text-ink opacity-0 will-change-transform"
        >
          <span className="absolute left-0 top-1/2 h-px w-7 bg-current opacity-60" />
          {text}
        </div>
      ))}
    </div>
  );
}
