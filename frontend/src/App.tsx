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
    <div style={{ background: '#f0f2ff', minHeight: '100vh' }}>

      {/* HEADER — slim, white card */}
      <header
        className="px-6 py-3 flex items-center justify-between"
        style={{
          background: 'white',
          borderBottom: '1px solid #e8eaf6',
          boxShadow: '0 1px 3px rgba(79,110,247,0.08)',
        }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <span
            style={{
              background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: '1.3rem',
            }}
          >
            KronoScan
          </span>
          <span
            style={{
              background: '#eef0ff',
              color: '#4f6ef7',
              border: '1px solid #c7d2fe',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            ARC TESTNET
          </span>
        </div>

        {/* Right: Agent wallet + connection */}
        <div className="flex items-center gap-4">
          <AgentIdentity verified={true} status={status} />
          <div className="flex items-center gap-1.5">
            {connected ? (
              <>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 11, color: '#22c55e' }}>Live</span>
              </>
            ) : (
              <>
                <span
                  className="stream-dot"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#ef4444',
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 11, color: '#ef4444' }}>Connecting</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN — two columns, padded bottom for fixed CostMeter bar */}
      <main
        className="p-6 max-w-[1400px] mx-auto"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingBottom: 96 }}
      >
        {/* LEFT: Findings Panel */}
        <FindingsPanel findings={findings} status={status} />

        {/* RIGHT: Contract Input + Run Audit button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ContractInput value={contractInput} onChange={setContractInput} />

          {/* RUN AUDIT BUTTON */}
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={!canRun && !isDone}
            style={{
              background: canRun
                ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                : isDone
                ? 'linear-gradient(135deg, #4f6ef7, #7c3aed)'
                : '#e2e8f0',
              color: canRun || isDone ? 'white' : '#94a3b8',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              fontSize: 15,
              fontWeight: 700,
              cursor: canRun ? 'pointer' : 'not-allowed',
              boxShadow: canRun ? '0 4px 20px rgba(34,197,94,0.35)' : 'none',
              transition: 'all 0.2s',
              width: '100%',
              letterSpacing: '-0.01em',
            }}
          >
            {status === 'IDLE' && '▶  Run Audit'}
            {status === 'OPENING' && 'Opening stream...'}
            {status === 'ACTIVE' && 'Scanning in progress...'}
            {(status === 'CLOSING' || status === 'CLOSED') && '✓  Audit Complete'}
            {status === 'TERMINATED' && 'Stream Terminated'}
          </button>

          {/* Inline status text */}
          <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            Stream:{' '}
            <span
              style={{
                fontWeight: 600,
                color:
                  status === 'ACTIVE'
                    ? '#22c55e'
                    : status === 'CLOSED'
                    ? '#4f6ef7'
                    : '#94a3b8',
              }}
            >
              {status}
            </span>
          </div>

          {/* Refund summary if closed */}
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

      {/* BOTTOM: Cost Meter — full width fixed bar */}
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
    </div>
  )
}
