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
    <div className="rounded-lg border border-[#1e1e2e] bg-[#0d0d16] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-green-400 text-lg">✓</span>
        <h2 className="text-base font-semibold text-green-400">Audit Complete</h2>
      </div>

      {/* Severity counts 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded bg-[#111118] border border-[#1e1e2e] p-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">CRITICAL</span>
          <span className="mono font-bold text-critical">{counts.CRITICAL}</span>
        </div>
        <div className="rounded bg-[#111118] border border-[#1e1e2e] p-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">HIGH</span>
          <span className="mono font-bold text-high">{counts.HIGH}</span>
        </div>
        <div className="rounded bg-[#111118] border border-[#1e1e2e] p-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">MEDIUM</span>
          <span className="mono font-bold text-medium">{counts.MEDIUM}</span>
        </div>
        <div className="rounded bg-[#111118] border border-[#1e1e2e] p-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">LOW</span>
          <span className="mono font-bold text-low">{counts.LOW}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <div className="text-center">
          <div className="mono font-bold text-white">{duration}s</div>
          <div className="text-xs text-gray-500">Duration</div>
        </div>
        <div className="w-px h-8 bg-[#1e1e2e]" />
        <div className="text-center">
          <div className="mono font-bold text-white">{formatUSDC(consumed)}</div>
          <div className="text-xs text-gray-500">Consumed</div>
        </div>
        <div className="w-px h-8 bg-[#1e1e2e]" />
        <div className="text-center">
          <div className="mono font-bold text-green-400">{formatUSDC(refunded)}</div>
          <div className="text-xs text-gray-500">Refunded</div>
        </div>
      </div>

      {/* Comparison box */}
      <div className="rounded border border-arc-blue/40 bg-arc-blue/5 p-3 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Traditional audit</span>
          <span className="mono text-gray-400">$5,000+ / 2 weeks</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white font-medium">KronoScan</span>
          <span className="mono text-arc-blue font-medium">
            {formatUSDC(consumed)} / {duration} seconds
          </span>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-4 text-xs text-gray-500">
        <a href="#" className="hover:text-arc-blue transition-colors">
          View stream on ArcScan ↗
        </a>
        <a href="#" className="hover:text-arc-blue transition-colors">
          View refund tx ↗
        </a>
      </div>
    </div>
  )
}
