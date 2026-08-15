import type { Metadata } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import { INTRO_SEEN_KEY } from "@/lib/stage/constants";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Granule Biosciences — Targeted oral delivery",
  description:
    "Granule Biosciences engineers oral capsules that carry fragile molecules through the gut and release them exactly where they work.",
};

/**
 * Claims the stage before first paint. globals.css styles the page as a plain
 * stacked document until this runs, so a browser with JS off.. or one that never
 * gets this far, still renders readable content instead of a black screen. The
 * stage driver downgrades the value again if WebGL turns out to be unavailable.
 *
 * It also settles here, before anything paints, whether the intro flight runs.
 * The driver reads that decision back rather than making its own, so the hero
 * copy CSS lights on arrival is the same copy the first frame takes over.
 */
const CLAIM_STAGE = `document.documentElement.dataset.stage="live";
var run=true;try{run=sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)})!=="1"}catch(e){}
if(run&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="run"`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: CLAIM_STAGE }} />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cobalt focus:px-5 focus:py-3 focus:font-mono focus:text-[13px] focus:tracking-cta focus:text-on-cobalt"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
