import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Zap, Sparkles, FileImage, CheckCircle2, Loader2 } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "../design-tokens";
import { fadeIn, animateCounter, animateProgress, pulse } from "../animation-utils";

interface ProcessingComponentProps {
  title?: string;
  maxEvents?: number;
}

export const ProcessingComponent: React.FC<ProcessingComponentProps> = ({
  title = "AI extracts details instantly",
  maxEvents = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleAnim = fadeIn(frame, fps, 0);
  const fileCardAnim = fadeIn(frame, fps, 10);
  const progressAnim = fadeIn(frame, fps, 20);
  const stepsAnim = fadeIn(frame, fps, 30);
  const counterAnim = fadeIn(frame, fps, 40);

  const progress = animateProgress(frame, 30, 120);
  const eventCount = animateCounter(frame, 40, 110, 0, maxEvents);
  const pulseScale = pulse(frame, fps, 2);

  const currentStep = progress < 30 ? 0 : progress < 60 ? 1 : progress < 90 ? 2 : 3;

  const steps = [
    { label: "Analyzing image", icon: FileImage },
    { label: "Detecting dates & times", icon: Sparkles },
    { label: "Extracting event details", icon: Zap },
    { label: "Formatting calendar data", icon: CheckCircle2 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ opacity: titleAnim, fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["5xl"], fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.foreground, textAlign: "center", marginBottom: 80 }}>
        {title}
      </h2>

      {/* File being processed */}
      <div style={{ opacity: fileCardAnim, width: "100%", maxWidth: 800, backgroundColor: COLORS.card, padding: 32, borderRadius: 20, border: `2px solid ${COLORS.border}`, marginBottom: 40, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 80, height: 80, backgroundColor: COLORS.primary, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FileImage size={40} color={COLORS.foreground} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["2xl"], fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.foreground, marginBottom: 4 }}>
            soccer-schedule.jpg
          </div>
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.muted }}>
            Processing with AI...
          </div>
        </div>
        <div style={{ transform: `scale(${pulseScale})` }}>
          <Loader2 size={32} color={COLORS.primary} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      </div>

      {/* AI Processing Banner */}
      <div style={{ opacity: progressAnim, width: "100%", maxWidth: 800, backgroundColor: COLORS.primary, color: COLORS.foreground, padding: 24, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 32, boxShadow: "0 10px 40px rgba(194, 51, 38, 0.3)" }}>
        <Zap size={28} color={COLORS.foreground} style={{ transform: `scale(${pulseScale})` }} />
        <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["2xl"], fontWeight: TYPOGRAPHY.fontWeight.bold }}>
          AI Processing in Progress
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ opacity: progressAnim, width: "100%", maxWidth: 800, marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.muted }}>
            Processing...
          </span>
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.primary }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ width: "100%", height: 12, backgroundColor: COLORS.border, borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, backgroundColor: COLORS.primary, borderRadius: 999 }} />
        </div>
      </div>

      {/* Processing Steps */}
      <div style={{ opacity: stepsAnim, width: "100%", maxWidth: 800, display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const StepIcon = step.icon;

          return (
            <div key={index} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, backgroundColor: isCurrent ? `${COLORS.primary}11` : "transparent", borderRadius: 12, border: isCurrent ? `2px solid ${COLORS.primary}44` : "2px solid transparent" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: isComplete ? COLORS.success : isCurrent ? COLORS.primary : COLORS.card, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isComplete ? (
                  <CheckCircle2 size={24} color={COLORS.foreground} />
                ) : (
                  <StepIcon size={24} color={isCurrent ? COLORS.foreground : COLORS.muted} />
                )}
              </div>
              <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: isCurrent ? TYPOGRAPHY.fontWeight.semibold : TYPOGRAPHY.fontWeight.normal, color: isComplete || isCurrent ? COLORS.foreground : COLORS.muted }}>
                {step.label}
              </span>
              {isCurrent && (
                <div style={{ marginLeft: "auto" }}>
                  <Loader2 size={20} color={COLORS.primary} style={{ animation: "spin 1s linear infinite" }} />
                </div>
              )}
              {isComplete && (
                <span style={{ marginLeft: "auto", fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.success }}>
                  ✓ Complete
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Event Counter */}
      <div style={{ opacity: counterAnim, width: "100%", maxWidth: 800, backgroundColor: COLORS.card, padding: 40, borderRadius: 24, textAlign: "center", border: `2px solid ${COLORS.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["9xl"], fontWeight: TYPOGRAPHY.fontWeight.black, color: COLORS.primary, lineHeight: 1 }}>
          {eventCount}
        </div>
        <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["2xl"], fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.muted, marginTop: 12 }}>
          Events Detected
        </div>
      </div>
    </AbsoluteFill>
  );
};
