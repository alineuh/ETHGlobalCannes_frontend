export default function AudithorLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="100" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0891b2"/>
          <stop offset="100%" stopColor="#10b981"/>
        </linearGradient>
      </defs>
      {/* Shield shape */}
      <path d="M50 4 L8 20 L8 54 C8 78 26 96 50 106 C74 96 92 78 92 54 L92 20 Z"
        fill="url(#shieldGrad)" opacity="0.15"/>
      <path d="M50 4 L8 20 L8 54 C8 78 26 96 50 106 C74 96 92 78 92 54 L92 20 Z"
        stroke="url(#shieldGrad)" strokeWidth="3" fill="none"/>
      {/* Hammer handle */}
      <rect x="46" y="48" width="8" height="30" rx="3" fill="url(#shieldGrad)"/>
      {/* Hammer head */}
      <rect x="30" y="28" width="40" height="26" rx="5" fill="url(#shieldGrad)"/>
      {/* Hammer head detail line */}
      <line x1="50" y1="28" x2="50" y2="54" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
    </svg>
  );
}
