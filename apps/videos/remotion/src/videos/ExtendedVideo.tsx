import { AbsoluteFill, Sequence } from "remotion";
import { UploadComponent, ProcessingComponent, ResultsTableComponent, ExportOptionsComponent, CTAComponent } from "../components";
import { HookScene } from "./scenes/HookScene";

/**
 * Extended Product Video - Comprehensive 90-second explainer
 * Combines best elements from all hooks
 * Desktop only (16:9) for YouTube and website hero
 */
export const ExtendedVideo: React.FC = () => {
  const scenes = {
    hook: { start: 0, duration: 150 },           // 0-5s: Magic moment
    problem: { start: 150, duration: 300 },      // 5-15s: Pain points
    solution: { start: 450, duration: 450 },     // 15-30s: Upload demo
    processing: { start: 900, duration: 450 },   // 30-45s: AI processing
    results: { start: 1350, duration: 450 },     // 45-60s: Results & features
    export: { start: 1800, duration: 300 },      // 60-70s: Export options
    social: { start: 2100, duration: 300 },      // 70-80s: Social proof
    cta: { start: 2400, duration: 300 },         // 80-90s: Strong CTA
  };

  return (
    <AbsoluteFill>
      <Sequence from={scenes.hook.start} durationInFrames={scenes.hook.duration}>
        <HookScene text="Image to calendar in seconds" subheadline="Watch this transformation" aspectRatio="desktop" />
      </Sequence>

      <Sequence from={scenes.problem.start} durationInFrames={scenes.problem.duration}>
        <HookScene text="Tired of typing calendar events manually?" subheadline="Sports schedules, syllabi, meeting agendas, event flyers" aspectRatio="desktop" />
      </Sequence>

      <Sequence from={scenes.solution.start} durationInFrames={scenes.solution.duration}>
        <UploadComponent title="Just upload any schedule" subtitle="Works with images and PDFs" showFile={true} fileName="schedule.jpg" />
      </Sequence>

      <Sequence from={scenes.processing.start} durationInFrames={scenes.processing.duration}>
        <ProcessingComponent title="AI extracts every detail" maxEvents={18} />
      </Sequence>

      <Sequence from={scenes.results.start} durationInFrames={scenes.results.duration}>
        <ResultsTableComponent
          title="Review, edit, and organize"
          events={[
            { title: "Soccer Practice", date: "Mon, May 5", time: "4:00 PM", location: "Field 3" },
            { title: "Team Meeting", date: "Wed, May 7", time: "6:00 PM", location: "Clubhouse" },
            { title: "Game vs Eagles", date: "Sat, May 10", time: "10:00 AM", location: "Stadium" },
            { title: "Assignment Due", date: "Mon, May 12", time: "11:59 PM" },
          ]}
        />
      </Sequence>

      <Sequence from={scenes.export.start} durationInFrames={scenes.export.duration}>
        <ExportOptionsComponent title="Download or share instantly" subtitle="Email, SMS, or .ics file" showSuccess={true} />
      </Sequence>

      <Sequence from={scenes.social.start} durationInFrames={scenes.social.duration}>
        <HookScene text="Join thousands organizing smarter" subheadline="Free to start • No credit card required" aspectRatio="desktop" />
      </Sequence>

      <Sequence from={scenes.cta.start} durationInFrames={scenes.cta.duration}>
        <CTAComponent headline="Never miss an event again" subheadline="Start your free trial today" url="QuickCalAI.com" />
      </Sequence>
    </AbsoluteFill>
  );
};
