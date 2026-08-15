"use client";

import { useId, useRef, type ReactNode } from "react";
import Panel from "./ui/panel";
import Tag from "./ui/tag";
import type { CaptionSection } from "@/content/sections";
import { captionAt } from "@/lib/scene/choreography";
import { cn } from "@/lib/cn";
import { useStageFrame } from "@/lib/stage/frame";
import { applyPanelStyle } from "@/lib/stage/panel";

export default function CaptionPanel({
  section,
  children,
}: {
  section: CaptionSection;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const headingId = useId();

  useStageFrame(({ p, ui }) => {
    const node = ref.current;
    if (!node) return;
    const { opacity, offsetY } = captionAt(p, section.center, section.width);
    applyPanelStyle(node, opacity * ui, offsetY);
  });

  return (
    <Panel
      ref={ref}
      aria-labelledby={headingId}
      scrim={section.scrim ? "always" : "compact"}
      className={section.className}
    >
      <Tag>{section.tag}</Tag>
      <h2
        id={headingId}
        className="mt-3.5 text-[clamp(20px,2.2vw,30px)] font-semibold leading-[1.2] tracking-heading"
      >
        {section.heading}
      </h2>
      {section.body && (
        <p
          className={cn(
            "mt-3.5 text-[clamp(14px,1.2vw,17px)] leading-[1.55] opacity-[0.78] sm:max-w-75",
            section.align === "right" && "ml-auto",
          )}
        >
          {section.body}
        </p>
      )}
      {children}
    </Panel>
  );
}
