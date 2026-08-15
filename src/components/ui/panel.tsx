import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const panelVariants = cva(
  "stage-layer z-2 max-w-[min(76vw,300px)] text-ink sm:max-w-85",
  {
    variants: {
      scrim: {
        always: "rounded-[14px] bg-stage/60 px-6 py-5.5 backdrop-blur-[6px]",
        compact:
          "max-lg:rounded-[14px] max-lg:bg-stage/70 max-lg:px-5 max-lg:py-4 max-lg:backdrop-blur-[6px]",
      },
    },
    defaultVariants: { scrim: "compact" },
  },
);

export default function Panel({
  className,
  scrim,
  ...props
}: ComponentProps<"section"> & VariantProps<typeof panelVariants>) {
  return (
    <section className={cn(panelVariants({ scrim }), className)} {...props} />
  );
}
