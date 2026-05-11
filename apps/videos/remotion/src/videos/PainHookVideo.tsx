import { AbsoluteFill, Sequence } from "remotion";
import { AspectRatio } from "../design-tokens";
import { UploadComponent, ProcessingComponent, ResultsTableComponent, CTAComponent } from "../components";
import { HookScene } from "./scenes/HookScene";

interface PainHookVideoProps {
  aspectRatio?: AspectRatio;
}

export const PainHookVideo: React.FC<PainHookVideoProps> = ({
  aspectRatio = "desktop",
}) => {
  const scenes = {
    hook: { start: 0, duration: 120 },
    upload: { start: 110, duration: 120 },
    processing: { start: 225, duration: 240 },
    results: { start: 460, duration: 240 },
    benefit: { start: 695, duration: 120 },
    cta: { start: 810, duration: 180 },
  };

  return (
    <AbsoluteFill>
      <Sequence from={scenes.hook.start} durationInFrames={scenes.hook.duration}>
        <HookScene
          text="Stop typing calendar events manually"
          subtext="There's a better way"
          aspectRatio={aspectRatio}
        />
      </Sequence>

      <Sequence from={scenes.upload.start} durationInFrames={scenes.upload.duration}>
        <UploadComponent
          title="Just upload your syllabus"
          subtitle="Drop your document here"
          showFile={true}
          fileName="spring-2026-syllabus.pdf"
        />
      </Sequence>

      <Sequence from={scenes.processing.start} durationInFrames={scenes.processing.duration}>
        <ProcessingComponent
          title="AI does the work for you"
          maxEvents={18}
        />
      </Sequence>

      <Sequence from={scenes.results.start} durationInFrames={scenes.results.duration}>
        <ResultsTableComponent
          title="Every assignment extracted"
          events={[
            { title: "Essay 1 Due", date: "Mon, Feb 10", time: "11:59 PM" },
            { title: "Midterm Exam", date: "Wed, Mar 12", time: "2:00 PM", location: "Hall 204" },
            { title: "Group Project Due", date: "Fri, Apr 18", time: "11:59 PM" },
            { title: "Final Exam", date: "Mon, May 5", time: "9:00 AM", location: "Hall 204" },
          ]}
        />
      </Sequence>

      <Sequence from={scenes.benefit.start} durationInFrames={scenes.benefit.duration}>
        <HookScene
          text="Save hours every semester"
          subtext="Join thousands of students organizing smarter"
          aspectRatio={aspectRatio}
        />
      </Sequence>

      <Sequence from={scenes.cta.start} durationInFrames={scenes.cta.duration}>
        <CTAComponent
          headline="Never miss a deadline"
          subheadline="Start your free trial today"
          url="QuickCalAI.com"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
