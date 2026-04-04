import type { AuditFinding } from '../types'

interface Props {
  consumed: bigint
  refunded: bigint
  duration: number
  findings: AuditFinding[]
}

function formatUSDC(amount: bigint): string {
  const whole = amount / 1_000_000n
  const frac = amount % 1_000_000n
  return `$${whole.toString()}.${frac.toString().padStart(6, '0')}`
}

export function RefundSummary({ consumed, refunded, duration, findings }: Props) {
  const counts = {
    CRITICAL: findings.filter(f => f.severity === 'CRITICAL').length,
    HIGH: findings.filter(f => f.severity === 'HIGH').length,
    MEDIUM: findings.filter(f => f.severity === 'MEDIUM').length,
    LOW: findings.filter(f => f.severity === 'LOW').length,
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
        border: '1px solid #bbf7d0',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>
        ✓ Audit Complete
      </div>

      {/* Severity counts 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'CRITICAL', count: counts.CRITICAL, color: '#ef4444' },
          { label: 'HIGH', count: counts.HIGH, color: '#f97316' },
          { label: 'MEDIUM', count: counts.MEDIUM, color: '#f59e0b' },
          { label: 'LOW', count: counts.LOW, color: '#3b82f6' },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            style={{
              background: 'white',
              borderRadius: 8,
              padding: 12,
              textAlign: 'center',
              border: '1px solid #dcfce7',
            }}
          >
            <div
              className="mono"
              style={{ fontSize: 22, fontWeight: 800, color }}
            >
              {count}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontWeight: 700, color: '#1a1a2e' }}>{duration}s</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Duration</div>
        </div>
        <div style={{ width: 1, height: 32, background: '#bbf7d0' }} />
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontWeight: 700, color: '#1a1a2e' }}>{formatUSDC(consumed)}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Consumed</div>
        </div>
        <div style={{ width: 1, height: 32, background: '#bbf7d0' }} />
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontWeight: 700, color: '#16a34a' }}>{formatUSDC(refunded)}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Refunded</div>
        </div>
      </div>

      {/* Comparison box */}
      <div
        style={{
          background: 'white',
          borderRadius: 10,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>Traditional audit</span>
          <span className="mono" style={{ color: '#ef4444', textDecoration: 'line-through' }}>$5,000+ / 2 weeks</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>KronoScan</span>
          <span className="mono" style={{ color: '#16a34a', fontWeight: 700 }}>
            {formatUSDC(consumed)} / {duration}s
          </span>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 16 }}>
        <a
          href="#"
          className="mono"
          style={{ color: '#4f6ef7', fontSize: 12, textDecoration: 'underline' }}
        >
          View stream on ArcScan ↗
        </a>
        <a
          href="#"
          className="mono"
          style={{ color: '#4f6ef7', fontSize: 12, textDecoration: 'underline' }}
        >
          View refund tx ↗
        </a>
      </div>
    </div>
  )
}
