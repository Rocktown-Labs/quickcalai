import { useCurrentFrame } from "remotion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

// Deterministic particle positions using a simple hash
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const createParticles = (count: number, width: number, height: number): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: seededRandom(i * 7) * width,
      y: seededRandom(i * 13) * height,
      size: 2 + seededRandom(i * 23) * 4,
      speedX: (seededRandom(i * 31) - 0.5) * 0.5,
      speedY: (seededRandom(i * 41) - 0.5) * 0.3,
      opacity: 0.1 + seededRandom(i * 53) * 0.3,
    });
  }
  return particles;
};

interface ParticleFieldProps {
  width: number;
  height: number;
  count?: number;
  color?: string;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  width,
  height,
  count = 30,
  color = "#c23326",
}) => {
  const frame = useCurrentFrame();
  const particles = createParticles(count, width, height);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {particles.map((p, i) => {
        const x = (p.x + frame * p.speedX + width) % width;
        const y = (p.y + frame * p.speedY + height) % height;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 2}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};
