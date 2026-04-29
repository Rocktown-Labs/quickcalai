import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Download, Mail, MessageSquare, CheckCircle, Calendar, Share2, Copy } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "../design-tokens";
import { fadeIn, scaleIn, staggeredFadeIn } from "../animation-utils";

interface ExportOptionsProps {
  title?: string;
  subtitle?: string;
  showSuccess?: boolean;
}

export const ExportOptionsComponent: React.FC<ExportOptionsProps> = ({
  title = "Download your .ics and you're done",
  subtitle = "Successfully extracted 12 calendar events!",
  showSuccess = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleAnim = fadeIn(frame, fps, 0);
  const successAnim = scaleIn(frame, fps, 10, 0.9);
  const cardAnim = fadeIn(frame, fps, 20);

  const exportOptions = [
    { icon: Download, label: "Download .ics File", desc: "Import to any calendar app", primary: true },
    { icon: Mail, label: "Send via Email", desc: "Deliver to your inbox" },
    { icon: MessageSquare, label: "Send via SMS", desc: "Text to your phone" },
    { icon: Share2, label: "Share Link", desc: "Share with your team" },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ opacity: titleAnim, fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["5xl"], fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.foreground, textAlign: "center", marginBottom: 60 }}>
        {title}
      </h2>

      {/* Success Banner */}
      {showSuccess && (
        <div style={{ transform: `scale(${successAnim})`, opacity: successAnim, width: "100%", maxWidth: 900, backgroundColor: `${COLORS.success}22`, padding: 32, borderRadius: 16, border: `2px solid ${COLORS.success}44`, marginBottom: 40, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, backgroundColor: COLORS.success, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CheckCircle size={36} color={COLORS.foreground} />
          </div>
          <div>
            <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["3xl"], fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.success, marginBottom: 4 }}>
              Processing Complete!
            </div>
            <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.foreground }}>
              {subtitle}
            </div>
          </div>
        </div>
      )}

      {/* Export Options Grid */}
      <div style={{ opacity: cardAnim, width: "100%", maxWidth: 900, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {exportOptions.map((option, index) => {
          const optionAnim = staggeredFadeIn(frame, fps, index, 8);
          const OptionIcon = option.icon;

          return (
            <div key={index} style={{ opacity: optionAnim, backgroundColor: option.primary ? COLORS.primary : COLORS.card, padding: 32, borderRadius: 16, border: option.primary ? "none" : `2px solid ${COLORS.border}`, display: "flex", flexDirection: "column", gap: 16, boxShadow: option.primary ? "0 10px 40px rgba(194, 51, 38, 0.3)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, backgroundColor: option.primary ? `${COLORS.foreground}22` : COLORS.background, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <OptionIcon size={28} color={option.primary ? COLORS.foreground : COLORS.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: option.primary ? COLORS.foreground : COLORS.foreground, marginBottom: 4 }}>
                    {option.label}
                  </div>
                  <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.base, color: option.primary ? `${COLORS.foreground}cc` : COLORS.muted }}>
                    {option.desc}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* File Preview Card */}
      <div style={{ opacity: cardAnim, width: "100%", maxWidth: 900, marginTop: 40, backgroundColor: COLORS.card, padding: 24, borderRadius: 16, border: `2px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 56, height: 56, backgroundColor: COLORS.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Calendar size={28} color={COLORS.foreground} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.foreground, marginBottom: 4 }}>
            soccer-schedule-events.ics
          </div>
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.muted }}>
            12 events • Ready to import
          </div>
        </div>
        <div style={{ padding: "10px 20px", backgroundColor: COLORS.background, borderRadius: 8, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <Copy size={18} color={COLORS.muted} />
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.base, color: COLORS.foreground }}>
            Copy Link
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
