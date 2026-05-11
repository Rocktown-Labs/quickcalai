import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TYPOGRAPHY, AspectRatio } from "../../design-tokens";
import { slideUpFadeIn, fadeIn } from "../../animation-utils";

interface HookSceneProps {
  text: string;
  subtext?: string;
  subheadline?: string;
  aspectRatio?: AspectRatio;
}

/**
 * Reusable hook scene for video openings
 * Displays bold text with optional subtext
 */
export const HookScene: React.FC<HookSceneProps> = ({
  text,
  subtext,
  subheadline,
  aspectRatio = "desktop",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { opacity: textOpacity, y: textY } = slideUpFadeIn(frame, fps, 0, 30);
  const subtextAnim = fadeIn(frame, fps, 20);

  const displaySubtext = subtext ?? subheadline;

  const fontSize = aspectRatio === "vertical" ? TYPOGRAPHY.fontSize["7xl"] : aspectRatio === "square" ? TYPOGRAPHY.fontSize["8xl"] : TYPOGRAPHY.fontSize["9xl"];
  const subtextSize = aspectRatio === "vertical" ? TYPOGRAPHY.fontSize["2xl"] : aspectRatio === "square" ? TYPOGRAPHY.fontSize["3xl"] : TYPOGRAPHY.fontSize["4xl"];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, textAlign: "center" }}>
      <h1 style={{ opacity: textOpacity, transform: `translateY(${textY}px)`, fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize, fontWeight: TYPOGRAPHY.fontWeight.black, color: COLORS.foreground, letterSpacing: "-0.02em", lineHeight: 1.1, maxWidth: "90%" }}>
        {text}
      </h1>

      {displaySubtext && (
        <p style={{ opacity: subtextAnim, fontFamily: TYPOGRAPHY.fontFamily.serif, fontSize: subtextSize, color: COLORS.muted, fontStyle: "italic", marginTop: 40 }}>
          {displaySubtext}
        </p>
      )}
    </AbsoluteFill>
  );
};
