import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { Calendar, Clock, MapPin, CheckCircle, Download } from "lucide-react";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { GradientBackground } from "../components/GradientBackground";
import { GlowEffect } from "../components/GlowEffect";
import { COLORS, LIGHT_COLORS, TYPOGRAPHY, AspectRatio, TRUST, ANIMATION } from "../design-tokens";
import { slideUpFadeIn, staggeredSlideUp } from "../animation-utils";

const { fontFamily } = loadFont();

interface ResultsSceneBProps {
  aspectRatio?: AspectRatio;
  isLight?: boolean;
}

const events = [
  { title: "Soccer Practice", date: "Mon, May 5", time: "4:00 PM", location: "Field 3" },
  { title: "Team Meeting", date: "Wed, May 7", time: "6:00 PM", location: "Clubhouse" },
  { title: "Game vs Eagles", date: "Sat, May 10", time: "10:00 AM", location: "Main Stadium" },
  { title: "Assignment Due", date: "Mon, May 12", time: "11:59 PM", location: null },
];

export const ResultsSceneB: React.FC<ResultsSceneBProps> = ({
  aspectRatio = "desktop",
  isLight = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const theme = isLight ? LIGHT_COLORS : COLORS;

  const isVertical = aspectRatio === "vertical";
  const isSquare = aspectRatio === "square";
  const scaleFactor = isVertical ? 0.68 : isSquare ? 0.82 : 1;

  const titleAnim = slideUpFadeIn(frame, fps, 0, 25);
  const statsAnim = slideUpFadeIn(frame, fps, 8, 20);
  const tableAnim = slideUpFadeIn(frame, fps, 15, 20);

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
        {/* Header */}
        <div
          style={{
            ...titleAnim,
            width: "100%",
            maxWidth: Math.round(900 * scaleFactor),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: Math.round(20 * scaleFactor),
          }}
        >
          <h2
            style={{
              fontSize: Math.round(34 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: theme.foreground,
              letterSpacing: "-0.02em",
            }}
          >
            Extracted Events
          </h2>

          <div
            style={{
              ...statsAnim,
              display: "flex",
              gap: Math.round(10 * scaleFactor),
            }}
          >
            <div
              style={{
                padding: `${Math.round(8 * scaleFactor)}px ${Math.round(14 * scaleFactor)}px`,
                backgroundColor: theme.card,
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: Math.round(15 * scaleFactor),
                  fontWeight: TYPOGRAPHY.fontWeight.bold,
                  color: theme.primary,
                }}
              >
                {events.length}
              </span>
              <span
                style={{
                  fontSize: Math.round(12 * scaleFactor),
                  color: theme.muted,
                }}
              >
                events
              </span>
            </div>
            <div
              style={{
                padding: `${Math.round(8 * scaleFactor)}px ${Math.round(14 * scaleFactor)}px`,
                backgroundColor: `${TRUST.green}18`,
                borderRadius: 10,
                border: `1px solid ${TRUST.badgeBorder}`,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <CheckCircle size={Math.round(13 * scaleFactor)} color={TRUST.green} />
              <span
                style={{
                  fontSize: Math.round(12 * scaleFactor),
                  color: TRUST.green,
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                }}
              >
                Ready
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            ...tableAnim,
            width: "100%",
            maxWidth: Math.round(900 * scaleFactor),
            backgroundColor: theme.card,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            overflow: "hidden",
            boxShadow: isLight
              ? "0 4px 24px rgba(0,0,0,0.08)"
              : "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: `${Math.round(12 * scaleFactor)}px ${Math.round(18 * scaleFactor)}px`,
              backgroundColor: isLight ? "#f5f5f5" : theme.background,
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            {["Event", "Date & Time", "Location"].map((label, i) => (
              <div
                key={label}
                style={{
                  flex: i === 0 ? 2 : i === 1 ? 1.5 : 1,
                  fontSize: Math.round(10 * scaleFactor),
                  fontWeight: TYPOGRAPHY.fontWeight.semibold,
                  color: theme.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {events.map((event, index) => {
            const rowAnim = staggeredSlideUp(frame, fps, index, 4, 16);
            return (
              <div
                key={index}
                style={{
                  ...rowAnim,
                  display: "flex",
                  padding: `${Math.round(14 * scaleFactor)}px ${Math.round(18 * scaleFactor)}px`,
                  alignItems: "center",
                  borderBottom:
                    index < events.length - 1 ? `1px solid ${theme.border}` : "none",
                  backgroundColor:
                    index % 2 === 0 ? "transparent" : isLight ? "#fafafa" : `${theme.background}60`,
                }}
              >
                <div style={{ flex: 2 }}>
                  <div
                    style={{
                      fontSize: Math.round(14 * scaleFactor),
                      fontWeight: TYPOGRAPHY.fontWeight.semibold,
                      color: theme.foreground,
                    }}
                  >
                    {event.title}
                  </div>
                </div>
                <div style={{ flex: 1.5 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Calendar size={Math.round(12 * scaleFactor)} color={theme.muted} />
                      <span style={{ fontSize: Math.round(12 * scaleFactor), color: theme.foreground }}>
                        {event.date}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={Math.round(12 * scaleFactor)} color={theme.muted} />
                      <span style={{ fontSize: Math.round(12 * scaleFactor), color: theme.muted }}>
                        {event.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {event.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <MapPin size={Math.round(12 * scaleFactor)} color={theme.muted} />
                      <span style={{ fontSize: Math.round(12 * scaleFactor), color: theme.muted }}>
                        {event.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA button */}
        <GlowEffect color={theme.primary} intensity={0.4} speed={1.5}>
          <div
            style={{
              opacity: spring({ frame: frame - 90, fps, config: ANIMATION.spring.default }),
              transform: `scale(${spring({ frame: frame - 90, fps, config: ANIMATION.spring.bouncy })})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: `${Math.round(12 * scaleFactor)}px ${Math.round(24 * scaleFactor)}px`,
              backgroundColor: theme.primary,
              borderRadius: 12,
              fontSize: Math.round(14 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(194,51,38,0.35)",
              marginTop: Math.round(20 * scaleFactor),
            }}
          >
            <Download size={Math.round(16 * scaleFactor)} />
            Download .ics
          </div>
        </GlowEffect>
      </div>
    </AbsoluteFill>
  );
};
