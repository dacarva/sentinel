import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import './Attest.css'

const SENTINEL_API = import.meta.env.VITE_SENTINEL_API ?? 'http://localhost:3000'

const PLUGIN_URLS: Record<string, string> = {
  'mock-bank': import.meta.env.VITE_TLSN_PLUGIN_URL ?? '/ts-plugin-sample.js',
  'bancolombia': import.meta.env.VITE_TLSN_PLUGIN_BANCOLOMBIA_URL ?? '/ts-plugin-bancolombia.js',
}

const PLUGIN_LABELS: Record<string, string> = {
  'mock-bank': 'Mock Bank',
  'bancolombia': 'Bancolombia',
}

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

interface ThresholdClaim {
  firstName: string
  maskedAccount: string
  currency: string
}

/** Extract a scalar value from a raw TLSNotary fragment like `"available":8481134.26`. */
function extractLeafValue(results: PluginProof['results'], leafKey: string): string | undefined {
  // Prefer explicit params.path match (future extension versions may include it).
  const byParams = results?.find(
    (r) => r.type === 'RECV' && r.part === 'BODY' &&
           (r.params as { path?: string } | undefined)?.path?.endsWith(leafKey)
  )
  if (byParams?.value) return byParams.value

  // Fallback: extension reveals raw key-value fragments, e.g. `"available":8481134.26`.
  const fragment = results?.find(
    (r) => r.type === 'RECV' && r.part === 'BODY' && r.value?.includes(`"${leafKey}"`)
  )
  if (!fragment?.value) return undefined
  const match = fragment.value.match(new RegExp(`"${leafKey}"\\s*:\\s*("([^"]*)"|[^,}\\s]+)`))
  if (!match) return undefined
  return match[2] !== undefined ? match[2] : match[1]
}

function extractThresholdClaim(proof: PluginProof): ThresholdClaim | null {
  const balanceStr = extractLeafValue(proof.results, 'available')
  const currency   = extractLeafValue(proof.results, 'currency') ?? 'COP'
  const number     = extractLeafValue(proof.results, 'number') ?? ''
  const name       = extractLeafValue(proof.results, 'name') ?? ''

  if (!balanceStr) return null
  const balance = Number(balanceStr)
  if (Number.isNaN(balance) || balance <= 1_000_000) return null

  const maskedAccount = number.length > 4
    ? `${number.slice(0, 4)}${'*'.repeat(number.length - 4)}`
    : '****'
  const firstName = name.trim().split(/\s+/)[0] ?? ''
  return { firstName, maskedAccount, currency }
}

/** Plugin returns string from done(JSON.stringify(resp)); resp has { results } and optional { bank }. */
interface PluginProof {
  results?: Array<{ type?: string; part?: string; action?: string; params?: unknown; value?: string }>;
  bank?: string;
}

export function Attest() {
  const { address: connectedAddress, isConnected } = useConnection()
  const [userAddress, setUserAddress] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedPlugin, setSelectedPlugin] = useState<string>('bancolombia')
  const [status, setStatus] = useState<AttestStatus>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<AttestResult | null>(null)
  const [thresholdClaim, setThresholdClaim] = useState<ThresholdClaim | null>(null)

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
    setThresholdClaim(null)

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
      const pluginUrl = resolvePluginUrl(PLUGIN_URLS[selectedPlugin] ?? PLUGIN_URLS['mock-bank'])
      const code = await fetch(pluginUrl).then((r) => {
        if (!r.ok) throw new Error(`Plugin fetch failed: ${r.status} ${r.statusText}`)
        return r.text()
      })
      const trimmed = code.trim()
      if (trimmed.startsWith('<!') || trimmed.startsWith('<html')) {
        setStatus('error')
        setMessage(
          'Plugin URL returned HTML instead of JavaScript. Run "bun run plugin:build" (Mock Bank) or "cd plugin-bancolombia && bun run build" (Bancolombia) and copy the output to app/public/.'
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
        setThresholdClaim(extractThresholdClaim(proof))
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
      const presentation: { results: PluginProof['results']; bank?: string } = { results: proof.results }
      if (proof.bank) presentation.bank = proof.bank
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
          Bank plugin
          <select
            value={selectedPlugin}
            onChange={(e) => setSelectedPlugin(e.target.value)}
            disabled={status === 'connecting' || status === 'proving' || status === 'submitting'}
          >
            {Object.entries(PLUGIN_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>
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

      {thresholdClaim && status === 'success' && (
        <div className="attest-claim">
          <strong>{thresholdClaim.firstName}</strong> ({thresholdClaim.maskedAccount}) has more than 1,000,000 {thresholdClaim.currency}
        </div>
      )}

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
        Backend: <code>{SENTINEL_API}</code> · Plugin: <code>{PLUGIN_URLS[selectedPlugin]}</code>
      </p>
    </div>
  )
}
