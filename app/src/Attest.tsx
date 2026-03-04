import { useAttestFlow, PLUGIN_LABELS, PLUGIN_URLS, SENTINEL_API } from './useAttestFlow'
import type { AttestStatus } from './useAttestFlow'
import { ShieldCheck, Shield, Terminal, Wallet, Download, ChevronDown, AlertCircle } from 'lucide-react'
import './Attest.css'

function statusLabel(status: AttestStatus): string {
  if (status === 'connecting') return 'Loading TLSNotary plugin…'
  if (status === 'proving') return 'Running MPC-TLS session…'
  if (status === 'submitting') return 'Submitting proof to Sentinel…'
  if (status === 'success') return 'Proof generated successfully'
  if (status === 'error') return 'Error during proof generation'
  return 'Ready to generate proof'
}

export function Attest() {
  const {
    userAddress,
    setUserAddress,
    username,
    setUsername,
    password,
    setPassword,
    selectedPlugin,
    setSelectedPlugin,
    status,
    message,
    result,
    thresholdClaim,
    fullAttestation,
    isConnected,
    handleProve,
  } = useAttestFlow()

  const busy = status === 'connecting' || status === 'proving' || status === 'submitting'
  const hasSuccess = status === 'success'

  const institution =
    fullAttestation?.proof_origin?.server_name ??
    PLUGIN_LABELS[selectedPlugin] ??
    'Unknown institution'

  const threshold =
    fullAttestation?.disclosed_data?.threshold ?? 1_000_000

  const currency =
    fullAttestation?.disclosed_data?.currency ??
    thresholdClaim?.currency ??
    'COP'

  const proofHash =
    fullAttestation?.disclosed_data?.commitment ??
    fullAttestation?.proof_origin?.transcript_hash ??
    result?.attestation_id ??
    '0x…'

  const debugPayload = result ?? fullAttestation ?? null

  const terminalLines: Array<{ key: string; tone: 'info' | 'success' | 'error'; text: string }> = []

  terminalLines.push({
    key: 'plugin',
    tone: 'info',
    text: `Selected plugin: ${PLUGIN_LABELS[selectedPlugin] ?? selectedPlugin}`,
  })

  if (status === 'idle') {
    terminalLines.push({
      key: 'idle',
      tone: 'info',
      text: '[Ready] Awaiting TLSNotary extension and bank interaction…',
    })
  }

  if (status === 'connecting') {
    terminalLines.push(
      {
        key: 'connect-1',
        tone: 'info',
        text: '[1/3] Fetching TLSNotary plugin JavaScript…',
      },
      {
        key: 'connect-2',
        tone: 'info',
        text: '[2/3] Handing off execution to TLSNotary extension…',
      },
    )
  }

  if (status === 'proving') {
    terminalLines.push(
      {
        key: 'prove-1',
        tone: 'info',
        text: '[Proving] Capturing MPC-TLS transcript from bank endpoint…',
      },
      {
        key: 'prove-2',
        tone: 'info',
        text: '[Proving] Generating zero-knowledge proof for balance threshold…',
      },
    )
  }

  if (status === 'submitting') {
    terminalLines.push(
      {
        key: 'submit-1',
        tone: 'info',
        text: '[Submitting] Posting proof payload to Sentinel backend /attest…',
      },
      {
        key: 'submit-2',
        tone: 'info',
        text: '[Submitting] Waiting for notary signature and attestation ID…',
      },
    )
  }

  if (status === 'success') {
    terminalLines.push({
      key: 'success',
      tone: 'success',
      text: '[Done] Proof verified and attestation registered.',
    })
  }

  if (status === 'error') {
    terminalLines.push({
      key: 'error',
      tone: 'error',
      text: message || 'An unknown error occurred while generating the proof.',
    })
  } else if (message) {
    terminalLines.push({
      key: 'message',
      tone: 'info',
      text: message,
    })
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    void handleProve()
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold text-white">
          Generate Financial Proof
        </h2>
        <p className="text-xs text-zinc-400">
          Developer view of the raw Sentinel attestation payloads and TLSNotary proof exchange.
        </p>
      </div>

      {/* Bank connection + credentials */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="text-sm font-semibold">Bank Connection</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Select Financial Institution
              </label>
              <div className="relative">
                <select
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-60"
                  value={selectedPlugin}
                  onChange={(e) => setSelectedPlugin(e.target.value)}
                  disabled={busy}
                >
                  {Object.entries(PLUGIN_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-500 text-xs">
                  <ChevronDown className="h-3 w-3" />
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Wallet / Destination Address
              </label>
              <input
                type="text"
                placeholder="0x1234…abcd"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                readOnly={isConnected}
                disabled={busy}
                title={isConnected ? 'Connected wallet — use header to disconnect' : undefined}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
              <Shield className="h-4 w-4" />
            </span>
            <div className="text-sm font-semibold">Security Credentials</div>
          </div>

          {/* Yellow shield callout */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3">
            <div className="mt-0.5 text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-amber-300">
                End-to-end privacy protected
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-200">
                Sentinel uses zkTLS. Your bank credentials stay local to the TLSNotary extension;
                only the zero-knowledge proof and minimal disclosed facts are sent to the backend.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Bank Username (optional)
              </label>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Bank Password (optional)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Primary action */}
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-400 disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {busy && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
          )}
          {statusLabel(status)}
        </button>
      </form>

      {/* Success cluster */}
      {hasSuccess && (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl" />
              <div className="relative rounded-full bg-emerald-500 p-3 text-white shadow-lg shadow-emerald-500/40">
                <ShieldCheck className="h-7 w-7" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">
                Proof Generated Successfully
              </h3>
              <p className="text-xs text-zinc-400">
                Your financial credentials have been cryptographically verified by Sentinel.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-2xl border-2 border-emerald-500/40 bg-zinc-950/80 p-1 shadow-2xl">
            <div className="relative rounded-xl border border-dashed border-emerald-500/40 p-4 text-left space-y-3 overflow-hidden">
              <div className="pointer-events-none absolute right-0 top-0 p-3 opacity-10">
                <ShieldCheck className="h-16 w-16 rotate-12" />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Sentinel Protocol
                  </p>
                  <h4 className="text-sm font-semibold text-zinc-100">
                    Financial Passport Stamp
                  </h4>
                </div>
                <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                  Verified
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                    Institution
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-zinc-100">
                    {institution}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                    Criteria
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-zinc-100">
                    Balance &gt; {threshold.toLocaleString('es-CO')}{' '}
                    {currency}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-zinc-800 pt-3">
                {thresholdClaim && (
                  <p className="mb-2 text-[11px] text-zinc-300">
                    <span className="font-semibold text-white">
                      {thresholdClaim.firstName}
                    </span>{' '}
                    ({thresholdClaim.maskedAccount}) satisfies the configured balance
                    threshold in {thresholdClaim.currency}.
                  </p>
                )}
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  Unique Proof Hash
                </p>
                <p className="mt-1 rounded bg-black/60 p-2 text-[10px] font-mono text-zinc-300 break-all">
                  {proofHash}
                </p>
              </div>
            </div>
          </div>

          {/* Secondary actions */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500/90 px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-500/30 transition-colors hover:bg-indigo-400/90"
              onClick={() => {
                /* Placeholder for future integration with downstream protocols. */
              }}
            >
              <Wallet className="h-4 w-4" />
              Use in Aave
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-100 transition-colors hover:bg-zinc-800"
              onClick={() => {
                if (result?.attestation_id) {
                  window.open(`${SENTINEL_API}/attest/${result.attestation_id}`, '_blank')
                }
              }}
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </button>
          </div>
        </div>
      )}

      {/* Live status terminal */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black/80">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            <Terminal className="h-3 w-3" />
            Live Proof Status
          </div>
        </div>
        <div className="terminal-text space-y-1 px-4 py-3 text-[11px] leading-relaxed">
          {terminalLines.map((line) => (
            <div
              key={line.key}
              className={
                line.tone === 'success'
                  ? 'text-emerald-400 flex items-start gap-2'
                  : line.tone === 'error'
                    ? 'text-red-400 flex items-start gap-2'
                    : 'text-zinc-300 flex items-start gap-2'
              }
            >
              <span className="mt-0.5">
                {line.tone === 'success' ? '✔' : line.tone === 'error' ? '✖' : '•'}
              </span>
              <span>{line.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible debug details */}
      {debugPayload && (
        <details className="group rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-left">
          <summary className="flex cursor-pointer items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-200">
            <span className="inline-flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Developer Debug Payload
            </span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3">
            {message && (
              <p className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-[11px] text-zinc-200">
                {message}
              </p>
            )}
            <div className="rounded-lg border border-zinc-900 bg-black/80 p-3">
              <pre className="max-h-64 overflow-auto text-[10px] text-zinc-300">
                {JSON.stringify(debugPayload, null, 2)}
              </pre>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
              <span className="font-mono">
                Backend:
                {' '}
                <code className="rounded bg-zinc-900 px-1 py-0.5">
                  {SENTINEL_API}
                </code>
              </span>
              <span className="font-mono">
                Plugin:
                {' '}
                <code className="rounded bg-zinc-900 px-1 py-0.5">
                  {PLUGIN_URLS[selectedPlugin]}
                </code>
              </span>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}
