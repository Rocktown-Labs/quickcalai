import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Upload as UploadIcon, Sparkles, FileImage } from "lucide-react";
import { COLORS, TYPOGRAPHY } from "../design-tokens";
import { fadeIn, slideUpFadeIn } from "../animation-utils";

interface UploadComponentProps {
  title?: string;
  subtitle?: string;
  showFile?: boolean;
  fileName?: string;
}

export const UploadComponent: React.FC<UploadComponentProps> = ({
  title = "Create Calendar Events",
  subtitle = "Drop your document here",
  showFile = false,
  fileName = "soccer-schedule.jpg",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleAnim = slideUpFadeIn(frame, fps, 0);
  const cardAnim = fadeIn(frame, fps, 10);
  const dropzoneAnim = fadeIn(frame, fps, 20);
  const fileOpacity = showFile ? fadeIn(frame, fps, 30) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.background, padding: 60 }}>
      {/* App Header */}
      <div style={{ position: "absolute", top: 40, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, backgroundColor: COLORS.primary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={24} color={COLORS.foreground} />
          </div>
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["2xl"], fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.foreground }}>
            QuickCalAI
          </span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ padding: "8px 16px", backgroundColor: COLORS.card, borderRadius: 8, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.muted }}>Dashboard</div>
          <div style={{ padding: "8px 16px", backgroundColor: COLORS.card, borderRadius: 8, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.muted }}>Settings</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginTop: 120, ...titleAnim }}>
        <h1 style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["5xl"], fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.foreground, textAlign: "center", marginBottom: 60 }}>
          {title}
        </h1>

        <div style={{ opacity: cardAnim, maxWidth: 900, margin: "0 auto", backgroundColor: COLORS.card, borderRadius: 24, padding: 48, border: `2px solid ${COLORS.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <Sparkles size={32} color={COLORS.primary} />
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["2xl"], fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.foreground }}>
              AI Calendar Extraction
            </span>
          </div>

          <div style={{ opacity: dropzoneAnim, border: `3px dashed ${showFile ? COLORS.primary : COLORS.border}`, borderRadius: 20, padding: 60, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, backgroundColor: showFile ? `${COLORS.primary}11` : "transparent" }}>
            {!showFile ? (
              <>
                <UploadIcon size={56} color={COLORS.muted} />
                <p style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["3xl"], fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.foreground }}>
                  {subtitle}
                </p>
                <p style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.xl, color: COLORS.muted }}>
                  Supports JPEG, PNG, WebP, and PDF
                </p>
                <div style={{ marginTop: 16, padding: "12px 32px", backgroundColor: COLORS.primary, borderRadius: 12, fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.foreground }}>
                  Browse Files
                </div>
              </>
            ) : (
              <div style={{ opacity: fileOpacity, display: "flex", alignItems: "center", gap: 24, backgroundColor: COLORS.background, padding: 32, borderRadius: 16, border: `2px solid ${COLORS.primary}`, width: "100%" }}>
                <div style={{ width: 80, height: 80, backgroundColor: COLORS.primary, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileImage size={40} color={COLORS.foreground} />
                </div>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <p style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize["2xl"], fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.foreground, marginBottom: 4 }}>
                    {fileName}
                  </p>
                  <p style={{ fontFamily: TYPOGRAPHY.fontFamily.sans, fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.muted }}>
                    Ready to process • 2.4 MB
                  </p>
                </div>
                <div style={{ padding: "12px 24px", backgroundColor: COLORS.primary, borderRadius: 10, fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.foreground }}>
                  Extract
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
