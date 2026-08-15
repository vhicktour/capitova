/** Scene positions are indices on the 7-scene scroll timeline. */
export interface CaptionSection {
  tag: string;
  heading: string;
  body?: string;
  center: number;
  width: number;
  className: string;
  align?: "left" | "right";
  scrim?: boolean;
}

export type SceneTarget = number | "end";

export const NAV_LINKS: readonly { label: string; target: SceneTarget }[] = [
  { label: "About", target: 1.5 },
  { label: "Platform", target: 2.95 },
  { label: "Capabilities", target: 3.8 },
  { label: "Impact", target: 6.15 },
  { label: "Contact", target: "end" },
];

export const HERO = {
  tag: "GRANULE BIOSCIENCES",
  heading: "Medicine, delivered to the millimetre.",
  body: "We engineer oral capsules that carry peptides, oligonucleotides and live cells through the gut intact, and let go exactly where they work.",
  center: 0.38,
  width: 0.52,
} as const;

export const ABOUT: CaptionSection = {
  tag: "01 / WHY GRANULE",
  heading: "Precision starts at the shell.",
  body: "Two ridge rings hold the cap under a quarter-millimetre of tension. That tolerance is the difference between a dose that survives the stomach and one that never arrives.",
  center: 1.5,
  width: 0.52,
  align: "right",
  className: "right-[clamp(24px,8vw,140px)] top-[22vh] text-right",
};

export const PLATFORM: CaptionSection = {
  tag: "02 / PLATFORM",
  heading: "Drawn at tolerance, built at scale.",
  body: "Size 0 — 21.7 mm closed, ø 7.64 mm at the cap.",
  center: 2.95,
  width: 0.45,
  className: "left-[clamp(24px,7vw,120px)] top-[20vh]",
};

export const PLATFORM_SPEC = [
  "enteric shell · pH-gated seam",
  "release window ±4 min",
  "GMP lines · 40M units / yr",
];

export const CAPABILITIES: CaptionSection = {
  tag: "03 / CAPABILITIES",
  heading: "One shell, many payloads.",
  center: 3.8,
  width: 0.5,
  align: "right",
  className: "right-[clamp(24px,8vw,140px)] top-[24vh] text-right",
};

export const PAYLOADS = [
  { label: "Peptides & proteins", meta: "GLP-1 class" },
  { label: "Oligos & mRNA", meta: "granule matrix" },
  { label: "Live biotherapeutics", meta: "≥10⁹ CFU" },
];

export const PIPELINE: CaptionSection = {
  tag: "04 / PIPELINE",
  heading: "Follow one dose down.",
  body: "Six programs ride the same 0.9 mm granule, from metabolic peptides to gut-restricted immunology. The first is in the clinic.",
  center: 4.72,
  width: 0.48,
  className: "left-[clamp(24px,7vw,120px)] bottom-[24vh]",
};

export const IMPACT: CaptionSection = {
  tag: "05 / IMPACT",
  heading: "Measured where it matters.",
  center: 6.15,
  width: 0.5,
  scrim: true,
  className: "left-[clamp(24px,7vw,120px)] top-[20vh] -mt-[22px] -ml-6",
};

export const IMPACT_NOTE = "tracer study · Cobaltrium-64";

export const IMPACT_STATS = [
  {
    value: 94,
    suffix: "%",
    decimals: 0,
    label: "payload reaching target site",
  },
  {
    value: 3.2,
    suffix: "×",
    decimals: 1,
    label: "bioavailability vs standard oral",
  },
  { value: 6, suffix: "", decimals: 0, label: "programs in development" },
];

export const CONTACT_EMAIL = "programs@granulebio.com";
