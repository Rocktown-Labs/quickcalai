/**
 * QuickCalAI Design System Tokens
 * Shared across Remotion and Hyperframes video compositions
 */

export const COLORS = {
  background: "#161616",
  foreground: "#efefef",
  primary: "#c23326",
  card: "#212121",
  border: "#333333",
  muted: "#888888",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
} as const;

export const LIGHT_COLORS = {
  background: "#ffffff",
  foreground: "#111111",
  primary: "#c23326",
  card: "#fafafa",
  border: "#e5e5e5",
  muted: "#666666",
  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",
} as const;

export const TRUST = {
  green: "#22c55e",
  greenLight: "#dcfce7",
  greenDark: "#166534",
  badgeBg: "#22c55e22",
  badgeBorder: "#22c55e44",
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    sans: "Plus Jakarta Sans, sans-serif",
    serif: "Instrument Serif, serif",
  },
  fontSize: {
    xs: 12, sm: 14, base: 16, lg: 18, xl: 20,
    "2xl": 24, "3xl": 30, "4xl": 36, "5xl": 48,
    "6xl": 60, "7xl": 72, "8xl": 96, "9xl": 128,
  },
  fontWeight: {
    normal: 400, medium: 500, semibold: 600,
    bold: 700, extrabold: 800, black: 900,
  },
} as const;

export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48, "3xl": 64, "4xl": 96,
} as const;

export const TIMING = {
  hook: 90, upload: 150, processing: 300,
  results: 300, export: 150, cta: 300,
  fadeIn: 20, fadeOut: 15, slideIn: 25, stagger: 5,
} as const;

export const ANIMATION = {
  spring: {
    default: { damping: 100, stiffness: 200, mass: 1 },
    bouncy: { damping: 12, stiffness: 200, mass: 1 },
    smooth: { damping: 200, stiffness: 100, mass: 1 },
    snappy: { damping: 80, stiffness: 300, mass: 0.5 },
    gentle: { damping: 150, stiffness: 120, mass: 1.2 },
  },
} as const;

export const GLOW = {
  primary: "0 0 60px rgba(194, 51, 38, 0.25)",
  primaryStrong: "0 0 100px rgba(194, 51, 38, 0.4)",
  card: "0 4px 24px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)",
  button: "0 8px 32px rgba(194, 51, 38, 0.35)",
} as const;

export const GRADIENTS = {
  background: "radial-gradient(ellipse at 50% 30%, #1a1a1a 0%, #161616 60%, #111111 100%)",
  backgroundVertical: "radial-gradient(ellipse at 50% 20%, #1a1a1a 0%, #161616 50%, #111111 100%)",
  shimmer: "linear-gradient(90deg, transparent 0%, rgba(194,51,38,0.15) 50%, transparent 100%)",
  textHighlight: "linear-gradient(135deg, #c23326 0%, #e85a4f 100%)",
} as const;

export const ASPECT_RATIOS = {
  desktop: { width: 1920, height: 1080, name: "16:9" },
  square: { width: 1080, height: 1080, name: "1:1" },
  vertical: { width: 1080, height: 1920, name: "9:16" },
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;
