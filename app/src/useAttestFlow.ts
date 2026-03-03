import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { generateBalanceProof } from './zkproof'

const SENTINEL_API = import.meta.env.VITE_SENTINEL_API ?? 'http://localhost:3000'

const PLUGIN_URLS: Record<string, string> = {
  'mock-bank': import.meta.env.VITE_TLSN_PLUGIN_URL ?? '/ts-plugin-sample.js',
  'bancolombia': import.meta.env.VITE_TLSN_PLUGIN_BANCOLOMBIA_URL ?? '/ts-plugin-bancolombia.js',
}

const PLUGIN_LABELS: Record<string, string> = {
  'mock-bank': 'Mock Bank',
  'bancolombia': 'Bancolombia',
}

export { SENTINEL_API, PLUGIN_URLS, PLUGIN_LABELS }

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

export interface AttestResult {
  attestation_id?: string
  status?: string
  proof_type?: string
  error?: string
  message?: string
}

export interface ThresholdClaim {
  firstName: string
  maskedAccount: string
  currency: string
}

/** Plugin returns string from done(JSON.stringify(resp)); resp has { results }, optional { bank }, and optional { balance_raw } for ZK. */
export interface PluginProof {
  results?: Array<{ type?: string; part?: string; action?: string; params?: unknown; value?: string }>
  bank?: string
  /** Raw balance string exposed by plugin so the app can generate a ZK proof in the browser. */
  balance_raw?: string
}

export interface FullAttestation {
  id: string
  user_address: string
  timestamp: string
  status: string
  proof_type?: string
  notary?: {
    public_key?: string
    signature?: string
  }
  disclosed_data?: {
    commitment?: string
    threshold?: number
    currency?: string
    account_id_hash?: string
    balance_proof?: unknown
  }
  proof_origin?: {
    server_name?: string
    session_id?: string
    transcript_hash?: string
  }
}

/** Extract a scalar value from a raw TLSNotary fragment like `"available":8481134.26`. */
function extractLeafValue(results: PluginProof['results'], leafKey: string): string | undefined {
  const byParams = results?.find(
    (r) =>
      r.type === 'RECV' &&
      r.part === 'BODY' &&
      (r.params as { path?: string } | undefined)?.path?.endsWith(leafKey),
  )
  if (byParams?.value) return byParams.value

  const fragment = results?.find(
    (r) => r.type === 'RECV' && r.part === 'BODY' && r.value?.includes(`"${leafKey}"`),
  )
  if (!fragment?.value) return undefined
  const match = fragment.value.match(new RegExp(`"${leafKey}"\\s*:\\s*("([^"]*)"|[^,}\\s]+)`))
  if (!match) return undefined
  return match[2] !== undefined ? match[2] : match[1]
}

function extractThresholdClaim(proof: PluginProof): ThresholdClaim | null {
  const balanceStr = extractLeafValue(proof.results, 'available')
  const currency = extractLeafValue(proof.results, 'currency') ?? 'COP'
  const number = extractLeafValue(proof.results, 'number') ?? ''
  const name = extractLeafValue(proof.results, 'name') ?? ''

  if (!balanceStr) return null
  const balance = Number(balanceStr)
  if (Number.isNaN(balance) || balance <= 1_000_000) return null

  const maskedAccount =
    number.length > 4 ? `${number.slice(0, 4)}${'*'.repeat(number.length - 4)}` : '****'
  const firstName = name.trim().split(/\s+/)[0] ?? ''
  return { firstName, maskedAccount, currency }
}

export interface UseAttestFlowState {
  userAddress: string
  setUserAddress: (value: string) => void
  username: string
  setUsername: (value: string) => void
  password: string
  setPassword: (value: string) => void
  selectedPlugin: string
  setSelectedPlugin: (value: string) => void
  status: AttestStatus
  message: string
  result: AttestResult | null
  fullAttestation: FullAttestation | null
  attestationHistory: FullAttestation[]
  thresholdClaim: ThresholdClaim | null
  isConnected: boolean
  handleProve: () => Promise<void>
}

