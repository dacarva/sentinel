import { useAttestFlow } from './useAttestFlow'
import type { AttestStatus, FullAttestation, ThresholdClaim } from './useAttestFlow'
import { PLUGIN_LABELS } from './useAttestFlow'
import { CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function StatusLabel({ status }: { status: AttestStatus }) {
  const { t } = useTranslation('common')
  if (status === 'connecting') return <>{t('wizard.status.connecting')}</>
  if (status === 'proving') return <>{t('wizard.status.proving')}</>
  if (status === 'submitting') return <>{t('wizard.status.submitting')}</>
  if (status === 'success') return <>{t('wizard.status.success')}</>
  if (status === 'error') return <>{t('wizard.status.error')}</>
  return <>{t('wizard.status.ready')}</>
}

function BalanceSummary({ claim }: { claim: ThresholdClaim }) {
  const { t } = useTranslation('common')
  return (
    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
      <div className="flex items-center gap-2 text-emerald-400 font-bold">
        <CheckCircle2 className="w-5 h-5" />
        {t('wizard.summary.title')}
      </div>
      <p className="text-zinc-300 text-sm leading-relaxed">
        <strong className="text-white">{claim.firstName}</strong>{' '}
        {t('wizard.summary.body', {
          account: claim.maskedAccount,
          currency: claim.currency,
        })}
      </p>
      <ul className="space-y-2 text-xs text-zinc-500">
        <li className="flex gap-2">
          <span>•</span>
          {t('wizard.summary.pointSource')}
        </li>
        <li className="flex gap-2">
          <span>•</span>
          {t('wizard.summary.pointPrivacy')}
        </li>
      </ul>
    </div>
  )
}

function extractBankLabel(serverName: string | undefined): { short: string; full: string } {
  if (!serverName) return { short: 'Unknown Origin', full: '' }
  if (serverName.includes('bancolombia')) {
    return { short: 'Bancolombia - Retail', full: serverName }
  }
  const parts = serverName.split('.')
  const domain = parts.slice(-2).join('.')
  return { short: domain || serverName, full: serverName }
}

function AttestationDetailCard({ status, message, result, attestation }: {
  status: AttestStatus
  message: string
  result: unknown
  attestation: FullAttestation | null
}) {
  const { t } = useTranslation('common')
  if (!message && !result && !attestation) return null

  const bankInfo = extractBankLabel(attestation?.proof_origin?.server_name)
  const threshold = attestation?.disclosed_data?.threshold ?? 1_000_000
  const currency = attestation?.disclosed_data?.currency ?? 'COP'

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="text-sm font-bold text-white">{bankInfo.short}</div>
          <div className="text-[10px] text-zinc-500 font-mono">{bankInfo.full}</div>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${attestation?.status === 'verified' || status === 'success'
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-blue-500/10 text-blue-400'
          }`}>
          {attestation?.status === 'verified' ? t('wizard.detail.verified') : t('wizard.detail.pending')}
        </div>
      </div>

      <div className="pt-2 border-t border-white/5">
        <div className="text-[11px] text-zinc-500 uppercase font-bold tracking-widest mb-2">
          {t('wizard.detail.certificateOutput')}
        </div>
        <div className="text-sm text-zinc-300">
          {t('wizard.detail.balanceProved', {
            threshold: threshold.toLocaleString('es-CO'),
            currency,
          })}
        </div>
      </div>

      {result ? (
        <details className="group border-t border-white/5 pt-2">
          <summary className="flex items-center justify-between text-[11px] font-bold text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors">
            {t('wizard.detail.rawPayload')}
            <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
          </summary>
          <pre className="mt-3 p-3 bg-black rounded-lg text-[10px] text-zinc-400 overflow-x-auto border border-white/5">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  )
}

export function SentinelProofPage() {
  const flow = useAttestFlow()
  const { t } = useTranslation('common')
  const {
    userAddress, setUserAddress, username, setUsername,
    password, setPassword, selectedPlugin, setSelectedPlugin,
    status, message, result, fullAttestation, thresholdClaim,
    isConnected, handleProve
  } = flow

  const busy = ['connecting', 'proving', 'submitting'].includes(status)

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      <div className="bg-brand-surface border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Progress bar hint */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
          <div
            className="h-full bg-brand-accent transition-all duration-500"
            style={{ width: status === 'idle' ? '25%' : status === 'connecting' ? '50%' : status === 'proving' ? '75%' : '100%' }}
          />
        </div>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-white">{t('wizard.hero.title')}</h2>
          <p className="text-zinc-400 text-sm">{t('wizard.hero.subtitle')}</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => { e.preventDefault(); void handleProve(); }}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              {t('wizard.form.institutionPlugin')}
            </label>
            <select
              className="w-full bg-brand-base border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors"
              value={selectedPlugin}
              onChange={(e) => setSelectedPlugin(e.target.value)}
              disabled={busy}
            >
              {Object.entries(PLUGIN_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              {t('wizard.form.walletAddress')}
            </label>
            <input
              className="w-full bg-brand-base border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors disabled:opacity-50"
              type="text"
              placeholder="0x..."
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              readOnly={isConnected}
              disabled={busy}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                {t('wizard.form.portalUser')}
              </label>
              <input
                className="w-full bg-brand-base border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                {t('wizard.form.portalPass')}
              </label>
              <input
                className="w-full bg-brand-base border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-brand-accent outline-none transition-colors"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand-accent hover:bg-brand-accent-hover disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-accent/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {busy && <Loader2 className="w-5 h-5 animate-spin" />}
          {status === 'idle' || status === 'error' || status === 'success'
            ? t('wizard.form.submit')
            : <StatusLabel status={status} />}
          </button>
        </form>

        {(thresholdClaim || result || fullAttestation) && (
          <div className="mt-8 pt-8 border-t border-white/5 space-y-4 animate-fade-in">
            {thresholdClaim && status === 'success' && <BalanceSummary claim={thresholdClaim} />}
            <AttestationDetailCard
              status={status}
              message={message}
              result={result}
              attestation={fullAttestation}
            />
          </div>
        )}
      </div>
    </div>
  )
}
