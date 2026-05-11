import { COLORS, GLOW } from "../design-tokens";

interface UICardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: boolean;
  noBorder?: boolean;
}

export const UICard: React.FC<UICardProps> = ({
  children,
  style,
  glow = false,
  noBorder = false,
}) => {
  return (
    <div
      style={{
        backgroundColor: COLORS.card,
        borderRadius: 20,
        border: noBorder ? "none" : `1px solid ${COLORS.border}`,
        boxShadow: glow ? `${GLOW.card}, 0 0 40px rgba(194,51,38,0.08)` : GLOW.card,
        padding: 32,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

interface UIButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  style?: React.CSSProperties;
}

export const UIButton: React.FC<UIButtonProps> = ({
  children,
  variant = "primary",
  style,
}) => {
  const isPrimary = variant === "primary";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "14px 28px",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 600,
        cursor: "default",
        backgroundColor: isPrimary ? COLORS.primary : "transparent",
        color: isPrimary ? "#ffffff" : COLORS.foreground,
        border: isPrimary ? "none" : `1px solid ${COLORS.border}`,
        boxShadow: isPrimary ? GLOW.button : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

interface UIBadgeProps {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}

export const UIBadge: React.FC<UIBadgeProps> = ({
  children,
  color = COLORS.primary,
  style,
}) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        textTransform: "uppercase" as const,
        backgroundColor: `${color}22`,
        color: color,
        border: `1px solid ${color}44`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
