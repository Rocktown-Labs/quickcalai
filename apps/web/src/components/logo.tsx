import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * QuickCalAI Logo — A calendar icon whose silhouette doubles as the letter "Q".
 * Rounded-rect calendar body with header bar, pins, date grid, and a
 * diagonal tail stroke extending from the bottom-right corner.
 * Uses currentColor so it inherits text color and works in any theme.
 */
export default function Logo({ className, size = 28 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * (36 / 32)}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Calendar body */}
      <rect
        x="2"
        y="5"
        width="24"
        height="23"
        rx="5"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      {/* Header bar */}
      <path
        d="M2 10C2 7.24 4.24 5 7 5H21c2.76 0 5 2.24 5 5v1H2v-1Z"
        fill="currentColor"
      />
      {/* Calendar pins */}
      <line x1="10" y1="3" x2="10" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="18" y1="3" x2="18" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Date grid - 3x2 */}
      <rect x="8" y="16" width="3" height="2.5" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="13" y="16" width="3" height="2.5" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="18" y="16" width="3" height="2.5" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="8" y="21" width="3" height="2.5" rx="0.75" fill="currentColor" opacity="0.35" />
      <rect x="13" y="21" width="3" height="2.5" rx="0.75" fill="currentColor" opacity="0.35" />
      {/* Active/selected date - highlighted */}
      <rect x="18" y="21" width="3" height="2.5" rx="0.75" fill="currentColor" />
      {/* Q tail — diagonal stroke from bottom-right */}
      <line
        x1="22"
        y1="26"
        x2="29"
        y2="33"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
