import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { GradientBackground } from "../components/GradientBackground";
import { ParticleField } from "../components/ParticleField";
import { COLORS, TYPOGRAPHY, AspectRatio, GRADIENTS } from "../design-tokens";
import { slideUpFadeIn, scaleIn, blurFadeIn } from "../animation-utils";

const { fontFamily } = loadFont();
const { fontFamily: serifFamily } = loadInstrumentSerif();

interface HookSceneBProps {
  aspectRatio?: AspectRatio;
  isLight?: boolean;
}

export const HookSceneB: React.FC<HookSceneBProps> = ({
  aspectRatio = "desktop",
  isLight = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const theme = isLight ? {
    bg: "#ffffff",
    fg: "#111111",
    muted: "#666666",
    particle: "#c23326",
  } : {
    bg: COLORS.background,
    fg: COLORS.foreground,
    muted: COLORS.muted,
    particle: COLORS.primary,
  };

  const isVertical = aspectRatio === "vertical";
  const isSquare = aspectRatio === "square";
  const scaleFactor = isVertical ? 0.72 : isSquare ? 0.85 : 1;
  const padding = isVertical ? 40 : isSquare ? 60 : 100;

  const titleSize = Math.round(68 * scaleFactor);
  const sublineSize = Math.round(22 * scaleFactor);

  const titleAnim = slideUpFadeIn(frame, fps, 5, 35);
  const highlightAnim = scaleIn(frame, fps, 18, 0.85);
  const sublineAnim = blurFadeIn(frame, fps, 35, 8);

  const glowOpacity = interpolate(frame, [0, 25, 110, 135], [0, 0.5, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <GradientBackground aspectRatio={aspectRatio} />
      <ParticleField width={width} height={height} count={20} color={theme.particle} />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: Math.min(width * 0.8, 1000),
          height: Math.min(height * 0.45, 500),
          background: `radial-gradient(ellipse, rgba(194,51,38,${glowOpacity * 0.12}) 0%, transparent 70%)`,
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
          gap: 20,
        }}
      >
        <h1
          style={{
            ...titleAnim,
            fontSize: titleSize,
            fontWeight: TYPOGRAPHY.fontWeight.black,
            color: theme.fg,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            maxWidth: isVertical ? "90%" : "800px",
          }}
        >
          Your schedule is hiding in your{" "}
          <span
            style={{
              opacity: highlightAnim,
              transform: `scale(${highlightAnim})`,
              display: "inline-block",
              fontFamily: serifFamily,
              fontStyle: "italic",
              fontWeight: TYPOGRAPHY.fontWeight.normal,
              background: GRADIENTS.textHighlight,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            photos
          </span>
        </h1>

        <p
          style={{
            ...sublineAnim,
            fontSize: sublineSize,
            color: theme.muted,
            fontWeight: TYPOGRAPHY.fontWeight.medium,
            marginTop: 12,
            letterSpacing: "0.02em",
          }}
        >
          QuickCalAI finds it in seconds
        </p>
      </div>
    </AbsoluteFill>
  );
};
