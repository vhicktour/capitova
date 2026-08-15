"use client";

import type { ComponentProps } from "react";
import Button from "./ui/button";
import type { SceneTarget } from "@/content/sections";
import { useScrollToScene } from "@/lib/stage/scroll";

export default function SceneButton({
  target,
  ...props
}: ComponentProps<typeof Button> & { target: SceneTarget }) {
  const scrollToScene = useScrollToScene();

  return (
    <Button
      onClick={() => scrollToScene(target)}
      className={typeof target === "number" ? "stage-only" : undefined}
      {...props}
    />
  );
}
