"use client";

import Button, { ButtonArrow } from "./ui/button";
import Tag from "./ui/tag";
import { CONTACT_EMAIL } from "@/content/sections";
import { useScrollToScene } from "@/lib/stage/scroll";

export default function SiteFooter() {
  const scrollToScene = useScrollToScene();

  return (
    <footer className="relative z-2 flex flex-col gap-[clamp(48px,10vh,96px)] border-t border-hairline bg-surface-deep px-[clamp(20px,4vw,48px)] pb-6 pt-[clamp(72px,14vh,140px)] text-ink-fixed">
      <div className="flex flex-col items-center gap-4 text-center">
        <Tag>06 / GRANULE BIOSCIENCES</Tag>
        <h2 className="text-[clamp(24px,2.6vw,40px)] font-bold tracking-heading">
          Deliver what was undeliverable.
        </h2>
        <Button asChild variant="solid" className="mt-1">
          <a href={`mailto:${CONTACT_EMAIL}`}>
            Start a program
            <ButtonArrow />
          </a>
        </Button>
      </div>

      <div className="flex flex-col gap-2 font-mono text-[11px] tracking-nav sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 GRANULE BIOSCIENCES</span>
        <nav
          aria-label="Footer"
          className="flex flex-col gap-2 sm:flex-row sm:gap-6"
        >
          <Button asChild variant="link" size="bare">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </Button>
          <Button variant="link" size="bare" onClick={() => scrollToScene(0)}>
            Back to top
          </Button>
        </nav>
      </div>
    </footer>
  );
}
