import {
    FileUp,
    Eye,
    Hourglass,
    ShieldCheck,
    Lock,
    Zap,
    Landmark,
    Fingerprint,
    ShieldPlus,
    ArrowRight,
    Network
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function InstitutionalUseCases() {
    const { t } = useTranslation('common')
    return (
        <div id="use-cases" className="w-full bg-white dark:bg-[#050816] transition-colors font-display">
            {/* Andrés' Journey: Transformation Section */}
            <section className="py-24 px-6 lg:px-20 bg-white dark:bg-[#050816] dark:bg-grid-pattern-dark border-b border-black/5 dark:border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-[#114cd4] dark:text-[#6366F1] font-mono text-[10px] uppercase tracking-[0.2em] mb-4 block">
                            {t('institutional.tagline')}
                        </h2>
                        <h3 className="text-4xl md:text-6xl font-bold text-[#111827] dark:text-white mb-6 tracking-[-0.02em]">
                            {t('institutional.headline')}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-normal">
                            {t('institutional.body')}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                        {/* The Old Way - Subdued */}
                        <div className="bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 p-10 relative rounded-none shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 text-[10px] font-mono uppercase tracking-widest">
                                    {t('institutional.oldWayLabel')}
                                </span>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">
                                    {t('institutional.oldWayEra')}
                                </span>
                            </div>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40">
                                        <FileUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">
                                            {t('institutional.oldInsecureTitle')}
                                        </h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-normal">
                                            {t('institutional.oldInsecureBody')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40">
                                        <Eye className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">
                                            {t('institutional.oldExposureTitle')}
                                        </h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-normal">
                                            {t('institutional.oldExposureBody')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40">
                                        <Hourglass className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">
                                            {t('institutional.oldManualTitle')}
                                        </h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-normal">
                                            {t('institutional.oldManualBody')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 border border-slate-100 dark:border-white/5 p-px overflow-hidden grayscale opacity-30">
                                <div className="h-48 w-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                    <Network className="w-12 h-12 text-slate-300 dark:text-white/10" />
                                </div>
                            </div>
                        </div>

                        {/* The Sentinel Way - Prominent */}
                        <div className="bg-indigo-50/50 dark:bg-[#6366F1] border-2 border-[#114cd4] dark:border-[#6366F1] p-10 relative shadow-2xl scale-105 z-10 rounded-none overflow-hidden">
                            <div className="flex items-center justify-between mb-10">
                                <span className="px-3 py-1 bg-[#114cd4] dark:bg-white/20 border border-[#114cd4] dark:border-white/20 text-white text-[10px] font-mono uppercase tracking-widest font-bold">
                                    {t('institutional.sentinelWayLabel')}
                                </span>
                                <span className="text-[#114cd4]/70 dark:text-white/70 text-[10px] font-mono font-bold uppercase">
                                    {t('institutional.sentinelWaySub')}
                                </span>
                            </div>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#114cd4]/10 dark:bg-white/20 flex items-center justify-center text-[#114cd4] dark:text-white border border-[#114cd4]/20 dark:border-white/20">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">
                                            {t('institutional.sentinelOriginTitle')}
                                        </h4>
                                        <p className="text-slate-600 dark:text-white/80 text-sm leading-relaxed font-normal">
                                            {t('institutional.sentinelOriginBody')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#114cd4]/10 dark:bg-white/20 flex items-center justify-center text-[#114cd4] dark:text-white border border-[#114cd4]/20 dark:border-white/20">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">
                                            {t('institutional.sentinelZkTitle')}
                                        </h4>
                                        <p className="text-slate-600 dark:text-white/80 text-sm leading-relaxed font-normal">
                                            {t('institutional.sentinelZkBody')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#114cd4]/10 dark:bg-white/20 flex items-center justify-center text-[#114cd4] dark:text-white border border-[#114cd4]/20 dark:border-white/20">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">
                                            {t('institutional.sentinelInstantTitle')}
                                        </h4>
                                        <p className="text-slate-600 dark:text-white/80 text-sm leading-relaxed font-normal">
                                            {t('institutional.sentinelInstantBody')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 border border-[#114cd4]/20 dark:border-white/30 p-px overflow-hidden shadow-inner">
                                <div className="h-48 w-full bg-white/10 dark:bg-white/5 flex items-center justify-center">
                                    <Zap className="w-12 h-12 text-white/40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Global Use Cases Grid */}
            <section className="py-32 px-6 md:px-20 bg-white dark:bg-[#050816] border-t border-black/5 dark:border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <h3 className="text-4xl font-bold text-[#111827] dark:text-white mb-6 tracking-[-0.02em]">
                            {t('institutional.b2bHeadline')}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl leading-relaxed font-normal">
                            {t('institutional.b2bBody')}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Use Case 1 */}
                        <div className="group p-10 bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 hover:border-[#114cd4]/50 dark:hover:border-[#6366F1]/50 transition-colors flex flex-col h-full rounded-none shadow-sm hover:shadow-xl">
                            <div className="w-12 h-12 bg-[#114cd4]/5 dark:bg-white/5 flex items-center justify-center mb-8 text-[#114cd4] dark:text-[#6366F1]">
                                <Landmark className="w-7 h-7" />
                            </div>
                            <h4 className="text-xl font-bold text-[#111827] dark:text-white mb-4">
                                {t('institutional.useCase1Title')}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 flex-grow font-normal">
                                {t('institutional.useCase1Body')}
                            </p>
                            <div>
                                <a className="text-[#114cd4] dark:text-[#6366F1] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center group-hover:gap-2 transition-all no-underline" href="#">
                                    {t('institutional.useCase1Cta')} <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        </div>
                        {/* Use Case 2 */}
                        <div className="group p-10 bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 hover:border-[#114cd4]/50 dark:hover:border-[#6366F1]/50 transition-colors flex flex-col h-full rounded-none shadow-sm hover:shadow-xl">
                            <div className="w-12 h-12 bg-[#114cd4]/5 dark:bg-white/5 flex items-center justify-center mb-8 text-[#114cd4] dark:text-[#6366F1]">
                                <Fingerprint className="w-7 h-7" />
                            </div>
                            <h4 className="text-xl font-bold text-[#111827] dark:text-white mb-4">
                                {t('institutional.useCase2Title')}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 flex-grow font-normal">
                                {t('institutional.useCase2Body')}
                            </p>
                            <div>
                                <a className="text-[#114cd4] dark:text-[#6366F1] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center group-hover:gap-2 transition-all no-underline" href="#">
                                    {t('institutional.useCase2Cta')} <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        </div>
                        {/* Use Case 3 */}
                        <div className="group p-10 bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 hover:border-[#114cd4]/50 dark:hover:border-[#6366F1]/50 transition-colors flex flex-col h-full rounded-none shadow-sm hover:shadow-xl">
                            <div className="w-12 h-12 bg-[#114cd4]/5 dark:bg-white/5 flex items-center justify-center mb-8 text-[#114cd4] dark:text-[#6366F1]">
                                <ShieldPlus className="w-7 h-7" />
                            </div>
                            <h4 className="text-xl font-bold text-[#111827] dark:text-white mb-4">
                                {t('institutional.useCase3Title')}
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 flex-grow font-normal">
                                {t('institutional.useCase3Body')}
                            </p>
                            <div>
                                <a className="text-[#114cd4] dark:text-[#6366F1] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center group-hover:gap-2 transition-all no-underline" href="#">
                                    {t('institutional.useCase3Cta')} <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        </div>
                    </div>
                    {/* Institutional Partners CTA */}
                    <div className="mt-20 bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 p-12 md:p-16 relative overflow-hidden rounded-none shadow-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#114cd4]/5 dark:bg-[#6366F1]/10 blur-[100px] pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="flex-1 text-center lg:text-left">
                                <h4 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4 tracking-[-0.02em]">
                                    {t('institutional.partnersHeadline')}
                                </h4>
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">
                                    {t('institutional.partnersBody')}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="bg-[#114cd4] dark:bg-[#6366F1] hover:brightness-110 text-white font-bold py-4 px-10 rounded-none uppercase tracking-widest text-xs transition-all shadow-lg border-none cursor-pointer">
                                    {t('institutional.partnersRequestDemo')}
                                </button>
                                <button className="border border-slate-200 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white font-bold py-4 px-10 rounded-none uppercase tracking-widest text-xs transition-all bg-transparent cursor-pointer">
                                    {t('institutional.partnersApiDocs')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
