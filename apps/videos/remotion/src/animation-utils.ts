import { interpolate, spring, Easing } from "remotion";
import { ANIMATION } from "./design-tokens";

export const fadeIn = (frame: number, fps: number, delay = 0): number => {
  return spring({ frame: frame - delay, fps, config: ANIMATION.spring.default });
};

export const slideUpFadeIn = (frame: number, fps: number, delay = 0, distance = 20) => {
  const progress = spring({ frame: frame - delay, fps, config: ANIMATION.spring.default });
  return { opacity: progress, y: interpolate(progress, [0, 1], [distance, 0]) };
};

export const slideDownFadeIn = (frame: number, fps: number, delay = 0, distance = 20) => {
  const progress = spring({ frame: frame - delay, fps, config: ANIMATION.spring.default });
  return { opacity: progress, y: interpolate(progress, [0, 1], [-distance, 0]) };
};

export const scaleIn = (frame: number, fps: number, delay = 0, from = 0.9): number => {
  const progress = spring({ frame: frame - delay, fps, config: ANIMATION.spring.default });
  return interpolate(progress, [0, 1], [from, 1]);
};

export const scaleInBouncy = (frame: number, fps: number, delay = 0, from = 0.5): number => {
  const progress = spring({ frame: frame - delay, fps, config: ANIMATION.spring.bouncy });
  return interpolate(progress, [0, 1], [from, 1]);
};

export const animateCounter = (frame: number, start: number, end: number, from: number, to: number): number => {
  const progress = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.floor(interpolate(progress, [0, 1], [from, to]));
};

export const animateProgress = (frame: number, start: number, end: number): number => {
  return interpolate(frame, [start, end], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

export const staggeredFadeIn = (frame: number, fps: number, index: number, staggerDelay = 5): number => {
  return spring({ frame: frame - (index * staggerDelay), fps, config: ANIMATION.spring.default });
};

export const staggeredSlideUp = (frame: number, fps: number, index: number, staggerDelay = 5, distance = 30) => {
  const progress = spring({ frame: frame - (index * staggerDelay), fps, config: ANIMATION.spring.default });
  return { opacity: progress, y: interpolate(progress, [0, 1], [distance, 0]) };
};

export const pulse = (frame: number, fps: number, speed = 1): number => {
  const cycle = (frame * speed) % fps;
  return interpolate(cycle, [0, fps / 2, fps], [1, 0.7, 1]);
};

export const shimmer = (frame: number, fps: number, speed = 0.5): number => {
  const cycle = (frame * speed) % fps;
  return interpolate(cycle, [0, fps], [-200, 200]);
};

export const glowPulse = (frame: number, fps: number, speed = 1): number => {
  const cycle = (frame * speed) % fps;
  return interpolate(cycle, [0, fps / 2, fps], [0.3, 0.6, 0.3]);
};

export const rotateIn = (frame: number, fps: number, delay = 0, fromDeg = -10): number => {
  const progress = spring({ frame: frame - delay, fps, config: ANIMATION.spring.gentle });
  return interpolate(progress, [0, 1], [fromDeg, 0]);
};

export const blurFadeIn = (frame: number, fps: number, delay = 0, maxBlur = 10) => {
  const progress = spring({ frame: frame - delay, fps, config: ANIMATION.spring.smooth });
  const blur = interpolate(progress, [0, 1], [maxBlur, 0]);
  return { opacity: progress, filter: `blur(${blur}px)` };
};

export const typewriter = (frame: number, start: number, end: number, text: string): string => {
  const progress = interpolate(frame, [start, end], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return text.slice(0, Math.floor(progress));
};

export const easeOutExpo = Easing.out(Easing.exp);
export const easeInOutCubic = Easing.inOut(Easing.cubic);
