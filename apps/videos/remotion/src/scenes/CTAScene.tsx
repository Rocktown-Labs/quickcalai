import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { GradientBackground } from "../components/GradientBackground";
import { ParticleField } from "../components/ParticleField";
import { LogoSVG } from "../components/LogoSVG";
import { GlowEffect } from "../components/GlowEffect";
import { COLORS, TYPOGRAPHY, AspectRatio, ANIMATION } from "../design-tokens";
import { slideUpFadeIn, scaleIn, typewriter } from "../animation-utils";

const { fontFamily } = loadFont();
const { fontFamily: serifFamily } = loadInstrumentSerif();

interface CTASceneProps {
  aspectRatio?: AspectRatio;
}

export const CTAScene: React.FC<CTASceneProps> = ({
  aspectRatio = "desktop",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isVertical = aspectRatio === "vertical";
  const scaleFactor = isVertical ? 0.6 : 0.85;

  const logoDelay = 0;
  const textDelay = 20;
  const subDelay = 40;
  const urlDelay = 60;

  const logoScale = scaleIn(frame, fps, logoDelay, 0.6);
  const logoRotate = interpolate(
    spring({ frame: frame - logoDelay, fps, config: ANIMATION.spring.bouncy }),
    [0, 1],
    [-20, 0]
  );

  const headlineAnim = slideUpFadeIn(frame, fps, textDelay, 30);
  const sublineAnim = slideUpFadeIn(frame, fps, subDelay, 20);

  const urlScale = scaleIn(frame, fps, urlDelay, 0.7);
  const urlBounce = spring({
    frame: frame - urlDelay,
    fps,
    config: ANIMATION.spring.bouncy,
  });

  // Particle burst on enter
  const particleOpacity = interpolate(frame, [0, 20, 100, 120], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline typewriter effect
  const tagline = "Organize your life in seconds";
  const typedTagline = typewriter(frame, textDelay + 10, textDelay + 50, tagline);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <GradientBackground aspectRatio={aspectRatio} />
      <div style={{ opacity: particleOpacity }}>
        <ParticleField
          width={width}
          height={height}
          count={20}
          color={COLORS.primary}
        />
      </div>

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: Math.min(width * 0.7, 800),
          height: Math.min(height * 0.4, 500),
          background: `radial-gradient(ellipse, rgba(194,51,38,0.12) 0%, transparent 70%)`,
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
          padding: isVertical ? 40 : 60,
          textAlign: "center",
          gap: Math.round(24 * scaleFactor),
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
            opacity: logoScale,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: Math.round(16 * scaleFactor),
            marginBottom: Math.round(16 * scaleFactor),
          }}
        >
          <LogoSVG size={Math.round(100 * scaleFactor)} delay={logoDelay} />
          <h1
            style={{
              fontSize: Math.round(56 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.black,
              color: COLORS.foreground,
              letterSpacing: "-0.03em",
            }}
          >
            QuickCalAI
          </h1>
        </div>

        {/* Tagline */}
        <div style={{ ...headlineAnim, marginBottom: 8 }}>
          <h2
            style={{
              fontSize: Math.round(36 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: COLORS.foreground,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {typedTagline}
            <span
              style={{
                display: "inline-block",
                width: 3,
                height: Math.round(36 * scaleFactor),
                backgroundColor: COLORS.primary,
                marginLeft: 4,
                verticalAlign: "middle",
                opacity: frame % 30 < 15 ? 1 : 0,
              }}
            />
          </h2>
        </div>

        {/* Subheadline / CTA */}
        <div style={{ ...sublineAnim }}>
          <p
            style={{
              fontSize: Math.round(22 * scaleFactor),
              color: COLORS.muted,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
            }}
          >
            Start your{" "}
            <span
              style={{
                fontFamily: serifFamily,
                fontStyle: "italic",
                color: COLORS.primary,
                fontWeight: TYPOGRAPHY.fontWeight.normal,
              }}
            >
              Free Trial
            </span>{" "}
            today
          </p>
        </div>

        {/* URL pill */}
        <GlowEffect color={COLORS.primary} intensity={0.5} speed={1.5}>
          <div
            style={{
              transform: `scale(${urlScale})`,
              opacity: urlBounce,
              marginTop: Math.round(16 * scaleFactor),
              backgroundColor: COLORS.primary,
              color: "#fff",
              padding: `${Math.round(16 * scaleFactor)}px ${Math.round(40 * scaleFactor)}px`,
              borderRadius: 999,
              fontSize: Math.round(24 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.black,
              letterSpacing: "-0.01em",
              boxShadow: "0 12px 40px rgba(194,51,38,0.4)",
            }}
          >
            QuickCalAI.com
          </div>
        </GlowEffect>

        {/* Trust badges */}
        <div
          style={{
            opacity: spring({
              frame: frame - 90,
              fps,
              config: ANIMATION.spring.default,
            }),
            display: "flex",
            gap: Math.round(20 * scaleFactor),
            marginTop: Math.round(16 * scaleFactor),
          }}
        >
          {["No credit card", "Cancel anytime"].map((text) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: Math.round(12 * scaleFactor),
                color: COLORS.muted,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  backgroundColor: COLORS.success,
                }}
              />
              {text}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
