import { AbsoluteFill } from "remotion";
import { ASPECT_RATIOS, AspectRatio } from "../design-tokens";

interface ResponsiveLayoutProps {
  aspectRatio: AspectRatio;
  children: React.ReactNode;
  padding?: number;
}

/**
 * Responsive layout wrapper that adapts content to different aspect ratios
 * Handles scaling and positioning for 16:9, 1:1, and 9:16 formats
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  aspectRatio,
  children,
  padding = 60,
}) => {
  const config = ASPECT_RATIOS[aspectRatio];

  // Calculate scale factor for text and spacing based on aspect ratio
  const scaleFactor = aspectRatio === "vertical" ? 0.85 : aspectRatio === "square" ? 0.9 : 1;

  // Adjust padding for smaller formats
  const adjustedPadding = aspectRatio === "vertical" ? padding * 0.7 : aspectRatio === "square" ? padding * 0.8 : padding;

  return (
    <AbsoluteFill
      style={{
        width: config.width,
        height: config.height,
        padding: adjustedPadding,
        fontSize: `${scaleFactor * 100}%`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Get responsive font size based on aspect ratio
 */
export const getResponsiveFontSize = (baseSize: number, aspectRatio: AspectRatio): number => {
  const scaleFactor = aspectRatio === "vertical" ? 0.75 : aspectRatio === "square" ? 0.85 : 1;
  return baseSize * scaleFactor;
};

/**
 * Get responsive spacing based on aspect ratio
 */
export const getResponsiveSpacing = (baseSpacing: number, aspectRatio: AspectRatio): number => {
  const scaleFactor = aspectRatio === "vertical" ? 0.7 : aspectRatio === "square" ? 0.8 : 1;
  return baseSpacing * scaleFactor;
};

/**
 * Determine if layout should be vertical (stacked) or horizontal based on aspect ratio
 */
export const shouldStackVertically = (aspectRatio: AspectRatio): boolean => {
  return aspectRatio === "vertical";
};
