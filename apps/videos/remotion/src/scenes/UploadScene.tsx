import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Upload, Sparkles, FileImage, Zap } from "lucide-react";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { GradientBackground } from "../components/GradientBackground";

import { COLORS, TYPOGRAPHY, AspectRatio, ANIMATION } from "../design-tokens";
import { slideUpFadeIn, scaleIn } from "../animation-utils";

const { fontFamily } = loadFont();

interface UploadSceneProps {
  aspectRatio?: AspectRatio;
}

export const UploadScene: React.FC<UploadSceneProps> = ({
  aspectRatio = "desktop",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isVertical = aspectRatio === "vertical";
  const isSquare = aspectRatio === "square";
  const scaleFactor = isVertical ? 0.7 : isSquare ? 0.85 : 1;

  const titleAnim = slideUpFadeIn(frame, fps, 0, 30);
  const cardAnim = scaleIn(frame, fps, 10, 0.92);
  const dropzoneAnim = scaleIn(frame, fps, 20, 0.95);

  // File card entrance
  const fileDelay = 50;
  const fileProgress = spring({
    frame: frame - fileDelay,
    fps,
    config: ANIMATION.spring.bouncy,
  });
  const fileY = interpolate(fileProgress, [0, 1], [60, 0]);
  const fileOpacity = fileProgress;

  // Border glow animation when file drops
  const glowProgress = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const borderColor = interpolate(
    glowProgress,
    [0, 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <GradientBackground aspectRatio={aspectRatio} />

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
          padding: isVertical ? 32 : isSquare ? 48 : 80,
        }}
      >
        {/* App header bar */}
        <div
          style={{
            ...titleAnim,
            width: "100%",
            maxWidth: Math.round(800 * scaleFactor),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: Math.round(40 * scaleFactor),
            padding: "12px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: COLORS.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <span
              style={{
                fontSize: Math.round(18 * scaleFactor),
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: COLORS.foreground,
              }}
            >
              QuickCalAI
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Dashboard", "Settings"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  backgroundColor: COLORS.card,
                  fontSize: Math.round(12 * scaleFactor),
                  color: COLORS.muted,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Main card */}
        <div
          style={{
            opacity: cardAnim,
            transform: `scale(${cardAnim})`,
            width: "100%",
            maxWidth: Math.round(800 * scaleFactor),
            backgroundColor: COLORS.card,
            borderRadius: 20,
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            padding: Math.round(32 * scaleFactor),
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: Math.round(24 * scaleFactor),
            }}
          >
            <Sparkles size={Math.round(22 * scaleFactor)} color={COLORS.primary} />
            <span
              style={{
                fontSize: Math.round(18 * scaleFactor),
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                color: COLORS.foreground,
              }}
            >
              AI Calendar Extraction
            </span>
          </div>

          {/* Drop zone */}
          <div
            style={{
              opacity: dropzoneAnim,
              transform: `scale(${dropzoneAnim})`,
              border: `2px dashed ${borderColor > 0.5 ? COLORS.primary : COLORS.border}`,
              borderRadius: 16,
              padding: Math.round(48 * scaleFactor),
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: Math.round(16 * scaleFactor),
              backgroundColor: borderColor > 0.5 ? `${COLORS.primary}08` : "transparent",
            }}
          >
            <Upload
              size={Math.round(40 * scaleFactor)}
              color={borderColor > 0.5 ? COLORS.primary : COLORS.muted}
            />
            <p
              style={{
                fontSize: Math.round(20 * scaleFactor),
                fontWeight: TYPOGRAPHY.fontWeight.medium,
                color: COLORS.foreground,
              }}
            >
              Drop your document here
            </p>
            <p
              style={{
                fontSize: Math.round(14 * scaleFactor),
                color: COLORS.muted,
              }}
            >
              Supports JPEG, PNG, WebP, and PDF
            </p>

            {/* File card that appears */}
            <div
              style={{
                opacity: fileOpacity,
                transform: `translateY(${fileY}px)`,
                display: "flex",
                alignItems: "center",
                gap: Math.round(16 * scaleFactor),
                backgroundColor: COLORS.background,
                padding: Math.round(16 * scaleFactor),
                borderRadius: 12,
                border: `2px solid ${COLORS.primary}`,
                width: "100%",
                maxWidth: Math.round(500 * scaleFactor),
                marginTop: Math.round(8 * scaleFactor),
              }}
            >
              <div
                style={{
                  width: Math.round(48 * scaleFactor),
                  height: Math.round(48 * scaleFactor),
                  borderRadius: 10,
                  backgroundColor: COLORS.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FileImage size={Math.round(24 * scaleFactor)} color="#fff" />
              </div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <p
                  style={{
                    fontSize: Math.round(16 * scaleFactor),
                    fontWeight: TYPOGRAPHY.fontWeight.semibold,
                    color: COLORS.foreground,
                  }}
                >
                  soccer-schedule.jpg
                </p>
                <p
                  style={{
                    fontSize: Math.round(13 * scaleFactor),
                    color: COLORS.muted,
                  }}
                >
                  Ready to process
                </p>
              </div>
              <div
                style={{
                  padding: `${Math.round(8 * scaleFactor)}px ${Math.round(16 * scaleFactor)}px`,
                  backgroundColor: COLORS.primary,
                  borderRadius: 8,
                  fontSize: Math.round(14 * scaleFactor),
                  fontWeight: TYPOGRAPHY.fontWeight.bold,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <Zap size={Math.round(14 * scaleFactor)} />
                Extract
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
