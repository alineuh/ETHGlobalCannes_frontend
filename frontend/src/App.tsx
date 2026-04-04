import { useState, useRef } from 'react'
import { useCoordinator } from './hooks/useCoordinator'
import type { ContractInput, AuditFinding } from './types'
import LandingPage from './LandingPage'
import ClickSpark from './components/ClickSpark'
import AudithorLogo from './components/AudithorLogo'
import NanoCounter from './components/NanoCounter'

// --- DEMO DATA ---
const DEMO_FINDINGS: AuditFinding[] = [
  { severity: 'CRITICAL', title: 'Reentrancy in withdraw()', line: 14, description: 'State variable updated after external call. Attacker can recursively drain all funds before balance updates.' },
  { severity: 'HIGH', title: 'Missing access control', line: 8, description: 'No owner or role-based restriction on deposit(). Any address can interact without authorization.' },
  { severity: 'MEDIUM', title: 'Unchecked return value', line: 13, description: 'Low-level call() return not fully validated. Silent failures can leave contract state inconsistent.' },
  { severity: 'HIGH', title: 'Unprotected selfdestruct path', line: 11, description: 'Contract balance can be forcibly manipulated. No circuit breaker or pause mechanism present.' },
  { severity: 'MEDIUM', title: 'Integer overflow risk', line: 9, description: 'Pre-0.8 arithmetic patterns detected. Explicit SafeMath usage recommended for clarity.' },
  { severity: 'LOW', title: 'No event emissions', line: 6, description: 'Deposit and withdraw operations emit no events, making off-chain tracking and auditing difficult.' },
]

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok);
        // ⚠ State update AFTER external call — reentrancy!
        balances[msg.sender] -= amount;
    }
}`

// --- SEVERITY CONFIG ---
const SEV: Record<string, { border: string; badge: string; text: string }> = {
  CRITICAL: { border: '#ef4444', badge: 'rgba(239,68,68,0.1)',  text: '#ef4444' },
  HIGH:     { border: '#f97316', badge: 'rgba(249,115,22,0.1)', text: '#f97316' },
  MEDIUM:   { border: '#f59e0b', badge: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
  LOW:      { border: '#0891b2', badge: 'rgba(8,145,178,0.1)',  text: '#0891b2' },
}

// --- FINDING CARD ---
function FindingCard({ finding }: { finding: AuditFinding }) {
  const s = SEV[finding.severity]
  return (
    <div className="finding-card" style={{
      borderRadius: 8,
      background: 'rgba(8,20,35,0.7)',
      border: '1px solid rgba(8,145,178,0.1)',
      borderLeft: `3px solid ${s.border}`,
      padding: '10px 13px',
      display: 'flex', flexDirection: 'column', gap: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 6px',
          borderRadius: 4, letterSpacing: '0.06em',
          fontFamily: 'JetBrains Mono, monospace',
          background: s.badge, color: s.text, flexShrink: 0,
        }}>{finding.severity}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#e2f0f7', letterSpacing: '-0.01em' }}>
          {finding.title}
        </span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#3a5a70' }}>
        line {finding.line}
      </div>
      <div style={{ fontSize: 11.5, color: '#4a7a96', lineHeight: 1.5 }}>
        {finding.description}
      </div>
    </div>
  )
}

// --- EMPTY STATE (while scanning) ---
function EmptyState({ scanning }: { scanning: boolean }) {
  if (scanning) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 }}>
        <div style={{ width: '50%', height: 1, background: 'linear-gradient(90deg, transparent, #0891b2, transparent)', opacity: 0.4 }}/>
        <span style={{ color: '#4a7a96', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>scanning for vulnerabilities...</span>
      </div>
    )
  }
  return null
}

// --- MAIN APP ---
declare global {
  interface Window {
    ethereum?: { request: (args: { method: string }) => Promise<string[]> }
  }
}

export default function App() {
  const coordinator = useCoordinator()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [source, setSource] = useState(SAMPLE_CONTRACT)
  const [contractInput] = useState<ContractInput>({ mode: 'source', source: SAMPLE_CONTRACT, address: '', chain: 'Hedera Testnet' })
  const [activeTab, setActiveTab] = useState(0)
  const [contractAddress, setContractAddress] = useState('')
  const [showDashboard, setShowDashboard] = useState(false)

  const [demoMode, setDemoMode] = useState(false)
  const [demoStatus, setDemoStatus] = useState<'IDLE' | 'ACTIVE' | 'CLOSED'>('IDLE')
  const [demoFindings, setDemoFindings] = useState<AuditFinding[]>([])
  const [demoConsumed, setDemoConsumed] = useState(0)
  const [demoAuthCount, setDemoAuthCount] = useState(0)
  const [demoTimeLeft, setDemoTimeLeft] = useState(32)
  const [demoIntervals, setDemoIntervals] = useState<number[]>([])
  const [scanning, setScanning] = useState(false)

  const [nanoTxs, setNanoTxs] = useState<{ id: number; amount: string; time: string; from: string }[]>([])
  const txCounter = useRef(0)

  const isLive = coordinator.connected
  const status = isLive ? coordinator.status : demoStatus
  const findings = isLive ? coordinator.findings : demoFindings
  const totalConsumed = isLive ? coordinator.totalConsumed : BigInt(demoConsumed)
  const authCount = isLive ? coordinator.authCount : demoAuthCount
  const timeRemaining = isLive ? coordinator.timeRemaining : demoTimeLeft
  const deposit = isLive ? coordinator.deposit : 1000000n
  const effectiveRate = isLive ? coordinator.effectiveRate : 80n
  const baseRate = isLive ? coordinator.baseRate : 100n

  const consumedRatio = deposit > 0n ? Number((totalConsumed * 10000n) / deposit) / 10000 : 0

  function formatUSDC(amount: bigint): string {
    const n = Number(amount) / 1e6
    return '$' + n.toFixed(6)
  }

  async function connectWallet() {
    if (!window.ethereum) { alert('Please install MetaMask'); return }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setWalletAddress(accounts[0])
    } catch (e) { console.error(e) }
  }

  function startDemo() {
    if (scanning) return
    setScanning(true)
    setDemoMode(true)
    setDemoStatus('ACTIVE')
    setDemoFindings([])
    setDemoConsumed(0)
    setDemoAuthCount(0)
    setDemoTimeLeft(32)
    setNanoTxs([])

    const newIntervals: number[] = []
    let consumed = 0
    let auth = 0
    let tLeft = 32

    const costInt = window.setInterval(() => {
      consumed += 80
      auth++
      tLeft = Math.max(0, tLeft - 1)
      setDemoConsumed(consumed)
      setDemoAuthCount(auth)
      setDemoTimeLeft(tLeft)

      txCounter.current++
      const txId = txCounter.current
      const fromHex = Math.random().toString(16).slice(2, 8)
      setNanoTxs(prev => [{
        id: txId,
        amount: '$0.000080',
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        from: `0x${fromHex}...`,
      }, ...prev].slice(0, 12))
    }, 1000)
    newIntervals.push(costInt)

    DEMO_FINDINGS.forEach((f, i) => {
      const t = window.setTimeout(() => {
        setDemoFindings(prev => [f, ...prev])
        if (i === DEMO_FINDINGS.length - 1) {
          window.setTimeout(() => {
            newIntervals.forEach(id => window.clearInterval(id))
            setDemoStatus('CLOSED')
            setScanning(false)
          }, 1200)
        }
      }, 3000 + i * 3500)
      newIntervals.push(t)
    })

    setDemoIntervals(newIntervals)
  }

  function resetDemo() {
    demoIntervals.forEach(id => window.clearInterval(id))
    setDemoStatus('IDLE')
    setDemoFindings([])
    setDemoConsumed(0)
    setDemoAuthCount(0)
    setDemoTimeLeft(32)
    setScanning(false)
    setDemoMode(false)
    setNanoTxs([])
  }

  function handleRunAudit() {
    if (isLive) {
      coordinator.runAudit(contractInput, true)
    } else {
      if (status === 'CLOSED') resetDemo()
      else startDemo()
    }
  }

  const sevCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  findings.forEach(f => { sevCounts[f.severity]++ })

  const timeColor = timeRemaining < 10 ? '#ef4444' : timeRemaining < 20 ? '#f59e0b' : '#0891b2'

  void demoMode
  void baseRate
  void effectiveRate

  // Landing page
  if (!showDashboard) {
    return <LandingPage onLaunch={() => setShowDashboard(true)} />
  }

  // Dashboard
  return (
    <ClickSpark sparkColor="#0891b2" sparkCount={6} sparkRadius={20} sparkSize={8}>
      <div style={{ minHeight: '100vh', background: '#060d14', display: 'flex', flexDirection: 'column' }}>

        {/* TOP NAVBAR */}
        <nav style={{
          height: 60,
          background: 'rgba(6,13,20,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(8,145,178,0.12)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 16, flexShrink: 0, zIndex: 10,
          position: 'sticky', top: 0,
        }}>
          {/* Logo — back to landing */}
          <button onClick={() => setShowDashboard(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10, padding: 0,
          }}>
            <AudithorLogo size={32}/>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#0891b2' }}>Audit</span>
                <span style={{ color: '#e2f0f7' }}>hor</span>
              </div>
              <div style={{ fontSize: 8, letterSpacing: '0.18em', color: '#4a7a96', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                SECURITY · STREAM
              </div>
            </div>
          </button>

          {/* Network badge */}
          <div style={{
            background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.25)',
            color: '#0891b2', borderRadius: 20, padding: '3px 10px',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
            fontFamily: 'JetBrains Mono, monospace',
          }}>HEDERA TESTNET</div>

          <div style={{ flex: 1 }}/>

          {/* Nav items */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['Dashboard', 'History', 'Certifications'] as const).map((item, i) => (
              <button key={item} style={{
                background: i === 0 ? 'rgba(8,145,178,0.12)' : 'transparent',
                border: i === 0 ? '1px solid rgba(8,145,178,0.25)' : '1px solid transparent',
                color: i === 0 ? '#0891b2' : '#4a7a96',
                borderRadius: 20, padding: '6px 14px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              }}>{item}</button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              color: '#10b981', borderRadius: 20, padding: '5px 12px',
              fontSize: 11, fontWeight: 600,
            }}>World ID ✓</div>

            {walletAddress ? (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: '#0891b2', background: 'rgba(8,145,178,0.08)',
                border: '1px solid rgba(8,145,178,0.2)',
                borderRadius: 20, padding: '5px 12px',
              }}>
                {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
              </div>
            ) : (
              <button onClick={connectWallet} style={{
                background: 'linear-gradient(135deg, #0891b2, #0e7490)',
                color: 'white', border: 'none', borderRadius: 20,
                padding: '7px 16px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: '0 0 16px rgba(8,145,178,0.25)',
              }}>Connect Wallet</button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? '#10b981' : '#0891b2' }}/>
              <span style={{ fontSize: 11, color: isLive ? '#10b981' : '#4a7a96', fontFamily: 'JetBrains Mono, monospace' }}>
                {isLive ? 'Live' : 'Demo'}
              </span>
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT — 2 columns */}
        <main style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20, padding: '20px 24px 96px',
          minHeight: 0,
        }}>

          {/* LEFT: Code input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

            {/* Hero banner */}
            <div style={{
              background: 'rgba(8,145,178,0.06)',
              border: '1px solid rgba(8,145,178,0.15)',
              borderRadius: 10, padding: '13px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#4a7a96', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                  SMART CONTRACT AUDIT
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2f0f7', letterSpacing: '-0.02em' }}>
                  AI-Powered Security
                </div>
                <div style={{ fontSize: 11, color: '#4a7a96', marginTop: 2 }}>
                  Pay per second · Verified by World ID
                </div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(8,145,178,0.1)',
                border: '1px solid rgba(8,145,178,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>🔍</div>
            </div>

            {/* Code card */}
            <div style={{
              flex: 1, background: 'rgba(6,13,20,0.8)',
              border: '1px solid rgba(8,145,178,0.12)',
              borderRadius: 12, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', minHeight: 0,
            }}>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid rgba(8,145,178,0.1)',
                flexShrink: 0, padding: '0 4px',
              }}>
                {['Paste Source', 'On-Chain Address'].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    style={{
                      padding: '10px 14px', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', border: 'none', outline: 'none',
                      color: activeTab === i ? '#0891b2' : '#3a5a70',
                      borderBottom: activeTab === i ? '2px solid #0891b2' : '2px solid transparent',
                      background: 'transparent',
                      transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                    }}
                  >{tab}</button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
                {activeTab === 0 ? (
                  <>
                    <textarea
                      value={source}
                      onChange={e => setSource(e.target.value)}
                      style={{
                        width: '100%', height: '100%',
                        background: '#040a10',
                        color: '#5a9ab5',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 12, lineHeight: 1.7,
                        padding: '16px 16px 16px 14px',
                        borderLeft: '2px solid rgba(8,145,178,0.35)',
                        border: 'none', outline: 'none',
                        resize: 'none', display: 'block',
                      }}
                      className="code-content"
                      spellCheck={false}
                    />
                    <div className={`scan-line ${status === 'ACTIVE' ? 'active' : ''}`}/>
                  </>
                ) : (
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', height: '100%' }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 600, color: '#3a5a70', letterSpacing: '0.08em', display: 'block', marginBottom: 7, fontFamily: 'JetBrains Mono, monospace' }}>
                        CONTRACT ADDRESS
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute', left: 11, top: '50%',
                          transform: 'translateY(-50%)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 13, color: '#3a5a70', pointerEvents: 'none',
                        }}>0x</span>
                        <input
                          value={contractAddress}
                          onChange={e => setContractAddress(e.target.value)}
                          placeholder="7f3a4b8c9d2e1f0a..."
                          style={{
                            width: '100%',
                            background: 'rgba(8,145,178,0.05)',
                            border: '1px solid rgba(8,145,178,0.15)',
                            borderRadius: 7,
                            padding: '10px 12px 10px 34px',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 12, color: '#e2f0f7', outline: 'none',
                          }}
                        />
                      </div>
                      {contractAddress.length > 0 && (
                        <div style={{ marginTop: 5, fontSize: 11, color: contractAddress.length === 40 ? '#10b981' : '#4a7a96', fontFamily: 'JetBrains Mono, monospace' }}>
                          {contractAddress.length === 40 ? '✓ valid address' : `${40 - contractAddress.length} more chars`}
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: 10, fontWeight: 600, color: '#3a5a70', letterSpacing: '0.08em', display: 'block', marginBottom: 7, fontFamily: 'JetBrains Mono, monospace' }}>
                        NETWORK
                      </label>
                      <select style={{
                        width: '100%',
                        background: 'rgba(8,145,178,0.05)',
                        border: '1px solid rgba(8,145,178,0.15)',
                        borderRadius: 7,
                        padding: '10px 12px', fontSize: 12,
                        color: '#e2f0f7', outline: 'none',
                      }}>
                        <option style={{ background: '#060d14' }}>Hedera Testnet</option>
                        <option style={{ background: '#060d14' }}>Ethereum Mainnet</option>
                        <option style={{ background: '#060d14' }}>Base</option>
                      </select>
                    </div>

                    <div style={{
                      background: 'rgba(8,145,178,0.05)',
                      border: '1px solid rgba(8,145,178,0.12)',
                      borderRadius: 7, padding: '10px 12px',
                      fontSize: 11.5, color: '#4a7a96', lineHeight: 1.6,
                    }}>
                      The scanner will fetch the verified Solidity source from the block explorer and analyze it in real time.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                borderRadius: 6, padding: '4px 10px', fontSize: 10,
                fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                background: 'rgba(6,13,20,0.8)',
                border: '1px solid rgba(8,145,178,0.12)',
                color: status === 'ACTIVE' ? '#10b981' : status === 'CLOSED' ? '#0891b2' : '#3a5a70',
              }}>
                {status === 'ACTIVE' && <div className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }}/>}
                {status}
              </div>
              <span style={{ fontSize: 11, color: '#1e3a4a', fontFamily: 'JetBrains Mono, monospace' }}>
                audit.audithor.eth
              </span>
            </div>

            {/* Run button */}
            <button onClick={handleRunAudit} style={{
              background: status === 'ACTIVE'
                ? 'rgba(8,145,178,0.15)'
                : 'linear-gradient(135deg, #0891b2, #0e7490)',
              color: status === 'ACTIVE' ? '#0891b2' : 'white',
              border: status === 'ACTIVE' ? '1px solid rgba(8,145,178,0.3)' : '1px solid transparent',
              borderRadius: 9,
              padding: '13px 24px', fontSize: 14, fontWeight: 700,
              cursor: status === 'ACTIVE' ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em',
              boxShadow: status === 'ACTIVE' ? 'none' : '0 4px 20px rgba(8,145,178,0.3)',
              animation: status === 'ACTIVE' ? 'btnGlow 2s infinite' : 'none',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, width: '100%',
              flexShrink: 0, transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 14 }}>
                {status === 'IDLE' ? '▶' : status === 'ACTIVE' ? '⏳' : '↩'}
              </span>
              {status === 'IDLE' && 'Run Audit'}
              {status === 'ACTIVE' && 'Scanning in progress...'}
              {status === 'CLOSED' && 'Scan Again'}
              {(status === 'OPENING' || status === 'CLOSING') && 'Processing...'}
              {status === 'TERMINATED' && 'Terminated'}
            </button>
          </div>

          {/* RIGHT: Findings panel */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {status === 'IDLE' ? (
              /* Idle placeholder */
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(8,145,178,0.03)',
                border: '1px dashed rgba(8,145,178,0.12)',
                borderRadius: 12, gap: 16,
              }}>
                <div style={{ width: 56, height: 56, position: 'relative', opacity: 0.25 }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderTop: '2px solid #0891b2', borderLeft: '2px solid #0891b2' }}/>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderTop: '2px solid #0891b2', borderRight: '2px solid #0891b2' }}/>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, borderBottom: '2px solid #0891b2', borderLeft: '2px solid #0891b2' }}/>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderBottom: '2px solid #0891b2', borderRight: '2px solid #0891b2' }}/>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}/>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: '#4a7a96', lineHeight: 1.6 }}>
                  Launch an audit to see<br/>vulnerability findings
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1e3a4a' }}>
                  audit.audithor.eth
                </div>
              </div>
            ) : (
              /* Findings panel */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, height: '100%' }}>

                {/* Severity counters */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, flexShrink: 0 }}>
                  {([
                    { key: 'CRITICAL', label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)' },
                    { key: 'HIGH',     label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.15)' },
                    { key: 'MEDIUM',   label: 'Medium',   color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
                    { key: 'LOW',      label: 'Low',      color: '#0891b2', bg: 'rgba(8,145,178,0.06)',  border: 'rgba(8,145,178,0.15)' },
                  ] as const).map(s => (
                    <div key={s.key} style={{
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      borderRadius: 8, padding: '10px 12px',
                      borderTop: `2px solid ${s.color}`,
                    }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                        {sevCounts[s.key]}
                      </div>
                      <div style={{ fontSize: 10, color: '#3a5a70', fontWeight: 500, marginTop: 4, letterSpacing: '0.04em' }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Findings list */}
                <div style={{
                  flex: 1, background: 'rgba(6,13,20,0.8)',
                  border: '1px solid rgba(8,145,178,0.12)',
                  borderRadius: 12, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', minHeight: 0,
                }}>
                  <div style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid rgba(8,145,178,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e2f0f7' }}>
                      Security Findings
                      {findings.length > 0 && (
                        <span style={{
                          marginLeft: 8, background: '#0891b2', color: 'white',
                          borderRadius: 5, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                        }}>{findings.length}</span>
                      )}
                    </div>
                    {status === 'ACTIVE' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                        <div className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }}/>
                        scanning
                      </div>
                    )}
                  </div>

                  <div className="findings-list" style={{
                    flex: 1, overflowY: 'auto',
                    padding: 10, display: 'flex',
                    flexDirection: 'column', gap: 7,
                  }}>
                    {findings.length === 0
                      ? <EmptyState scanning={status === 'ACTIVE'}/>
                      : findings.map((f, i) => <FindingCard key={`${f.title}-${i}`} finding={f}/>)
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* BOTTOM COST BAR */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 80,
          background: 'rgba(6,13,20,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(8,145,178,0.1)',
          zIndex: 100, padding: '10px 24px',
          display: 'flex', flexDirection: 'column', gap: 7,
        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>

            <div style={{ flexShrink: 0, minWidth: 120 }}>
              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1, color: '#0891b2' }}>
                <NanoCounter value={totalConsumed} />
              </div>
              <div style={{ fontSize: 10, color: '#3a5a70', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                {status === 'ACTIVE'
                  ? `$0.000080/s · World ID -20%`
                  : status === 'CLOSED'
                  ? `${findings.length} findings · complete`
                  : 'ready to scan'
                }
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ flex: 1 }}>
              {status === 'IDLE' ? (
                <div style={{
                  height: 4, background: 'rgba(8,145,178,0.08)', borderRadius: 2,
                  border: '1px dashed rgba(8,145,178,0.15)',
                }}/>
              ) : (
                <div style={{
                  height: 4, background: 'rgba(8,145,178,0.08)', borderRadius: 2,
                  position: 'relative', overflow: 'visible',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: 'linear-gradient(90deg, #0e7490, #0891b2)',
                    width: `${Math.min(consumedRatio * 100, 100)}%`,
                    transition: 'width 1s linear', position: 'relative',
                  }}>
                    {status === 'ACTIVE' && (
                      <div className="cost-dot" style={{
                        position: 'absolute', right: -5, top: '50%',
                        width: 9, height: 9, borderRadius: '50%',
                        background: '#0891b2',
                      }}/>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14,
              opacity: status === 'IDLE' ? 0.25 : 1, transition: 'opacity 0.3s',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#0891b2' }}>
                  {authCount}
                </div>
                <div style={{ fontSize: 9, color: '#3a5a70', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>sigs</div>
              </div>
              <div style={{ width: 1, height: 20, background: 'rgba(8,145,178,0.15)' }}/>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: timeColor }}>
                  {status === 'IDLE' ? '--' : `${timeRemaining}s`}
                </div>
                <div style={{ fontSize: 9, color: '#3a5a70', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>left</div>
              </div>
              {status === 'CLOSED' && (
                <>
                  <div style={{ width: 1, height: 20, background: 'rgba(8,145,178,0.15)' }}/>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#10b981' }}>
                      {formatUSDC(BigInt(1000000) - totalConsumed)}
                    </div>
                    <div style={{ fontSize: 9, color: '#3a5a70', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>refund</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Nano-tx feed */}
          <div style={{
            display: 'flex', gap: 5, overflow: 'hidden',
            alignItems: 'center', height: 20,
          }}>
            {status === 'IDLE' ? (
              <span style={{ fontSize: 10, color: '#1e3a4a', fontFamily: 'JetBrains Mono, monospace' }}>
                — nanopayment stream will appear here
              </span>
            ) : nanoTxs.map((tx, i) => (
              <div key={tx.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(8,145,178,0.08)',
                border: '1px solid rgba(8,145,178,0.15)',
                borderRadius: 5, padding: '2px 8px', flexShrink: 0,
                animation: i === 0 ? 'txIn 0.25s ease forwards' : 'none',
                opacity: Math.max(0.2, 1 - i * 0.1),
              }}>
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: i === 0 ? '#0891b2' : '#0e7490', flexShrink: 0,
                }}/>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
                  fontWeight: 600, color: '#0891b2',
                }}>{tx.amount}</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#3a5a70',
                }}>{tx.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ClickSpark>
  )
}
