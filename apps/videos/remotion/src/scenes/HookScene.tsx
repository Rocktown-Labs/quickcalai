import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { GradientBackground } from "../components/GradientBackground";
import { ParticleField } from "../components/ParticleField";
import { COLORS, TYPOGRAPHY, AspectRatio } from "../design-tokens";
import { slideUpFadeIn, blurFadeIn, scaleIn } from "../animation-utils";

const { fontFamily } = loadFont();
const { fontFamily: serifFamily } = loadInstrumentSerif();

interface HookSceneProps {
  aspectRatio?: AspectRatio;
}

export const HookScene: React.FC<HookSceneProps> = ({
  aspectRatio = "desktop",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isVertical = aspectRatio === "vertical";
  const isSquare = aspectRatio === "square";

  const scaleFactor = isVertical ? 0.6 : isSquare ? 0.75 : 1;
  const padding = isVertical ? 40 : isSquare ? 60 : 100;

  const titleSize = Math.round(72 * scaleFactor);
  const highlightSize = Math.round(80 * scaleFactor);

  const titleAnim = slideUpFadeIn(frame, fps, 6, 40);
  const highlightAnim = scaleIn(frame, fps, 20, 0.8);
  const sublineAnim = blurFadeIn(frame, fps, 40, 8);

  const glowOpacity = interpolate(frame, [0, 30, 90, 120], [0, 0.6, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <GradientBackground aspectRatio={aspectRatio} />
      <ParticleField width={width} height={height} count={25} color={COLORS.primary} />

      {/* Ambient glow behind text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: Math.min(width * 0.8, 1200),
          height: Math.min(height * 0.5, 600),
          background: `radial-gradient(ellipse, rgba(194,51,38,${glowOpacity * 0.15}) 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding,
          textAlign: "center",
          gap: 24,
        }}
      >
        <h1
          style={{
            ...titleAnim,
            fontSize: titleSize,
            fontWeight: TYPOGRAPHY.fontWeight.black,
            color: COLORS.foreground,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            maxWidth: isVertical ? "100%" : "900px",
          }}
        >
          Stop typing calendar events{" "}
          <span
            style={{
              opacity: highlightAnim,
              transform: `scale(${highlightAnim})`,
              display: "inline-block",
              fontFamily: serifFamily,
              fontStyle: "italic",
              fontWeight: TYPOGRAPHY.fontWeight.normal,
              fontSize: highlightSize,
              background: "linear-gradient(135deg, #c23326 0%, #e85a4f 60%, #ff7a6e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            manually
          </span>
        </h1>

        <p
          style={{
            ...sublineAnim,
            fontSize: Math.round(22 * scaleFactor),
            color: COLORS.muted,
            fontWeight: TYPOGRAPHY.fontWeight.medium,
            marginTop: 16,
            letterSpacing: "0.02em",
          }}
        >
          There&apos;s a better way
        </p>
      </div>
    </AbsoluteFill>
  );
};
