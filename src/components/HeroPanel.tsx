"use client";

import { useRef } from "react";
import SceneButton from "./SceneButton";
import Tag from "./ui/tag";
import { HERO } from "@/content/sections";
import { captionAt } from "@/lib/scene/choreography";
import { useStageFrame } from "@/lib/stage/frame";
import { applyPanelStyle } from "@/lib/stage/panel";

export default function HeroPanel() {
  const ref = useRef<HTMLDivElement>(null);

  useStageFrame(({ p }) => {
    const node = ref.current;
    if (!node) return;
    const { opacity, offsetY } = captionAt(p, HERO.center, HERO.width, true);
    applyPanelStyle(node, opacity, offsetY);
  });

  return (
    <div
      ref={ref}
      data-lit
      className="stage-layer inset-y-0 left-0 z-2 flex w-full flex-col justify-end px-[clamp(20px,6vw,120px)] pb-[13vh] text-ink lg:w-auto lg:max-w-[min(680px,46vw)] lg:justify-center lg:pb-0 lg:pr-6"
    >
      <Tag>{HERO.tag}</Tag>
      <h1 className="mt-3.5 text-[clamp(36px,4.4vw,60px)] font-bold leading-[1.04] tracking-display">
        {HERO.heading}
      </h1>
      <p className="mt-4 max-w-110 text-[clamp(14px,1.2vw,17px)] leading-[1.55] opacity-[0.78]">
        {HERO.body}
      </p>
      <div className="mt-8 flex flex-wrap gap-3.5">
        <SceneButton target={2.95} variant="solid" arrow>
          See the platform
        </SceneButton>
        <SceneButton target="end" variant="outline">
          Start a program
        </SceneButton>
      </div>
    </div>
  );
}
