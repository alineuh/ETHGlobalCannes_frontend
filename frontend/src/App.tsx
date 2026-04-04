import { useState } from 'react'
import { useCoordinator } from './hooks/useCoordinator'
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

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}

export default function App() {
  const [contractInput, setContractInput] = useState<ContractInputType>(DEFAULT_INPUT)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)

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

  async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to connect your wallet')
      return
    }
    setWalletLoading(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      setWalletAddress((accounts as string[])[0])
    } catch (e) {
      console.error('Wallet connection failed', e)
    } finally {
      setWalletLoading(false)
    }
  }

  return (
    <div style={{ background: '#f0f2ff', minHeight: '100vh' }}>

      {/* HEADER */}
      <header
        style={{
          background: 'white',
          borderBottom: '1px solid #e8eaf6',
          boxShadow: '0 1px 3px rgba(79,110,247,0.08)',
          padding: '10px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: SVG Logo + wordmark + network badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* SVG Logo */}
            <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L3 7V17C3 24.5 9 31 16 34C23 31 29 24.5 29 17V7L16 2Z"
                fill="url(#shieldGrad)" opacity="0.15"/>
              <path d="M16 2L3 7V17C3 24.5 9 31 16 34C23 31 29 24.5 29 17V7L16 2Z"
                stroke="url(#shieldGrad)" strokeWidth="1.5" fill="none"/>
              <path d="M11 10H21M11 26H21M13 10L19 18L13 26M19 10L13 18L19 26"
                stroke="url(#shieldGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="22" cy="18" r="2.5" fill="#7c3aed"/>
              <circle cx="22" cy="18" r="1.2" fill="white"/>
              <defs>
                <linearGradient id="shieldGrad" x1="3" y1="2" x2="29" y2="34" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4f6ef7"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
              </defs>
            </svg>

            {/* Wordmark */}
            <div>
              <span style={{
                fontWeight: 800,
                fontSize: '1.2rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Krono</span>
              <span style={{
                fontWeight: 800,
                fontSize: '1.2rem',
                letterSpacing: '-0.03em',
                color: '#1a1a2e',
              }}>Scan</span>
            </div>
          </div>

          <span style={{
            background: '#eef0ff',
            color: '#4f6ef7',
            border: '1px solid #c7d2fe',
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 600,
          }}>
            ARC TESTNET
          </span>
        </div>

        {/* Right: wallet + World ID + ENS + connection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Wallet button */}
          {walletAddress ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#f0f2ff', border: '1px solid #c7d2fe',
              borderRadius: 20, padding: '6px 12px',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12, color: '#4f6ef7', fontWeight: 500,
              }}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={walletLoading}
              style={{
                background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: 20,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(79,110,247,0.3)',
                transition: 'opacity 0.2s',
                opacity: walletLoading ? 0.7 : 1,
              }}
            >
              {walletLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          {/* World ID badge */}
          <span style={{
            background: '#f0fdf4', color: '#16a34a',
            border: '1px solid #bbf7d0',
            borderRadius: 20, padding: '6px 10px',
            fontSize: 11, fontWeight: 600,
          }}>
            World ID ✓
          </span>

          {/* ENS name */}
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, color: '#a5b4fc',
          }}>
            audit.kronoscan.eth
          </span>

          {/* Coordinator status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: connected ? '#22c55e' : '#ef4444',
              animation: connected ? 'none' : 'streamPulse 1s infinite',
            }} />
            <span style={{ fontSize: 11, color: connected ? '#22c55e' : '#ef4444' }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN — two columns */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: 28,
        padding: '32px 48px 100px 48px',
        maxWidth: 1300,
        margin: '0 auto',
      }}>
        {/* LEFT (60%): Contract Input + Run Audit + status + refund */}
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
            <span style={{
              fontWeight: 600,
              color: status === 'ACTIVE' ? '#22c55e' : status === 'CLOSED' ? '#4f6ef7' : '#94a3b8',
            }}>
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

        {/* RIGHT (40%): Findings Panel */}
        <FindingsPanel findings={findings} status={status} />
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
