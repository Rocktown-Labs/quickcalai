import "./index.css";
import { Composition } from "remotion";
import { QuickCalAIPromo } from "./QuickCalAI";
import { MagicHookVideo } from "./videos/MagicHookVideo";
import { PainHookVideo } from "./videos/PainHookVideo";
import { AspirationHookVideo } from "./videos/AspirationHookVideo";
import { CuriosityHookVideo } from "./videos/CuriosityHookVideo";
import { ExtendedVideo } from "./videos/ExtendedVideo";
import { PremiumPromo } from "./videos/PremiumPromo";
import { PremiumPromoB } from "./videos/PremiumPromoB";
import { createResponsiveCompositions } from "./layouts";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Premium Promo - Desktop + Vertical (30s) */}
      {createResponsiveCompositions({
        id: "PremiumPromo",
        component: PremiumPromo,
        durationInFrames: 900,
        fps: 30,
      })}

      {/* Premium Promo B - Desktop + Vertical (15s) */}
      {createResponsiveCompositions({
        id: "PremiumPromoB",
        component: PremiumPromoB,
        durationInFrames: 450,
        fps: 30,
      })}

      {/* Extended Video - Desktop only */}
      <Composition
        id="Extended-desktop"
        component={ExtendedVideo}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Magic Hook - Desktop + Vertical */}
      {createResponsiveCompositions({
        id: "MagicHook",
        component: MagicHookVideo,
        durationInFrames: 1350,
        fps: 30,
      })}

      {/* Pain Hook - Desktop + Vertical */}
      {createResponsiveCompositions({
        id: "PainHook",
        component: PainHookVideo,
        durationInFrames: 1350,
        fps: 30,
      })}

      {/* Aspiration Hook - Desktop + Vertical */}
      {createResponsiveCompositions({
        id: "AspirationHook",
        component: AspirationHookVideo,
        durationInFrames: 1350,
        fps: 30,
      })}

      {/* Curiosity Hook - Desktop + Vertical */}
      {createResponsiveCompositions({
        id: "CuriosityHook",
        component: CuriosityHookVideo,
        durationInFrames: 1350,
        fps: 30,
      })}

      {/* Legacy vertical promo */}
      <Composition
        id="QuickCalAIPromo"
        component={QuickCalAIPromo}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
