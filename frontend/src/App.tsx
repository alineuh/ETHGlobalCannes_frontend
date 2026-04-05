import { useState, useRef } from 'react'
import { useCoordinator } from './hooks/useCoordinator'
import type { ContractInput, AuditFinding } from './types'
import LandingPage from './LandingPage'
import ClickSpark from './components/ClickSpark'
import AudithorLogo from './components/AudithorLogo'
import NanoCounter from './components/NanoCounter'
import { BentoCard } from './components/MagicBento'

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
  LOW:      { border: '#3b82f6', badge: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
}

// --- AGENT CONFIG ---
const AGENTS = [
  {
    id: 'basic',
    name: 'Basic Agent',
    model: 'GPT-4o mini',
    price: '$0.00005/s',
    desc: 'Standard detection — Reentrancy, Overflow, Access Control',
    color: '#3b82f6',
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro Agent',
    model: 'Claude Sonnet',
    price: '$0.00015/s',
    desc: 'Advanced reasoning — Flash loans, Oracle manipulation',
    color: '#2563eb',
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Agent',
    model: 'Claude Opus',
    price: '$0.00040/s',
    desc: 'Maximum depth — MEV, Cross-contract, Economic attacks',
    color: '#1d4ed8',
    recommended: false,
  },
] as const

// --- FINDING CARD ---
function FindingCard({ finding }: { finding: AuditFinding }) {
  const s = SEV[finding.severity]
  return (
    <div className="finding-card" style={{
      borderRadius: 6,
      background: 'rgba(6,11,24,0.75)',
      border: '1px solid rgba(37,99,235,0.1)',
      borderLeft: `3px solid ${s.border}`,
      padding: '10px 13px',
      display: 'flex', flexDirection: 'column', gap: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 6px',
          borderRadius: 3, letterSpacing: '0.06em',
          fontFamily: 'JetBrains Mono, monospace',
          background: s.badge, color: s.text, flexShrink: 0,
        }}>{finding.severity}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#e2f0f7', letterSpacing: '-0.01em' }}>
          {finding.title}
        </span>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155' }}>
        line {finding.line}
      </div>
      <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5 }}>
        {finding.description}
      </div>
    </div>
  )
}

