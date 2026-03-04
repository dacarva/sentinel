import { useAttestFlow, PLUGIN_LABELS, PLUGIN_URLS, SENTINEL_API } from './useAttestFlow'
import type { AttestStatus } from './useAttestFlow'
import { ShieldCheck, Shield, Terminal, Wallet, Download, ChevronDown, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './Attest.css'

function statusLabel(status: AttestStatus): string {
  if (status === 'connecting') return 'attest.status.loadingPlugin'
  if (status === 'proving') return 'attest.status.proving'
  if (status === 'submitting') return 'attest.status.submitting'
  if (status === 'success') return 'attest.status.success'
  if (status === 'error') return 'attest.status.error'
  return 'attest.status.ready'
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

  const { t } = useTranslation('common')

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
    text: t('attest.terminal.selectedPlugin', {
      plugin: PLUGIN_LABELS[selectedPlugin] ?? selectedPlugin,
    }),
  })

  if (status === 'idle') {
    terminalLines.push({
      key: 'idle',
      tone: 'info',
      text: t('attest.terminal.ready'),
    })
  }

  if (status === 'connecting') {
    terminalLines.push(
      {
        key: 'connect-1',
        tone: 'info',
        text: t('attest.terminal.connect1'),
      },
      {
        key: 'connect-2',
        tone: 'info',
        text: t('attest.terminal.connect2'),
      },
    )
  }

  if (status === 'proving') {
    terminalLines.push(
      {
        key: 'prove-1',
        tone: 'info',
        text: t('attest.terminal.prove1'),
      },
      {
        key: 'prove-2',
        tone: 'info',
        text: t('attest.terminal.prove2'),
      },
    )
  }

  if (status === 'submitting') {
    terminalLines.push(
      {
        key: 'submit-1',
        tone: 'info',
        text: t('attest.terminal.submit1'),
      },
      {
        key: 'submit-2',
        tone: 'info',
        text: t('attest.terminal.submit2'),
      },
    )
  }

  if (status === 'success') {
    terminalLines.push({
      key: 'success',
      tone: 'success',
      text: t('attest.terminal.success'),
    })
  }

  if (status === 'error') {
    terminalLines.push({
      key: 'error',
      tone: 'error',
      text: message || t('attest.terminal.unknownError'),
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
          {t('attest.hero.title')}
        </h2>
        <p className="text-xs text-zinc-400">
          {t('attest.hero.subtitle')}
        </p>
      </div>

      {/* Bank connection + credentials */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-4">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="text-sm font-semibold">{t('attest.bankConnection.title')}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {t('attest.bankConnection.selectInstitution')}
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
                {t('attest.bankConnection.walletLabel')}
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
            <div className="text-sm font-semibold">{t('attest.security.title')}</div>
          </div>

          {/* Yellow shield callout */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3">
            <div className="mt-0.5 text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-amber-300">
                {t('attest.security.calloutTitle')}
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-200">
                {t('attest.security.calloutBody')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {t('attest.security.usernameLabel')}
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
                {t('attest.security.passwordLabel')}
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
          {t(statusLabel(status))}
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
                {t('attest.success.title')}
              </h3>
              <p className="text-xs text-zinc-400">
                {t('attest.success.subtitle')}
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
                    {t('attest.success.protocolLabel')}
                  </p>
                  <h4 className="text-sm font-semibold text-zinc-100">
                    {t('attest.success.passportStamp')}
                  </h4>
                </div>
                <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                  {t('attest.success.verifiedPill')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                    {t('attest.success.institutionLabel')}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-zinc-100">
                    {institution}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                    {t('attest.success.criteriaLabel')}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-zinc-100">
                    {t('attest.success.criteriaValue', {
                      threshold: threshold.toLocaleString('es-CO'),
                      currency,
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t border-zinc-800 pt-3">
                {thresholdClaim && (
                  <p className="mb-2 text-[11px] text-zinc-300">
                    <span className="font-semibold text-white">
                      {thresholdClaim.firstName}
                    </span>{' '}
                    {t('attest.success.thresholdText', {
                      account: thresholdClaim.maskedAccount,
                      currency: thresholdClaim.currency,
                    })}
                  </p>
                )}
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  {t('attest.success.proofHashLabel')}
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
              {t('attest.success.useInAave')}
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
              {t('attest.success.downloadCertificate')}
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
            {t('attest.terminal.title')}
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
                {t('attest.debug.backendLabel')}
                {' '}
                <code className="rounded bg-zinc-900 px-1 py-0.5">
                  {SENTINEL_API}
                </code>
              </span>
              <span className="font-mono">
                {t('attest.debug.pluginLabel')}
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
