import type { StreamStatus } from '../types'

interface Props {
  verified: boolean
  status: StreamStatus
}

export function AgentIdentity({ verified }: Props) {
  return (
    <div className="rounded-lg border border-[#1e1e2e] bg-[#0d0d16] p-4 space-y-3">
      {/* Row 1: Agent Wallet */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Agent Wallet</span>
        <span className="mono text-sm text-arc-blue">0x1234...5678</span>
      </div>

      {/* Row 2: World ID */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Identity</span>
        {verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-900/40 border border-green-700/50 px-2.5 py-0.5 text-xs text-green-400">
            ✓ World ID Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-900/40 border border-yellow-700/50 px-2.5 py-0.5 text-xs text-yellow-400">
            ⚠ Unverified
          </span>
        )}
      </div>

      {/* Row 3: Target */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Target</span>
        <div className="flex items-center gap-1.5">
          <span className="mono text-sm text-arc-blue">audit.kronoscan.eth</span>
          <span className="mono text-xs text-gray-600">(0x7f3a...)</span>
        </div>
      </div>

      {/* Row 4: Network */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Network</span>
        <span className="mono text-xs text-gray-500">Arc Testnet • Chain ID 5042002</span>
      </div>
    </div>
  )
}