// --- EMPTY STATE ---
function EmptyState({ scanning }: { scanning: boolean }) {
  if (scanning) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 }}>
        <div style={{ width: '50%', height: 1, background: 'linear-gradient(90deg, transparent, #2563eb, transparent)', opacity: 0.4 }}/>
        <span style={{ color: '#475569', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>scanning for vulnerabilities...</span>
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

  // Change 4: agent selector
  const [selectedAgent, setSelectedAgent] = useState('pro')
  // Change 5: findings filter
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

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

  // Change 5: filtered findings
  const displayedFindings = activeFilter
    ? findings.filter(f => f.severity === activeFilter)
    : findings

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
      setNanoTxs(prev => [{
        id: txCounter.current,
        amount: '$0.000080',
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        from: `0x${Math.random().toString(16).slice(2, 8)}`,
      }, ...prev].slice(0, 10))
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
    setActiveFilter(null)
  }

  const sevCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  findings.forEach(f => { sevCounts[f.severity]++ })

  const timeColor = timeRemaining < 10 ? '#ef4444' : timeRemaining < 20 ? '#f59e0b' : '#2563eb'

  void demoMode
  void baseRate
  void effectiveRate

  if (!showDashboard) {
    return <LandingPage onLaunch={() => setShowDashboard(true)} />
  }

  return (
    <ClickSpark sparkColor="#2563eb" sparkCount={6} sparkRadius={20} sparkSize={8}>
      <div style={{ minHeight: '100vh', background: '#060b18', display: 'flex', flexDirection: 'column' }}>

        {/* TOP NAVBAR */}
        <nav style={{
          height: 60,
          background: 'rgba(6,11,24,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(37,99,235,0.12)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 16, flexShrink: 0, zIndex: 10,
          position: 'sticky', top: 0,
        }}>
          <button onClick={() => setShowDashboard(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10, padding: 0,
          }}>
            <AudithorLogo size={32}/>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#2563eb' }}>Audit</span>
                <span style={{ color: '#e2f0f7' }}>hor</span>
              </div>
              <div style={{ fontSize: 8, letterSpacing: '0.18em', color: '#475569', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                SECURITY · STREAM
              </div>
            </div>
          </button>

          {/* Change 1: borderRadius 20→6 */}
          <div style={{
            background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)',
            color: '#3b82f6', borderRadius: 6, padding: '3px 10px',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
            fontFamily: 'JetBrains Mono, monospace',
          }}>HEDERA TESTNET</div>

          <div style={{ flex: 1 }}/>

          <div style={{ display: 'flex', gap: 4 }}>
            {(['Dashboard', 'History', 'Certifications'] as const).map((item, i) => (
              <button key={item} style={{
                background: i === 0 ? 'rgba(37,99,235,0.12)' : 'transparent',
                border: i === 0 ? '1px solid rgba(37,99,235,0.25)' : '1px solid transparent',
                color: i === 0 ? '#3b82f6' : '#475569',
                borderRadius: 6, padding: '6px 14px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              }}>{item}</button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              color: '#10b981', borderRadius: 6, padding: '5px 12px',
              fontSize: 11, fontWeight: 600,
            }}>World ID ✓</div>

            {walletAddress ? (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: '#3b82f6', background: 'rgba(37,99,235,0.08)',
                border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: 6, padding: '5px 12px',
              }}>
                {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
              </div>
            ) : (
              <button onClick={connectWallet} style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white', border: 'none', borderRadius: 6,
                padding: '7px 16px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: '0 0 16px rgba(37,99,235,0.25)',
              }}>Connect Wallet</button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? '#10b981' : '#2563eb' }}/>
              <span style={{ fontSize: 11, color: isLive ? '#10b981' : '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                {isLive ? 'Live' : 'Demo'}
              </span>
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20, padding: '20px 24px 96px',
          minHeight: 0,
        }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

            {/* Hero banner — Change 1: borderRadius 10→6 */}
            <div style={{
              background: 'rgba(37,99,235,0.06)',
              border: '1px solid rgba(37,99,235,0.15)',
              borderRadius: 6, padding: '13px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                  SMART CONTRACT AUDIT
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2f0f7', letterSpacing: '-0.02em' }}>
                  AI-Powered Security
                </div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                  Pay per second · Verified by World ID
                </div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 6,
                background: 'rgba(37,99,235,0.1)',
                border: '1px solid rgba(37,99,235,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>🔍</div>
            </div>

            {/* Change 4: Agent selector */}
            <div style={{
              background: '#0a0f1e',
              border: '1px solid rgba(37,99,235,0.2)',
              borderRadius: 6,
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <div style={{
                padding: '8px 14px',
                borderBottom: '1px solid rgba(37,99,235,0.1)',
                fontSize: 10, fontWeight: 700, color: '#64748b',
                letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace',
              }}>SELECT AI AGENT</div>

              {AGENTS.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: selectedAgent === agent.id ? 'rgba(37,99,235,0.1)' : 'transparent',
                    borderLeft: selectedAgent === agent.id ? `3px solid ${agent.color}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: selectedAgent === agent.id ? agent.color : '#94a3b8',
                      }}>{agent.name}</span>
                      {agent.recommended && (
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          background: 'rgba(37,99,235,0.15)', color: '#3b82f6',
                          border: '1px solid rgba(37,99,235,0.25)',
                          borderRadius: 3, padding: '1px 5px', letterSpacing: '0.05em',
                        }}>RECOMMENDED</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                      {agent.model} · {agent.desc}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
                    color: selectedAgent === agent.id ? agent.color : '#475569',
                    flexShrink: 0, marginLeft: 12,
                  }}>{agent.price}</div>
                </div>
              ))}
            </div>

            {/* Code card — Change 1: borderRadius 12→6 */}
            <div style={{
              flex: 1, background: 'rgba(6,11,24,0.85)',
              border: '1px solid rgba(37,99,235,0.12)',
              borderRadius: 6, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', minHeight: 0,
            }}>
              <div style={{
                display: 'flex',
                borderBottom: '1px solid rgba(37,99,235,0.1)',
                flexShrink: 0, padding: '0 4px',
              }}>
                {['Paste Source', 'On-Chain Address'].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    style={{
                      padding: '10px 14px', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', border: 'none', outline: 'none',
                      color: activeTab === i ? '#3b82f6' : '#334155',
                      borderBottom: activeTab === i ? '2px solid #2563eb' : '2px solid transparent',
                      background: 'transparent',
                      transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                    }}
                  >{tab}</button>
                ))}
              </div>

              <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
                {activeTab === 0 ? (
                  <>
                    <textarea
                      value={source}
                      onChange={e => setSource(e.target.value)}
                      style={{
                        width: '100%', height: '100%',
                        background: '#03060f', color: '#60a5fa',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 12, lineHeight: 1.7,
                        padding: '16px 16px 16px 14px',
                        borderLeft: '2px solid rgba(37,99,235,0.4)',
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
                      <label style={{ fontSize: 10, fontWeight: 600, color: '#334155', letterSpacing: '0.08em', display: 'block', marginBottom: 7, fontFamily: 'JetBrains Mono, monospace' }}>
                        CONTRACT ADDRESS
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute', left: 11, top: '50%',
                          transform: 'translateY(-50%)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 13, color: '#334155', pointerEvents: 'none',
                        }}>0x</span>
                        <input
                          value={contractAddress}
                          onChange={e => setContractAddress(e.target.value)}
                          placeholder="7f3a4b8c9d2e1f0a..."
                          style={{
                            width: '100%', background: 'rgba(37,99,235,0.05)',
                            border: '1px solid rgba(37,99,235,0.15)', borderRadius: 4,
                            padding: '10px 12px 10px 34px',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 12, color: '#e2f0f7', outline: 'none',
                          }}
                        />
                      </div>
                      {contractAddress.length > 0 && (
                        <div style={{ marginTop: 5, fontSize: 11, color: contractAddress.length === 40 ? '#10b981' : '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                          {contractAddress.length === 40 ? '✓ valid address' : `${40 - contractAddress.length} more chars`}
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: 10, fontWeight: 600, color: '#334155', letterSpacing: '0.08em', display: 'block', marginBottom: 7, fontFamily: 'JetBrains Mono, monospace' }}>
                        NETWORK
                      </label>
                      <select style={{
                        width: '100%', background: 'rgba(37,99,235,0.05)',
                        border: '1px solid rgba(37,99,235,0.15)', borderRadius: 4,
                        padding: '10px 12px', fontSize: 12,
                        color: '#e2f0f7', outline: 'none',
                      }}>
                        <option style={{ background: '#060b18' }}>Hedera Testnet</option>
                        <option style={{ background: '#060b18' }}>Ethereum Mainnet</option>
                        <option style={{ background: '#060b18' }}>Base</option>
                      </select>
                    </div>

                    <div style={{
                      background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.12)',
                      borderRadius: 4, padding: '10px 12px',
                      fontSize: 11.5, color: '#475569', lineHeight: 1.6,
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
                borderRadius: 4, padding: '4px 10px', fontSize: 10,
                fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                background: 'rgba(6,11,24,0.85)', border: '1px solid rgba(37,99,235,0.12)',
                color: status === 'ACTIVE' ? '#10b981' : status === 'CLOSED' ? '#3b82f6' : '#334155',
              }}>
                {status === 'ACTIVE' && <div className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }}/>}
                {status}
              </div>
              <span style={{ fontSize: 11, color: '#1e293b', fontFamily: 'JetBrains Mono, monospace' }}>
                audit.audithor.eth
              </span>
            </div>

            {/* Single launch button */}
            <button
              onClick={() => {
                if (isLive) coordinator.runAudit(contractInput, true)
                else if (status === 'CLOSED') resetDemo()
                else if (status === 'IDLE') startDemo()
              }}
              style={{
                background: status === 'ACTIVE'
                  ? 'rgba(37,99,235,0.1)'
                  : status === 'CLOSED'
                  ? 'rgba(16,185,129,0.1)'
                  : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: status === 'ACTIVE' ? '#3b82f6' : status === 'CLOSED' ? '#10b981' : 'white',
                border: status === 'ACTIVE' ? '1px solid rgba(37,99,235,0.3)' : 'none',
                borderRadius: 6, padding: '14px 24px',
                fontSize: 14, fontWeight: 700,
                cursor: status === 'ACTIVE' ? 'not-allowed' : 'pointer',
                width: '100%', fontFamily: 'Inter, sans-serif',
                boxShadow: status === 'IDLE' ? '0 4px 20px rgba(37,99,235,0.3)' : 'none',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                flexShrink: 0,
              }}
            >
              {status === 'IDLE' && <><span>⚡</span> Launch Analysis</>}
              {status === 'ACTIVE' && <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span> Scanning...</>}
              {status === 'CLOSED' && <><span>↩</span> New Scan</>}
              {(status === 'OPENING' || status === 'CLOSING') && 'Processing...'}
              {status === 'TERMINATED' && 'Terminated'}
            </button>
          </div>

          {/* RIGHT: Findings panel */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {status === 'IDLE' ? (
              /* Idle placeholder — Change 1: borderRadius 12→6 */
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(37,99,235,0.03)',
                border: '1px dashed rgba(37,99,235,0.12)',
                borderRadius: 6, gap: 16,
              }}>
                <div style={{ width: 56, height: 56, position: 'relative', opacity: 0.25 }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderTop: '2px solid #2563eb', borderLeft: '2px solid #2563eb' }}/>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderTop: '2px solid #2563eb', borderRight: '2px solid #2563eb' }}/>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, borderBottom: '2px solid #2563eb', borderLeft: '2px solid #2563eb' }}/>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderBottom: '2px solid #2563eb', borderRight: '2px solid #2563eb' }}/>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}/>
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  Launch an audit to see<br/>vulnerability findings
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1e293b' }}>
                  audit.audithor.eth
                </div>
              </div>
            ) : (
              /* Findings panel */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, height: '100%' }}>

                {/* Change 5: MagicBento clickable filter cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, flexShrink: 0 }}>
                  {([
                    { key: 'CRITICAL', label: 'Critical', color: '#ef4444', glow: '239,68,68' },
                    { key: 'HIGH',     label: 'High',     color: '#f97316', glow: '249,115,22' },
                    { key: 'MEDIUM',   label: 'Medium',   color: '#f59e0b', glow: '245,158,11' },
                    { key: 'LOW',      label: 'Low',      color: '#3b82f6', glow: '59,130,246' },
                  ] as const).map(s => (
                    <BentoCard
                      key={s.key}
                      glowColor={s.glow}
                      onClick={() => setActiveFilter(activeFilter === s.key ? null : s.key)}
                      style={{
                        borderTop: `2px solid ${s.color}`,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        outline: activeFilter === s.key ? `2px solid ${s.color}` : '2px solid transparent',
                        outlineOffset: '-2px',
                        opacity: activeFilter && activeFilter !== s.key ? 0.45 : 1,
                        transition: 'outline 0.15s, opacity 0.15s, transform 0.2s',
                      }}
                    >
                      <div style={{ fontSize: 22, fontWeight: 900, color: s.color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                        {sevCounts[s.key]}
                      </div>
                      <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, marginTop: 5, letterSpacing: '0.05em' }}>
                        {s.label}
                        {activeFilter === s.key && <span style={{ marginLeft: 5, color: s.color }}>▼</span>}
                      </div>
                    </BentoCard>
                  ))}
                </div>

                {/* Findings list — Change 1: borderRadius 12→6 */}
                <div style={{
                  flex: 1, background: 'rgba(6,11,24,0.85)',
                  border: '1px solid rgba(37,99,235,0.12)',
                  borderRadius: 6, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', minHeight: 0,
                }}>
                  <div style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(37,99,235,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                  }}>
                    {/* Change 5: filtered header */}
                    {activeFilter ? (
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
                        Showing: <span style={{ color: SEV[activeFilter]?.text }}>{activeFilter}</span>
                        <span style={{ color: '#475569', fontWeight: 400 }}> ({displayedFindings.length})</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e2f0f7' }}>
                        Security Findings
                        {findings.length > 0 && (
                          <span style={{
                            marginLeft: 8, background: '#2563eb', color: 'white',
                            borderRadius: 4, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                          }}>{findings.length}</span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Change 5: clear filter button */}
                      {activeFilter && (
                        <button
                          onClick={() => setActiveFilter(null)}
                          style={{
                            background: 'none', border: '1px solid rgba(37,99,235,0.3)',
                            color: '#3b82f6', borderRadius: 4,
                            padding: '2px 8px', fontSize: 10,
                            cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                          }}
                        >✕ clear</button>
                      )}
                      {status === 'ACTIVE' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                          <div className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }}/>
                          scanning
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="findings-list" style={{
                    flex: 1, overflowY: 'auto',
                    padding: 10, display: 'flex',
                    flexDirection: 'column', gap: 7,
                  }}>
                    {displayedFindings.length === 0
                      ? <EmptyState scanning={status === 'ACTIVE'}/>
                      : displayedFindings.map((f, i) => <FindingCard key={`${f.title}-${i}`} finding={f}/>)
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
          background: 'rgba(6,11,24,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(37,99,235,0.1)',
          zIndex: 100, padding: '10px 24px',
          display: 'flex', flexDirection: 'column', gap: 7,
        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ flexShrink: 0, minWidth: 120 }}>
              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1, color: '#2563eb' }}>
                <NanoCounter value={totalConsumed} />
              </div>
              <div style={{ fontSize: 10, color: '#334155', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
                {status === 'ACTIVE'
                  ? `$0.000080/s · World ID -20%`
                  : status === 'CLOSED'
                  ? `${findings.length} findings · complete`
                  : 'ready to scan'
                }
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {status === 'IDLE' ? (
                <div style={{ height: 4, background: 'rgba(37,99,235,0.08)', borderRadius: 2, border: '1px dashed rgba(37,99,235,0.15)' }}/>
              ) : (
                <div style={{ height: 4, background: 'rgba(37,99,235,0.08)', borderRadius: 2, position: 'relative', overflow: 'visible' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: 'linear-gradient(90deg, #1d4ed8, #2563eb, #3b82f6)',
                    width: `${Math.min(consumedRatio * 100, 100)}%`,
                    transition: 'width 1s linear', position: 'relative',
                  }}>
                    {status === 'ACTIVE' && (
                      <div className="cost-dot" style={{
                        position: 'absolute', right: -5, top: '50%',
                        width: 9, height: 9, borderRadius: '50%', background: '#3b82f6',
                      }}/>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14,
              opacity: status === 'IDLE' ? 0.25 : 1, transition: 'opacity 0.3s',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#2563eb' }}>{authCount}</div>
                <div style={{ fontSize: 9, color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>sigs</div>
              </div>
              <div style={{ width: 1, height: 20, background: 'rgba(37,99,235,0.15)' }}/>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: timeColor }}>
                  {status === 'IDLE' ? '--' : `${timeRemaining}s`}
                </div>
                <div style={{ fontSize: 9, color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>left</div>
              </div>
              {status === 'CLOSED' && (
                <>
                  <div style={{ width: 1, height: 20, background: 'rgba(37,99,235,0.15)' }}/>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#10b981' }}>
                      {formatUSDC(BigInt(1000000) - totalConsumed)}
                    </div>
                    <div style={{ fontSize: 9, color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>refund</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Change 3: Fixed nano-tx feed */}
          <div style={{
            display: 'flex', gap: 6, alignItems: 'center',
            height: 24, overflow: 'hidden', position: 'relative', flex: 1,
          }}>
            {status === 'IDLE' ? (
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155' }}>
                — nanopayment stream will appear here
              </span>
            ) : nanoTxs.length === 0 ? (
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155' }}>
                Initializing stream...
              </span>
            ) : (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', animation: 'slideLeft 0.3s ease', width: '100%', overflow: 'hidden' }}>
                {nanoTxs.slice(0, 8).map((tx, i) => (
                  <div key={tx.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: i === 0 ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.08)',
                    border: `1px solid ${i === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.15)'}`,
                    borderRadius: 4, padding: '2px 8px', flexShrink: 0,
                    opacity: Math.max(0.25, 1 - i * 0.1),
                    animation: i === 0 ? 'txIn 0.3s ease forwards' : 'none',
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: i === 0 ? '#10b981' : '#2563eb', flexShrink: 0 }}/>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, color: i === 0 ? '#10b981' : '#3b82f6', whiteSpace: 'nowrap' }}>
                      {tx.amount}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {tx.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </ClickSpark>
  )
}
