import AtomLabels from "@/components/AtomLabels";
import CaptionPanel from "@/components/CaptionPanel";
import ChipList from "@/components/ChipList";
import HeroPanel from "@/components/HeroPanel";
import IntroOverlay from "@/components/IntroOverlay";
import ScrollTrack from "@/components/ScrollTrack";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import SpecList from "@/components/SpecList";
import StageCanvas from "@/components/StageCanvas";
import StageHud from "@/components/StageHud";
import StatGrid from "@/components/StatGrid";
import {
  ABOUT,
  CAPABILITIES,
  IMPACT,
  IMPACT_NOTE,
  PAYLOADS,
  PIPELINE,
  PLATFORM,
  PLATFORM_SPEC,
} from "@/content/sections";

export default function Home() {
  return (
    <StageCanvas>
      <SiteNav />

      <main id="content">
        <HeroPanel />

        <CaptionPanel section={ABOUT} />
        <CaptionPanel section={PLATFORM}>
          <SpecList items={PLATFORM_SPEC} />
        </CaptionPanel>
        <CaptionPanel section={CAPABILITIES}>
          <ChipList items={PAYLOADS} />
        </CaptionPanel>
        <CaptionPanel section={PIPELINE} />
        <CaptionPanel section={IMPACT}>
          <p className="mt-3.5 font-mono text-[clamp(12px,1vw,14px)] tracking-spec opacity-[0.78]">
            {IMPACT_NOTE}
          </p>
          <StatGrid />
        </CaptionPanel>

        <ScrollTrack />
      </main>

      <AtomLabels />
      <StageHud />
      <IntroOverlay />
      <SiteFooter />
    </StageCanvas>
  );
}
