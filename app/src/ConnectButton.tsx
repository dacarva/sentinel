import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function ConnectButton() {
  const { address, isConnected } = useConnection()
  const connectors = useConnectors()
  const { connect, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="connect-button connect-button--connected">
        <span className="connect-button__address" title={address}>
          {truncateAddress(address)}
        </span>
        <button
          type="button"
          className="connect-button__disconnect"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
    )
  }

  const firstConnector = connectors[0]
  const isConnecting = isPending

  return (
    <div className="connect-button">
      <button
        type="button"
        className="connect-button__connect"
        disabled={!firstConnector || isConnecting}
        onClick={() => firstConnector && connect({ connector: firstConnector })}
      >
        {isConnecting ? 'Connecting…' : 'Connect wallet'}
      </button>
      {error && (
        <p className="connect-button__error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
