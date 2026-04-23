import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface AnimationProps {
  delay?: number;
  duration?: number;
}

// fadeIn: opacity 0 → 1
export function useFadeIn({ delay = 0, duration = 20 }: AnimationProps = {}) {
  const frame = useCurrentFrame();
  return interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// slideUp: translateY 40px → 0 with spring + fade
export function useSlideUp({ delay = 0, duration = 20 }: AnimationProps = {}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(progress, [0, 1], [40, 0]);
  return { opacity, translateY };
}

// scale: scale 0.7 → 1 with spring
export function useScaleIn({ delay = 0 }: { delay?: number } = {}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.6 },
  });

  const scale = interpolate(progress, [0, 1], [0.7, 1]);
  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return { scale, opacity };
}

// blurReveal: blur + fade — dramatic reveal
export function useBlurReveal({ delay = 0, duration = 25 }: AnimationProps = {}) {
  const frame = useCurrentFrame();
  const blurAmount = interpolate(frame, [delay, delay + duration], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { filter: `blur(${blurAmount}px)`, opacity };
}

// typewriter: reveals text character by character
export function useTypewriter(text: string, { delay = 0, charsPerFrame = 3 }: { delay?: number; charsPerFrame?: number } = {}) {
  const frame = useCurrentFrame();
  const charsVisible = Math.floor((frame - delay) * charsPerFrame);
  return text.slice(0, Math.max(0, charsVisible));
}

// counterAnimation: number counter 0 → target
export function useCounter(target: number, { delay = 0, duration = 60 }: AnimationProps = {}) {
  const frame = useCurrentFrame();
  const value = interpolate(frame, [delay, delay + duration], [0, target], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.floor(value);
}

// pulse: subtle scale pulse for CTA
export function usePulse({ delay = 0, period = 30 }: { delay?: number; period?: number } = {}) {
  const frame = useCurrentFrame();
  if (frame < delay) return 1;
  const t = ((frame - delay) % period) / period;
  return 1 + 0.025 * Math.sin(t * Math.PI * 2);
}
