import { useCurrentFrame, useVideoConfig } from "remotion";
import { glowPulse } from "../animation-utils";
import { COLORS } from "../design-tokens";

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  speed?: number;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  children,
  color = COLORS.primary,
  intensity = 0.4,
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = glowPulse(frame, fps, speed);
  const opacity = intensity * pulse;

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: -20,
          background: `radial-gradient(circle, ${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          filter: "blur(40px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};
