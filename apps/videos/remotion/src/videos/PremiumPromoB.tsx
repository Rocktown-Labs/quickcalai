import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { AspectRatio } from "../design-tokens";
import { TransitionWipe } from "../components/TransitionWipe";
import { HookSceneB, ResultsSceneB, CTASceneB } from "../scenes";

interface PremiumPromoBProps {
  aspectRatio?: AspectRatio;
}

/**
 * Variation B — "Your Schedule Is Hiding in Your Photos"
 * 15 seconds, tight cuts, zero dead air
 */
export const PremiumPromoB: React.FC<PremiumPromoBProps> = ({
  aspectRatio = "desktop",
}) => {
  const scenes = {
    hook: { start: 0, duration: 135 },
    results: { start: 125, duration: 140 },
    cta: { start: 260, duration: 140 },
  };

  const transitions = [
    scenes.hook.start + scenes.hook.duration,
    scenes.results.start + scenes.results.duration,
  ];

  return (
    <AbsoluteFill>
      <Audio
        src={staticFile("assets/music-placeholder.mp3")}
        startFrom={0}
        endAt={400}
        volume={0.5}
      />

      <Sequence from={scenes.hook.start} durationInFrames={scenes.hook.duration}>
        <HookSceneB aspectRatio={aspectRatio} isLight={false} />
      </Sequence>

      <Sequence from={scenes.results.start} durationInFrames={scenes.results.duration}>
        <ResultsSceneB aspectRatio={aspectRatio} isLight={false} />
      </Sequence>

      <Sequence from={scenes.cta.start} durationInFrames={scenes.cta.duration}>
        <CTASceneB aspectRatio={aspectRatio} isLight={false} />
      </Sequence>

      {transitions.map((frame, i) => (
        <TransitionWipe key={i} fromFrame={frame} duration={10} />
      ))}
    </AbsoluteFill>
  );
};
