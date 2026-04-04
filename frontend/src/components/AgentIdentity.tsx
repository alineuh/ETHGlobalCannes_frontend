import type { StreamStatus } from '../types'

interface Props {
  verified: boolean
  status: StreamStatus
}

export function AgentIdentity({ verified }: Props) {
  return (
    <div className="flex items-center gap-4 mono" style={{ fontSize: 12 }}>
      <span style={{ color: '#94a3b8' }}>0x1234...5678</span>
      {verified ? (
        <span
          style={{
            background: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            borderRadius: 20,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          World ID
        </span>
      ) : (
        <span
          style={{
            background: '#fefce8',
            color: '#ca8a04',
            border: '1px solid #fde68a',
            borderRadius: 20,
            padding: '2px 8px',
            fontSize: 11,
          }}
        >
          Unverified
        </span>
      )}
      <span style={{ color: '#a5b4fc', fontWeight: 500 }}>audit.kronoscan.eth</span>
    </div>
  )
}
