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

  // Cost number color based on consumed ratio
  const costColor =
    consumedRatio > 0.9
      ? '#ef4444'
      : consumedRatio > 0.5
      ? '#eab308'
      : '#ffffff'

  const costGlow =
    consumedRatio > 0.9
      ? '0 0 30px rgba(239,68,68,0.5)'
      : consumedRatio > 0.5
      ? '0 0 30px rgba(234,179,8,0.4)'
      : '0 0 30px rgba(59,130,246,0.5)'

  return (
    <div
      className="rounded-lg p-4 space-y-4"
      style={{
        background: 'linear-gradient(135deg, #0a0d1a 0%, #080810 100%)',
        border: '1px solid #1a1a2e',
        borderLeft: '3px solid #3b82f6',
      }}
    >
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Live Cost Meter
      </h2>

      {!isActive ? (
        <div className="space-y-2 py-4 text-center">
          <div className="mono text-4xl font-bold text-gray-700">$0.000000</div>
          <div className="text-sm text-gray-600">Waiting to start...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Big cost display */}
          <div
            className="mono font-bold"
            style={{ fontSize: '3.5rem', lineHeight: 1, color: costColor, textShadow: costGlow }}
          >
            {formatUSDC(totalConsumed)}
          </div>

          {/* Rate row */}
          <div
            className="flex items-center gap-2 flex-wrap rounded px-3 py-2"
            style={{ background: '#0d0d1a', border: '1px solid #1a1a2e' }}
          >
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
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Consumed</span>
              <span>{(consumedRatio * 100).toFixed(1)}%</span>
            </div>
            <div
              className="overflow-hidden"
              style={{ background: '#0d0d1a', height: '6px', borderRadius: '3px' }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.min(consumedRatio * 100, 100).toFixed(1)}%`,
                  background: 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 100%)',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>

          {/* Time remaining bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>⏱ {timeRemaining}s remaining</span>
              <span>{(timeRatio * 100).toFixed(0)}%</span>
            </div>
            <div
              className="overflow-hidden"
              style={{ background: '#0d0d1a', height: '6px', borderRadius: '3px' }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${(timeRatio * 100).toFixed(1)}%`,
                  background:
                    timeRatio > 0.5
                      ? 'linear-gradient(90deg, #16a34a 0%, #3b82f6 100%)'
                      : timeRatio > 0.2
                      ? 'linear-gradient(90deg, #f97316 0%, #eab308 100%)'
                      : 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>

          {/* Auth count */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {status === 'ACTIVE' && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            )}
            🔐 {authCount} EIP-3009 authorizations sent
          </div>
        </div>
      )}
    </div>
  )
}
