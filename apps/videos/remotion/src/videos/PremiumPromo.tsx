import { AbsoluteFill, Sequence } from "remotion";
import { AspectRatio } from "../design-tokens";
import { TransitionWipe } from "../components/TransitionWipe";
import {
  HookScene,
  ProblemScene,
  UploadScene,
  ProcessingScene,
  ResultsScene,
  CTAScene,
} from "../scenes";

interface PremiumPromoProps {
  aspectRatio?: AspectRatio;
}

/**
 * Premium "Introducing QuickCalAI" Promotional Video
 * Duration: ~26 seconds (tight cuts)
 */
export const PremiumPromo: React.FC<PremiumPromoProps> = ({
  aspectRatio = "desktop",
}) => {
  const scenes = {
    hook: { start: 0, duration: 105 },
    problem: { start: 95, duration: 105 },
    upload: { start: 190, duration: 120 },
    processing: { start: 305, duration: 165 },
    results: { start: 465, duration: 135 },
    cta: { start: 595, duration: 105 },
  };

  const transitions = [
    scenes.hook.start + scenes.hook.duration,
    scenes.problem.start + scenes.problem.duration,
    scenes.upload.start + scenes.upload.duration,
    scenes.processing.start + scenes.processing.duration,
    scenes.results.start + scenes.results.duration,
  ];

  return (
    <AbsoluteFill>
      <Sequence from={scenes.hook.start} durationInFrames={scenes.hook.duration}>
        <HookScene aspectRatio={aspectRatio} />
      </Sequence>

      <Sequence from={scenes.problem.start} durationInFrames={scenes.problem.duration}>
        <ProblemScene aspectRatio={aspectRatio} />
      </Sequence>

      <Sequence from={scenes.upload.start} durationInFrames={scenes.upload.duration}>
        <UploadScene aspectRatio={aspectRatio} />
      </Sequence>

      <Sequence from={scenes.processing.start} durationInFrames={scenes.processing.duration}>
        <ProcessingScene aspectRatio={aspectRatio} />
      </Sequence>

      <Sequence from={scenes.results.start} durationInFrames={scenes.results.duration}>
        <ResultsScene aspectRatio={aspectRatio} />
      </Sequence>

      <Sequence from={scenes.cta.start} durationInFrames={scenes.cta.duration}>
        <CTAScene aspectRatio={aspectRatio} />
      </Sequence>

      {transitions.map((frame, i) => (
        <TransitionWipe key={i} fromFrame={frame} duration={10} />
      ))}
    </AbsoluteFill>
  );
};
