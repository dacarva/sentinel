import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'
import { LogOut, Wallet } from 'lucide-react'

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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-zinc-300" title={address}>
            {truncateAddress(address)}
          </span>
        </div>
        <button
          type="button"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          onClick={() => disconnect()}
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const firstConnector = connectors[0]
  const isConnecting = isPending

  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover disabled:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-brand-accent/20 active:scale-95"
        disabled={!firstConnector || isConnecting}
        onClick={() => firstConnector && connect({ connector: firstConnector })}
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
      </button>
      {error && (
        <p className="absolute top-full right-0 mt-2 whitespace-nowrap text-[10px] text-red-400 bg-red-950/50 px-2 py-1 rounded border border-red-900/50" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
