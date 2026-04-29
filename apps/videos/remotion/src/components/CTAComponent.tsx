import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TYPOGRAPHY } from "../design-tokens";
import { LogoSVG } from "../components/LogoSVG";
import { scaleIn, slideUpFadeIn } from "../animation-utils";

interface CTAComponentProps {
  headline?: string;
  subheadline?: string;
  url?: string;
}

export const CTAComponent: React.FC<CTAComponentProps> = ({
  headline = "Organize your life in seconds",
  subheadline = "Start your free trial today",
  url = "QuickCalAI.com",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoAnim = scaleIn(frame, fps, 10, 0.8);
  const { opacity: textOpacity, y: textY } = slideUpFadeIn(frame, fps, 30);
  const urlAnim = scaleIn(frame, fps, 50, 0.9);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ transform: `scale(${logoAnim})`, opacity: logoAnim, display: "flex", flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 80 }}>
        <LogoSVG size={80} color={COLORS.primary} />
        <h1 style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["7xl"], fontWeight: TYPOGRAPHY.fontWeight.black, color: COLORS.foreground, letterSpacing: "-0.02em" }}>
          QuickCalAI
        </h1>
      </div>

      <div style={{ opacity: textOpacity, transform: `translateY(${textY}px)`, marginBottom: 80 }}>
        <h2 style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["4xl"], fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.foreground, marginBottom: 24 }}>
          {headline}
        </h2>
        <p style={{ fontFamily: TYPOGRAPHY.fontFamily.serif, fontSize: TYPOGRAPHY.fontSize["2xl"], color: COLORS.muted, fontStyle: "italic" }}>
          {subheadline}
        </p>
      </div>

      <div style={{ transform: `scale(${urlAnim})`, opacity: urlAnim, backgroundColor: COLORS.primary, color: COLORS.foreground, padding: "32px 64px", borderRadius: 999, fontSize: TYPOGRAPHY.fontSize["4xl"], fontWeight: TYPOGRAPHY.fontWeight.black, boxShadow: "0 20px 60px rgba(194, 51, 38, 0.4)" }}>
        {url}
      </div>
    </AbsoluteFill>
  );
};
