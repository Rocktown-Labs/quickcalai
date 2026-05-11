import { AbsoluteFill, Sequence } from "remotion";
import { AspectRatio } from "../design-tokens";
import { UploadComponent, ProcessingComponent, ResultsTableComponent, ExportOptionsComponent, CTAComponent } from "../components";
import { HookScene } from "./scenes/HookScene";

interface AspirationHookVideoProps {
  aspectRatio?: AspectRatio;
}

export const AspirationHookVideo: React.FC<AspirationHookVideoProps> = ({
  aspectRatio = "desktop",
}) => {
  const scenes = {
    hook: { start: 0, duration: 100 },
    upload: { start: 90, duration: 150 },
    processing: { start: 235, duration: 240 },
    results: { start: 470, duration: 240 },
    share: { start: 705, duration: 120 },
    cta: { start: 820, duration: 180 },
  };

  return (
    <AbsoluteFill>
      <Sequence from={scenes.hook.start} durationInFrames={scenes.hook.duration}>
        <HookScene
          text="Never miss a game day"
          subtext="Keep your whole family in sync"
          aspectRatio={aspectRatio}
        />
      </Sequence>

      <Sequence from={scenes.upload.start} durationInFrames={scenes.upload.duration}>
        <UploadComponent
          title="Snap a photo of the schedule"
          subtitle="Works with any image"
          showFile={true}
          fileName="team-schedule-spring.jpg"
        />
      </Sequence>

      <Sequence from={scenes.processing.start} durationInFrames={scenes.processing.duration}>
        <ProcessingComponent
          title="AI extracts every game and practice"
          maxEvents={15}
        />
      </Sequence>

      <Sequence from={scenes.results.start} durationInFrames={scenes.results.duration}>
        <ResultsTableComponent
          title="Your season at a glance"
          events={[
            { title: "Practice", date: "Tue, Apr 1", time: "5:00 PM", location: "Field 2" },
            { title: "Game vs Tigers", date: "Sat, Apr 5", time: "9:00 AM", location: "Stadium" },
            { title: "Practice", date: "Tue, Apr 8", time: "5:00 PM", location: "Field 2" },
            { title: "Tournament", date: "Sat, Apr 12", time: "8:00 AM", location: "Regional" },
          ]}
        />
      </Sequence>

      <Sequence from={scenes.share.start} durationInFrames={scenes.share.duration}>
        <ExportOptionsComponent
          title="Share with everyone"
          subtitle="Email to family, sync to all calendars"
          showSuccess={true}
        />
      </Sequence>

      <Sequence from={scenes.cta.start} durationInFrames={scenes.cta.duration}>
        <CTAComponent
          headline="Organized life in seconds"
          subheadline="Free for families - no credit card"
          url="QuickCalAI.com"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
