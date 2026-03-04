import {
    Shield,
    EyeOff,
    FileText,
    CheckCircle,
    Terminal,
    Cpu,
    LayoutGrid,
    Zap
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function MechanicsOfTrust() {
    const { t } = useTranslation('common')
    return (
        <div id="architecture" className="w-full bg-background-light dark:bg-background-dark">
            {/* Mechanics Hero Section */}
            <section className="relative min-h-[600px] flex items-center py-20 px-6 md:px-20 border-b border-grid-color dark:border-white/10 bg-grid-pattern-light dark:bg-grid-pattern-dark overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
                    <div className="space-y-8 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/10 dark:bg-white/5 rounded-full border border-primary-light/20 dark:border-white/10">
                            <div className="w-2 h-2 rounded-full bg-trust-blue animate-pulse"></div>
                            <span className="text-xs font-mono font-medium text-primary-light dark:text-trust-blue uppercase tracking-wider">
                                {t('mechanics.tagline')}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tighter-swiss text-text-body-light dark:text-white">
                            {t('mechanics.heroTitle')}
                        </h1>
                        <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-xl font-normal">
                            {t('mechanics.heroBody')}
                        </p>
                        <div className="flex flex-wrap gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <Zap className="text-trust-blue w-6 h-6" />
                                <span className="text-sm font-bold uppercase tracking-widest text-text-body-light dark:text-white/80">
                                    {t('mechanics.heroInstant')}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <LayoutGrid className="text-trust-blue w-6 h-6" />
                                <span className="text-sm font-bold uppercase tracking-widest text-text-body-light dark:text-white/80">
                                    {t('mechanics.heroLibrary')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="absolute w-96 h-96 bg-trust-blue/10 rounded-full blur-[120px] -top-20 -right-20"></div>
                        <div className="relative bg-zinc-900 p-8 border border-white/10 rounded-sm shadow-2xl flex flex-col max-w-sm transform rotate-1 hover:rotate-0 transition-all duration-500 font-mono">
                            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                <Terminal className="w-4 h-4 text-trust-blue" />
                                <span className="text-[10px] text-white/50 uppercase tracking-widest">Sentinel AI Builder</span>
                            </div>
                            <div className="space-y-4">
                                <p className="text-xs text-trust-blue">&gt; I want to prove my Bancolombia balance is &gt; 1M COP</p>
                                <div className="space-y-2 py-4">
                                    <div className="h-1 w-full bg-white/5 overflow-hidden">
                                        <div className="h-full w-2/3 bg-trust-blue"></div>
                                    </div>
                                    <p className="text-[9px] text-white/40 uppercase">Analyzing API Response Structure...</p>
                                </div>
                                <div className="bg-white/5 p-3 border border-white/10 rounded">
                                    <p className="text-[10px] text-green-400">SUCCESS: ZK-Circuit Deployed</p>
                                    <p className="text-[9px] text-white/30 mt-1">CIRCUIT_HASH: 0x8a2f...9c1e</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blindfolded Notary Principle */}
            <section className="py-32 px-6 md:px-20 border-b border-grid-color dark:border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter-swiss mb-6 text-text-body-light dark:text-white">
                            {t('mechanics.blindfoldedTitle')}
                        </h2>
                        <p className="text-lg text-text-muted leading-relaxed font-normal">
                            {t('mechanics.blindfoldedBody')}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-white/10 p-10 relative group hover:border-trust-blue/50 transition-colors shadow-sm">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-8">
                                <FileText className="text-trust-blue w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-3 text-text-body-light dark:text-white">
                                {t('mechanics.blindfoldedLocalTitle')}
                            </h4>
                            <p className="text-text-muted text-sm leading-relaxed font-normal">
                                {t('mechanics.blindfoldedLocalBody')}
                            </p>
                        </div>
                        <div className="bg-primary-light dark:bg-trust-blue border border-primary-light dark:border-trust-blue p-10 relative shadow-2xl scale-105 z-10 text-white">
                            <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-8 text-white">
                                <EyeOff className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-3">
                                {t('mechanics.blindfoldedEphemeralTitle')}
                            </h4>
                            <p className="text-white/80 text-sm leading-relaxed font-normal">
                                {t('mechanics.blindfoldedEphemeralBody')}
                            </p>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-white/10 p-10 relative group hover:border-trust-blue/50 transition-colors shadow-sm">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-8 text-green-500">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-3 text-text-body-light dark:text-white">
                                {t('mechanics.blindfoldedReceiptTitle')}
                            </h4>
                            <p className="text-text-muted text-sm leading-relaxed font-normal">
                                {t('mechanics.blindfoldedReceiptBody')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Network Effect */}
            <section className="py-32 px-6 md:px-20 border-b border-grid-color dark:border-white/10 bg-grid-pattern-light dark:bg-grid-pattern-dark">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: 'Bancolombia', status: 'Verified' },
                                { name: 'IRS / Tax', status: 'Verified' },
                                { name: 'Chase Bank', status: 'Community' },
                                { name: 'UnitedHealth', status: 'Verified' },
                                { name: 'LinkedIn ID', status: 'Community' },
                                { name: 'Gov.uk', status: 'Verified' }
                            ].map((source, i) => (
                                <div key={i} className="bg-surface-light dark:bg-surface-dark p-6 border border-grid-color dark:border-white/10 flex flex-col justify-between aspect-video">
                                    <p className="text-sm font-bold text-text-body-light dark:text-white">{source.name}</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`size-1.5 rounded-full ${source.status === 'Verified' ? 'bg-green-500' : 'bg-trust-blue'}`}></div>
                                        <span className="text-[10px] uppercase font-mono text-text-muted">{source.status} Source</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 space-y-8">
                        <div className="inline-block p-2 bg-trust-blue/10 border border-trust-blue/20">
                            <LayoutGrid className="text-trust-blue w-6 h-6" />
                        </div>
                        <h3 className="text-4xl font-bold tracking-tighter-swiss text-text-body-light dark:text-white">
                            {t('mechanics.networkTitle')}
                        </h3>
                        <p className="text-lg text-text-muted leading-relaxed font-normal">
                            {t('mechanics.networkBody')}
                        </p>
                        <ul className="space-y-5">
                            <li className="flex items-center gap-4 text-text-body-light dark:text-white/90">
                                <CheckCircle className="text-trust-blue w-5 h-5" />
                                <span className="text-sm font-medium">
                                    {t('mechanics.networkPoint1')}
                                </span>
                            </li>
                            <li className="flex items-center gap-4 text-text-body-light dark:text-white/90">
                                <CheckCircle className="text-trust-blue w-5 h-5" />
                                <span className="text-sm font-medium">
                                    {t('mechanics.networkPoint2')}
                                </span>
                            </li>
                            <li className="flex items-center gap-4 text-text-body-light dark:text-white/90">
                                <CheckCircle className="text-trust-blue w-5 h-5" />
                                <span className="text-sm font-medium">
                                    {t('mechanics.networkPoint3')}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Local Edge Processing */}
            <section className="py-32 px-6 md:px-20 border-b border-grid-color dark:border-white/10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-8">
                        <div className="inline-block p-2 bg-yellow-400/10 border border-yellow-400/20">
                            <Shield className="text-yellow-600 dark:text-yellow-400 w-6 h-6" />
                        </div>
                        <h3 className="text-4xl font-bold tracking-tighter-swiss text-text-body-light dark:text-white">
                            {t('mechanics.localTitle')}
                        </h3>
                        <p className="text-lg text-text-muted leading-relaxed font-normal">
                            {t('mechanics.localBody')}
                        </p>
                        <div className="bg-surface-light dark:bg-surface-dark p-8 border border-grid-color dark:border-white/10 shadow-lg">
                            <h5 className="text-xs font-mono font-bold text-trust-blue mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <span className="w-2 h-2 bg-trust-blue rounded-full animate-pulse"></span>
                                {t('mechanics.localStatusLabel')}
                            </h5>
                            <div className="space-y-3">
                                <div className="h-1 w-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                                    <div className="h-full w-2/3 bg-trust-blue"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-text-muted font-mono">
                                    <span>{t('mechanics.localStatusLeft')}</span>
                                    <span>{t('mechanics.localStatusRight')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex justify-center">
                        <div className="absolute -inset-1 bg-trust-blue/20 blur-3xl opacity-50"></div>
                        <div className="relative bg-surface-light dark:bg-surface-dark p-2 border border-grid-color dark:border-white/10 w-full shadow-2xl">
                            <div className="aspect-video bg-gray-50 dark:bg-background-dark flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 bg-grid-pattern-light dark:bg-grid-pattern-dark"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-32 h-32 border border-trust-blue/30 rounded-full flex items-center justify-center mb-6">
                                        <div className="w-24 h-24 border border-trust-blue/60 rounded-full flex items-center justify-center">
                                            <div className="w-16 h-16 bg-trust-blue flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                                                <Cpu className="text-white w-8 h-8" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-text-body-light dark:text-white font-mono text-[10px] uppercase tracking-[0.3em]">
                                        {t('mechanics.localShieldLabel')}
                                    </p>
                                </div>
                                <div className="absolute bottom-4 right-4 text-[8px] text-text-muted font-mono">
                                    {t('mechanics.localEnclaveState')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integration CTA */}
            <section className="py-32 px-6 md:px-20 bg-grid-pattern-light dark:bg-grid-pattern-dark">
                <div className="max-w-6xl mx-auto bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-white/10 p-12 md:p-20 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-trust-blue/10 blur-[100px]"></div>
                    <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter-swiss text-text-body-light dark:text-white">
                                {t('mechanics.ctaTitle')}
                            </h2>
                            <p className="text-lg text-text-muted leading-relaxed font-normal">
                                {t('mechanics.ctaBody')}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-primary-light dark:bg-trust-blue hover:bg-indigo-500 text-white px-8 py-4 font-bold transition-all border-none cursor-pointer">
                                    {t('mechanics.ctaDocs')}
                                </button>
                                <button className="border border-grid-color dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-text-body-light dark:text-white px-8 py-4 font-bold transition-all bg-transparent cursor-pointer">
                                    {t('mechanics.ctaDemo')}
                                </button>
                            </div>
                        </div>
                        <div className="w-full lg:w-auto">
                            <div className="bg-yellow-400 p-10 w-full lg:w-64 aspect-square flex flex-col items-center justify-center text-indigo-950 shadow-hard transform transition-transform hover:rotate-0 rotate-2 cursor-pointer">
                                <LayoutGrid className="w-12 h-12 mb-6" />
                                <p className="font-black text-center text-sm uppercase leading-tight tracking-tighter">
                                    Download the<br />Sentinel Widget
                                </p>
                                <div className="mt-6 flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-950"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/30"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/30"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
