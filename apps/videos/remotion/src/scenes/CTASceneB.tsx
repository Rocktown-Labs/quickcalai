import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { GradientBackground } from "../components/GradientBackground";
import { ParticleField } from "../components/ParticleField";
import { LogoSVG } from "../components/LogoSVG";
import { GlowEffect } from "../components/GlowEffect";
import { COLORS, LIGHT_COLORS, TYPOGRAPHY, AspectRatio, TRUST, ANIMATION } from "../design-tokens";
import { slideUpFadeIn, scaleIn, typewriter } from "../animation-utils";

const { fontFamily } = loadFont();
loadInstrumentSerif();

interface CTASceneBProps {
  aspectRatio?: AspectRatio;
  isLight?: boolean;
}

export const CTASceneB: React.FC<CTASceneBProps> = ({
  aspectRatio = "desktop",
  isLight = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const theme = isLight ? LIGHT_COLORS : COLORS;

  const isVertical = aspectRatio === "vertical";
  const isSquare = aspectRatio === "square";
  const scaleFactor = isVertical ? 0.62 : isSquare ? 0.78 : 1;

  const logoDelay = 0;
  const textDelay = 18;
  const subDelay = 35;
  const urlDelay = 55;

  const logoScale = scaleIn(frame, fps, logoDelay, 0.55);
  const logoRotate = interpolate(
    spring({ frame: frame - logoDelay, fps, config: ANIMATION.spring.bouncy }),
    [0, 1],
    [-18, 0]
  );

  const headlineAnim = slideUpFadeIn(frame, fps, textDelay, 25);
  const sublineAnim = slideUpFadeIn(frame, fps, subDelay, 20);

  const urlScale = scaleIn(frame, fps, urlDelay, 0.65);
  const urlBounce = spring({
    frame: frame - urlDelay,
    fps,
    config: ANIMATION.spring.bouncy,
  });

  const trustBadgeSpring = spring({
    frame: frame - 85,
    fps,
    config: ANIMATION.spring.bouncy,
  });

  const tagline = "Organize your life in seconds";
  const typedTagline = typewriter(frame, textDelay + 8, textDelay + 45, tagline);

  const particleOpacity = interpolate(frame, [0, 15, 100, 120], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <GradientBackground aspectRatio={aspectRatio} />
      <div style={{ opacity: particleOpacity }}>
        <ParticleField width={width} height={height} count={18} color={theme.primary} />
      </div>

      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: Math.min(width * 0.65, 700),
          height: Math.min(height * 0.35, 400),
          background: `radial-gradient(ellipse, rgba(194,51,38,0.1) 0%, transparent 70%)`,
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
          padding: isVertical ? 36 : isSquare ? 56 : 100,
          textAlign: "center",
          gap: Math.round(18 * scaleFactor),
        }}
      >
        {/* Logo + Brand Name */}
        <div
          style={{
            transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
            opacity: logoScale,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: Math.round(14 * scaleFactor),
            marginBottom: Math.round(8 * scaleFactor),
          }}
        >
          <LogoSVG size={Math.round(64 * scaleFactor)} color={theme.primary} delay={logoDelay} />
          <h1
            style={{
              fontSize: Math.round(48 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.black,
              color: theme.foreground,
              letterSpacing: "-0.03em",
            }}
          >
            QuickCalAI
          </h1>
        </div>

        {/* Tagline with typewriter */}
        <div style={{ ...headlineAnim, marginBottom: 4 }}>
          <h2
            style={{
              fontSize: Math.round(30 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: theme.foreground,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}
          >
            {typedTagline}
            <span
              style={{
                display: "inline-block",
                width: 3,
                height: Math.round(30 * scaleFactor),
                backgroundColor: theme.primary,
                marginLeft: 4,
                verticalAlign: "middle",
                opacity: frame % 30 < 15 ? 1 : 0,
              }}
            />
          </h2>
        </div>

        {/* Subheadline */}
        <div style={{ ...sublineAnim }}>
          <p
            style={{
              fontSize: Math.round(18 * scaleFactor),
              color: theme.muted,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
            }}
          >
            Get started free{" "}
            <span style={{ color: theme.muted, opacity: 0.7 }}>
              no credit card
            </span>
          </p>
        </div>

        {/* Trust badge — GREEN */}
        <div
          style={{
            transform: `scale(${trustBadgeSpring})`,
            opacity: trustBadgeSpring,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: `${Math.round(6 * scaleFactor)}px ${Math.round(14 * scaleFactor)}px`,
            backgroundColor: TRUST.badgeBg,
            border: `1px solid ${TRUST.badgeBorder}`,
            borderRadius: 100,
            marginTop: Math.round(4 * scaleFactor),
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: TRUST.green,
            }}
          />
          <span
            style={{
              fontSize: Math.round(12 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: TRUST.greenDark,
            }}
          >
            Join 500+ users
          </span>
        </div>

        {/* URL pill */}
        <GlowEffect color={theme.primary} intensity={0.5} speed={1.5}>
          <div
            style={{
              transform: `scale(${urlScale})`,
              opacity: urlBounce,
              marginTop: Math.round(10 * scaleFactor),
              backgroundColor: theme.primary,
              color: "#fff",
              padding: `${Math.round(14 * scaleFactor)}px ${Math.round(36 * scaleFactor)}px`,
              borderRadius: 999,
              fontSize: Math.round(20 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.black,
              letterSpacing: "-0.01em",
              boxShadow: "0 12px 40px rgba(194,51,38,0.4)",
            }}
          >
            QuickCalAI.com
          </div>
        </GlowEffect>
      </div>
    </AbsoluteFill>
  );
};
