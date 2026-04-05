import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
}

interface PillNavProps {
  items: NavItem[];
  onLaunch: () => void;
}

export default function PillNav({ items, onLaunch }: PillNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 16, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      zIndex: 100, pointerEvents: 'none',
    }}>
      <nav style={{
        pointerEvents: 'all',
        display: 'flex', alignItems: 'center',
        gap: 4,
        background: scrolled
          ? 'rgba(6,11,24,0.92)'
          : 'rgba(10,15,30,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(37,99,235,0.2)',
        borderRadius: 9999,
        padding: '6px 8px',
        boxShadow: scrolled
          ? '0 4px 32px rgba(0,0,0,0.4)'
          : '0 2px 16px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo pill */}
        <a href="#" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(37,99,235,0.15)',
          border: '1px solid rgba(37,99,235,0.25)',
          borderRadius: 9999,
          padding: '6px 14px 6px 8px',
          textDecoration: 'none',
          marginRight: 4,
        }}>
          <svg width="22" height="26" viewBox="0 0 96 116" fill="none">
            <defs>
              <linearGradient id="nl1" x1="4" y1="2" x2="92" y2="114" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8"/>
                <stop offset="50%" stopColor="#2563eb"/>
                <stop offset="100%" stopColor="#1e40af"/>
              </linearGradient>
              <linearGradient id="nl2" x1="20" y1="24" x2="76" y2="96" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7dd3fc"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
            <path d="M48 2 L4 20 L4 56 C4 82 20 104 48 114 C76 104 92 82 92 56 L92 20 Z" fill="#0f172a"/>
            <path d="M48 2 L4 20 L4 56 C4 82 20 104 48 114 C76 104 92 82 92 56 L92 20 Z" stroke="url(#nl1)" strokeWidth="2.5" fill="none"/>
            <rect x="44" y="64" width="8" height="34" rx="3.5" fill="url(#nl2)"/>
            <rect x="22" y="28" width="52" height="38" rx="9" fill="url(#nl1)"/>
            <rect x="24" y="30" width="48" height="13" rx="6" fill="rgba(255,255,255,0.2)"/>
          </svg>
          <span style={{
            fontSize: 14, fontWeight: 800,
            letterSpacing: '-0.02em',
            fontFamily: 'Sora, sans-serif',
          }}>
            <span style={{ color: '#60a5fa' }}>Audit</span>
            <span style={{ color: '#e2f0f7' }}>hor</span>
          </span>
        </a>

        {/* Nav items */}
        {items.map((item, i) => (
          <a
            key={item.label}
            href={item.href}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '7px 16px',
              borderRadius: 9999,
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              color: hoveredIndex === i ? '#e2f0f7' : '#64748b',
              background: hoveredIndex === i
                ? 'rgba(37,99,235,0.15)'
                : 'transparent',
              transition: 'all 0.15s ease',
              fontFamily: 'Sora, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </a>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(37,99,235,0.2)', margin: '0 4px' }}/>

        {/* Hedera badge */}
        <div style={{
          background: 'rgba(37,99,235,0.08)',
          border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: 9999, padding: '5px 12px',
          fontSize: 10, color: '#475569',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 700, letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}>HEDERA TESTNET</div>

        {/* CTA — launch analysis */}
        <button
          onClick={onLaunch}
          style={{
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            color: 'white', border: 'none',
            borderRadius: 9999, padding: '8px 18px',
            fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Sora, sans-serif',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 16px rgba(37,99,235,0.3)',
            transition: 'all 0.2s',
            marginLeft: 2,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(37,99,235,0.5)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(37,99,235,0.3)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          ⚡ Start Analysis
        </button>
      </nav>
    </div>
  );
}
