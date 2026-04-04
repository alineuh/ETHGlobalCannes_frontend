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

  const timeColor =
    timeRemaining < 10 ? '#ef4444' : timeRemaining < 30 ? '#f59e0b' : '#22c55e'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: 'white',
        borderTop: '2px solid #e8eaf6',
        boxShadow: '0 -4px 24px rgba(79,110,247,0.1)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
        gap: 24,
      }}
    >
      {!isActive ? (
        <>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap' }}>
            KronoScan Payment Stream
          </span>
          <div style={{
            flex: 1,
            height: 6,
            background: '#f0f2ff',
            borderRadius: 3,
            border: '1px dashed #c7d2fe',
          }} />
          <span style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>
            Ready — click Run Audit to begin
          </span>
        </>
      ) : (
        <>
          {/* Left: cost amount */}
          <div style={{ whiteSpace: 'nowrap' }}>
            <div
              className="mono"
              style={{
                fontSize: 22,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatUSDC(totalConsumed)}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {formatUSDC(effectiveRate)}/s{verified ? ' · World ID -20%' : ''}
            </div>
          </div>

          {/* Center: streaming progress bar — flex-1 to fill remaining space */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div
              style={{
                width: '100%',
                height: 8,
                background: '#f0f2ff',
                borderRadius: 4,
                overflow: 'visible',
                position: 'relative',
              }}
            >
              {/* Main progress fill */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.min(consumedRatio * 100, 100).toFixed(2)}%`,
                  background: 'linear-gradient(90deg, #4f6ef7, #7c3aed)',
                  borderRadius: 4,
                  transition: 'width 1s linear',
                }}
              />
              {/* Pulse dot at leading edge */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 12,
                  height: 12,
                  left: `calc(${Math.min(consumedRatio * 100, 100).toFixed(2)}% - 6px)`,
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #7c3aed',
                  transition: 'left 1s linear',
                }}
              />
            </div>
          </div>

          {/* Time remaining */}
          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: timeColor }}>
              {timeRemaining}s
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>remaining</div>
          </div>

          {/* Auth count */}
          <div
            style={{
              background: '#f0f2ff',
              border: '1px solid #c7d2fe',
              borderRadius: 8,
              padding: '6px 12px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#4f6ef7' }}>
              {authCount}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>auth sigs</div>
          </div>
        </>
      )}
    </div>
  )
}
