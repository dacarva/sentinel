import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Lock, ShieldCheck, Zap } from 'lucide-react'

export function ExplainerView() {
    return (
        <div className="w-full flex flex-col overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-accent/10 blur-[120px] rounded-full -z-10" />

                <div className="animate-fade-in space-y-6 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 rounded-full">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Enterprise Compliance Infrastructure</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent leading-[1.1]">
                        The Universal Privacy Layer <br className="hidden md:block" /> for Financial Data
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Verify identity, solvency, and compliance across institutions with cryptographic certainty. No data silos. No privacy leaks.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/app"
                            className="px-8 py-3.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-accent/25 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Launch App
                        </Link>
                        <a
                            href="#how-it-works"
                            className="px-8 py-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white font-semibold rounded-xl transition-all"
                        >
                            See how it works
                        </a>
                    </div>
                </div>
            </section>

            {/* Comparison Section (The Story of Andres) */}
            <section id="how-it-works" className="py-24 px-6 bg-zinc-950/50">
                <div className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">The old way vs. The Sentinel way</h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                            Imagine Andrés, one of your customers, needs a loan.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        {/* The Old Way */}
                        <div className="flex flex-col p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Lock className="w-24 h-24 text-red-500" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-6">Without Sentinel</h3>
                            <ul className="space-y-4 mb-10 flex-1">
                                {[
                                    "Andrés downloads 3 months of bank statements (PDFs).",
                                    "He emails them to your loan officer.",
                                    "Your team manually reviews them, exposing his exact salary, spending habits, and account numbers.",
                                    "You store those PII-heavy PDFs on your servers forever, increasing your liability."
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3 text-zinc-400 text-sm leading-relaxed">
                                        <span className="text-zinc-700 font-mono mt-0.5">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center rounded-lg uppercase tracking-wider">
                                High Friction • High Liability • Manual Verification
                            </div>
                        </div>

                        {/* The New Way */}
                        <div className="flex flex-col p-8 rounded-3xl bg-brand-accent/5 border border-brand-accent/20 relative group overflow-hidden shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)]">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldCheck className="w-24 h-24 text-brand-accent" />
                            </div>

                            <h3 className="text-xl font-bold text-brand-accent mb-6 flex items-center gap-2">
                                With Sentinel
                            </h3>
                            <ul className="space-y-4 mb-10 flex-1">
                                {[
                                    "Andrés logs into his bank via the Sentinel zkTLS Portal.",
                                    "Sentinel mathematically proves his income &gt; $3,000/mo without revealing the exact amount or history.",
                                    "You receive a cryptographic YES/NO certificate.",
                                    "Approval is instantaneous. No data is stored. Zero liability."
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3 text-zinc-300 text-sm leading-relaxed">
                                        <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto px-4 py-2 bg-brand-accent/20 border border-brand-accent/30 text-brand-accent text-xs font-bold text-center rounded-lg uppercase tracking-wider">
                                Instant • Zero-Knowledge • Cryptographic Truth
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Architecture */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Trust Architecture</h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            Sentinel transforms trust from institutional promises to mathematical certainty.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 space-y-4 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                            <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-white leading-tight">1. The Source (zkTLS)</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                We capture a cryptographic signature from the bank's genuine HTTPS response, proving origin integrity.
                            </p>
                        </div>

                        <div className="p-8 space-y-4 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                            <div className="w-12 h-12 flex items-center justify-center bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-white leading-tight">2. The Proof (ZK)</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                A zero-knowledge circuit evaluates the data locally, answering compliance questions without exposing raw data.
                            </p>
                        </div>

                        <div className="p-8 space-y-4 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                            <div className="w-12 h-12 flex items-center justify-center bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-white leading-tight">3. Verification</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                The certificate is signed and verifiable on-chain in milliseconds, enabling instant institutional DeFi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / CTA */}
            <section className="py-20 px-6 border-t border-white/5 bg-brand-base">
                <div className="max-w-4xl mx-auto text-center space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-white">Ready to automate compliance?</h2>
                        <p className="text-zinc-400">Join the waitlist for institutional access or try the demo app today.</p>
                    </div>
                    <Link
                        to="/app"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all hover:scale-[1.03]"
                    >
                        Get Started <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    )
}
