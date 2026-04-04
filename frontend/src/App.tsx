import { useState } from 'react'
import { useCoordinator } from './hooks/useCoordinator'
import type { ContractInput, AuditFinding } from './types'

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

// --- LOGO SVG ---
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="32" height="32" viewBox="0 0 88 88" fill="none">
        <path d="M4 22 L4 4 L22 4" stroke="#0891b2" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M66 4 L84 4 L84 22" stroke="#0891b2" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M4 66 L4 84 L22 84" stroke="#0891b2" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M66 84 L84 84 L84 66" stroke="#0891b2" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="22" y1="30" x2="66" y2="30" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
        <line x1="22" y1="58" x2="66" y2="58" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
        <line x1="22" y1="30" x2="66" y2="58" stroke="#0891b2" strokeWidth="1.5"/>
        <line x1="66" y1="30" x2="22" y2="58" stroke="#0891b2" strokeWidth="1.5"/>
        <circle cx="44" cy="44" r="5" fill="#10b981"/>
        <circle cx="44" cy="44" r="10" stroke="#10b981" strokeWidth="1.2" fill="none" opacity="0.35"/>
      </svg>
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em' }}>
          <span style={{ color: '#0891b2' }}>Krono</span>
          <span style={{ color: '#e2f0f7' }}>Scan</span>
        </div>
        <div style={{ fontSize: 8, letterSpacing: '0.2em', color: '#4a7a96', fontWeight: 600, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
          SECURITY · STREAM
        </div>
      </div>
    </div>
  )
}

// --- SEVERITY CONFIG ---
const SEV_CONFIG = {
  CRITICAL: { border: '#ef4444', bg: 'rgba(239,68,68,0.06)', borderCard: 'rgba(239,68,68,0.2)', badge: 'rgba(239,68,68,0.2)', badgeText: '#f87171' },
  HIGH:     { border: '#f97316', bg: 'rgba(249,115,22,0.06)',  borderCard: 'rgba(249,115,22,0.2)',  badge: 'rgba(249,115,22,0.2)',  badgeText: '#fb923c' },
  MEDIUM:   { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)', borderCard: 'rgba(245,158,11,0.2)', badge: 'rgba(245,158,11,0.2)', badgeText: '#fbbf24' },
  LOW:      { border: '#0891b2', bg: 'rgba(8,145,178,0.06)',  borderCard: 'rgba(8,145,178,0.2)',  badge: 'rgba(8,145,178,0.2)',  badgeText: '#22d3ee' },
}

// --- FINDING CARD ---
function FindingCard({ finding }: { finding: AuditFinding }) {
  const s = SEV_CONFIG[finding.severity]
  return (
    <div className="finding-card" style={{
      borderRadius: 10,
      border: `1px solid ${s.borderCard}`,
      borderLeft: `3px solid ${s.border}`,
      background: s.bg,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 9, fontWeight: 800, padding: '2px 7px',
          borderRadius: 4, letterSpacing: '0.05em',
          fontFamily: 'JetBrains Mono, monospace',
          background: s.badge, color: s.badgeText,
          flexShrink: 0,
        }}>{finding.severity}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2f0f7', letterSpacing: '-0.01em' }}>
          {finding.title}
        </span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#4a7a96' }}>
        #{finding.line}
      </div>
      <div style={{ fontSize: 11.5, color: '#4a7a96', lineHeight: 1.5 }}>
        {finding.description}
      </div>
    </div>
  )
}

