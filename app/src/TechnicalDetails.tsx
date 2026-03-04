import {
    Network,
    ShieldCheck,
    Eye,
    Code2,
    Wallet,
    CheckCircle2,
    Zap,
    Users,
    Unplug,
    Monitor,
    Server,
    Copy,
    FileDown
} from 'lucide-react'

export function TechnicalDetails() {
    return (
        <div className="w-full bg-background-light dark:bg-background-dark">
            {/* Hero Header */}
            <div className="relative w-full py-16 px-6 md:px-10 bg-surface-light dark:bg-zinc-950/50 border-b border-grid-color dark:border-white/5 overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 40%)' }}></div>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                    <div className="flex flex-col gap-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
                            <span className="size-2 rounded-full bg-blue-500 animate-pulse"></span>
                            MPC-TLS Architecture
                        </div>
                        <h2 className="text-text-body-light dark:text-white text-5xl md:text-6xl font-black leading-tight tracking-tight">Trust Architecture</h2>
                        <p className="text-text-muted text-lg max-w-2xl font-light leading-relaxed">
                            A deep dive into the Sentinel protocol: leveraging zkTLS, Noir ZK circuits, and TLSNotary for cryptographically verifiable source truth.
                        </p>
                    </div>
                    <button className="flex min-w-[160px] items-center justify-center rounded-lg h-12 px-6 bg-primary-light dark:bg-blue-600 text-white text-sm font-bold hover:brightness-110 transition-all shadow-lg border-none cursor-pointer">
                        <FileDown className="w-4 h-4 mr-2" />
                        Technical Whitepaper
                    </button>
                </div>
            </div>

            {/* Technical Grid */}
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 gap-16">

                {/* Section A: Data Provenance via zkTLS */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center size-10 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                <Network className="w-6 h-6" />
                            </span>
                            <h3 className="text-text-body-light dark:text-white text-2xl font-bold">Data Provenance via zkTLS</h3>
                        </div>
                        <p className="text-text-muted leading-relaxed">
                            Our framework enables cryptographic attestation of data directly from secure web sessions. Sentinel acts as a "Blind Notary," ensuring data integrity without ever gaining access to the underlying session keys.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <ShieldCheck className="text-blue-600 dark:text-blue-400 w-5 h-5 shrink-0" />
                                <div>
                                    <p className="text-text-body-light dark:text-white font-semibold text-sm">TLSNotary Integration</p>
                                    <p className="text-text-muted text-sm scale-95 origin-left">Three-party computation protocol for verifiable TLS 1.3 transcripts.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <Eye className="text-blue-600 dark:text-blue-400 w-5 h-5 shrink-0" />
                                <div>
                                    <p className="text-text-body-light dark:text-white font-semibold text-sm">Selective Redaction</p>
                                    <p className="text-text-muted text-sm scale-95 origin-left">Users redact sensitive session data locally before generating the final proof.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="lg:col-span-7 bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-white/10 rounded-xl p-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
                        <div className="relative flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-grid-color dark:border-white/10 pb-4">
                                <span className="text-xs font-mono text-text-muted uppercase tracking-widest">zkTLS Handshake Architecture</span>
                                <Unplug className="text-text-muted w-4 h-4" />
                            </div>
                            <div className="h-64 flex items-center justify-center bg-gray-50/50 dark:bg-background-dark/50 rounded-lg border border-grid-color dark:border-white/5">
                                {/* Abstract Diagram */}
                                <div className="flex items-center gap-12 relative scale-90 sm:scale-100">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-16 rounded-lg bg-blue-500/20 border border-blue-500 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Monitor className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] text-text-muted font-mono">User Enclave</span>
                                    </div>
                                    <div className="w-24 h-[1px] bg-grid-color dark:bg-slate-700 relative">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-background-light dark:bg-background-dark rounded border border-grid-color dark:border-white/10 text-[8px] text-blue-600 dark:text-blue-400 font-bold">MPC</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-16 rounded-full bg-primary-light/20 dark:bg-primary/20 border border-primary-light dark:border-primary flex items-center justify-center text-primary-light dark:text-primary">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] text-text-muted font-mono">Notary Node</span>
                                    </div>
                                    <div className="w-24 h-[1px] bg-grid-color dark:bg-slate-700 relative">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-background-light dark:bg-background-dark rounded border border-grid-color dark:border-white/10 text-[8px] text-text-muted">TLS 1.3</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="size-16 rounded-lg bg-surface-light dark:bg-white/5 border border-grid-color dark:border-white/20 flex items-center justify-center text-text-muted dark:text-white/40">
                                            <Server className="w-8 h-8" />
                                        </div>
                                        <span className="text-[10px] text-text-muted font-mono">Source API</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section B: AI-Generated Noir Circuits */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-8">
                    <div className="lg:col-span-7 order-2 lg:order-1 bg-surface-light dark:bg-background-dark border border-grid-color dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 border-b border-grid-color dark:border-white/10">
                            <div className="flex gap-1.5">
                                <div className="size-3 rounded-full bg-red-500/50"></div>
                                <div className="size-3 rounded-full bg-yellow-500/50"></div>
                                <div className="size-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <span className="text-xs font-mono text-text-muted">bancolombia_threshold.nr</span>
                            <Copy className="text-text-muted w-3.5 h-3.5 cursor-pointer hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="p-6 font-mono text-xs leading-relaxed overflow-x-auto text-text-body-light dark:text-slate-300">
                            <pre><code><span className="text-blue-600 dark:text-blue-400">use</span> dep::std;
                                <br />
                                <br /><span className="text-blue-600 dark:text-blue-400">fn</span> main(
                                <br />    <span className="text-primary-light dark:text-primary">private</span> balance: Field,
                                <br />    <span className="text-primary-light dark:text-primary">public</span> threshold: Field
                                <br />) {"{"}
                                <br />    <span className="text-text-muted italic">// AI-Generated ZK Constraint</span>
                                <br />    <span className="text-blue-600 dark:text-blue-400">assert</span>(balance &gt;= threshold);
                                <br />
                                <br />    <span className="text-text-muted italic">// Proof sent to Verifier</span>
                                <br />    std::println(threshold);
                                <br />{"}"}</code></pre>
                        </div>
                    </div>

                    <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center size-10 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                <Code2 className="w-6 h-6" />
                            </span>
                            <h3 className="text-text-body-light dark:text-white text-2xl font-bold">AI-Generated Noir Circuits</h3>
                        </div>
                        <p className="text-text-muted leading-relaxed">
                            Sentinel's AI engine converts natural language requirements into optimized **Noir ZK circuits** instantly. These circuits allow users to prove complex logic (e.g., "Monthly income &gt; $5,000") without revealing the raw numbers.
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-grid-color dark:border-white/10">
                                <p className="text-text-body-light dark:text-white text-sm font-bold mb-1">Noir DSL</p>
                                <p className="text-text-muted text-xs">A Rust-based language for zero-knowledge proofs, optimized for the web.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-grid-color dark:border-white/10">
                                <p className="text-text-body-light dark:text-white text-sm font-bold mb-1">Barretenberg Backend</p>
                                <p className="text-text-muted text-xs">High-performance PLONK-based proof system for instant browser verification.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section C: Zero-Friction Execution */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-8">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center size-10 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                <Wallet className="w-6 h-6" />
                            </span>
                            <h3 className="text-text-body-light dark:text-white text-2xl font-bold">Account Abstraction</h3>
                        </div>
                        <p className="text-text-muted leading-relaxed">
                            Built on Safe (ERC-4337) infrastructure, we provide a zero-friction user experience. Smart accounts handle the complexity of gas management and recovery, ensuring institutional accessibility.
                        </p>
                        <div className="flex flex-col gap-3">
                            {[
                                "Gas-less transactions via Paymasters",
                                "Social Recovery & Hardware Key Support",
                                "Institutional-grade Role Based Access"
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-text-body-light dark:text-slate-300">
                                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-white/10 rounded-xl p-6 flex flex-col justify-between group hover:border-blue-500/50 transition-colors">
                                <Zap className="text-blue-600 dark:text-blue-400 w-10 h-10 group-hover:scale-110 transition-transform" />
                                <div>
                                    <p className="text-text-body-light dark:text-white font-bold">Gas Sponsorship</p>
                                    <p className="text-text-muted text-xs mt-1">Users pay zero network fees. Managed by protocol-level paymasters.</p>
                                </div>
                            </div>
                            <div className="aspect-square bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-white/10 rounded-xl p-6 flex flex-col justify-between group hover:border-blue-500/50 transition-colors">
                                <Users className="text-blue-600 dark:text-blue-400 w-10 h-10 group-hover:scale-110 transition-transform" />
                                <div>
                                    <p className="text-text-body-light dark:text-white font-bold">Social Recovery</p>
                                    <p className="text-text-muted text-xs mt-1">Recover access through trusted entities or institutional guardians.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Technical Footer / Summary Stats */}
            <div className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
                <div className="bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900/50 dark:to-background-dark border border-grid-color dark:border-white/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
                    <div className="text-center md:text-left">
                        <h4 className="text-text-body-light dark:text-white text-3xl font-bold leading-tight">Ready for Institutional Scale</h4>
                        <p className="text-text-muted mt-2">Audit-ready, battle-tested, and built for high-throughput verification.</p>
                    </div>
                    <div className="flex gap-8 sm:gap-12">
                        {[
                            { label: 'Uptime', value: '99.9%' },
                            { label: 'Proof Gen', value: '<2s' },
                            { label: 'Compliance', value: 'SOC2' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className="text-3xl font-black text-text-body-light dark:text-white">{stat.value}</p>
                                <p className="text-xs uppercase text-blue-600 dark:text-blue-400 font-bold tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
