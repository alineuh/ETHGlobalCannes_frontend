import type { StreamStatus } from '../types'

interface Props {
  verified: boolean
  status: StreamStatus
}

export function AgentIdentity({ verified }: Props) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d0d1a 0%, #0a0a14 100%)',
        border: '1px solid #1a1a2e',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-0.5 w-full"
        style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, transparent 100%)' }}
      />

      <div className="p-4 space-y-0">
        {/* Row 1: Agent Wallet */}
        <div className="flex items-center justify-between py-3 border-b border-[#12121e]">
          <span className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            🛡 Agent Wallet
          </span>
          <span className="mono text-sm text-arc-blue">0x1234...5678</span>
        </div>

        {/* Row 2: World ID */}
        <div className="flex items-center justify-between py-3 border-b border-[#12121e]">
          <span className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            🔐 Identity
          </span>
          {verified ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-green-900/40 border border-green-700/50 px-2.5 py-0.5 text-xs text-green-400"
              style={{ boxShadow: '0 0 12px rgba(34, 197, 94, 0.2)' }}
            >
              ✓ World ID Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-900/40 border border-yellow-700/50 px-2.5 py-0.5 text-xs text-yellow-400">
              ⚠ Unverified
            </span>
          )}
        </div>

        {/* Row 3: Target */}
        <div className="flex items-center justify-between py-3 border-b border-[#12121e]">
          <span className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            🎯 Target
          </span>
          <div className="flex items-center gap-1.5">
            <span className="mono text-sm text-arc-blue">audit.kronoscan.eth</span>
            <span className="mono text-xs text-gray-600">(0x7f3a...)</span>
          </div>
        </div>

        {/* Row 4: Network */}
        <div className="flex items-center justify-between py-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            🌐 Network
          </span>
          <span className="mono text-xs text-gray-500">Arc Testnet • Chain ID 5042002</span>
        </div>
      </div>
    </div>
  )
}
