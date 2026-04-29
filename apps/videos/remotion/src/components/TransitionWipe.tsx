import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "../design-tokens";

interface TransitionWipeProps {
  fromFrame: number;
  duration?: number;
}

export const TransitionWipe: React.FC<TransitionWipeProps> = ({
  fromFrame,
  duration = 15,
}) => {
  const frame = useCurrentFrame();
  useVideoConfig();

  const progress = interpolate(
    frame,
    [fromFrame, fromFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = interpolate(progress, [0, 0.5, 1], [0, 0.3, 0]);
  const scale = interpolate(progress, [0, 0.5, 1], [0.95, 1, 1.02]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: COLORS.background,
        opacity,
        transform: `scale(${scale})`,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
};