export function useAttestFlow(): UseAttestFlowState {
  const { address: connectedAddress, isConnected } = useConnection()
  const [userAddress, setUserAddress] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedPlugin, setSelectedPlugin] = useState<string>('bancolombia')
  const [status, setStatus] = useState<AttestStatus>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<AttestResult | null>(null)
  const [thresholdClaim, setThresholdClaim] = useState<ThresholdClaim | null>(null)
  const [fullAttestation, setFullAttestation] = useState<FullAttestation | null>(null)
  const [attestationHistory, setAttestationHistory] = useState<FullAttestation[]>([])

  useEffect(() => {
    if (!connectedAddress || userAddress) return
    // This mirrors the previous behaviour where the connected wallet
    // prefilled the address field for convenience.
    setTimeout(() => {
      setUserAddress((prev) => (prev || connectedAddress))
    }, 0)
  }, [connectedAddress, userAddress])

  async function handleProve() {
    const addr = userAddress.trim()
    if (!addr || addr.length !== 42 || !addr.startsWith('0x')) {
      setStatus('error')
      setMessage('La dirección debe tener el formato 0x + 40 caracteres hexadecimales.')
      return
    }

    setResult(null)
    setMessage('')
    setThresholdClaim(null)
    setFullAttestation(null)

    if (typeof window.tlsn === 'undefined') {
      setStatus('error')
      setMessage(
        'No encontramos la extensión de TLSNotary. Instálala en tu navegador y vuelve a intentarlo.',
      )
      return
    }

    if (typeof window.tlsn.execCode !== 'function') {
      setStatus('error')
      setMessage(
        'La extensión de TLSNotary no expone execCode. Intenta actualizar la extensión e inténtalo de nuevo.',
      )
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
          'El plugin devolvió HTML en lugar de JavaScript. Ejecuta "bun run plugin:build" (Mock Bank) o "cd plugin-bancolombia && bun run build" y copia el output a app/public/.',
        )
        return
      }

      setStatus('proving')
      let proof: PluginProof

      const resultString = await window.tlsn.execCode(code)

      if (resultString == null || typeof resultString !== 'string') {
        setStatus('error')
        setMessage(
          'El plugin no devolvió datos de prueba. Completa el flujo en la extensión (abre el banco, inicia sesión, haz clic en Prove) y espera a que termine.',
        )
        return
      }
      try {
        proof = JSON.parse(resultString) as PluginProof
      } catch {
        setStatus('error')
        setMessage(
          'El plugin devolvió JSON inválido. Es posible que la extensión haya devuelto un mensaje de error.',
        )
        return
      }
      if (!proof.results || !Array.isArray(proof.results)) {
        setStatus('error')
        setMessage('La prueba no contiene resultados. Completa el flujo completo en la extensión.')
        return
      }
      setThresholdClaim(extractThresholdClaim(proof))

      setStatus('submitting')
      let zkProof: Awaited<ReturnType<typeof generateBalanceProof>> | undefined
      if (proof.balance_raw) {
        try {
          setMessage('Generando prueba criptográfica de saldo > 1.000.000…')
          zkProof = await generateBalanceProof(proof.balance_raw)
        } catch {
          zkProof = undefined
        }
      }

      const presentation: { results: PluginProof['results']; bank?: string; zkProof?: typeof zkProof } = {
        results: proof.results,
      }
      if (proof.bank) presentation.bank = proof.bank
      if (zkProof) presentation.zkProof = zkProof

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
        setMessage(
          data.attestation_id
            ? `Certificado creado correctamente (ID: ${data.attestation_id}).`
            : 'Certificado creado correctamente.',
        )

        if (data.attestation_id) {
          try {
            const full = await fetch(`${SENTINEL_API}/attest/${data.attestation_id}`).then((r) => {
              if (!r.ok) throw new Error(`Failed to load attestation ${data.attestation_id}`)
              return r.json() as Promise<FullAttestation>
            })
            setFullAttestation(full)
            setAttestationHistory((prev) => {
              const existingIndex = prev.findIndex((a) => a.id === full.id)
              const without = existingIndex >= 0 ? prev.filter((a) => a.id !== full.id) : prev
              return [full, ...without]
            })
          } catch {
            // If fetching full attestation fails, we still keep the summary result.
          }
        }
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

  return {
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
  }
}

