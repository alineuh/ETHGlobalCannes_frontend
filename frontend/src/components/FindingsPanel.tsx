import type { AuditFinding, StreamStatus, Severity } from '../types'

interface Props {
  findings: AuditFinding[]
  status: StreamStatus
}

const severityConfig: Record<
  Severity,
  { borderColor: string; cardBg: string; badgeBg: string; badgeText: string; label: string }
> = {
  CRITICAL: {
    borderColor: '#ef4444',
    cardBg: 'linear-gradient(90deg, #fff5f5 0%, white 40%)',
    badgeBg: '#ef4444',
    badgeText: '#ffffff',
    label: 'CRITICAL',
  },
  HIGH: {
    borderColor: '#f97316',
    cardBg: 'linear-gradient(90deg, #fff7ed 0%, white 40%)',
    badgeBg: '#f97316',
    badgeText: '#ffffff',
    label: 'HIGH',
  },
  MEDIUM: {
    borderColor: '#f59e0b',
    cardBg: 'linear-gradient(90deg, #fffbeb 0%, white 40%)',
    badgeBg: '#f59e0b',
    badgeText: '#ffffff',
    label: 'MEDIUM',
  },
  LOW: {
    borderColor: '#3b82f6',
    cardBg: 'linear-gradient(90deg, #eff6ff 0%, white 40%)',
    badgeBg: '#3b82f6',
    badgeText: '#ffffff',
    label: 'LOW',
  },
}

export function FindingsPanel({ findings, status }: Props) {
  const reversed = [...findings].reverse()

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(79,110,247,0.06)',
        overflow: 'hidden',
        minHeight: 500,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title bar — subtle, light */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f2ff, #f5f3ff)',
          borderLeft: '3px solid #4f6ef7',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Vulnerability Findings
          </span>
          {status === 'ACTIVE' && (
            <span
              className="stream-dot"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                display: 'inline-block',
              }}
            />
          )}
        </div>
        {findings.length > 0 && (
          <span
            style={{
              background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
              color: 'white',
              borderRadius: '50px',
              padding: '2px 10px',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {findings.length}
          </span>
        )}
      </div>

      {/* Findings list */}
      <div style={{ padding: 16, overflowY: 'auto', maxHeight: 440, flex: 1 }}>
        {/* Empty states */}
        {findings.length === 0 && status === 'IDLE' && (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            Submit a contract to begin scanning
          </div>
        )}

        {findings.length === 0 && status === 'ACTIVE' && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div
              style={{
                height: 3,
                background: 'linear-gradient(90deg, #4f6ef7, #7c3aed)',
                borderRadius: 2,
                marginBottom: 16,
                animation: 'tickRight 2s ease-in-out infinite',
              }}
            />
            <span style={{ color: '#94a3b8', fontSize: 14 }}>
              Scanning for vulnerabilities...
            </span>
          </div>
        )}

        {/* Finding cards */}
        {reversed.map((finding, i) => {
          const cfg = severityConfig[finding.severity]
          return (
            <div
              key={`${finding.title}-${finding.line}-${i}`}
              className="finding-enter"
              style={{
                marginBottom: 10,
                borderRadius: 10,
                border: '1px solid #f1f5f9',
                borderLeft: `4px solid ${cfg.borderColor}`,
                padding: '14px 16px',
                background: cfg.cardBg,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                animationDelay: `${i * 20}ms`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span
                  style={{
                    background: cfg.badgeBg,
                    color: cfg.badgeText,
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 4,
                    padding: '2px 6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {cfg.label}
                </span>
                <span style={{ color: '#1a1a2e', fontWeight: 600, fontSize: 14 }}>
                  {finding.title}
                </span>
              </div>
              <div className="mono" style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>
                #{finding.line}
              </div>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                {finding.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
