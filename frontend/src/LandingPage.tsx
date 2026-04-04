import { useState } from 'react';
import ClickSpark from './components/ClickSpark';
import AudithorLogo from './components/AudithorLogo';

export default function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060d14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(8,145,178,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(8,145,178,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }}/>

      {/* Glow effects */}
      <div style={{ position: 'absolute', top: -150, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: -100, left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }}/>

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
              <span style={{ color: '#0891b2' }}>Audit</span>
              <span style={{ color: '#e2f0f7' }}>hor</span>
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#4a7a96', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
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
          <span style={{ background: 'linear-gradient(135deg, #0891b2, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            paid by the second.
          </span>
        </h1>

        <p style={{ fontSize: 16, color: '#4a7a96', lineHeight: 1.7, marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
          AI-powered vulnerability scanning with per-second payment streaming on Hedera. Confidential report delivery via Chainlink TEE. From $0.01 per scan.
        </p>

        {/* 3 stats */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 48 }}>
          {[
            { num: '$0.01', label: 'Min cost per scan' },
            { num: '60s', label: 'Max scan time' },
            { num: '4', label: 'Specialized AI agents' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0891b2', fontFamily: 'JetBrains Mono, monospace' }}>{s.num}</div>
              <div style={{ fontSize: 11, color: '#4a7a96', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Button wrapped in ClickSpark */}
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <ClickSpark sparkColor="#10b981" sparkCount={10} sparkRadius={30} sparkSize={8}>
            <button
              onClick={onLaunch}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                background: hovered
                  ? 'linear-gradient(135deg, #0e7490, #059669)'
                  : 'linear-gradient(135deg, #0891b2, #10b981)',
                color: 'white', border: 'none',
                borderRadius: 16, padding: '18px 48px',
                fontSize: 17, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.02em',
                boxShadow: hovered
                  ? '0 8px 40px rgba(16,185,129,0.5)'
                  : '0 4px 24px rgba(8,145,178,0.4)',
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
              background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.2)',
              borderRadius: 20, padding: '5px 14px',
              fontSize: 11, color: '#4a7a96', fontWeight: 600,
              fontFamily: 'JetBrains Mono, monospace',
            }}>{badge}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
