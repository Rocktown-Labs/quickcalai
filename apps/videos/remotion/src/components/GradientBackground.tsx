import { GRADIENTS, AspectRatio } from "../design-tokens";

interface GradientBackgroundProps {
  aspectRatio?: AspectRatio;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  aspectRatio = "desktop",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          aspectRatio === "vertical"
            ? GRADIENTS.backgroundVertical
            : GRADIENTS.background,
        zIndex: 0,
      }}
    />
  );
};
