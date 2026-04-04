import { useState, useEffect, useRef, useCallback } from 'react'
import type { AuditFinding, StreamStatus, ContractInput } from '../types'

interface ClosedData {
  consumed: bigint
  refunded: bigint
  txHash: string
}

interface CoordinatorState {
  status: StreamStatus
  streamId: string | null
  totalConsumed: bigint
  effectiveRate: bigint
  baseRate: bigint
  deposit: bigint
  timeRemaining: number
  authCount: number
  verified: boolean
  findings: AuditFinding[]
  closedData: ClosedData | null
  connected: boolean
}

interface CoordinatorHook extends CoordinatorState {
  runAudit: (input: ContractInput, verified: boolean) => void
}

export function useCoordinator(): CoordinatorHook {
  const [state, setState] = useState<CoordinatorState>({
    status: 'IDLE',
    streamId: null,
    totalConsumed: 0n,
    effectiveRate: 0n,
    baseRate: 0n,
    deposit: 0n,
    timeRemaining: 0,
    authCount: 0,
    verified: false,
    findings: [],
    closedData: null,
    connected: false,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (!mountedRef.current) return
    if (wsRef.current && wsRef.current.readyState < 2) return

    const ws = new WebSocket('ws://localhost:3001')
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      setState(prev => ({ ...prev, connected: true }))
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setState(prev => ({ ...prev, connected: false }))
      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect()
      }, 2000)
    }

    ws.onerror = () => {
      // onclose will fire after onerror, reconnect handled there
    }

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(event.data as string)

        switch (msg.type) {
          case 'stream_opened':
            setState(prev => ({
              ...prev,
              status: 'ACTIVE',
              streamId: msg.streamId ?? null,
              effectiveRate: BigInt(msg.effectiveRate ?? '0'),
              deposit: BigInt(msg.deposit ?? '0'),
              baseRate: BigInt(msg.baseRate ?? '0'),
            }))
            break

          case 'stream_update':
            setState(prev => ({
              ...prev,
              totalConsumed: BigInt(msg.totalConsumed ?? '0'),
              timeRemaining: Number(msg.timeRemaining ?? 0),
              authCount: Number(msg.authCount ?? 0),
              status: (msg.status as StreamStatus) ?? prev.status,
            }))
            break

          case 'stream_closed':
            setState(prev => ({
              ...prev,
              status: 'CLOSED',
              closedData: {
                consumed: BigInt(msg.consumed ?? '0'),
                refunded: BigInt(msg.refunded ?? '0'),
                txHash: String(msg.txHash ?? ''),
              },
            }))
            break

          case 'finding':
            setState(prev => ({
              ...prev,
              findings: [
                ...prev.findings,
                {
                  severity: msg.severity,
                  title: msg.title,
                  line: Number(msg.line ?? 0),
                  description: msg.description,
                },
              ],
            }))
            break

          case 'error':
            console.error('[KronoScan] Coordinator error:', msg)
            break

          default:
            break
        }
      } catch (err) {
        console.error('[KronoScan] Failed to parse message:', err)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const runAudit = useCallback((input: ContractInput, verified: boolean) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[KronoScan] WebSocket not open')
      return
    }
    setState(prev => ({
      ...prev,
      status: 'OPENING',
      findings: [],
      closedData: null,
      totalConsumed: 0n,
      timeRemaining: 0,
      authCount: 0,
    }))
    ws.send(
      JSON.stringify({
        type: 'open_stream',
        seller: '0x0000000000000000000000000000000000000001',
        baseRate: '100',
        deposit: '1000000',
        verified,
        contractInput: input,
      }),
    )
  }, [])

  return { ...state, runAudit }
}
