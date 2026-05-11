import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Calendar, Clock, MapPin, CheckCircle, Download } from "lucide-react";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { GradientBackground } from "../components/GradientBackground";
import { GlowEffect } from "../components/GlowEffect";
import { COLORS, TYPOGRAPHY, AspectRatio } from "../design-tokens";
import { slideUpFadeIn, staggeredSlideUp } from "../animation-utils";

const { fontFamily } = loadFont();

interface ResultsSceneProps {
  aspectRatio?: AspectRatio;
}

const events = [
  { title: "Soccer Practice", date: "Mon, May 5", time: "4:00 PM", location: "Field 3" },
  { title: "Team Meeting", date: "Wed, May 7", time: "6:00 PM", location: "Clubhouse" },
  { title: "Game vs Eagles", date: "Sat, May 10", time: "10:00 AM", location: "Main Stadium" },
  { title: "Assignment Due", date: "Mon, May 12", time: "11:59 PM", location: null },
];

export const ResultsScene: React.FC<ResultsSceneProps> = ({
  aspectRatio = "desktop",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isVertical = aspectRatio === "vertical";
  const scaleFactor = isVertical ? 0.65 : 0.85;

  const titleAnim = slideUpFadeIn(frame, fps, 0, 30);
  const statsAnim = slideUpFadeIn(frame, fps, 10, 20);
  const tableAnim = slideUpFadeIn(frame, fps, 20, 20);
  const ctaAnim = slideUpFadeIn(frame, fps, 50, 20);

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
        {/* Header */}
        <div
          style={{
            ...titleAnim,
            width: "100%",
            maxWidth: Math.round(900 * scaleFactor),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: Math.round(24 * scaleFactor),
          }}
        >
          <h2
            style={{
              fontSize: Math.round(36 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              color: COLORS.foreground,
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
                backgroundColor: COLORS.card,
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: Math.round(16 * scaleFactor),
                  fontWeight: TYPOGRAPHY.fontWeight.bold,
                  color: COLORS.primary,
                }}
              >
                {events.length}
              </span>
              <span
                style={{
                  fontSize: Math.round(13 * scaleFactor),
                  color: COLORS.muted,
                }}
              >
                events
              </span>
            </div>
            <div
              style={{
                padding: `${Math.round(8 * scaleFactor)}px ${Math.round(14 * scaleFactor)}px`,
                backgroundColor: `${COLORS.success}18`,
                borderRadius: 10,
                border: `1px solid ${COLORS.success}44`,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <CheckCircle
                size={Math.round(14 * scaleFactor)}
                color={COLORS.success}
              />
              <span
                style={{
                  fontSize: Math.round(13 * scaleFactor),
                  color: COLORS.success,
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
            backgroundColor: COLORS.card,
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "flex",
              padding: `${Math.round(14 * scaleFactor)}px ${Math.round(20 * scaleFactor)}px`,
              backgroundColor: COLORS.background,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                flex: 2,
                fontSize: Math.round(11 * scaleFactor),
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                color: COLORS.muted,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Event
            </div>
            <div
              style={{
                flex: 1.5,
                fontSize: Math.round(11 * scaleFactor),
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                color: COLORS.muted,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Date & Time
            </div>
            <div
              style={{
                flex: 1,
                fontSize: Math.round(11 * scaleFactor),
                fontWeight: TYPOGRAPHY.fontWeight.semibold,
                color: COLORS.muted,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Location
            </div>
          </div>

          {/* Table rows */}
          {events.map((event, index) => {
            const rowAnim = staggeredSlideUp(
              frame,
              fps,
              index,
              5,
              20
            );
            return (
              <div
                key={index}
                style={{
                  ...rowAnim,
                  display: "flex",
                  padding: `${Math.round(12 * scaleFactor)}px ${Math.round(18 * scaleFactor)}px`,
                  alignItems: "center",
                  borderBottom:
                    index < events.length - 1
                      ? `1px solid ${COLORS.border}`
                      : "none",
                  backgroundColor:
                    index % 2 === 0 ? "transparent" : `${COLORS.background}60`,
                }}
              >
                <div style={{ flex: 2 }}>
                  <div
                    style={{
                      fontSize: Math.round(15 * scaleFactor),
                      fontWeight: TYPOGRAPHY.fontWeight.semibold,
                      color: COLORS.foreground,
                    }}
                  >
                    {event.title}
                  </div>
                </div>
                <div style={{ flex: 1.5 }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Calendar
                        size={Math.round(13 * scaleFactor)}
                        color={COLORS.muted}
                      />
                      <span
                        style={{
                          fontSize: Math.round(13 * scaleFactor),
                          color: COLORS.foreground,
                        }}
                      >
                        {event.date}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Clock
                        size={Math.round(13 * scaleFactor)}
                        color={COLORS.muted}
                      />
                      <span
                        style={{
                          fontSize: Math.round(13 * scaleFactor),
                          color: COLORS.muted,
                        }}
                      >
                        {event.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {event.location && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <MapPin
                        size={Math.round(13 * scaleFactor)}
                        color={COLORS.muted}
                      />
                      <span
                        style={{
                          fontSize: Math.round(13 * scaleFactor),
                          color: COLORS.muted,
                        }}
                      >
                        {event.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div
          style={{
            ...ctaAnim,
            display: "flex",
            gap: Math.round(12 * scaleFactor),
            marginTop: Math.round(16 * scaleFactor),
            width: "100%",
            maxWidth: Math.round(900 * scaleFactor),
          }}
        >
          <GlowEffect color={COLORS.primary} intensity={0.4} speed={1.5}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: `${Math.round(14 * scaleFactor)}px ${Math.round(24 * scaleFactor)}px`,
                backgroundColor: COLORS.primary,
                borderRadius: 12,
                fontSize: Math.round(15 * scaleFactor),
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: "#fff",
                boxShadow: "0 8px 32px rgba(194,51,38,0.35)",
              }}
            >
              <Download size={Math.round(18 * scaleFactor)} />
              Download .ics
            </div>
          </GlowEffect>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: `${Math.round(14 * scaleFactor)}px ${Math.round(24 * scaleFactor)}px`,
              backgroundColor: "transparent",
              borderRadius: 12,
              fontSize: Math.round(15 * scaleFactor),
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
              color: COLORS.foreground,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            View All Events
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
