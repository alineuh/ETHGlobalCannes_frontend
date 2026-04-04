import type { AuditFinding, StreamStatus, Severity } from '../types'

interface Props {
  findings: AuditFinding[]
  status: StreamStatus
}

const severityStyles: Record<Severity, { border: string; badge: string; label: string }> = {
  CRITICAL: {
    border: 'border-l-critical',
    badge: 'bg-critical text-white',
    label: 'CRITICAL',
  },
  HIGH: {
    border: 'border-l-high',
    badge: 'bg-high text-white',
    label: 'HIGH',
  },
  MEDIUM: {
    border: 'border-l-medium',
    badge: 'bg-medium text-black',
    label: 'MEDIUM',
  },
  LOW: {
    border: 'border-l-low',
    badge: 'bg-low text-white',
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
        const styles = severityStyles[finding.severity]
        return (
          <div
            key={`${finding.title}-${finding.line}-${i}`}
            className={`finding-enter rounded-r-lg border-l-4 ${styles.border} bg-[#0d0d16] border border-[#1e1e2e] border-l-0 p-4 space-y-2`}
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${styles.badge}`}>
                {styles.label}
              </span>
              <span className="font-semibold text-white text-sm">{finding.title}</span>
            </div>
            <div className="mono text-xs text-gray-500">Line {finding.line}</div>
            <div className="text-sm text-gray-400">{finding.description}</div>
          </div>
        )
      })}
    </div>
  )
}