// --- EMPTY STATE ---
function EmptyState({ scanning }: { scanning: boolean }) {
  if (scanning) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #0891b2, #10b981)', borderRadius: 2, width: '60%', opacity: 0.6 }}/>
        <span style={{ color: '#4a7a96', fontSize: 13 }}>Scanning for vulnerabilities...</span>
      </div>
    )
  }
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
      <div style={{ width: 56, height: 56, position: 'relative', opacity: 0.35 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderTop: '2px solid #0891b2', borderLeft: '2px solid #0891b2' }}/>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderTop: '2px solid #0891b2', borderRight: '2px solid #0891b2' }}/>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, borderBottom: '2px solid #0891b2', borderLeft: '2px solid #0891b2' }}/>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderBottom: '2px solid #0891b2', borderRight: '2px solid #0891b2' }}/>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981' }}/>
      </div>
      <div style={{ fontSize: 13, color: '#4a7a96', textAlign: 'center', lineHeight: 1.6 }}>
        Submit a contract<br/>to begin scanning
      </div>
    </div>
  )
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
  const [contractInput] = useState<ContractInput>({ mode: 'source', source: SAMPLE_CONTRACT, address: '', chain: 'Arc Testnet' })

  // DEMO MODE state
  const [demoMode, setDemoMode] = useState(false)
  const [demoStatus, setDemoStatus] = useState<'IDLE' | 'ACTIVE' | 'CLOSED'>('IDLE')
  const [demoFindings, setDemoFindings] = useState<AuditFinding[]>([])
  const [demoConsumed, setDemoConsumed] = useState(0)
  const [demoAuthCount, setDemoAuthCount] = useState(0)
  const [demoTimeLeft, setDemoTimeLeft] = useState(32)
  const [demoIntervals, setDemoIntervals] = useState<number[]>([])
  const [scanning, setScanning] = useState(false)

  // Use real coordinator if connected, demo mode otherwise
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

  const timeColor = timeRemaining < 10 ? '#ef4444' : timeRemaining < 20 ? '#f59e0b' : '#10b981'

  // suppress unused var warning
  void demoMode
  void baseRate
  void effectiveRate

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', position: 'relative' }}>
      <div className="bg-grid"/>
      <div className="bg-glow"/>
      <div className="bg-glow2"/>

      {/* HEADER */}
      <header style={{
        height: 56, background: 'rgba(6,13,20,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16,
        position: 'relative', zIndex: 10,
      }}>
        <Logo/>
        <div style={{
          background: 'rgba(8,145,178,0.1)', border: '1px solid rgba(8,145,178,0.25)',
          color: '#0891b2', borderRadius: 20, padding: '3px 10px',
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
          fontFamily: 'JetBrains Mono, monospace',
        }}>ARC TESTNET</div>

        <div style={{ flex: 1 }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            color: '#10b981', borderRadius: 20, padding: '5px 12px',
            fontSize: 11, fontWeight: 600,
          }}>World ID ✓</div>

          {walletAddress ? (
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#4a7a96',
              background: 'rgba(8,145,178,0.05)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '5px 12px',
            }}>
              {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
            </div>
          ) : (
            <button onClick={connectWallet} style={{
              background: 'linear-gradient(135deg, #0891b2, #0e7490)',
              color: 'white', border: 'none', borderRadius: 20,
              padding: '7px 16px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Sora, sans-serif',
              boxShadow: '0 0 20px rgba(8,145,178,0.3)',
            }}>Connect Wallet</button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div className={isLive ? 'pulse-dot' : ''} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isLive ? '#10b981' : '#ef4444',
            }}/>
            <span style={{ fontSize: 11, color: isLive ? '#10b981' : '#ef4444' }}>
              {isLive ? 'Live' : status === 'IDLE' ? 'Demo mode' : 'Demo'}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <main style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 20, padding: '20px 24px 90px',
        height: 'calc(100vh - 56px)', overflow: 'hidden',
        position: 'relative', zIndex: 1,
      }}>

        {/* LEFT: Code input + controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>

          {/* Code card */}
          <div style={{
            flex: 1, background: 'var(--dark2)',
            border: '1px solid var(--border)', borderRadius: 16,
            overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0,
          }}>
            {/* Tab header */}
            <div style={{
              display: 'flex', borderBottom: '1px solid var(--border)',
              background: 'rgba(8,145,178,0.04)',
            }}>
              {['Paste Source', 'On-Chain Address'].map((tab, i) => (
                <div key={tab} style={{
                  padding: '12px 20px', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', color: i === 0 ? '#0891b2' : '#4a7a96',
                  borderBottom: i === 0 ? '2px solid #0891b2' : '2px solid transparent',
                  background: i === 0 ? 'rgba(8,145,178,0.06)' : 'transparent',
                  transition: 'all 0.2s',
                }}>{tab}</div>
              ))}
            </div>

            {/* Code area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
              <textarea
                value={source}
                onChange={e => setSource(e.target.value)}
                style={{
                  width: '100%', height: '100%',
                  background: '#060f18', color: '#8ab4c8',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12.5, lineHeight: 1.7,
                  padding: '20px 20px 20px 16px',
                  borderLeft: '3px solid #0891b2',
                  border: 'none', outline: 'none',
                  resize: 'none', display: 'block',
                }}
                className="code-content"
                spellCheck={false}
              />
              <div className={`scan-line ${status === 'ACTIVE' ? 'active' : ''}`}/>
            </div>
          </div>

          {/* Status row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              borderRadius: 20, padding: '4px 12px', fontSize: 11,
              fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
              background: status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : status === 'CLOSED' ? 'rgba(8,145,178,0.1)' : 'rgba(74,122,150,0.15)',
              color: status === 'ACTIVE' ? '#10b981' : status === 'CLOSED' ? '#0891b2' : '#4a7a96',
              border: `1px solid ${status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : status === 'CLOSED' ? 'rgba(8,145,178,0.2)' : 'rgba(74,122,150,0.2)'}`,
            }}>
              {status === 'ACTIVE' && <div className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }}/>}
              {status}
            </div>
            <span style={{ fontSize: 11, color: '#4a7a96', fontFamily: 'JetBrains Mono, monospace' }}>
              audit.kronoscan.eth
            </span>
            {!isLive && (
              <span style={{ fontSize: 10, color: '#3a5a70', marginLeft: 'auto' }}>
                demo mode — no backend needed
              </span>
            )}
          </div>

          {/* RUN AUDIT BUTTON */}
          <button onClick={handleRunAudit} style={{
            background: status === 'ACTIVE'
              ? 'linear-gradient(135deg, #0e7490, #0891b2)'
              : status === 'CLOSED'
              ? 'linear-gradient(135deg, #0e7490, #0891b2)'
              : 'linear-gradient(135deg, #059669, #10b981)',
            color: 'white', border: 'none', borderRadius: 14,
            padding: '16px 24px', fontSize: 15, fontWeight: 700,
            cursor: status === 'ACTIVE' ? 'not-allowed' : 'pointer',
            fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em',
            boxShadow: status === 'ACTIVE'
              ? '0 4px 24px rgba(8,145,178,0.3)'
              : '0 4px 24px rgba(16,185,129,0.3), 0 0 0 1px rgba(16,185,129,0.15)',
            animation: status === 'ACTIVE' ? 'btnGlow 2s infinite' : 'none',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, width: '100%',
            transition: 'all 0.25s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11,
            }}>
              {status === 'ACTIVE' ? '⏳' : status === 'CLOSED' ? '↩' : '▶'}
            </div>
            {status === 'IDLE' && 'Run Audit'}
            {status === 'ACTIVE' && 'Scanning in progress...'}
            {status === 'CLOSED' && 'Scan Again'}
            {(status === 'OPENING' || status === 'CLOSING') && 'Processing...'}
            {status === 'TERMINATED' && 'Terminated'}
          </button>
        </div>

        {/* RIGHT: Findings panel */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{
            flex: 1, background: 'var(--dark2)',
            border: '1px solid var(--border)', borderRadius: 16,
            overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0,
          }}>
            {/* Findings header */}
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(8,145,178,0.04)', flexShrink: 0,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                color: '#0891b2', textTransform: 'uppercase' as const,
              }}>Vulnerability Findings</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(s => {
                  const colors = { CRITICAL: '#f87171', HIGH: '#fb923c', MEDIUM: '#fbbf24', LOW: '#22d3ee' }
                  const bgs = { CRITICAL: 'rgba(239,68,68,0.15)', HIGH: 'rgba(249,115,22,0.15)', MEDIUM: 'rgba(245,158,11,0.15)', LOW: 'rgba(8,145,178,0.15)' }
                  const borders = { CRITICAL: 'rgba(239,68,68,0.2)', HIGH: 'rgba(249,115,22,0.2)', MEDIUM: 'rgba(245,158,11,0.2)', LOW: 'rgba(8,145,178,0.2)' }
                  return (
                    <div key={s} style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '3px 8px', borderRadius: 6,
                      fontFamily: 'JetBrains Mono, monospace',
                      background: bgs[s], color: colors[s],
                      border: `1px solid ${borders[s]}`,
                    }}>
                      {s[0]}: {sevCounts[s]}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Findings list */}
            <div className="findings-list" style={{
              flex: 1, overflowY: 'auto' as const,
              padding: 12, display: 'flex',
              flexDirection: 'column', gap: 8,
            }}>
              {findings.length === 0
                ? <EmptyState scanning={status === 'ACTIVE'}/>
                : findings.map((f, i) => <FindingCard key={`${f.title}-${i}`} finding={f}/>)
              }
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM COST BAR */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 72, background: 'rgba(6,13,20,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 24, zIndex: 100,
      }}>
        {/* Cost amount */}
        <div style={{ flexShrink: 0, minWidth: 150 }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 22,
            fontWeight: 700, lineHeight: 1,
            background: 'linear-gradient(135deg, #22d3ee, #10b981)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {formatUSDC(totalConsumed)}
          </div>
          <div style={{ fontSize: 10, color: '#4a7a96', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
            {status === 'ACTIVE'
              ? `$0.000080/s · World ID -20% · ${authCount} sigs`
              : status === 'CLOSED'
              ? `${findings.length} findings · scan complete`
              : 'Ready — click Run Audit to begin'
            }
          </div>
        </div>

        {/* Progress track */}
        <div style={{ flex: 1, position: 'relative' }}>
          {status === 'IDLE' ? (
            <div style={{
              height: 6, background: 'var(--dark3)', borderRadius: 3,
              border: '1px dashed rgba(8,145,178,0.2)',
            }}/>
          ) : (
            <div style={{
              height: 8, background: 'var(--dark3)', borderRadius: 4,
              overflow: 'visible', border: '1px solid var(--border)', position: 'relative',
            }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: 'linear-gradient(90deg, #0e7490, #0891b2, #10b981)',
                width: `${Math.min(consumedRatio * 100, 100)}%`,
                transition: 'width 1s linear', position: 'relative',
              }}>
                {status === 'ACTIVE' && (
                  <div className="cost-dot" style={{
                    position: 'absolute', right: -5, top: '50%',
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#10b981',
                  }}/>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          flexShrink: 0, display: 'flex',
          alignItems: 'center', gap: 20,
          opacity: status === 'IDLE' ? 0.3 : 1,
          transition: 'opacity 0.3s',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700, color: '#22d3ee' }}>
              {authCount}
            </div>
            <div style={{ fontSize: 9, color: '#4a7a96', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginTop: 1 }}>
              auth sigs
            </div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--border)' }}/>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: timeColor }}>
              {status === 'IDLE' ? '--' : `${timeRemaining}s`}
            </div>
            <div style={{ fontSize: 9, color: '#4a7a96', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginTop: 1 }}>
              remaining
            </div>
          </div>
          {status === 'CLOSED' && (
            <>
              <div style={{ width: 1, height: 32, background: 'var(--border)' }}/>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                  {formatUSDC(BigInt(1000000) - totalConsumed)}
                </div>
                <div style={{ fontSize: 9, color: '#4a7a96', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginTop: 1 }}>
                  refunded
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
