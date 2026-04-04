import { useState } from 'react';
import ClickSpark from './components/ClickSpark';
import AudithorLogo from './components/AudithorLogo';
import RippleGrid from './components/RippleGrid';

export default function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060b18',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* RippleGrid background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <RippleGrid
          gridColor="#2563eb"
          rippleIntensity={0.035}
          gridSize={9}
          gridThickness={20}
          opacity={0.55}
          mouseInteraction={true}
        />
      </div>

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: -150, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}/>
      <div style={{ position: 'absolute', bottom: -100, left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}/>

      {/* Main content */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: 700 }}>

        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
          <AudithorLogo size={56}/>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em',
              fontFamily: 'Inter, sans-serif', lineHeight: 1,
            }}>
              <span style={{ color: '#2563eb' }}>Audit</span>
              <span style={{ color: '#e2f0f7' }}>hor</span>
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#64748b', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
              SECURITY · STREAM · HEDERA
            </div>
          </div>
        </div>

        {/* Tagline */}
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 800, color: '#e2f0f7',
          letterSpacing: '-0.03em', lineHeight: 1.15,
          fontFamily: 'Inter, sans-serif',
          marginBottom: 20,
        }}>
          Smart contract security,<br/>
          <span style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            paid by the second.
          </span>
        </h1>

        <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 48px' }}>
          AI-powered vulnerability scanning with per-second payment streaming on Hedera. Confidential report delivery via Chainlink TEE. From $0.01 per scan.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 48 }}>
          {[
            { num: '$0.01', label: 'Min cost per scan' },
            { num: '60s',   label: 'Max scan time' },
            { num: '4',     label: 'Specialized AI agents' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace' }}>{s.num}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <ClickSpark sparkColor="#3b82f6" sparkCount={10} sparkRadius={30} sparkSize={8}>
            <button
              onClick={onLaunch}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                background: hovered
                  ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
                  : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: 'white', border: 'none',
                borderRadius: 16, padding: '18px 48px',
                fontSize: 17, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em',
                boxShadow: hovered
                  ? '0 8px 40px rgba(37,99,235,0.55)'
                  : '0 4px 24px rgba(37,99,235,0.45)',
                transition: 'all 0.25s',
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                display: 'flex', alignItems: 'center', gap: 12,
                position: 'relative', zIndex: 1,
              }}
            >
              <span>▶</span>
              Launch an Analysis
            </button>
          </ClickSpark>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
          {['Hedera HCS', 'Chainlink TEE', 'Uniswap API', 'World ID'].map(badge => (
            <div key={badge} style={{
              background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: 20, padding: '5px 14px',
              fontSize: 11, color: '#64748b', fontWeight: 600,
              fontFamily: 'JetBrains Mono, monospace',
            }}>{badge}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
