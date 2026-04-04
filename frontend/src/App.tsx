import { useState } from 'react'
import { useCoordinator } from './hooks/useCoordinator'
import { AgentIdentity } from './components/AgentIdentity'
import { ContractInput } from './components/ContractInput'
import { CostMeter } from './components/CostMeter'
import { FindingsPanel } from './components/FindingsPanel'
import { RefundSummary } from './components/RefundSummary'
import type { ContractInput as ContractInputType } from './types'

const DEFAULT_INPUT: ContractInputType = {
  mode: 'source',
  source: '',
  address: '',
  chain: 'Arc Testnet',
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    IDLE: 'bg-gray-800 text-gray-400',
    OPENING: 'bg-yellow-900/50 text-yellow-400 animate-pulse',
    ACTIVE: 'bg-green-900/50 text-green-400 animate-pulse',
    CLOSING: 'bg-yellow-900/50 text-yellow-400',
    CLOSED: 'bg-green-900/50 text-green-400',
    TERMINATED: 'bg-red-900/50 text-red-400',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mono ${styles[status] ?? 'bg-gray-800 text-gray-400'}`}
    >
      {status}
    </span>
  )
}

export default function App() {
  const [contractInput, setContractInput] = useState<ContractInputType>(DEFAULT_INPUT)

  const {
    status,
    totalConsumed,
    effectiveRate,
    baseRate,
    deposit,
    timeRemaining,
    authCount,
    findings,
    closedData,
    connected,
    runAudit,
  } = useCoordinator()

  const canRun = status === 'IDLE' && connected
  const isRunning = status === 'OPENING' || status === 'ACTIVE'
  const isDone = status === 'CLOSED' || status === 'TERMINATED'

  function handleRunAudit() {
    runAudit(contractInput, true)
  }

  // Compute duration when closed
  const duration =
    closedData && deposit > 0n && effectiveRate > 0n
      ? Number(closedData.consumed / effectiveRate)
      : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Header */}
      <header className="border-b border-[#1e1e2e] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-lg">⚡ KronoScan</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111118] border border-[#1e1e2e] px-2.5 py-0.5 text-xs text-gray-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
            Arc Testnet
          </span>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-green-400">Coordinator connected</span>
            </>
          ) : (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs text-red-400">Connecting...</span>
            </>
          )}
        </div>
      </header>

      {/* Main layout */}
      <main className="flex flex-col lg:flex-row gap-6 p-6 max-w-[1400px] mx-auto">
        {/* Left column — 40% */}
        <div className="flex flex-col gap-4 lg:w-2/5">
          <AgentIdentity verified={true} status={status} />

          <ContractInput value={contractInput} onChange={setContractInput} />

          {/* Run Audit button */}
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={!canRun && !isDone}
            className={`w-full rounded-lg py-3 px-4 font-bold text-sm transition-colors ${
              canRun
                ? 'bg-arc-blue text-white hover:bg-blue-500 cursor-pointer'
                : isDone
                ? 'bg-[#1e1e2e] text-green-400 cursor-default'
                : 'bg-[#1e1e2e] text-gray-600 cursor-not-allowed'
            }`}
          >
            {status === 'IDLE' && '▶ Run Audit'}
            {status === 'OPENING' && 'Opening stream...'}
            {status === 'ACTIVE' && 'Scanning...'}
            {(status === 'CLOSING' || status === 'CLOSED') && '✓ Done'}
            {status === 'TERMINATED' && '✕ Terminated'}
          </button>

          {/* Status pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Stream status:</span>
            <StatusPill status={status} />
          </div>
        </div>

        {/* Right column — 60% */}
        <div className="flex flex-col gap-4 lg:w-3/5">
          <CostMeter
            status={status}
            totalConsumed={totalConsumed}
            effectiveRate={effectiveRate}
            baseRate={baseRate}
            deposit={deposit}
            timeRemaining={timeRemaining}
            authCount={authCount}
            verified={true}
          />

          <hr className="border-[#1e1e2e]" />

          <FindingsPanel findings={findings} status={status} />

          {status === 'CLOSED' && closedData && (
            <RefundSummary
              consumed={closedData.consumed}
              refunded={closedData.refunded}
              duration={duration}
              findings={findings}
            />
          )}
        </div>
      </main>
    </div>
  )
}
