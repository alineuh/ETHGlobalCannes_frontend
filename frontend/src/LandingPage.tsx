import { useState, useEffect, useRef } from 'react';
import RippleGrid from './components/RippleGrid';
import AudithorLogo from './components/AudithorLogo';
import ClickSpark from './components/ClickSpark';

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

/* ── Intersection observer hook ── */
function useVisible(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── KPI Card ── */
function KpiCard({ value, suffix, label, sub }: {
  value: number; suffix: string; label: string; sub: string;
}) {
  const { ref, visible } = useVisible();
  const count = useCountUp(value, 1600, visible);
  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: '28px 20px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(37,99,235,0.18)',
      borderRadius: 8,
    }}>
      <div style={{
        fontSize: 48, fontWeight: 900, lineHeight: 1,
        fontFamily: 'Sora, sans-serif', letterSpacing: '-0.04em',
        background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#e2f0f7', marginTop: 10 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

/* ── Feature Card ── */
function FeatureCard({ icon, title, desc, tag }: {
  icon: string; title: string; desc: string; tag?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '24px 20px',
        background: hovered ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(37,99,235,0.35)' : 'rgba(37,99,235,0.12)'}`,
        borderRadius: 8,
        transition: 'all 0.2s',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e2f0f7' }}>{title}</div>
        {tag && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 7px',
            background: 'rgba(37,99,235,0.2)', color: '#60a5fa',
            border: '1px solid rgba(37,99,235,0.3)', borderRadius: 4,
            letterSpacing: '0.06em',
          }}>{tag}</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

/* ── Architecture Diagram ── */
function ArchDiagram() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(37,99,235,0.15)',
      borderRadius: 8, padding: '32px 24px',
    }}>
      {/* Top: Dashboard */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(37,99,235,0.15)',
          border: '1px solid rgba(37,99,235,0.4)',
          borderRadius: 6, padding: '10px 32px',
          fontSize: 13, fontWeight: 700, color: '#93c5fd',
        }}>
          Unified Dashboard — Real-time Findings & Audit Proof
        </div>
      </div>

      {/* Vertical line */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <div style={{ width: 1, height: 24, background: 'rgba(37,99,235,0.4)' }}/>
      </div>

      {/* Center: ASPM */}
      <div style={{ textAlign: 'center', marginBottom: 0 }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(29,78,216,0.15))',
          border: '2px solid rgba(37,99,235,0.5)',
          borderRadius: 6, padding: '14px 48px',
          fontSize: 15, fontWeight: 800, color: '#e2f0f7',
        }}>
          Audithor Security Engine
        </div>
      </div>

      {/* Connector lines */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 120, margin: '0 0 0 0' }}>
        {['', '', ''].map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 1, height: 28, background: 'rgba(37,99,235,0.3)' }}/>
          </div>
        ))}
      </div>

      {/* AI Powered layer */}
      <div style={{ textAlign: 'center', marginBottom: 0 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(96,165,250,0.08)',
          border: '1px solid rgba(96,165,250,0.25)',
          borderRadius: 6, padding: '10px 48px',
          fontSize: 13, fontWeight: 700, color: '#93c5fd',
        }}>
          ⚡ AI-Powered — 4 Specialized Agents
        </div>
      </div>

      {/* 3 columns lines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, margin: '0' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 1, height: 28, background: 'rgba(37,99,235,0.25)' }}/>
          </div>
        ))}
      </div>

      {/* 3 bottom cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          {
            title: 'Smart Contract Code',
            items: ['Reentrancy', 'Access Control', 'Overflow / Underflow', 'Flash Loan Vectors'],
          },
          {
            title: 'Payment Stream',
            items: ['Per-second billing', 'EIP-3009 signatures', 'Auto-refund onchain', 'Multi-token via Uniswap'],
          },
          {
            title: 'Trust & Privacy',
            items: ['Chainlink TEE delivery', 'Hedera HCS proof', 'World ID verification', 'Audit certification'],
          },
        ].map(col => (
          <div key={col.title} style={{
            background: 'rgba(37,99,235,0.06)',
            border: '1px solid rgba(37,99,235,0.2)',
            borderRadius: 6, padding: '16px 14px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#93c5fd', marginBottom: 12 }}>
              {col.title}
            </div>
            {col.items.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ color: '#2563eb', fontSize: 10, flexShrink: 0 }}>↘</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 0, marginTop: 24,
        background: 'rgba(37,99,235,0.06)',
        border: '1px solid rgba(37,99,235,0.15)',
        borderRadius: 6, overflow: 'hidden',
      }}>
        {[
          { num: '$0.01', label: 'Minimum scan cost' },
          { num: '60s', label: 'Max scan duration' },
          { num: '4', label: 'Specialized AI agents' },
          { num: '∞', label: 'CI/CD scans per day' },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '16px 12px', textAlign: 'center',
            borderRight: i < 3 ? '1px solid rgba(37,99,235,0.12)' : 'none',
          }}>
            <div style={{
              fontSize: 20, fontWeight: 900,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#60a5fa',
            }}>{s.num}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pricing Card ── */
function PricingCard({ name, model, price, features, recommended, color }: {
  name: string; model: string; price: string;
  features: string[]; recommended?: boolean; color: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '24px 20px',
        background: recommended
          ? 'rgba(37,99,235,0.1)'
          : 'rgba(255,255,255,0.02)',
        border: `2px solid ${recommended
          ? 'rgba(37,99,235,0.5)'
          : hovered ? 'rgba(37,99,235,0.25)' : 'rgba(37,99,235,0.12)'}`,
        borderRadius: 8,
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      {recommended && (
        <div style={{
          position: 'absolute', top: -12, left: '50%',
          transform: 'translateX(-50%)',
          background: '#2563eb', color: 'white',
          fontSize: 10, fontWeight: 700,
          padding: '3px 12px', borderRadius: 4,
          letterSpacing: '0.08em', whiteSpace: 'nowrap',
        }}>RECOMMENDED</div>
      )}
      <div style={{ fontSize: 16, fontWeight: 800, color: '#e2f0f7', marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>{model}</div>
      <div style={{
        fontSize: 28, fontWeight: 900,
        fontFamily: 'JetBrains Mono, monospace',
        color, lineHeight: 1, marginBottom: 4,
      }}>{price}</div>
      <div style={{ fontSize: 10, color: '#475569', marginBottom: 20 }}>per second of compute</div>
      {features.map(f => (
        <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
          <span style={{ color: '#2563eb', flexShrink: 0, marginTop: 1 }}>✓</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{f}</span>
        </div>
      ))}
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  const [ctaHovered, setCtaHovered] = useState(false);

  return (
    <div style={{
      background: '#060b18',
      color: '#e2f0f7',
      fontFamily: "'Sora', sans-serif",
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6,11,24,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(37,99,235,0.12)',
        display: 'flex', alignItems: 'center',
        padding: '0 48px', height: 60, gap: 16,
      }}>
        <AudithorLogo size={30}/>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.03em' }}>
            <span style={{ color: '#2563eb' }}>Audit</span>
            <span style={{ color: '#e2f0f7' }}>hor</span>
          </div>
          <div style={{ fontSize: 7, letterSpacing: '0.18em', color: '#334155', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>
            SECURITY · STREAM
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {['Features', 'Pricing', 'Architecture', 'Docs'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{
            fontSize: 13, color: '#475569', fontWeight: 500,
            textDecoration: 'none', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#93c5fd'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#475569'}
          >{item}</a>
        ))}

        <div style={{
          background: 'rgba(37,99,235,0.1)',
          border: '1px solid rgba(37,99,235,0.25)',
          color: '#60a5fa', borderRadius: 4,
          padding: '4px 10px', fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
        }}>HEDERA TESTNET</div>

        <ClickSpark sparkColor="#3b82f6" sparkCount={8} sparkRadius={20} sparkSize={6}>
          <button onClick={onLaunch} style={{
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            color: 'white', border: 'none', borderRadius: 6,
            padding: '8px 20px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Sora, sans-serif',
            boxShadow: '0 0 16px rgba(37,99,235,0.3)',
            position: 'relative', zIndex: 1,
          }}>Launch App →</button>
        </ClickSpark>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', minHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 48px 60px', textAlign: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <RippleGrid gridColor="#2563eb" rippleIntensity={0.035}
            gridSize={9} gridThickness={20} opacity={0.5} mouseInteraction={true}/>
        </div>
        <div style={{
          position: 'absolute', top: '20%', left: '50%',
          transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(37,99,235,0.1)',
            border: '1px solid rgba(37,99,235,0.25)',
            borderRadius: 4, padding: '5px 14px',
            fontSize: 11, color: '#60a5fa',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600, letterSpacing: '0.08em',
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}/>
            ETHGlobal Cannes 2026 · Hedera + Chainlink + Uniswap
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 900, letterSpacing: '-0.04em',
            lineHeight: 1.1, marginBottom: 24,
          }}>
            Smart contract security,<br/>
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>paid by the second.</span>
          </h1>

          <p style={{
            fontSize: 17, color: '#64748b', lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 40px',
          }}>
            AI-powered vulnerability scanning on Hedera. Confidential report delivery via Chainlink TEE.
            Pay exactly for what you use — from <strong style={{ color: '#93c5fd' }}>$0.01 per scan</strong>.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <ClickSpark sparkColor="#3b82f6" sparkCount={10} sparkRadius={28} sparkSize={7}>
              <button
                onClick={onLaunch}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: 'white', border: 'none', borderRadius: 6,
                  padding: '16px 40px', fontSize: 16, fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                  boxShadow: ctaHovered
                    ? '0 8px 40px rgba(37,99,235,0.55)'
                    : '0 4px 24px rgba(37,99,235,0.35)',
                  transform: ctaHovered ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.2s',
                  position: 'relative', zIndex: 1,
                }}>
                ⚡ Launch an Analysis
              </button>
            </ClickSpark>

            <a href="#architecture" style={{
              background: 'transparent',
              color: '#60a5fa',
              border: '1px solid rgba(37,99,235,0.3)',
              borderRadius: 6, padding: '16px 32px',
              fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Sora, sans-serif',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              See how it works →
            </a>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            {['Hedera HCS', 'Chainlink TEE', 'Uniswap API', 'World ID', 'EIP-3009'].map(b => (
              <div key={b} style={{
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.15)',
                borderRadius: 4, padding: '5px 12px',
                fontSize: 11, color: '#475569',
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
              }}>{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KPI MARKET ── */}
      <section style={{
        padding: '80px 64px',
        background: '#0a0f1e',
        borderTop: '1px solid rgba(37,99,235,0.1)',
        borderBottom: '1px solid rgba(37,99,235,0.1)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, alignItems: 'start' }}>

          {/* Left: title */}
          <div>
            <div style={{ fontSize: 11, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 16 }}>
              WHY IT MATTERS
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#e2f0f7', marginBottom: 20 }}>
              Web3 security is broken.
            </h2>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
              Every year, billions are lost to smart contract vulnerabilities that could have been caught.
              The tools to prevent this exist — but they're inaccessible, slow, and expensive.
              Audithor changes that.
            </p>
          </div>

          {/* Right: 2x2 big number grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { num: '$2.2B', label: 'Stolen in 2024', sub: 'via smart contract vulnerabilities' },
              { num: '85%', label: 'Were preventable', sub: 'exploited known vulnerability patterns' },
              { num: '$500M', label: 'Audit market 2024', sub: 'growing 35% year over year' },
              { num: '15,000+', label: 'Active Web3 projects', sub: 'deploying smart contracts today' },
            ].map((kpi, i) => (
              <div key={kpi.label} style={{
                background: i === 1 || i === 2 ? '#0f172a' : '#0d1422',
                border: '1px solid rgba(37,99,235,0.12)',
                borderRadius: 8,
                padding: '32px 28px',
                transition: 'border-color 0.2s',
              }}>
                <div style={{
                  fontSize: 52,
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  color: '#e2f0f7',
                  fontFamily: "'Sora', sans-serif",
                  marginBottom: 16,
                }}>{kpi.num}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2f0f7', marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDITHOR NUMBERS ── */}
      <section style={{
        padding: '80px 64px',
        background: '#060b18',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 14 }}>
              AUDITHOR BY THE NUMBERS
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', color: '#e2f0f7' }}>
              Fast, cheap, and <span style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>verifiable.</span>
            </h2>
          </div>

          {/* 4 stats in a row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(37,99,235,0.1)', borderRadius: 8, overflow: 'hidden' }}>
            {[
              { num: '$0.01', label: 'Minimum scan cost', sub: 'vs $15,000+ traditional' },
              { num: '60s', label: 'Max scan duration', sub: 'vs 4-8 weeks traditional' },
              { num: '4', label: 'Specialized AI agents', sub: 'working in parallel' },
              { num: '86%', label: 'Gross margin', sub: 'on pay-per-scan revenue' },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '40px 28px',
                background: '#060b18',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 48, fontWeight: 900,
                  letterSpacing: '-0.04em', lineHeight: 1,
                  background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: 14, fontFamily: "'Sora', sans-serif",
                }}>{stat.num}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2f0f7', marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: '#334155' }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* 3 sponsor blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
            {[
              {
                logo: '⬡', name: 'Hedera',
                prize: '$2,500', track: 'Tokenization + No Solidity',
                desc: 'Immutable audit proof via HCS. Nanopayments at 10,000 TPS. Governed by IBM, Google, Deutsche Bank.',
                color: '#2563eb',
              },
              {
                logo: '🔗', name: 'Chainlink CRE',
                prize: '$2,000', track: 'Confidential HTTP',
                desc: 'Audit report delivered encrypted inside a TEE enclave. Tamper-proof. Unreadable by anyone in transit.',
                color: '#60a5fa',
              },
              {
                logo: '🦄', name: 'Uniswap',
                prize: '$5,000', track: 'Best API Integration',
                desc: 'Pay in any ERC-20 token. Uniswap routes automatically. No pre-buying required. Zero friction.',
                color: '#9333ea',
              },
            ].map(s => (
              <div key={s.name} style={{
                background: '#0a0f1e',
                border: '1px solid rgba(37,99,235,0.15)',
                borderRadius: 8, padding: '24px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{s.logo}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#e2f0f7' }}>{s.name}</span>
                  </div>
                  <div style={{
                    background: 'rgba(37,99,235,0.1)',
                    border: '1px solid rgba(37,99,235,0.25)',
                    borderRadius: 4, padding: '3px 8px',
                    fontSize: 11, fontWeight: 700, color: '#60a5fa',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{s.prize}</div>
                </div>
                <div style={{ fontSize: 10, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
                  {s.track}
                </div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT COMPARES ── */}
      <section style={{ padding: '72px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
              WHY AUDITHOR
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
              Traditional audits vs <span style={{ color: '#60a5fa' }}>Audithor</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { label: 'Traditional Audit', price: '$15,000+', time: '4-8 weeks', proof: '❌ PDF email', continuous: '❌ One-time', color: '#ef4444', dim: true },
              { label: 'Audithor Pro', price: '$0.01–$15', time: '30–120 seconds', proof: '✅ Chainlink TEE', continuous: '✅ Every deploy', color: '#2563eb', dim: false },
              { label: 'Open Source Tools', price: 'Free', time: 'Instant', proof: '❌ Local only', continuous: '✅ CI/CD', color: '#f59e0b', dim: true },
            ].map(row => (
              <div key={row.label} style={{
                padding: '24px 20px',
                background: row.dim ? 'rgba(255,255,255,0.01)' : 'rgba(37,99,235,0.08)',
                border: `2px solid ${row.dim ? 'rgba(255,255,255,0.06)' : 'rgba(37,99,235,0.4)'}`,
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: row.color, marginBottom: 20 }}>{row.label}</div>
                {[
                  { k: 'Cost', v: row.price },
                  { k: 'Speed', v: row.time },
                  { k: 'Confidential report', v: row.proof },
                  { k: 'Continuous scanning', v: row.continuous },
                ].map(item => (
                  <div key={item.k} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: 12,
                  }}>
                    <span style={{ color: '#475569' }}>{item.k}</span>
                    <span style={{ color: '#e2f0f7', fontWeight: 600 }}>{item.v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{
        padding: '72px 48px',
        background: 'rgba(37,99,235,0.03)',
        borderTop: '1px solid rgba(37,99,235,0.1)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
              FEATURES
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
              Everything you need to secure your contracts
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <FeatureCard icon="⚡" title="Per-second streaming" tag="UNIQUE"
              desc="Pay exactly for the compute time used. 34 seconds of scan = 34 seconds billed. Automatic refund of the unused deposit onchain." />
            <FeatureCard icon="🔒" title="Confidential delivery"
              desc="Your audit report travels encrypted inside a Chainlink TEE enclave. Nobody can intercept or read it in transit — not even Chainlink." />
            <FeatureCard icon="⬡" title="Immutable proof"
              desc="Every audit hash is inscribed permanently on Hedera Consensus Service. Verifiable by investors, regulators, and users — forever." />
            <FeatureCard icon="🦄" title="Pay with any token"
              desc="Uniswap routes your ETH, USDC, DAI or any ERC-20 automatically to the settlement token. No pre-buying, zero friction." />
            <FeatureCard icon="🤖" title="4 specialized agents" tag="AI"
              desc="Reentrancy agent, Access Control agent, Logic agent, and Economic Attack agent work in parallel for maximum coverage." />
            <FeatureCard icon="🔄" title="CI/CD integration"
              desc="Scan at every deploy. If a CRITICAL vulnerability is detected, the pipeline is blocked. Build a verifiable audit history over time." />
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE ── */}
      <section id="architecture" style={{ padding: '72px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
              ARCHITECTURE
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
              How Audithor works
            </h2>
            <p style={{ fontSize: 14, color: '#475569', marginTop: 12, maxWidth: 560, margin: '12px auto 0' }}>
              Three sponsor technologies, one cohesive security product.
            </p>
          </div>
          <ArchDiagram />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{
        padding: '72px 48px',
        background: 'rgba(37,99,235,0.03)',
        borderTop: '1px solid rgba(37,99,235,0.1)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
              PRICING
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
              Choose your AI agent
            </h2>
            <p style={{ fontSize: 14, color: '#475569', marginTop: 12 }}>
              Each agent uses a different LLM. The nanopayment stream pays them directly.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 40 }}>
            <PricingCard
              name="Basic Agent" model="GPT-4o mini" price="$0.00005/s" color="#60a5fa"
              features={['Reentrancy detection', 'Access control checks', 'Integer overflow', 'Basic pattern matching']}
            />
            <PricingCard
              name="Pro Agent" model="Claude Sonnet" price="$0.00015/s" color="#2563eb" recommended
              features={['All Basic features', 'Flash loan vectors', 'Oracle manipulation', 'Advanced logic flaws', 'Contextual reasoning']}
            />
            <PricingCard
              name="Enterprise Agent" model="Claude Opus" price="$0.00040/s" color="#1d4ed8"
              features={['All Pro features', 'MEV attack vectors', 'Cross-contract analysis', 'Economic modeling', 'Adversarial simulation']}
            />
          </div>
          {/* Criticality bonuses */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(37,99,235,0.15)',
            borderRadius: 8, padding: '20px 24px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', marginBottom: 14 }}>
              CRITICALITY BONUSES — ALL TIERS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { sev: 'CRITICAL', bonus: '+$0.05', color: '#ef4444', cvss: '9.0–10.0' },
                { sev: 'HIGH', bonus: '+$0.02', color: '#f97316', cvss: '7.0–8.9' },
                { sev: 'MEDIUM', bonus: '+$0.005', color: '#f59e0b', cvss: '4.0–6.9' },
                { sev: 'LOW', bonus: '+$0.001', color: '#3b82f6', cvss: '0.1–3.9' },
              ].map(s => (
                <div key={s.sev} style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: s.color, letterSpacing: '0.08em', marginBottom: 6 }}>{s.sev}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.bonus}</div>
                  <div style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>CVSS {s.cvss}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section style={{
        padding: '80px 48px',
        textAlign: 'center',
        borderTop: '1px solid rgba(37,99,235,0.1)',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Ready to secure your contracts?
          </h2>
          <p style={{ fontSize: 15, color: '#475569', marginBottom: 40 }}>
            From $0.01 per scan. No subscription required. Pay only for what you use.
          </p>
          <ClickSpark sparkColor="#3b82f6" sparkCount={12} sparkRadius={32} sparkSize={8}>
            <button onClick={onLaunch} style={{
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              color: 'white', border: 'none', borderRadius: 6,
              padding: '18px 56px', fontSize: 17, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'Sora, sans-serif',
              boxShadow: '0 4px 32px rgba(37,99,235,0.4)',
              position: 'relative', zIndex: 1,
              letterSpacing: '-0.01em',
            }}>⚡ Launch an Analysis</button>
          </ClickSpark>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 40 }}>
            {[
              { num: '$9,500', label: 'Prize pool targeted' },
              { num: '3', label: 'Sponsor integrations' },
              { num: '100%', label: 'On testnet' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#2563eb', fontFamily: 'JetBrains Mono, monospace' }}>{s.num}</div>
                <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '24px 48px',
        borderTop: '1px solid rgba(37,99,235,0.1)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <AudithorLogo size={22}/>
        <span style={{ fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: '#2563eb' }}>Audit</span>hor
        </span>
        <span style={{ fontSize: 11, color: '#1e293b' }}>ETHGlobal Cannes 2026</span>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 11, color: '#1e293b', fontFamily: 'JetBrains Mono, monospace' }}>
          Hedera · Chainlink · Uniswap
        </span>
      </footer>
    </div>
  );
}
