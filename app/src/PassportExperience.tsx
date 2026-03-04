import {
    Landmark,
    ShieldCheck,
    Globe,
    ArrowRight,
    Verified,
    MapPin,
    Shield,
    User,
    Check,
    CreditCard,
    Building2,
    Lock
} from 'lucide-react'

export function PassportExperience() {
    return (
        <section className="flex-grow w-full max-w-[1440px] mx-auto bg-background-light dark:bg-background-dark border-x border-grid-color dark:border-grid-color-dark pt-8 pb-16">
            {/* Header Section */}
            <div className="max-w-5xl w-full mx-auto flex flex-col items-center text-center gap-6 mb-16 px-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-light dark:bg-surface-dark rounded-full mb-8 border border-grid-color dark:border-grid-color-dark">
                    <div className="w-2 h-2 rounded-full bg-primary-light dark:bg-trust-blue animate-pulse"></div>
                    <span className="text-xs font-mono font-medium text-primary-light dark:text-trust-blue uppercase tracking-wider">
                        Next-Gen Identity Protocol
                    </span>
                </div>
                <h2 className="text-5xl md:text-7xl font-semibold text-text-body-light dark:text-text-body-dark tracking-tighter-swiss mb-6">
                    Prove the <span className="text-trust-blue">Fact</span>, <br />Not the History.
                </h2>
                <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-2xl font-normal">
                    Andrés needed a loan. His bank asked for 6 months of statements. Every coffee, medical bill, and personal habit was exposed. Sentinel changed that.
                </p>
            </div>

            {/* Digital Passport Visualization Area */}
            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20 px-6">

                {/* Left: Steps 1 & 2 */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    <div className="relative p-8 bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-grid-color-dark shadow-hard dark:shadow-hard dark:shadow-trust-blue hover:-translate-y-1 transition-transform group">
                        <div className="absolute -top-3 -right-3 size-8 bg-primary-light dark:bg-primary text-white flex items-center justify-center text-xs font-mono font-bold">01</div>
                        <Landmark className="text-primary-light dark:text-trust-blue w-8 h-8 mb-4" />
                        <h3 className="text-lg font-bold text-text-body-light dark:text-text-body-dark mb-2 uppercase tracking-tight">Source Truth</h3>
                        <p className="text-text-muted text-sm leading-relaxed font-mono">Connect directly to your bank. Sentinel verifies the source via zkTLS without seeing your data.</p>
                    </div>

                    <div className="relative p-8 bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-grid-color-dark shadow-hard dark:shadow-hard dark:shadow-trust-blue hover:-translate-y-1 transition-transform group">
                        <div className="absolute -top-3 -right-3 size-8 bg-primary-light dark:bg-primary text-white flex items-center justify-center text-xs font-mono font-bold">02</div>
                        <ShieldCheck className="text-trust-blue w-8 h-8 mb-4" />
                        <h3 className="text-lg font-bold text-text-body-light dark:text-text-body-dark mb-2 uppercase tracking-tight">Selective Proof</h3>
                        <p className="text-text-muted text-sm leading-relaxed font-mono">Generate a mathematical proof for exactly what you need to say. Nothing more.</p>
                    </div>
                </div>

                {/* Center: The Passport Card */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-12 bg-grid-pattern-light dark:bg-grid-pattern-dark rounded-lg border border-grid-color dark:border-grid-color-dark mx-4">
                    {/* Flying Stamps Effect */}
                    <div className="absolute -top-4 left-10 animate-bounce duration-[3s] flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-yellow-400/30">
                        <Verified className="text-yellow-400 w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-text-body-light dark:text-text-body-dark">Average Income &gt; $5k</span>
                    </div>
                    <div className="absolute bottom-10 -right-4 animate-pulse flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-yellow-400/30">
                        <MapPin className="text-yellow-400 w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-text-body-light dark:text-text-body-dark">Solvency Verified</span>
                    </div>

                    {/* Passport Card */}
                    <div className="w-full max-w-sm aspect-[1.58/1] rounded-2xl p-6 shadow-[0_20px_50px_rgba(17,115,212,0.3)] text-white relative overflow-hidden group bg-gradient-to-br from-indigo-950 to-primary-light">
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="flex flex-col">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-white/70">Trust Link</p>
                                <h4 className="text-xl font-black">SENTINEL RECEIPT</h4>
                            </div>
                            <Shield className="text-yellow-400 w-8 h-8" />
                        </div>

                        <div className="flex gap-4 items-end relative z-10">
                            <div className="size-20 bg-slate-200/20 rounded-lg backdrop-blur-sm border border-white/20 overflow-hidden">
                                <div className="w-full h-full flex items-center justify-center">
                                    <Lock className="w-10 h-10 text-white/50" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-3/4 bg-white/20 rounded"></div>
                                <div className="h-2 w-1/2 bg-white/20 rounded"></div>
                                <div className="flex gap-2 pt-2">
                                    <div className="size-6 rounded-full bg-yellow-400/90 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-indigo-950 font-bold" />
                                    </div>
                                    <div className="size-6 rounded-full bg-yellow-400/90 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-indigo-950 font-bold" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center relative z-10">
                            <p className="text-[9px] font-mono text-white/60">PROOF_ID: SN-ZK-2026</p>
                            <div className="flex items-center gap-1">
                                <div className="size-2 rounded-full bg-green-400"></div>
                                <span className="text-[10px] font-bold text-green-400 uppercase">Cryptographically Secure</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Step 3 */}
                <div className="lg:col-span-3">
                    <div className="relative p-8 bg-surface-light dark:bg-surface-dark border-2 border-primary-light dark:border-primary shadow-hard dark:shadow-hard dark:shadow-trust-blue hover:-translate-y-1 transition-transform group">
                        <div className="absolute -top-3 -right-3 size-8 bg-primary-light dark:bg-primary text-white flex items-center justify-center text-xs font-mono font-bold">03</div>
                        <Globe className="text-primary-light dark:text-trust-blue w-8 h-8 mb-4" />
                        <h3 className="text-lg font-bold text-text-body-light dark:text-text-body-dark mb-2 uppercase tracking-tight">Share Truth</h3>
                        <p className="text-text-muted text-sm leading-relaxed mb-6 font-mono">Send a Trust Link to your lender. They get instant certainty; you get total privacy.</p>
                        <button className="w-full h-12 bg-primary-light dark:bg-primary text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-hard-hover transition-all border-none cursor-pointer">
                            View Receipt <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-grid-color dark:border-grid-color-dark mt-20">
                <div className="p-10 bg-surface-light dark:bg-surface-dark border-r border-b border-grid-color dark:border-grid-color-dark">
                    <CreditCard className="text-primary-light dark:text-trust-blue w-6 h-6 mb-6" />
                    <h4 className="text-sm font-bold text-text-body-light dark:text-text-body-dark uppercase tracking-widest mb-4">No Data Exposure</h4>
                    <p className="text-text-muted text-sm leading-relaxed font-mono">Prove solvency and income without sharing your coffee receipts or full history.</p>
                </div>
                <div className="p-10 bg-surface-light dark:bg-surface-dark border-r border-b border-grid-color dark:border-grid-color-dark">
                    <Building2 className="text-primary-light dark:text-trust-blue w-6 h-6 mb-6" />
                    <h4 className="text-sm font-bold text-text-body-light dark:text-text-body-dark uppercase tracking-widest mb-4">Source Integrity</h4>
                    <p className="text-text-muted text-sm leading-relaxed font-mono">Verified directly from the bank's TLS session. Zero chance of forgery.</p>
                </div>
                <div className="p-10 bg-surface-light dark:bg-surface-dark border-r border-b border-grid-color dark:border-grid-color-dark">
                    <Lock className="text-primary-light dark:text-trust-blue w-6 h-6 mb-6" />
                    <h4 className="text-sm font-bold text-text-body-light dark:text-text-body-dark uppercase tracking-widest mb-4">ZK-Powered</h4>
                    <p className="text-text-muted text-sm leading-relaxed font-mono">Math-based guarantees that replace human-based reviews.</p>
                </div>
            </div>
        </section>
    )
}
