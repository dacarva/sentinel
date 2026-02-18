import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import './Attest.css'

const SENTINEL_API = import.meta.env.VITE_SENTINEL_API ?? 'http://localhost:3000'
const PLUGIN_URL =
  import.meta.env.VITE_TLSN_PLUGIN_URL ??
  '/mock-bank-plugin.wasm'

/** Resolve plugin URL to absolute so the extension can fetch it (background resolves relative URLs against extension origin). */
function resolvePluginUrl(relativeOrAbsolute: string): string {
  if (typeof window === 'undefined') return relativeOrAbsolute
  if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) return relativeOrAbsolute
  const path = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : `/${relativeOrAbsolute}`
  return `${window.location.origin}${path}`
}

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
      const c = client as Record<string, unknown>
      const pluginParams = Object.keys(params).length ? params : undefined
      const methodName =
        typeof c?.runPlugin === 'function' ? 'runPlugin'
          : typeof c?.executePlugin === 'function' ? 'executePlugin'
          : typeof c?.execute === 'function' ? 'execute'
          : null
      if (!methodName) {
        const keys = c != null && typeof c === 'object' ? Object.keys(c) : []
        setStatus('error')
        setMessage(`TLSN extension client has no runPlugin/executePlugin. Available: ${keys.join(', ') || 'none'}. Try updating the TLSNotary extension to a version that supports runPlugin (see tlsnotary.org/docs/extension/provider).`)
        return
      }
      const absolutePluginUrl = resolvePluginUrl(PLUGIN_URL)
      // Pass absolute URL so extension (e.g. background) can fetch the WASM; relative URLs resolve against extension origin and 404
      // Direct method call (no .call) so extension getters/proxies work; preserves `this`
      let proofData: unknown
      if (methodName === 'runPlugin') {
        proofData = await (client as { runPlugin: (url: string, params?: Record<string, string>) => Promise<unknown> }).runPlugin(absolutePluginUrl, pluginParams)
      } else if (methodName === 'executePlugin') {
        proofData = await (client as unknown as { executePlugin: (url: string, params?: Record<string, string>) => Promise<unknown> }).executePlugin(absolutePluginUrl, pluginParams)
      } else {
        proofData = await (client as unknown as { execute: (url: string, params?: Record<string, string>) => Promise<unknown> }).execute(absolutePluginUrl, pluginParams)
      }

      const proof = proofData as { notaryUrl?: string; session?: unknown; substrings?: unknown } | null
      if (!proof || proof.notaryUrl == null) {
        setStatus('error')
        setMessage(
          'Proof was cancelled or the plugin did not return proof data. ' +
          'After you click Accept, the extension may show more modals or steps (e.g. open Mock Bank, enter credentials, notarize). ' +
          'Complete every step and wait until the plugin finishes; only then is the proof sent here. Do not close modals early—try again and complete the full flow.'
        )
        return
      }

      setStatus('submitting')
      const presentation = {
        notaryUrl: proof.notaryUrl,
        session: proof.session,
        substrings: proof.substrings,
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
      const err = e instanceof Error ? e.message : String(e)
      setStatus('error')
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
        You may see more than one modal—accept the first, then complete any further steps (e.g. open Mock Bank, notarize) until the plugin finishes.
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
