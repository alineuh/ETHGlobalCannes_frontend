import type { StreamStatus } from '../types'

interface Props {
  status: StreamStatus
  totalConsumed: bigint
  effectiveRate: bigint
  baseRate: bigint
  timeRemaining: number
  authCount: number
  deposit: bigint
  verified: boolean
}

function formatUSDC(amount: bigint): string {
  const whole = amount / 1_000_000n
  const frac = amount % 1_000_000n
  return `$${whole.toString()}.${frac.toString().padStart(6, '0')}`
}

export function CostMeter({
  status,
  totalConsumed,
  effectiveRate,
  baseRate,
  timeRemaining,
  authCount,
  deposit,
  verified,
}: Props) {
  const isActive = status !== 'IDLE'

  // Consumed ratio 0..1
  const consumedRatio =
    deposit > 0n ? Number((totalConsumed * 10000n) / deposit) / 10000 : 0

  // Time remaining ratio 0..1
  const totalTime =
    effectiveRate > 0n ? Number(deposit / effectiveRate) : 0
  const timeRatio = totalTime > 0 ? Math.min(timeRemaining / totalTime, 1) : 0

  // Interpolate blue→red for time bar
  const timeBarColor =
    timeRatio > 0.5
      ? '#3b82f6'
      : timeRatio > 0.2
      ? '#f97316'
      : '#ef4444'

  return (
    <div className="rounded-lg border border-[#1e1e2e] bg-[#0d0d16] p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Live Cost Meter
      </h2>

      {!isActive ? (
        <div className="space-y-2 py-4 text-center">
          <div className="mono text-4xl font-bold text-gray-600">$0.000000</div>
          <div className="text-sm text-gray-600">Waiting to start...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Big cost display */}
          <div className="mono font-bold text-white" style={{ fontSize: '3rem', lineHeight: 1 }}>
            {formatUSDC(totalConsumed)}
          </div>

          {/* Rate row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono text-sm text-gray-400">
              Base: {formatUSDC(baseRate)}/s
            </span>
            {verified && effectiveRate !== baseRate && (
              <>
                <span className="text-gray-600">→</span>
                <span className="mono text-sm text-gray-300">
                  Effective: {formatUSDC(effectiveRate)}/s
                </span>
                <span className="inline-flex items-center rounded-full bg-green-900/40 border border-green-700/50 px-2 py-0.5 text-xs text-green-400">
                  World ID -20%
                </span>
              </>
            )}
          </div>

          {/* Consumed progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Consumed</span>
              <span>{(consumedRatio * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#1a1a2e] overflow-hidden">
              <div
                className="h-full rounded-full bg-arc-blue transition-all duration-300"
                style={{ width: `${Math.min(consumedRatio * 100, 100).toFixed(1)}%` }}
              />
            </div>
          </div>

          {/* Time remaining bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>⏱ {timeRemaining}s remaining</span>
              <span>{(timeRatio * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#1a1a2e] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(timeRatio * 100).toFixed(1)}%`,
                  backgroundColor: timeBarColor,
                }}
              />
            </div>
          </div>

          {/* Auth count */}
          <div className="text-xs text-gray-600">
            🔐 {authCount} EIP-3009 authorizations sent
          </div>
        </div>
      )}
    </div>
  )
}
