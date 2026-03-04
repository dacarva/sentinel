import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { AppWizardView } from './AppWizardView'
import { ConnectButton } from './ConnectButton'
import { ExplainerView } from './ExplainerView'
import { ThemeToggle } from './ThemeToggle'
import { Shield } from 'lucide-react'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background-light text-text-body-light dark:bg-brand-base dark:text-white transition-colors duration-300">
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-brand-base/80 backdrop-blur-md border-b border-grid-color dark:border-white/5">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-primary-light dark:bg-brand-accent rounded-lg shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight m-0">Sentinel</h1>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/app"
              className="text-sm font-medium text-text-muted hover:text-primary-light dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Launch App
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <ConnectButton />
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<ExplainerView />} />
            <Route path="/app" element={<AppWizardView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
