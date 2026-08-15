"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "group inline-flex items-center pointer-events-auto transition duration-250 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid:
          "gap-2.5 rounded-full border border-cobalt bg-cobalt text-on-cobalt hover:-translate-y-px hover:border-cobalt-deep hover:bg-cobalt-deep",
        outline:
          "gap-2.5 rounded-full border border-current text-ink hover:-translate-y-px hover:bg-ink hover:text-stage",
        box: "border border-ink/35 hover:border-cobalt-soft",
        nav: "border-b border-transparent opacity-65 hover:border-current hover:opacity-100 data-[active=true]:border-current data-[active=true]:opacity-100",
        menu: "w-full justify-start rounded-lg text-left opacity-75 hover:bg-ink/10 hover:opacity-100",
        link: "opacity-65 hover:opacity-100",
        bare: "",
      },
      size: {
        pill: "px-5.5 py-3.25 font-mono text-[13px] tracking-cta",
        sm: "px-4 py-2 font-mono text-[11px] tracking-trigger",
        box: "px-5.5 py-3 font-mono text-xs tracking-hud",
        nav: "px-0.5 py-1.5 font-mono text-xs tracking-nav",
        menu: "px-3 py-2.5 font-mono text-xs tracking-nav",
        bare: "font-mono text-[11px] tracking-nav",
        wordmark: "gap-2.5 text-[17px] font-bold",
      },
    },
    defaultVariants: { variant: "solid", size: "pill" },
  },
);

export function ButtonArrow() {
  return (
    <span
      aria-hidden
      className="transition-transform duration-250 group-hover:translate-x-1"
    >
      →
    </span>
  );
}

export default function Button({
  className,
  variant,
  size,
  asChild = false,
  arrow = false,
  type,
  children,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    arrow?: boolean;
  }) {
  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {arrow && <ButtonArrow />}
    </button>
  );
}
