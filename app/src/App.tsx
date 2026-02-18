import { Attest } from './Attest'
import './App.css'

function App() {
  return (
    <>
      <div className="app-header">
        <h1>zkCredit</h1>
        <p className="app-tagline">Minimal client — prove bank data with TLSNotary</p>
      </div>
      <Attest />
    </>
  )
}

export default App
