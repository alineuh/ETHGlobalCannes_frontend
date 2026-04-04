export default function AudithorLogo({ size = 40 }: { size?: number }) {
  const id = Math.random().toString(36).slice(2, 7);
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 96 116" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`shield-${id}`} x1="4" y1="2" x2="92" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="50%" stopColor="#2563eb"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
        <linearGradient id={`hammer-${id}`} x1="20" y1="24" x2="76" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd"/>
          <stop offset="100%" stopColor="#2563eb"/>
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="24" y1="26" x2="72" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)"/>
        </linearGradient>
      </defs>
      {/* Shield dark fill */}
      <path d="M48 3 L4 19 L4 56 C4 84 22 104 48 114 C74 104 92 84 92 56 L92 19 Z" fill="#0f172a"/>
      {/* Shield border gradient */}
      <path d="M48 3 L4 19 L4 56 C4 84 22 104 48 114 C74 104 92 84 92 56 L92 19 Z" stroke={`url(#shield-${id})`} strokeWidth="3" fill="none"/>
      {/* Inner shield subtle glow */}
      <path d="M48 14 L16 26 L16 54 C16 76 30 93 48 102 C66 93 80 76 80 54 L80 26 Z" fill={`url(#shield-${id})`} opacity="0.06"/>
      {/* Hammer handle */}
      <rect x="44" y="64" width="8" height="34" rx="3.5" fill={`url(#hammer-${id})`}/>
      {/* Hammer head */}
      <rect x="22" y="28" width="52" height="38" rx="9" fill={`url(#hammer-${id})`}/>
      {/* Hammer head shine */}
      <rect x="24" y="30" width="48" height="13" rx="6" fill={`url(#shine-${id})`}/>
      {/* Hammer center split */}
      <line x1="48" y1="28" x2="48" y2="66" stroke="rgba(15,23,42,0.35)" strokeWidth="2"/>
      {/* Side rivets */}
      <circle cx="29" cy="47" r="2.5" fill="rgba(255,255,255,0.18)"/>
      <circle cx="67" cy="47" r="2.5" fill="rgba(255,255,255,0.18)"/>
    </svg>
  );
}
