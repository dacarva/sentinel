import { Attest } from './Attest'
import { PLUGIN_LABELS, PLUGIN_URLS, SENTINEL_API, useAttestFlow } from './useAttestFlow'
import type { AttestStatus, ThresholdClaim, FullAttestation } from './useAttestFlow'
import './SentinelProof.css'

function ProofHero() {
  const scrollToWizard = () => {
    const el = document.getElementById('balance-proof-wizard')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="sentinel-hero">
      <div className="sentinel-hero-badge">Sentinel · zkTLS + ZK</div>
      <h1 className="sentinel-hero-title">
        Prueba que tu saldo supera{' '}
        <span className="sentinel-highlight">1.000.000</span> sin mostrar tu saldo.
      </h1>
      <p className="sentinel-hero-subtitle">
        Genera un certificado criptográfico, sellado por tu banco, que responde solo una pregunta:
        <br />
        <strong>¿tu saldo es mayor a 1.000.000?</strong> — sin exponer números, extractos ni
        contraseñas.
      </p>
      <div className="sentinel-hero-actions">
        <button type="button" className="sentinel-primary" onClick={scrollToWizard}>
          Generar mi prueba ahora
        </button>
        <span className="sentinel-hero-meta">Sin PDF, sin fotos de pantalla. Solo matemática.</span>
      </div>
    </section>
  )
}

function TrustPillars() {
  return (
    <section className="sentinel-section sentinel-trust">
      <h2 className="sentinel-section-title">Tres garantías para confiar en la prueba</h2>
      <div className="sentinel-trust-grid">
        <article className="sentinel-card">
          <h3>Origen bancario verificado</h3>
          <p>
            Sentinel recibe la confirmación directamente de tu banco, como un notario que estampa un
            sello sobre un documento cerrado. Así se sabe que el dato es real y no viene de un
            archivo editado.
          </p>
        </article>
        <article className="sentinel-card">
          <h3>Respuesta SÍ/NO matemática</h3>
          <p>
            Dentro de un “sobre sellado” digital se comprueba si{' '}
            <strong>tu saldo es mayor a 1.000.000</strong>. Hacia afuera solo sale un resultado SÍ o
            NO que la institución puede revisar sin ver tu saldo exacto.
          </p>
        </article>
        <article className="sentinel-card">
          <h3>Tú controlas qué se comparte</h3>
          <p>
            El certificado vive en tu dispositivo. Tú eliges con quién compartirlo y puedes
            borrarlo cuando quieras. Tu saldo exacto, tus movimientos y tus claves nunca se muestran.
          </p>
        </article>
      </div>
    </section>
  )
}

