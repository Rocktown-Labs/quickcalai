import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FileImage, FileText, Mail, Image } from "lucide-react";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { GradientBackground } from "../components/GradientBackground";
import { ParticleField } from "../components/ParticleField";
import { COLORS, TYPOGRAPHY, AspectRatio, ANIMATION } from "../design-tokens";
import { slideUpFadeIn, scaleIn } from "../animation-utils";

const { fontFamily } = loadFont();

interface ProblemSceneProps {
  aspectRatio?: AspectRatio;
}

const DocumentIcon: React.FC<{
  Icon: React.ElementType;
  frame: number;
  fps: number;
  index: number;
  centerX: number;
  centerY: number;
  scaleFactor: number;
}> = ({ Icon, frame, fps, index, centerX, centerY, scaleFactor }) => {
  const chaosDuration = 40;
  const settleDelay = 30 + index * 8;

  // Chaotic motion
  const chaosProgress = interpolate(frame, [0, chaosDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const angle = (index / 4) * Math.PI * 2 + chaosProgress * Math.PI;
  const radius = 120 + Math.sin(frame * 0.05 + index) * 40;

  const chaoticX = Math.cos(angle) * radius * (1 - chaosProgress * 0.3);
  const chaoticY = Math.sin(angle) * radius * (1 - chaosProgress * 0.3);
  const rotation = interpolate(frame, [0, chaosDuration], [index * 30 - 60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Settle into grid
  const settleProgress = spring({
    frame: frame - settleDelay,
    fps,
    config: ANIMATION.spring.bouncy,
  });

  const gridPositions = [
    { x: -140, y: -40 },
    { x: -40, y: -40 },
    { x: 60, y: -40 },
    { x: 160, y: -40 },
  ];

  const targetX = gridPositions[index].x * scaleFactor;
  const targetY = gridPositions[index].y * scaleFactor;

  const currentX = interpolate(settleProgress, [0, 1], [chaoticX, targetX], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentY = interpolate(settleProgress, [0, 1], [chaoticY, targetY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = scaleIn(frame, fps, settleDelay, 0.3);
  const opacity = interpolate(frame, [0, 15, 100, 120], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: centerX + currentX,
        top: centerY + currentY,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: Math.round(64 * scaleFactor),
          height: Math.round(64 * scaleFactor),
          borderRadius: 16,
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <Icon size={Math.round(28 * scaleFactor)} color={COLORS.primary} />
      </div>
    </div>
  );
};

export const ProblemScene: React.FC<ProblemSceneProps> = ({
  aspectRatio = "desktop",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isVertical = aspectRatio === "vertical";
  const isSquare = aspectRatio === "square";
  const scaleFactor = isVertical ? 0.65 : isSquare ? 0.8 : 1;

  const titleAnim = slideUpFadeIn(frame, fps, 0, 30);
  const subtitleAnim = slideUpFadeIn(frame, fps, 15, 20);

  const centerX = width / 2;
  const centerY = height * 0.55;

  const icons = [FileImage, Image, FileText, Mail];
  const labels = ["Receipts", "Screenshots", "Flyers", "Emails"];

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <GradientBackground aspectRatio={aspectRatio} />
      <ParticleField width={width} height={height} count={15} color={COLORS.primary} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: isVertical ? 40 : isSquare ? 60 : 100,
          paddingTop: isVertical ? 120 : isSquare ? 140 : 160,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            ...titleAnim,
            fontSize: Math.round(48 * scaleFactor),
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.foreground,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            maxWidth: "800px",
          }}
        >
          Your schedule is hiding everywhere
        </h2>

        <p
          style={{
            ...subtitleAnim,
            fontSize: Math.round(22 * scaleFactor),
            color: COLORS.muted,
            marginTop: 16,
            fontWeight: TYPOGRAPHY.fontWeight.medium,
          }}
        >
          Turn any document into calendar events instantly
        </p>

        <div style={{ position: "relative", width: "100%", height: "50%", marginTop: 40 }}>
          {icons.map((Icon, i) => (
            <DocumentIcon
              key={i}
              Icon={Icon}
              frame={frame}
              fps={fps}
              index={i}
              centerX={centerX}
              centerY={centerY}
              scaleFactor={scaleFactor}
            />
          ))}

          {/* Labels below icons */}
          {labels.map((label, i) => {
            const labelDelay = 50 + i * 6;
            const labelProgress = spring({
              frame: frame - labelDelay,
              fps,
              config: ANIMATION.spring.default,
            });
            const labelOpacity = labelProgress;

            const gridX = [-140, -40, 60, 160][i] * scaleFactor;

            return (
              <div
                key={`label-${i}`}
                style={{
                  position: "absolute",
                  left: centerX + gridX,
                  top: centerY + 50 * scaleFactor,
                  transform: "translate(-50%, 0)",
                  opacity: labelOpacity,
                  fontSize: Math.round(14 * scaleFactor),
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: COLORS.muted,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
