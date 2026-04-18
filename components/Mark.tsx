export function Mark({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block' }} aria-hidden>
      <rect x="6" y="24" width="6" height="18" fill={color} />
      <rect x="15" y="18" width="6" height="24" fill={color} />
      <rect x="24" y="10" width="6" height="32" fill={color} />
      <rect x="33" y="4" width="6" height="38" fill={color} />
      <circle cx="9" cy="20" r="3" fill={color} />
      <circle cx="36" cy="44" r="3" fill={color} />
    </svg>
  );
}
