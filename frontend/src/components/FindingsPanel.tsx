import type { AuditFinding, StreamStatus, Severity } from '../types'

interface Props {
  findings: AuditFinding[]
  status: StreamStatus
}

const severityConfig: Record<
  Severity,
  { borderColor: string; bgGradient: string; boxShadow: string; badgeBg: string; badgeText: string; badgeGlow: string; label: string }
> = {
  CRITICAL: {
    borderColor: '#ef4444',
    bgGradient: 'linear-gradient(90deg, rgba(239,68,68,0.08) 0%, transparent 100%)',
    boxShadow: 'inset 0 0 20px rgba(239,68,68,0.05)',
    badgeBg: '#ef4444',
    badgeText: '#ffffff',
    badgeGlow: '0 0 10px rgba(239,68,68,0.4)',
    label: 'CRITICAL',
  },
  HIGH: {
    borderColor: '#f97316',
    bgGradient: 'linear-gradient(90deg, rgba(249,115,22,0.08) 0%, transparent 100%)',
    boxShadow: 'inset 0 0 20px rgba(249,115,22,0.05)',
    badgeBg: '#f97316',
    badgeText: '#ffffff',
    badgeGlow: '0 0 10px rgba(249,115,22,0.4)',
    label: 'HIGH',
  },
  MEDIUM: {
    borderColor: '#eab308',
    bgGradient: 'linear-gradient(90deg, rgba(234,179,8,0.08) 0%, transparent 100%)',
    boxShadow: 'inset 0 0 20px rgba(234,179,8,0.05)',
    badgeBg: '#eab308',
    badgeText: '#000000',
    badgeGlow: '0 0 10px rgba(234,179,8,0.4)',
    label: 'MEDIUM',
  },
  LOW: {
    borderColor: '#60a9fa',
    bgGradient: 'linear-gradient(90deg, rgba(96,169,250,0.08) 0%, transparent 100%)',
    boxShadow: 'inset 0 0 20px rgba(96,169,250,0.05)',
    badgeBg: '#60a9fa',
    badgeText: '#ffffff',
    badgeGlow: '0 0 10px rgba(96,169,250,0.4)',
    label: 'LOW',
  },
}

export function FindingsPanel({ findings, status }: Props) {
  const reversed = [...findings].reverse()

  return (
    <div className="space-y-3">
      {/* Title row */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Vulnerability Findings
        </h2>
        {status === 'ACTIVE' && (
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        )}
        {findings.length > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-arc-blue px-2 py-0.5 text-xs font-bold text-white min-w-[1.25rem]">
            {findings.length}
          </span>
        )}
      </div>

      {/* Empty states */}
      {findings.length === 0 && status === 'IDLE' && (
        <div className="py-12 text-center text-gray-600 text-sm">
          Submit a contract to begin scanning
        </div>
      )}

      {findings.length === 0 && status === 'ACTIVE' && (
        <div className="py-12 text-center">
          <span className="animate-pulse-text text-gray-500 text-sm">
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
            className="finding-enter rounded-r-lg p-4 space-y-2 transition-all duration-150 group"
            style={{
              borderLeft: `4px solid ${cfg.borderColor}`,
              background: cfg.bgGradient,
              boxShadow: cfg.boxShadow,
              border: `1px solid #1a1a2e`,
              borderLeftColor: cfg.borderColor,
              borderLeftWidth: '4px',
              animationDelay: `${i * 20}ms`,
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center rounded px-2.5 py-1 text-xs font-bold tracking-wide"
                style={{
                  background: cfg.badgeBg,
                  color: cfg.badgeText,
                  boxShadow: cfg.badgeGlow,
                }}
              >
                {cfg.label}
              </span>
              <span
                className="font-semibold text-white text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                {finding.title}
              </span>
            </div>
            <div className="mono text-xs text-gray-500">#{finding.line}</div>
            <div className="text-sm text-gray-400">{finding.description}</div>
          </div>
        )
      })}
    </div>
  )
}
