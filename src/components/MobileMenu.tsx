"use client";

import { useEffect, useRef, useState } from "react";
import Button from "./ui/button";
import { NAV_LINKS, type SceneTarget } from "@/content/sections";
import { useScrollToScene } from "@/lib/stage/scroll";

const MENU_ID = "mobile-menu";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const scrollToScene = useScrollToScene();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const go = (target: SceneTarget) => {
    setOpen(false);
    scrollToScene(target);
  };

  return (
    <div ref={root} className="relative min-[861px]:hidden">
      <Button
        ref={trigger}
        variant="outline"
        size="sm"
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={() => setOpen((value) => !value)}
        className="uppercase"
      >
        {open ? "Close" : "Menu"}
      </Button>

      <ul
        id={MENU_ID}
        hidden={!open}
        className="absolute right-0 top-full mt-2 flex w-[min(240px,70vw)] flex-col rounded-xl border border-ink/25 bg-stage/85 p-2 backdrop-blur-md"
      >
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <Button variant="menu" size="menu" onClick={() => go(link.target)}>
              {link.label}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
