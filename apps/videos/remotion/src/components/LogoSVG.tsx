import { useCurrentFrame, useVideoConfig } from "remotion";
import { spring, interpolate } from "remotion";
import { ANIMATION } from "../design-tokens";

interface LogoSVGProps {
  size?: number;
  color?: string;
  delay?: number;
}

export const LogoSVG: React.FC<LogoSVGProps> = ({
  size = 120,
  color = "#c23326",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleProgress = spring({
    frame: frame - delay,
    fps,
    config: ANIMATION.spring.bouncy,
  });

  const scale = interpolate(scaleProgress, [0, 1], [0.5, 1]);
  const opacity = scaleProgress;
  const rotate = interpolate(scaleProgress, [0, 1], [-15, 0]);

  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * (36 / 32)}
      style={{
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        opacity,
        transformOrigin: "center center",
      }}
    >
      <rect
        x="2"
        y="5"
        width="24"
        height="23"
        rx="5"
        stroke={color}
        strokeWidth="2.2"
      />
      <path
        d="M2 10C2 7.24 4.24 5 7 5H21c2.76 0 5 2.24 5 5v1H2v-1Z"
        fill={color}
      />
      <line x1="10" y1="3" x2="10" y2="8" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="18" y1="3" x2="18" y2="8" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <rect x="8" y="16" width="3" height="2.5" rx="0.75" fill={color} opacity="0.35" />
      <rect x="13" y="16" width="3" height="2.5" rx="0.75" fill={color} opacity="0.35" />
      <rect x="18" y="16" width="3" height="2.5" rx="0.75" fill={color} opacity="0.35" />
      <rect x="8" y="21" width="3" height="2.5" rx="0.75" fill={color} opacity="0.35" />
      <rect x="13" y="21" width="3" height="2.5" rx="0.75" fill={color} opacity="0.35" />
      <rect x="18" y="21" width="3" height="2.5" rx="0.75" fill={color} />
      <line
        x1="22"
        y1="26"
        x2="29"
        y2="33"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
};
