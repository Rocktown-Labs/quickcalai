import { AbsoluteFill, Sequence } from "remotion";
import { AspectRatio } from "../design-tokens";
import { ProcessingComponent, ResultsTableComponent, CTAComponent } from "../components";
import { HookScene } from "./scenes/HookScene";

interface CuriosityHookVideoProps {
  aspectRatio?: AspectRatio;
}

export const CuriosityHookVideo: React.FC<CuriosityHookVideoProps> = ({
  aspectRatio = "desktop",
}) => {
  const scenes = {
    hook: { start: 0, duration: 120 },
    examples: { start: 110, duration: 180 },
    demo: { start: 285, duration: 240 },
    features: { start: 520, duration: 210 },
    proof: { start: 725, duration: 120 },
    cta: { start: 840, duration: 180 },
  };

  return (
    <AbsoluteFill>
      <Sequence from={scenes.hook.start} durationInFrames={scenes.hook.duration}>
        <HookScene
          text="What if you could photograph any schedule?"
          subtext="And have it in your calendar instantly"
          aspectRatio={aspectRatio}
        />
      </Sequence>

      <Sequence from={scenes.examples.start} durationInFrames={scenes.examples.duration}>
        <HookScene
          text="Sports • School • Work • Events"
          subtext="Any schedule, any format"
          aspectRatio={aspectRatio}
        />
      </Sequence>

      <Sequence from={scenes.demo.start} durationInFrames={scenes.demo.duration}>
        <ProcessingComponent
          title="AI extracts everything"
          maxEvents={12}
        />
      </Sequence>

      <Sequence from={scenes.features.start} durationInFrames={scenes.features.duration}>
        <ResultsTableComponent
          title="Edit, download, or share"
          events={[
            { title: "Conference Day 1", date: "Mon, Jun 2", time: "9:00 AM", location: "Convention Center" },
            { title: "Keynote Speech", date: "Mon, Jun 2", time: "2:00 PM", location: "Main Hall" },
            { title: "Workshop Session", date: "Tue, Jun 3", time: "10:00 AM", location: "Room 204" },
            { title: "Networking Event", date: "Tue, Jun 3", time: "6:00 PM", location: "Rooftop" },
          ]}
        />
      </Sequence>

      <Sequence from={scenes.proof.start} durationInFrames={scenes.proof.duration}>
        <HookScene
          text="12 events in 3 seconds"
          subtext="Instant AI extraction"
          aspectRatio={aspectRatio}
        />
      </Sequence>

      <Sequence from={scenes.cta.start} durationInFrames={scenes.cta.duration}>
        <CTAComponent
          headline="Try QuickCalAI free today"
          subheadline="No credit card required"
          url="QuickCalAI.com"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
