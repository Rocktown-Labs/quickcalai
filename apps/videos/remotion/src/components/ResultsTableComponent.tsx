import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Calendar, Clock, MapPin, Edit2, Trash2, Download } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "../design-tokens";
import { fadeIn, staggeredFadeIn } from "../animation-utils";

interface Event {
  title: string;
  date: string;
  time: string;
  location?: string;
}

interface ResultsTableProps {
  title?: string;
  events?: Event[];
}

const defaultEvents: Event[] = [
  { title: "Soccer Practice", date: "Mon, May 5", time: "4:00 PM", location: "Field 3" },
  { title: "Team Meeting", date: "Wed, May 7", time: "6:00 PM", location: "Clubhouse" },
  { title: "Game vs Eagles", date: "Sat, May 10", time: "10:00 AM", location: "Main Stadium" },
  { title: "Soccer Practice", date: "Mon, May 12", time: "4:00 PM", location: "Field 3" },
];

export const ResultsTableComponent: React.FC<ResultsTableProps> = ({
  title = "Review extracted events",
  events = defaultEvents,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleAnim = fadeIn(frame, fps, 0);
  const statsAnim = fadeIn(frame, fps, 10);
  const actionsAnim = fadeIn(frame, fps, 15);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: 60 }}>
      {/* Header with stats */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ opacity: titleAnim, fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["5xl"], fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.foreground }}>
            {title}
          </h2>
          <div style={{ opacity: actionsAnim, display: "flex", gap: 12 }}>
            <div style={{ padding: "12px 24px", backgroundColor: COLORS.card, borderRadius: 10, fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.foreground, border: `2px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Edit2 size={20} />
              Edit All
            </div>
            <div style={{ padding: "12px 24px", backgroundColor: COLORS.primary, borderRadius: 10, fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.foreground, display: "flex", alignItems: "center", gap: 8 }}>
              <Download size={20} />
              Download .ics
            </div>
          </div>
        </div>

        <div style={{ opacity: statsAnim, display: "flex", gap: 16 }}>
          <div style={{ padding: "12px 20px", backgroundColor: COLORS.card, borderRadius: 10, border: `2px solid ${COLORS.border}` }}>
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["2xl"], fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.primary }}>
              {events.length}
            </span>
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.muted, marginLeft: 8 }}>
              events found
            </span>
          </div>
          <div style={{ padding: "12px 20px", backgroundColor: `${COLORS.success}22`, borderRadius: 10, border: `2px solid ${COLORS.success}44` }}>
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.success, fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
              ✓ Ready to export
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: COLORS.card, borderRadius: 16, border: `2px solid ${COLORS.border}`, overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{ display: "flex", padding: "16px 24px", backgroundColor: COLORS.background, borderBottom: `2px solid ${COLORS.border}` }}>
          <div style={{ flex: 2, fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Event</div>
          <div style={{ flex: 1, fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date & Time</div>
          <div style={{ flex: 1, fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Location</div>
          <div style={{ width: 100 }}></div>
        </div>

        {/* Table Rows */}
        {events.map((event, index) => {
          const rowAnim = staggeredFadeIn(frame, fps, index, 6);
          return (
            <div key={index} style={{ opacity: rowAnim, display: "flex", padding: "20px 24px", alignItems: "center", borderBottom: index < events.length - 1 ? `1px solid ${COLORS.border}` : "none", backgroundColor: index % 2 === 0 ? "transparent" : `${COLORS.background}88` }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.foreground }}>
                  {event.title}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={16} color={COLORS.muted} />
                    <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.foreground }}>
                      {event.date}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={16} color={COLORS.muted} />
                    <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.muted }}>
                      {event.time}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {event.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={16} color={COLORS.muted} />
                    <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.muted }}>
                      {event.location}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ width: 100, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Edit2 size={16} color={COLORS.muted} />
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Trash2 size={16} color={COLORS.error} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
