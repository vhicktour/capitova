"use client";

import { useRef } from "react";
import MobileMenu from "./MobileMenu";
import Button from "./ui/button";
import { NAV_LINKS } from "@/content/sections";
import { useStageFrame } from "@/lib/stage/frame";
import { useScrollToScene } from "@/lib/stage/scroll";

/** A link is "active" while the timeline sits within this many scenes of it. */
const ACTIVE_RANGE = 0.75;

export default function SiteNav() {
  const scrollToScene = useScrollToScene();
  const bar = useRef<HTMLElement>(null);
  const links = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = useRef(-2);

  useStageFrame(({ p, ui }) => {
    if (bar.current) {
      bar.current.style.opacity = ui.toFixed(3);
      bar.current.style.visibility = ui > 0.02 ? "visible" : "hidden";
    }

    let best = -1;
    let nearest = ACTIVE_RANGE;
    NAV_LINKS.forEach((link, index) => {
      if (typeof link.target !== "number") return;
      const distance = Math.abs(p - link.target);
      if (distance < nearest) {
        nearest = distance;
        best = index;
      }
    });
    if (best === activeIndex.current) return;
    activeIndex.current = best;
    links.current.forEach((node, index) => {
      if (!node) return;
      const active = index === best;
      node.dataset.active = String(active);
      if (active) node.setAttribute("aria-current", "true");
      else node.removeAttribute("aria-current");
    });
  });

  return (
    <nav
      ref={bar}
      aria-label="Primary"
      className="stage-only fixed inset-x-0 top-0 z-10 flex items-center justify-between px-[clamp(20px,4vw,48px)] py-4.5 text-ink opacity-0"
    >
      <Button variant="bare" size="wordmark" onClick={() => scrollToScene(0)}>
        <span
          aria-hidden
          className="size-2.5 rounded-full bg-cobalt-soft shadow-[0_0_0_3px_color-mix(in_srgb,#5d79e0_25%,transparent)]"
        />
        Granule
      </Button>

      <ul className="hidden gap-[clamp(14px,2.4vw,34px)] min-[861px]:flex">
        {NAV_LINKS.map((link, index) => (
          <li key={link.label}>
            <Button
              ref={(node) => {
                links.current[index] = node;
              }}
              variant="nav"
              size="nav"
              data-active="false"
              onClick={() => scrollToScene(link.target)}
            >
              {link.label}
            </Button>
          </li>
        ))}
      </ul>

      <MobileMenu />
    </nav>
  );
}