function WhatIsShared() {
  return (
    <section className="sentinel-section sentinel-what-shared">
      <h2 className="sentinel-section-title">Qué se comparte y qué jamás se comparte</h2>
      <div className="sentinel-what-grid">
        <div className="sentinel-what-column">
          <h3>Se comparte</h3>
          <ul>
            <li>
              <span className="sentinel-pill sentinel-pill--yes">Sí</span>
              Respuesta a: <strong>“¿saldo &gt; 1.000.000?”</strong>
            </li>
            <li>
              <span className="sentinel-pill sentinel-pill--yes">Sí</span>
              Banco de origen y fecha de la sesión (en forma sellada)
            </li>
            <li>
              <span className="sentinel-pill sentinel-pill--yes">Sí</span>
              Firma criptográfica del notario (clave pública verificable)
            </li>
          </ul>
        </div>
        <div className="sentinel-what-column">
          <h3>No se comparte nunca</h3>
          <ul>
            <li>
              <span className="sentinel-pill sentinel-pill--no">No</span>
              Tu saldo exacto
            </li>
            <li>
              <span className="sentinel-pill sentinel-pill--no">No</span>
              Número completo de cuenta ni tarjeta
            </li>
            <li>
              <span className="sentinel-pill sentinel-pill--no">No</span>
              Historial de movimientos ni comercios donde compras
            </li>
            <li>
              <span className="sentinel-pill sentinel-pill--no">No</span>
              Usuario, contraseña ni códigos de tu banco
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function MathExplainerToggle() {
  return (
    <section className="sentinel-section sentinel-math">
      <button
        type="button"
        className="sentinel-math-toggle"
        onClick={() => {
          const el = document.getElementById('sentinel-math-details')
          if (!el) return
          const isOpen = el.getAttribute('data-open') === 'true'
          el.setAttribute('data-open', (!isOpen).toString())
        }}
      >
        ¿Cómo sé que esto es matemáticamente sólido?
      </button>
      <div id="sentinel-math-details" className="sentinel-math-details" data-open="false">
        <ul>
          <li>
            <strong>1. Solo usamos datos oficiales de tu banco.</strong> No aceptamos capturas de
            pantalla ni PDFs que puedas subir; la información viene directamente del banco.
          </li>
          <li>
            <strong>2. Tu saldo va dentro de un “sobre sellado”.</strong> El número exacto queda
            guardado dentro de un sobre digital que nadie abre; por fuera solo se ve el sello.
          </li>
          <li>
            <strong>3. Dentro del sobre se hace la cuenta.</strong> Ahí adentro comprobamos si tu
            saldo supera 1.000.000. Hacia afuera solo sale un resultado SÍ o NO.
          </li>
          <li>
            <strong>4. Cualquiera puede detectar cambios.</strong> La institución que recibe tu
            certificado puede revisar una firma digital que avisa si alguien intentó modificarlo.
          </li>
        </ul>
        <details className="sentinel-math-advanced">
          <summary>Ver versión técnica</summary>
          <ol>
            <li>
              <strong>Sello de origen (zkTLS).</strong> Cuando tu banco responde a tu navegador,
              Sentinel toma una “huella” criptográfica de esa sesión. Es la prueba de que los datos
              vinieron realmente del banco, en una fecha y sesión específicas.
            </li>
            <li>
              <strong>Sobre sellado (compromiso).</strong> Dentro de tu dispositivo se calcula un
              compromiso del tipo <code>sha256(saldo || blinder)</code>. Es como un sobre sellado:
              por fuera se ve el sello; por dentro está tu saldo exacto, que nadie abre.
            </li>
            <li>
              <strong>Prueba de saldo &gt; 1.000.000.</strong> Un circuito de conocimiento cero
              verifica, dentro del sobre, que tu saldo es mayor a 1.000.000. El circuito produce una
              prueba que cualquiera puede verificar con el compromiso, sin ver el saldo.
            </li>
            <li>
              <strong>Firma del notario.</strong> El backend de Sentinel verifica la prueba con la
              clave de verificación pública y firma el certificado con una clave ECDSA. Cualquiera
              puede comprobar esa firma consultando la clave pública en{' '}
              <code>/notary/pubkey</code>.
            </li>
          </ol>
          <p className="sentinel-math-footnote">
            El resultado es un certificado que dice “el saldo en este sobre es &gt; 1.000.000” y
            cuya veracidad se comprueba con operaciones matemáticas, no confiando en Sentinel como
            empresa.
          </p>
        </details>
      </div>
    </section>
  )
}

function StatusLabel({ status }: { status: AttestStatus }) {
  if (status === 'connecting') return <>Conectando con el plugin del banco…</>
  if (status === 'proving') return <>Ejecutando la prueba criptográfica…</>
  if (status === 'submitting') return <>Guardando el certificado en Sentinel…</>
  if (status === 'success') return <>Prueba generada correctamente.</>
  if (status === 'error') return <>Ocurrió un error al generar la prueba.</>
  return <>Listo para generar tu prueba.</>
}

function BalanceSummary({ claim }: { claim: ThresholdClaim }) {
  return (
    <div className="sentinel-summary">
      <div className="sentinel-summary-title">Resultado resumido</div>
      <p>
        <strong>{claim.firstName}</strong> ({claim.maskedAccount}) tiene más de{' '}
        <strong>1.000.000 {claim.currency}</strong> en la cuenta probada.
      </p>
      <ul className="sentinel-summary-list">
        <li>El dato proviene directamente del banco, no de un archivo subido por ti.</li>
        <li>La institución solo ve que tu saldo es mayor a 1.000.000, nunca el número exacto.</li>
        <li>Si alguien cambiara el certificado, la firma matemática dejaría de ser válida.</li>
      </ul>
      <p className="sentinel-summary-note">
        El certificado que generamos no incluye tu saldo exacto ni tu número completo de cuenta.
      </p>
    </div>
  )
}

function formatDateTime(value: string | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function extractBankLabel(serverName: string | undefined): { short: string; full: string } {
  if (!serverName) return { short: 'Banco de origen desconocido', full: '' }
  if (serverName.includes('bancolombia')) {
    return { short: 'Bancolombia – banca personas', full: serverName }
  }
  const parts = serverName.split('.')
  const domain = parts.slice(-2).join('.')
  return { short: domain || serverName, full: serverName }
}

function AttestationDetailCard(props: {
  status: AttestStatus
  message: string
  result: unknown
  attestation: FullAttestation | null
}) {
  const { status, message, result, attestation } = props

  if (!message && !result && !attestation) {
    return null
  }

  const bankInfo = extractBankLabel(attestation?.proof_origin?.server_name)
  const threshold = attestation?.disclosed_data?.threshold ?? 1_000_000
  const currency = attestation?.disclosed_data?.currency ?? 'COP'

  return (
    <div className="sentinel-att-card">
      <header className="sentinel-att-header">
        <div className="sentinel-att-bank">
          <div className="sentinel-att-bank-icon" aria-hidden="true" />
          <div>
            <div className="sentinel-att-bank-name">{bankInfo.short}</div>
            {bankInfo.full && (
              <div className="sentinel-att-bank-subtitle">Origen: {bankInfo.full}</div>
            )}
          </div>
        </div>
        <div className="sentinel-att-meta">
          {attestation?.timestamp && (
            <div className="sentinel-att-date">
              Generado el {formatDateTime(attestation.timestamp)}
            </div>
          )}
          <div className={`sentinel-att-status sentinel-att-status--${attestation?.status ?? status}`}>
            {attestation?.status === 'verified'
              ? 'Verificado'
              : attestation?.status === 'pending' || status === 'success'
                ? 'Pendiente de verificación'
                : status === 'error'
                  ? 'Error'
                  : 'En proceso'}
          </div>
        </div>
      </header>

      <section className="sentinel-att-summary">
        <h3 className="sentinel-att-summary-title">Qué demuestra este certificado</h3>
        <ul className="sentinel-summary-list">
          <li>
            Tu banco confirmó que el saldo de la cuenta probada es mayor a{' '}
            <strong>
              {threshold.toLocaleString('es-CO')} {currency}
            </strong>
            .
          </li>
          <li>
            La institución que reciba este certificado solo ve esa afirmación SÍ/NO, nunca el valor
            exacto de tu saldo.
          </li>
          <li>
            Si alguien modifica el archivo, la firma matemática del notario dejará de ser válida y
            la verificación fallará.
          </li>
        </ul>
      </section>

      <section className="sentinel-att-badges">
        <div className="sentinel-att-badge">
          <span className="sentinel-att-badge-label">Origen bancario</span>
          <span className="sentinel-att-badge-value">
            {bankInfo.short}
            {bankInfo.full ? ' · dato tomado directamente de este servidor' : ''}
          </span>
        </div>
        {attestation?.notary?.public_key && (
          <div className="sentinel-att-badge">
            <span className="sentinel-att-badge-label">Notario criptográfico</span>
            <span className="sentinel-att-badge-value">
              Sentinel Notary · clave{' '}
              {attestation.notary.public_key.slice(0, 8)}…
              {attestation.notary.public_key.slice(-6)}
            </span>
          </div>
        )}
      </section>

      <section className="sentinel-att-technical">
        {message && <p className="sentinel-result-message">{message}</p>}
        {result && (
          <>
            <p className="sentinel-result-intro">
              Este es el certificado que tu banco o fintech puede verificar automáticamente. No
              muestra tu saldo exacto; solo que supera el umbral configurado ({threshold.toLocaleString('es-CO')}{' '}
              {currency}).
            </p>
            <details className="sentinel-result-details">
              <summary>Ver detalles técnicos del certificado</summary>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </details>
            <p className="sentinel-result-footnote">
              En los detalles verás claves como <code>proof_type</code>. Cuando vale{' '}
              <code>&quot;v3_zk&quot;</code>, usamos la versión que nunca guarda tu saldo exacto,
              solo un compromiso cifrado que prueba que el saldo supera el umbral.
            </p>
          </>
        )}
      </section>
    </div>
  )
}

function BalanceProofWizard() {
  const flow = useAttestFlow()
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
    fullAttestation,
    attestationHistory,
    thresholdClaim,
    isConnected,
    handleProve,
  } = flow

  const busy = status === 'connecting' || status === 'proving' || status === 'submitting'
  const hasResult = Boolean(message || result || fullAttestation)

  return (
    <section className="sentinel-section sentinel-wizard" id="balance-proof-wizard">
      <div className="sentinel-wizard-header">
        <h2 className="sentinel-section-title">Genera tu prueba de saldo &gt; 1.000.000</h2>
        <p>
          Este asistente usa la extensión de <strong>TLSNotary</strong> para hablar con tu banco y
          luego genera una prueba de saldo mayor a 1.000.000 sin revelar tu saldo exacto.
        </p>
      </div>

      <div className="sentinel-steps">
        <div className={`sentinel-step ${status !== 'idle' ? 'sentinel-step--done' : ''}`}>
          <span className="sentinel-step-index">1</span>
          <div className="sentinel-step-body">
            <div className="sentinel-step-title">Conecta tu dirección</div>
            <div className="sentinel-step-text">
              Usamos tu dirección para vincular el certificado a tu identidad en la red.
            </div>
          </div>
        </div>
        <div
          className={`sentinel-step ${
            status === 'connecting' || status === 'proving' || status === 'submitting' || status === 'success'
              ? 'sentinel-step--active'
              : ''
          }`}
        >
          <span className="sentinel-step-index">2</span>
          <div className="sentinel-step-body">
            <div className="sentinel-step-title">Sesión segura con tu banco</div>
            <div className="sentinel-step-text">
              La extensión abre el portal del banco; tú inicias sesión como siempre. Sentinel nunca
              ve tus credenciales.
            </div>
          </div>
        </div>
        <div
          className={`sentinel-step ${
            status === 'proving' || status === 'submitting' || status === 'success'
              ? 'sentinel-step--active'
              : ''
          }`}
        >
          <span className="sentinel-step-index">3</span>
          <div className="sentinel-step-body">
            <div className="sentinel-step-title">Prueba criptográfica de saldo</div>
            <div className="sentinel-step-text">
              Dentro de tu dispositivo se calcula la prueba de que tu saldo es mayor a 1.000.000.
            </div>
          </div>
        </div>
        <div className={`sentinel-step ${status === 'success' ? 'sentinel-step--active' : ''}`}>
          <span className="sentinel-step-index">4</span>
          <div className="sentinel-step-body">
            <div className="sentinel-step-title">Certificado listo para compartir</div>
            <div className="sentinel-step-text">
              El certificado queda listo para que lo compartas con la institución que lo solicite.
            </div>
          </div>
        </div>
      </div>

      <div className="sentinel-wizard-grid">
        <form
          className="sentinel-form"
          onSubmit={(e) => {
            e.preventDefault()
            void handleProve()
          }}
        >
          <label className="sentinel-field">
            Banco a probar
            <select
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
          </label>

          <label className="sentinel-field">
            Dirección (0x…)
            <input
              type="text"
              placeholder="0x1234…abcd"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              readOnly={isConnected}
              disabled={busy}
              title={
                isConnected
                  ? 'Dirección conectada desde tu wallet — usa el encabezado para desconectar.'
                  : undefined
              }
            />
          </label>

          <label className="sentinel-field">
            Usuario del banco (opcional)
            <input
              type="text"
              placeholder="usuario_banco"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={busy}
            />
          </label>

          <label className="sentinel-field">
            Contraseña del banco (opcional)
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </label>

          <button type="submit" className="sentinel-primary" disabled={busy}>
            {status === 'idle' || status === 'error' || status === 'success'
              ? 'Generar prueba ahora'
              : status === 'connecting'
                ? 'Cargando plugin del banco…'
                : status === 'proving'
                  ? 'Ejecutando prueba…'
                  : 'Enviando certificado…'}
          </button>

          <p className="sentinel-status">
            <StatusLabel status={status} />
          </p>

          <p className="sentinel-hint">
            Backend: <code>{SENTINEL_API}</code> · Plugin:{' '}
            <code>{PLUGIN_URLS[selectedPlugin]}</code>
          </p>
        </form>

        <div className="sentinel-wizard-right">
          {thresholdClaim && status === 'success' && <BalanceSummary claim={thresholdClaim} />}

          <AttestationDetailCard
            status={status}
            message={message}
            result={result}
            attestation={fullAttestation}
          />

          {!hasResult && (
            <p className="sentinel-side-note">
              Cuando generes tu prueba, aquí verás un resumen sencillo y, si lo necesitas, los
              detalles técnicos del certificado.
            </p>
          )}
        </div>
      </div>

      {attestationHistory.length > 0 && (
        <section className="sentinel-section sentinel-history">
          <h3 className="sentinel-section-title">Tus certificados anteriores</h3>
          <div className="sentinel-history-list">
            {attestationHistory.map((att) => {
              const bankInfo = extractBankLabel(att.proof_origin?.server_name)
              const label =
                att.disclosed_data?.threshold && att.disclosed_data?.currency
                  ? `Saldo > ${att.disclosed_data.threshold.toLocaleString('es-CO')} ${
                      att.disclosed_data.currency
                    }`
                  : 'Saldo > umbral'
              return (
                <div key={att.id} className="sentinel-history-item">
                  <div className="sentinel-history-main">
                    <div className="sentinel-history-title">{bankInfo.short}</div>
                    <div className="sentinel-history-subtitle">{label}</div>
                  </div>
                  <div className="sentinel-history-meta">
                    <span className="sentinel-history-date">
                      {formatDateTime(att.timestamp)}
                    </span>
                    <span className={`sentinel-att-status sentinel-att-status--${att.status}`}>
                      {att.status === 'verified'
                        ? 'Verificado'
                        : att.status === 'pending'
                          ? 'Pendiente'
                          : att.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="sentinel-dev-toggle">
        <details>
          <summary>Ver vista técnica completa (para desarrolladores)</summary>
          <div className="sentinel-dev-panel">
            <Attest />
          </div>
        </details>
      </div>
    </section>
  )
}

export function SentinelProofPage() {
  return (
    <main className="sentinel-page">
      <div className="sentinel-layout">
        <ProofHero />
        <TrustPillars />
        <WhatIsShared />
        <MathExplainerToggle />
        <BalanceProofWizard />
      </div>
    </main>
  )
}


