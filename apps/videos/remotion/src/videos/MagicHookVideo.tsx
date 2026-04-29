import { AbsoluteFill, Sequence } from "remotion";
import { AspectRatio } from "../design-tokens";
import { UploadComponent, ProcessingComponent, ResultsTableComponent, ExportOptionsComponent, CTAComponent } from "../components";
import { HookScene } from "./scenes/HookScene";

interface MagicHookVideoProps {
  aspectRatio?: AspectRatio;
}

export const MagicHookVideo: React.FC<MagicHookVideoProps> = ({
  aspectRatio = "desktop",
}) => {
  const scenes = {
    hook: { start: 0, duration: 80 },
    upload: { start: 70, duration: 120 },
    processing: { start: 185, duration: 240 },
    results: { start: 420, duration: 240 },
    export: { start: 655, duration: 165 },
    cta: { start: 815, duration: 180 },
  };

  return (
    <AbsoluteFill>
      <Sequence from={scenes.hook.start} durationInFrames={scenes.hook.duration}>
        <HookScene
          text="Watch this..."
          subtext="Soccer schedule → Calendar in 3 seconds"
          aspectRatio={aspectRatio}
        />
      </Sequence>

      <Sequence from={scenes.upload.start} durationInFrames={scenes.upload.duration}>
        <UploadComponent
          title="Upload any schedule"
          subtitle="Drop your document here"
          showFile={true}
          fileName="soccer-schedule.jpg"
        />
      </Sequence>

      <Sequence from={scenes.processing.start} durationInFrames={scenes.processing.duration}>
        <ProcessingComponent
          title="AI extracts details instantly"
          maxEvents={12}
        />
      </Sequence>

      <Sequence from={scenes.results.start} durationInFrames={scenes.results.duration}>
        <ResultsTableComponent
          title="All events extracted"
          events={[
            { title: "Soccer Practice", date: "Mon, May 5", time: "4:00 PM", location: "Field 3" },
            { title: "Team Meeting", date: "Wed, May 7", time: "6:00 PM", location: "Clubhouse" },
            { title: "Game vs Eagles", date: "Sat, May 10", time: "10:00 AM", location: "Main Stadium" },
            { title: "Soccer Practice", date: "Mon, May 12", time: "4:00 PM", location: "Field 3" },
          ]}
        />
      </Sequence>

      <Sequence from={scenes.export.start} durationInFrames={scenes.export.duration}>
        <ExportOptionsComponent
          title="Share with your team"
          subtitle="12 events ready to download"
          showSuccess={true}
        />
      </Sequence>

      <Sequence from={scenes.cta.start} durationInFrames={scenes.cta.duration}>
        <CTAComponent
          headline="Never miss a game day"
          subheadline="Start free - no credit card required"
          url="QuickCalAI.com"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
