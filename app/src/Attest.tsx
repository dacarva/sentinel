import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import './Attest.css'

const SENTINEL_API = import.meta.env.VITE_SENTINEL_API ?? 'http://localhost:3000'
const PLUGIN_URL =
  import.meta.env.VITE_TLSN_PLUGIN_URL ??
  '/ts-plugin-sample.js'

/** Resolve plugin URL to absolute for fetch (same-origin or full URL). */
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

/** Plugin returns string from done(JSON.stringify(resp)); resp has { results }. */
interface PluginProof {
  results?: Array<{ type?: string; part?: string; action?: string; params?: unknown; value?: string }>;
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

    if (typeof window.tlsn.execCode !== 'function') {
      setStatus('error')
      setMessage('TLSN extension does not expose execCode. Try updating the TLSNotary extension.')
      return
    }

    setStatus('connecting')
    try {
      const pluginUrl = resolvePluginUrl(PLUGIN_URL)
      const code = await fetch(pluginUrl).then((r) => {
        if (!r.ok) throw new Error(`Plugin fetch failed: ${r.status} ${r.statusText}`)
        return r.text()
      })
      const trimmed = code.trim()
      if (trimmed.startsWith('<!') || trimmed.startsWith('<html')) {
        setStatus('error')
        setMessage(
          'Plugin URL returned HTML instead of JavaScript. Set VITE_TLSN_PLUGIN_URL to /ts-plugin-sample.js in app/.env (or remove it to use the default), then run "bun run plugin:build" from the repo root so app/public/ts-plugin-sample.js exists.'
        )
        return
      }
      setStatus('proving')
      const mocking = false
      let proof: PluginProof

      if (!mocking)  {
        const resultString = await window.tlsn.execCode(code)
        if (resultString == null || typeof resultString !== 'string') {
          setStatus('error')
          setMessage('Plugin did not return proof data. Complete the flow in the extension (open Mock Bank, log in, click Prove) and wait until it finishes.')
          return
        }
        try {
          proof = JSON.parse(resultString) as PluginProof
        } catch {
          setStatus('error')
          setMessage('Plugin returned invalid JSON. The extension may have returned an error message.')
          return
        }
        if (!proof.results || !Array.isArray(proof.results)) {
          setStatus('error')
          setMessage('Proof missing results array. Complete the full prove flow in the extension.')
          return
        }
        console.log('proof', proof)
      }
      else {
        const mockProof = {
          results: [
            { type: 'SENT', part: 'START_LINE', value: 'GET https://sentinel-d75o.onrender.com/account/balance HTTP/1.1' },
            { type: 'RECV', part: 'START_LINE', value: 'HTTP/1.1 200 OK' },
            { type: 'RECV', part: 'BODY', value: '"balance":25000' },
            { type: 'RECV', part: 'BODY', value: '"currency":"USD"' },
            { type: 'RECV', part: 'BODY', value: '"account_id":"ACC-001"' },
          ],
        }
        proof = mockProof as PluginProof

      }



      setStatus('submitting')
      const presentation = { results: proof.results }
      const res = await fetch(`${SENTINEL_API}/attest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: addr,
          presentation,
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
        When you click Prove, the extension will open the Mock Bank login in a new window; after you log in there, use the plugin overlay to run the proof, then the result is sent to your backend.
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
              ? 'Loading plugin…'
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
