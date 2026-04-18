export function BgPattern({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        zIndex: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--accent-3) 35%, transparent) 0%, transparent 45%),
          radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--accent-2) 25%, transparent) 0%, transparent 45%)`,
      }}
    />
  );
}
