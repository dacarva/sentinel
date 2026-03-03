import { useAttestFlow, PLUGIN_LABELS, PLUGIN_URLS, SENTINEL_API } from './useAttestFlow'
import './Attest.css'

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
    isConnected,
    handleProve,
  } = useAttestFlow()

  return (
    <div className="attest">
      <h1>Technical TLSNotary attestation demo</h1>
      <p className="attest-intro">
        Low-level view of the attestation request sent to the Sentinel backend. Use this view to
        debug plugins and webhook flows; non-technical users should use the guided wizard instead.
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
