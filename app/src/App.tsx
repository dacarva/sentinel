import { ConnectButton } from './ConnectButton'
import { SentinelProofPage } from './SentinelProofPage'
import './App.css'

function App() {
  return (
    <>
      <div className="app-header">
        <div className="app-header__brand">
          <h1>Sentinel</h1>
          <p className="app-tagline">
            Pruebas criptográficas de saldo &gt; 1.000.000 sin exponer tu información.
          </p>
        </div>
        <ConnectButton />
      </div>
      <SentinelProofPage />
    </>
  )
}

export default App
