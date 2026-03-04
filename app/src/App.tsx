import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppWizardView } from './AppWizardView'
import { ConnectButton } from './ConnectButton'
import { ExplainerView } from './ExplainerView'
import { VerificationView } from './VerificationView'
import { ThemeToggle } from './ThemeToggle'
import { Shield } from 'lucide-react'

function App() {
  const { t, i18n } = useTranslation('common')

  useEffect(() => {
    const lang = i18n.language && i18n.language.startsWith('es') ? 'es' : 'en'
    document.documentElement.lang = lang
  }, [i18n.language])

  const handleLanguageChange = (lang: 'en' | 'es') => {
    void i18n.changeLanguage(lang)
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background-light text-text-body-light dark:bg-brand-base dark:text-white transition-colors duration-300">
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white/80 dark:bg-brand-base/80 backdrop-blur-md border-b border-grid-color dark:border-white/5">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-primary-light dark:bg-brand-accent rounded-lg shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight m-0 truncate">{t('nav.brand')}</h1>
            </Link>
          </div>
          <div className="flex items-center gap-3 md:gap-8 shrink-0">
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/#use-cases"
                className="text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-primary-light dark:hover:text-brand-accent transition-colors no-underline"
              >
                {t('nav.useCases')}
              </a>
              <a
                href="/#architecture"
                className="text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-primary-light dark:hover:text-brand-accent transition-colors no-underline"
              >
                {t('nav.architecture')}
              </a>
              <Link
                to="/verify/test"
                className="text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-primary-light dark:hover:text-brand-accent transition-colors no-underline"
              >
                {t('nav.verify')}
              </Link>
            </nav>
            <div className="h-4 w-px bg-grid-color dark:bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                to="/app"
                className="flex h-8 px-3 md:h-10 md:px-5 bg-primary-light dark:bg-brand-accent text-white text-[10px] md:text-[11px] font-bold uppercase tracking-widest items-center justify-center hover:brightness-110 transition-all shadow-lg no-underline"
              >
                <span className="md:hidden">{t('nav.launch')}</span>
                <span className="hidden md:inline">{t('nav.launchProtocol')}</span>
              </Link>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden md:flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest">
                  <button
                    type="button"
                    className={`px-1.5 py-0.5 rounded-sm border text-xs ${
                      i18n.language.startsWith('en')
                        ? 'border-primary-light text-primary-light dark:border-brand-accent dark:text-brand-accent'
                        : 'border-transparent text-text-muted'
                    }`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    {t('language.english')}
                  </button>
                  <span className="text-text-muted">/</span>
                  <button
                    type="button"
                    className={`px-1.5 py-0.5 rounded-sm border text-xs ${
                      i18n.language.startsWith('es')
                        ? 'border-primary-light text-primary-light dark:border-brand-accent dark:text-brand-accent'
                        : 'border-transparent text-text-muted'
                    }`}
                    onClick={() => handleLanguageChange('es')}
                  >
                    {t('language.spanish')}
                  </button>
                </div>
                <ThemeToggle />
                <ConnectButton />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<ExplainerView />} />
            <Route path="/app" element={<AppWizardView />} />
            <Route path="/verify/:proofId" element={<VerificationView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
