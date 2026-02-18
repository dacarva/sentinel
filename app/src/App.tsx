import { Attest } from './Attest'
import { ConnectButton } from './ConnectButton'
import './App.css'

function App() {
  return (
    <>
      <div className="app-header">
        <div className="app-header__brand">
          <h1>zkCredit</h1>
          <p className="app-tagline">Minimal client — prove bank data with TLSNotary</p>
        </div>
        <ConnectButton />
      </div>
      <Attest />
    </>
  )
}

export default App
