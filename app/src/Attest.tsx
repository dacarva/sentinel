import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import './Attest.css'

const SENTINEL_API = import.meta.env.VITE_SENTINEL_API ?? 'http://localhost:3000'
const PLUGIN_URL =
  import.meta.env.VITE_TLSN_PLUGIN_URL ??
  '/mock-bank-plugin.wasm'

export type AttestStatus =
  | 'idle'
  | 'connecting'
  | 'proving'
  | 'submitting'
  | 'success'
  | 'error'

interface AttestResult {
  attestation_id?: string
  status?: string
  error?: string
  message?: string
}

export function Attest() {
  const { address: connectedAddress, isConnected } = useConnection()
  const [userAddress, setUserAddress] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<AttestStatus>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<AttestResult | null>(null)

  useEffect(() => {
    if (connectedAddress) setUserAddress(connectedAddress)
  }, [connectedAddress])

  async function handleProve() {
    const addr = userAddress.trim()
    if (!addr || addr.length !== 42 || !addr.startsWith('0x')) {
      setStatus('error')
      setMessage('user_address must be 0x + 40 hex characters (42 total)')
      return
    }

    setResult(null)
    setMessage('')

    if (typeof window.tlsn === 'undefined') {
      setStatus('error')
      setMessage('TLSN extension not found. Install the TLSNotary browser extension and reload.')
      return
    }

    setStatus('connecting')
    try {
      const client = await window.tlsn.connect()
      setStatus('proving')
      const params: Record<string, string> = {}
      if (username.trim()) params.username = username.trim()
      if (password.trim()) params.password = password.trim()
      const proofData = await client.runPlugin(PLUGIN_URL, Object.keys(params).length ? params : undefined)

      setStatus('submitting')
      const presentation = {
        notaryUrl: proofData.notaryUrl,
        session: proofData.session,
        substrings: proofData.substrings,
      }
      const res = await fetch(`${SENTINEL_API}/attest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: addr,
          presentation: presentation,
        }),
      })
      const data = (await res.json()) as AttestResult & { details?: unknown }
      setResult(data)

      if (res.ok) {
        setStatus('success')
        setMessage(data.attestation_id ? `Attestation ${data.attestation_id} created` : 'Done')
      } else {
        setStatus('error')
        setMessage(data.message ?? data.error ?? `HTTP ${res.status}`)
      }
    } catch (e) {
      setStatus('error')
      const err = e instanceof Error ? e.message : String(e)
      setMessage(err)
      setResult(null)
    }
  }

  return (
    <div className="attest">
      <h1>Prove bank data with TLSNotary</h1>
      <p className="attest-intro">
        Connect the TLSNotary extension, then prove your mock bank balance and transactions.
        Credentials stay in your browser and are only used by the plugin to talk to the bank.
      </p>

      <div className="attest-form">
        <label>
          Wallet address (0x + 40 hex)
          <input
            type="text"
            placeholder="0x1234...abcd"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            readOnly={isConnected}
            disabled={status === 'proving' || status === 'submitting'}
            title={isConnected ? 'Connected wallet — use header to disconnect' : undefined}
          />
        </label>
        <label>
          Bank username (optional for plugin)
          <input
            type="text"
            placeholder="user_pass"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={status === 'proving' || status === 'submitting'}
          />
        </label>
        <label>
          Bank password (optional for plugin)
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={status === 'proving' || status === 'submitting'}
          />
        </label>
        <button
          type="button"
          onClick={handleProve}
          disabled={status === 'connecting' || status === 'proving' || status === 'submitting'}
        >
          {status === 'idle' || status === 'error' || status === 'success'
            ? 'Prove with TLSNotary'
            : status === 'connecting'
              ? 'Connecting to extension…'
              : status === 'proving'
                ? 'Proving…'
                : 'Submitting to backend…'}
        </button>
      </div>

      {(message || result) && (
        <div className={`attest-result attest-result--${status}`}>
          {message && <p className="attest-message">{message}</p>}
          {result && (
            <pre className="attest-json">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}

      <p className="attest-hint">
        Backend: <code>{SENTINEL_API}</code> · Plugin: <code>{PLUGIN_URL}</code>
      </p>
    </div>
  )
}
