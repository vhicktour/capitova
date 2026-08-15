import { SCENE_COUNT } from "@/lib/scene/choreography";
import { SCROLL_TRACK_ID } from "@/lib/stage/constants";

export default function ScrollTrack() {
  return (
    <div id={SCROLL_TRACK_ID} aria-hidden className="stage-only">
      {Array.from({ length: SCENE_COUNT }, (_, index) => (
        <section key={index} className="h-[135vh]" />
      ))}
    </div>
  );
}
