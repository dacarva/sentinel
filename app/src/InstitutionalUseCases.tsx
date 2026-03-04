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

export function InstitutionalUseCases() {
    return (
        <div className="w-full bg-white dark:bg-[#050816] transition-colors font-display">
            {/* Andrés' Journey: Transformation Section */}
            <section className="py-24 px-6 lg:px-20 bg-white dark:bg-[#050816] dark:bg-grid-pattern-dark border-b border-black/5 dark:border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-[#114cd4] dark:text-[#6366F1] font-mono text-[10px] uppercase tracking-[0.2em] mb-4 block">Institutional Transformation</h2>
                        <h3 className="text-4xl md:text-6xl font-bold text-[#111827] dark:text-white mb-6 tracking-[-0.02em]">Redefining Trust Infrastructure</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-normal">
                            See how Andres transformed a weeks-long manual loan process into an instant, private verification using Sentinel's zero-knowledge proofs.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                        {/* The Old Way - Subdued */}
                        <div className="bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 p-10 relative rounded-none shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 text-[10px] font-mono uppercase tracking-widest">The Old Way</span>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">CIRCA 2023</span>
                            </div>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40">
                                        <FileUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">Manual Submission</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-normal">Andres uploads 6 months of bank statements and ID copies to a centralized portal.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40">
                                        <Eye className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">Full PII Exposure</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-normal">Loan officers see every coffee purchase and personal habit in his transaction history.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40">
                                        <Hourglass className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">14-Day Review Cycle</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-normal">Underwriters manually verify data across disconnected silos, leading to significant delays.</p>
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
                                <span className="px-3 py-1 bg-[#114cd4] dark:bg-white/20 border border-[#114cd4] dark:border-white/20 text-white text-[10px] font-mono uppercase tracking-widest font-bold">The Sentinel Way</span>
                                <span className="text-[#114cd4]/70 dark:text-white/70 text-[10px] font-mono font-bold uppercase">Modern Era</span>
                            </div>
                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#114cd4]/10 dark:bg-white/20 flex items-center justify-center text-[#114cd4] dark:text-white border border-[#114cd4]/20 dark:border-white/20">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">Zero-Knowledge Proofs</h4>
                                        <p className="text-slate-600 dark:text-white/80 text-sm leading-relaxed font-normal">Andres generates a ZK-Proof locally. He proves "Income &gt; $5k/mo" privately.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#114cd4]/10 dark:bg-white/20 flex items-center justify-center text-[#114cd4] dark:text-white border border-[#114cd4]/20 dark:border-white/20">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">Privacy-Preserving</h4>
                                        <p className="text-slate-600 dark:text-white/80 text-sm leading-relaxed font-normal">The bank only receives confirmation. No raw data ever leaves Andres' device.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#114cd4]/10 dark:bg-white/20 flex items-center justify-center text-[#114cd4] dark:text-white border border-[#114cd4]/20 dark:border-white/20">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-[#111827] dark:text-white font-bold text-lg mb-2">Instant Settlement</h4>
                                        <p className="text-slate-600 dark:text-white/80 text-sm leading-relaxed font-normal">Verification is programmatic. Andres is approved for the loan in under 60 seconds.</p>
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
                        <h3 className="text-4xl font-bold text-[#111827] dark:text-white mb-6 tracking-[-0.02em]">Global Use Cases</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl leading-relaxed font-normal">Scaling privacy across the decentralized and traditional financial landscape.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Use Case 1 */}
                        <div className="group p-10 bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 hover:border-[#114cd4]/50 dark:hover:border-[#6366F1]/50 transition-colors flex flex-col h-full rounded-none shadow-sm hover:shadow-xl">
                            <div className="w-12 h-12 bg-[#114cd4]/5 dark:bg-white/5 flex items-center justify-center mb-8 text-[#114cd4] dark:text-[#6366F1]">
                                <Landmark className="w-7 h-7" />
                            </div>
                            <h4 className="text-xl font-bold text-[#111827] dark:text-white mb-4">Lending & Credit</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 flex-grow font-normal">
                                Prove solvency and income for undercollateralized loans on global protocols like Aave, without sharing sensitive records.
                            </p>
                            <div>
                                <a className="text-[#114cd4] dark:text-[#6366F1] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center group-hover:gap-2 transition-all no-underline" href="#">
                                    Explore Protocol <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        </div>
                        {/* Use Case 2 */}
                        <div className="group p-10 bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 hover:border-[#114cd4]/50 dark:hover:border-[#6366F1]/50 transition-colors flex flex-col h-full rounded-none shadow-sm hover:shadow-xl">
                            <div className="w-12 h-12 bg-[#114cd4]/5 dark:bg-white/5 flex items-center justify-center mb-8 text-[#114cd4] dark:text-[#6366F1]">
                                <Fingerprint className="w-7 h-7" />
                            </div>
                            <h4 className="text-xl font-bold text-[#111827] dark:text-white mb-4">Identity & Residency</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 flex-grow font-normal">
                                Verify residency, age, or citizenship for global fintech onboarding without exposing PII to providers.
                            </p>
                            <div>
                                <a className="text-[#114cd4] dark:text-[#6366F1] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center group-hover:gap-2 transition-all no-underline" href="#">
                                    View KYC Specs <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        </div>
                        {/* Use Case 3 */}
                        <div className="group p-10 bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 hover:border-[#114cd4]/50 dark:hover:border-[#6366F1]/50 transition-colors flex flex-col h-full rounded-none shadow-sm hover:shadow-xl">
                            <div className="w-12 h-12 bg-[#114cd4]/5 dark:bg-white/5 flex items-center justify-center mb-8 text-[#114cd4] dark:text-[#6366F1]">
                                <ShieldPlus className="w-7 h-7" />
                            </div>
                            <h4 className="text-xl font-bold text-[#111827] dark:text-white mb-4">Insurance & Benefits</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 flex-grow font-normal">
                                Complete 'Privacy-First' onboarding for health or rental insurance by proving policy eligibility privately.
                            </p>
                            <div>
                                <a className="text-[#114cd4] dark:text-[#6366F1] font-bold text-[10px] uppercase tracking-[0.2em] flex items-center group-hover:gap-2 transition-all no-underline" href="#">
                                    Privacy Standards <ArrowRight className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        </div>
                    </div>
                    {/* Institutional Partners CTA */}
                    <div className="mt-20 bg-white dark:bg-[#0A0E23] border border-slate-200 dark:border-white/10 p-12 md:p-16 relative overflow-hidden rounded-none shadow-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#114cd4]/5 dark:bg-[#6366F1]/10 blur-[100px] pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="flex-1 text-center lg:text-left">
                                <h4 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4 tracking-[-0.02em]">Ready to integrate Sentinel?</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">Join 50+ institutions building on our privacy-first infrastructure.</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="bg-[#114cd4] dark:bg-[#6366F1] hover:brightness-110 text-white font-bold py-4 px-10 rounded-none uppercase tracking-widest text-xs transition-all shadow-lg border-none cursor-pointer">
                                    Request Demo
                                </button>
                                <button className="border border-slate-200 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white font-bold py-4 px-10 rounded-none uppercase tracking-widest text-xs transition-all bg-transparent cursor-pointer">
                                    API Docs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
