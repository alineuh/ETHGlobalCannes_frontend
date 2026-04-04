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
      className="rounded-lg p-4 space-y-4"
      style={{
        border: '2px solid #16a34a',
        background: 'linear-gradient(135deg, #051a0d 0%, #080810 100%)',
        boxShadow: '0 -4px 20px rgba(34,197,94,0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2
          className="text-lg font-bold text-green-400"
          style={{ textShadow: '0 0 20px rgba(34,197,94,0.5)' }}
        >
          ✓ Audit Complete
        </h2>
      </div>

      {/* Severity counts 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className="rounded p-3 text-center"
          style={{ background: '#0a0a14', border: '1px solid #1a1a2e' }}
        >
          <div className="mono text-2xl font-bold text-critical">{counts.CRITICAL}</div>
          <div className="text-xs text-gray-500 mt-1">CRITICAL</div>
        </div>
        <div
          className="rounded p-3 text-center"
          style={{ background: '#0a0a14', border: '1px solid #1a1a2e' }}
        >
          <div className="mono text-2xl font-bold text-high">{counts.HIGH}</div>
          <div className="text-xs text-gray-500 mt-1">HIGH</div>
        </div>
        <div
          className="rounded p-3 text-center"
          style={{ background: '#0a0a14', border: '1px solid #1a1a2e' }}
        >
          <div className="mono text-2xl font-bold text-medium">{counts.MEDIUM}</div>
          <div className="text-xs text-gray-500 mt-1">MEDIUM</div>
        </div>
        <div
          className="rounded p-3 text-center"
          style={{ background: '#0a0a14', border: '1px solid #1a1a2e' }}
        >
          <div className="mono text-2xl font-bold text-low">{counts.LOW}</div>
          <div className="text-xs text-gray-500 mt-1">LOW</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <div className="text-center">
          <div className="mono font-bold text-white">{duration}s</div>
          <div className="text-xs text-gray-500">Duration</div>
        </div>
        <div className="w-px h-8" style={{ background: '#1a1a2e' }} />
        <div className="text-center">
          <div className="mono font-bold text-white">{formatUSDC(consumed)}</div>
          <div className="text-xs text-gray-500">Consumed</div>
        </div>
        <div className="w-px h-8" style={{ background: '#1a1a2e' }} />
        <div className="text-center">
          <div className="mono font-bold text-green-400">{formatUSDC(refunded)}</div>
          <div className="text-xs text-gray-500">Refunded</div>
        </div>
      </div>

      {/* Comparison box */}
      <div
        className="rounded p-3 space-y-1.5"
        style={{ background: '#050508', border: '1px solid #1e3a5f' }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 line-through">Traditional audit</span>
          <span className="mono text-gray-500 line-through">$5,000+ / 2 weeks</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-400 font-bold">KronoScan</span>
          <span
            className="mono font-bold text-green-400"
            style={{ textShadow: '0 0 10px rgba(34,197,94,0.4)' }}
          >
            {formatUSDC(consumed)} / {duration} seconds
          </span>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-4 text-xs">
        <a
          href="#"
          className="mono text-arc-blue hover:underline transition-colors"
        >
          View stream on ArcScan ↗
        </a>
        <a
          href="#"
          className="mono text-arc-blue hover:underline transition-colors"
        >
          View refund tx ↗
        </a>
      </div>
    </div>
  )
}
