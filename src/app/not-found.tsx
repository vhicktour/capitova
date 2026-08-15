import type { Metadata } from "next";
import Link from "next/link";
import NotFoundMark from "@/components/NotFoundMark";
import Button from "@/components/ui/button";
import Tag from "@/components/ui/tag";

export const metadata: Metadata = {
  title: "404 — Not Found",
};

export default function NotFound() {
  return (
    <main
      id="content"
      className="relative grid min-h-dvh place-items-center overflow-hidden px-6 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_42%,rgba(0,0,0,0.6)_100%)]"
      />
      <div className="relative">
        <NotFoundMark />
        <Tag tracking="wide">00 / NOT FOUND</Tag>
        <h1 className="text-[clamp(64px,14vw,150px)] font-bold leading-none tracking-mega">
          404
        </h1>
        <p className="mx-auto mb-8.5 mt-4.5 max-w-[320px] text-[clamp(14px,1.4vw,17px)] leading-[1.55] opacity-[0.78]">
          This page left in one stream.. decanted, and never resealed.
        </p>
        <Button asChild variant="box" size="box">
          <Link href="/">RETURN TO THE CAPSULE</Link>
        </Button>
      </div>
    </main>
  );
}
