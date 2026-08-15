import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const tagVariants = cva("block font-mono text-xs opacity-[0.72]", {
  variants: {
    tracking: { panel: "tracking-tag", wide: "tracking-loud" },
  },
  defaultVariants: { tracking: "panel" },
});

export default function Tag({
  className,
  tracking,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof tagVariants>) {
  return (
    <span className={cn(tagVariants({ tracking }), className)} {...props} />
  );
}
