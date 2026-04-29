import { Composition } from "remotion";
import { ASPECT_RATIOS, AspectRatio } from "../design-tokens";

interface CompositionConfig {
  id: string;
  component: React.ComponentType<{ aspectRatio?: AspectRatio }>;
  durationInFrames: number;
  fps?: number;
  defaultProps?: Record<string, unknown>;
}

/**
 * Create compositions for all aspect ratios from a single component
 */
export const createResponsiveCompositions = (
  config: CompositionConfig,
  aspectRatios: AspectRatio[] = ["desktop", "vertical"]
) => {
  const fps = config.fps || 30;

  return aspectRatios.map((aspectRatio) => {
    const { width, height } = ASPECT_RATIOS[aspectRatio];

    return (
      <Composition
        key={`${config.id}-${aspectRatio}`}
        id={`${config.id}-${aspectRatio}`}
        component={config.component}
        durationInFrames={config.durationInFrames}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{
          ...config.defaultProps,
          aspectRatio,
        } as { aspectRatio?: AspectRatio }}
      />
    );
  });
};
