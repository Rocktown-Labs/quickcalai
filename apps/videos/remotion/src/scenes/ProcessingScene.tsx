import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Zap, FileImage, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { GradientBackground } from "../components/GradientBackground";
import { GlowEffect } from "../components/GlowEffect";
import { COLORS, TYPOGRAPHY, AspectRatio, ANIMATION } from "../design-tokens";
import { animateProgress, animateCounter, slideUpFadeIn, staggeredSlideUp } from "../animation-utils";

const { fontFamily } = loadFont();

interface ProcessingSceneProps {
  aspectRatio?: AspectRatio;
}

const steps = [
  { label: "Analyzing image", icon: FileImage },
  { label: "Detecting dates & times", icon: Sparkles },
  { label: "Extracting event details", icon: Zap },
  { label: "Formatting calendar data", icon: CheckCircle2 },
];

export const ProcessingScene: React.FC<ProcessingSceneProps> = ({
  aspectRatio = "desktop",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isVertical = aspectRatio === "vertical";
  const scaleFactor = isVertical ? 0.68 : 0.85;

  const titleAnim = slideUpFadeIn(frame, fps, 0, 30);
  const bannerAnim = slideUpFadeIn(frame, fps, 10, 20);
  const progressAnim = slideUpFadeIn(frame, fps, 20, 20);

  const progress = animateProgress(frame, 30, 140);
  const eventCount = animateCounter(frame, 60, 130, 0, 12);

  const currentStep = progress < 25 ? 0 : progress < 50 ? 1 : progress < 75 ? 2 : 3;

  // Shimmer effect for progress bar
  const shimmerX = interpolate((frame * 0.8) % fps, [0, fps], [-200, 600]);

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
          padding: isVertical ? 32 : 50,
        }}
      >
        <h2
          style={{
            ...titleAnim,
            fontSize: Math.round(42 * scaleFactor),
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            color: COLORS.foreground,
            textAlign: "center",
            marginBottom: Math.round(24 * scaleFactor),
            letterSpacing: "-0.02em",
          }}
        >
          AI extracts every detail instantly
        </h2>

        {/* Processing banner */}
        <GlowEffect color={COLORS.primary} intensity={0.5} speed={2}>
          <div
            style={{
              ...bannerAnim,
              width: "100%",
              maxWidth: Math.round(720 * scaleFactor),
              backgroundColor: COLORS.primary,
              color: "#fff",
              padding: `${Math.round(18 * scaleFactor)}px ${Math.round(28 * scaleFactor)}px`,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: Math.round(12 * scaleFactor),
               marginBottom: Math.round(16 * scaleFactor),
            }}
          >
            <Zap size={Math.round(24 * scaleFactor)} />
            <span
              style={{
                fontSize: Math.round(18 * scaleFactor),
                fontWeight: TYPOGRAPHY.fontWeight.bold,
              }}
            >
              Processing document with AI...
            </span>

          </div>
        </GlowEffect>

        {/* Progress bar */}
        <div
          style={{
            ...progressAnim,
            width: "100%",
            maxWidth: Math.round(720 * scaleFactor),
            marginBottom: Math.round(16 * scaleFactor),
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: Math.round(14 * scaleFactor),
                color: COLORS.muted,
                fontWeight: TYPOGRAPHY.fontWeight.medium,
              }}
            >
              Processing...
            </span>
            <span
              style={{
                fontSize: Math.round(14 * scaleFactor),
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                color: COLORS.primary,
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 8,
              backgroundColor: COLORS.border,
              borderRadius: 999,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                backgroundColor: COLORS.primary,
                borderRadius: 999,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Shimmer overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: shimmerX,
                  width: 100,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div
          style={{
            width: "100%",
            maxWidth: Math.round(720 * scaleFactor),
            display: "flex",
            flexDirection: "column",
            gap: Math.round(8 * scaleFactor),
            marginBottom: Math.round(16 * scaleFactor),
          }}
        >
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const StepIcon = step.icon;
            const stepAnim = staggeredSlideUp(frame, fps, index, 5, 20);

            return (
              <div
                key={index}
                style={{
                  ...stepAnim,
                  display: "flex",
                  alignItems: "center",
                  gap: Math.round(12 * scaleFactor),
                  padding: `${Math.round(12 * scaleFactor)}px ${Math.round(16 * scaleFactor)}px`,
                  borderRadius: 10,
                  backgroundColor: isCurrent ? `${COLORS.primary}11` : "transparent",
                  border: isCurrent
                    ? `2px solid ${COLORS.primary}44`
                    : "2px solid transparent",
                }}
              >
                <div
                  style={{
                    width: Math.round(32 * scaleFactor),
                    height: Math.round(32 * scaleFactor),
                    borderRadius: 8,
                    backgroundColor: isComplete
                      ? COLORS.success
                      : isCurrent
                        ? COLORS.primary
                        : COLORS.card,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isComplete ? (
                    <CheckCircle2
                      size={Math.round(16 * scaleFactor)}
                      color="#fff"
                    />
                  ) : (
                    <StepIcon
                      size={Math.round(16 * scaleFactor)}
                      color={isCurrent ? "#fff" : COLORS.muted}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: Math.round(15 * scaleFactor),
                    fontWeight: isCurrent
                      ? TYPOGRAPHY.fontWeight.semibold
                      : TYPOGRAPHY.fontWeight.normal,
                    color:
                      isComplete || isCurrent
                        ? COLORS.foreground
                        : COLORS.muted,
                    flex: 1,
                  }}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <Loader2
                    size={Math.round(16 * scaleFactor)}
                    color={COLORS.primary}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
                {isComplete && (
                  <span
                    style={{
                      fontSize: Math.round(11 * scaleFactor),
                      color: COLORS.success,
                      fontWeight: TYPOGRAPHY.fontWeight.medium,
                    }}
                  >
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Event counter */}
        <div
          style={{
            opacity: spring({
              frame: frame - 80,
              fps,
              config: ANIMATION.spring.bouncy,
            }),
            transform: `scale(${spring({
              frame: frame - 80,
              fps,
              config: ANIMATION.spring.bouncy,
            })})`,
            width: "100%",
            maxWidth: Math.round(720 * scaleFactor),
            backgroundColor: COLORS.card,
            padding: Math.round(20 * scaleFactor),
            borderRadius: 16,
            textAlign: "center",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              fontSize: Math.round(72 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.black,
              color: COLORS.primary,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {eventCount}
          </div>
          <div
            style={{
              fontSize: Math.round(16 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              color: COLORS.muted,
              marginTop: 8,
            }}
          >
            Events Detected
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
