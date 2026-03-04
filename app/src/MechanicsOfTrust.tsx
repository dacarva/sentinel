import {
    Shield,
    Lock,
    EyeOff,
    FileText,
    CheckCircle,
    Handshake,
    Key,
    Terminal,
    Cpu,
    LayoutGrid,
    SearchCode
} from 'lucide-react'

export function MechanicsOfTrust() {
    return (
        <div className="w-full bg-background-light dark:bg-background-dark">
            {/* Mechanics Hero Section */}
            <section className="relative min-h-[600px] flex items-center py-20 px-6 md:px-20 border-b border-grid-color dark:border-white/10 bg-grid-pattern-light dark:bg-grid-pattern-dark overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center w-full">
                    <div className="space-y-8 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/10 dark:bg-white/5 rounded-full border border-primary-light/20 dark:border-white/10">
                            <div className="w-2 h-2 rounded-full bg-trust-blue animate-pulse"></div>
                            <span className="text-xs font-mono font-medium text-primary-light dark:text-trust-blue uppercase tracking-wider">Core Protocol</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tighter-swiss text-text-body-light dark:text-white">
                            The Mechanics <br /> of <span className="text-trust-blue">Trust.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-text-muted leading-relaxed max-w-xl font-normal">
                            Under the hood: How Sentinel protects your digital identity using the Blindfolded Notary principle and Zero-Knowledge proofs.
                        </p>
                        <div className="flex flex-wrap gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <Shield className="text-trust-blue w-6 h-6" />
                                <span className="text-sm font-bold uppercase tracking-widest text-text-body-light dark:text-white/80">100% Verifiable</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <EyeOff className="text-trust-blue w-6 h-6" />
                                <span className="text-sm font-bold uppercase tracking-widest text-text-body-light dark:text-white/80">0% Data Exposure</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="absolute w-96 h-96 bg-trust-blue/10 rounded-full blur-[120px] -top-20 -right-20"></div>
                        <div className="relative bg-yellow-400 p-10 rounded-sm shadow-hard flex flex-col items-center text-indigo-950 max-w-sm transform rotate-2 hover:rotate-0 transition-all duration-500">
                            <Lock className="w-16 h-16 mb-6" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">Sentinel Widget</h3>
                            <div className="w-full h-px bg-indigo-950/20 my-4"></div>
                            <p className="text-center font-bold text-xs mb-8 uppercase tracking-widest opacity-80">Secure your digital presence in 3 seconds</p>
                            <button className="w-full bg-indigo-950 text-white py-4 font-bold uppercase tracking-widest text-xs hover:bg-slate-900 transition-colors border-none cursor-pointer">
                                Active & Shielded
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blindfolded Notary Principle */}
            <section className="py-32 px-6 md:px-20 border-b border-grid-color dark:border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter-swiss mb-6 text-text-body-light dark:text-white">The Blindfolded Notary Principle</h2>
                        <p className="text-lg text-text-muted leading-relaxed font-normal">
                            Sentinel acts as a third-party verifier that can confirm the validity of information without ever actually seeing the sensitive data itself.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-white/10 p-10 relative group hover:border-trust-blue/50 transition-colors shadow-sm">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-8">
                                <FileText className="text-trust-blue w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-3 text-text-body-light dark:text-white">Your Data Source</h4>
                            <p className="text-text-muted text-sm leading-relaxed font-normal">You connect to your private data source (Bank, Govt, Social) locally on your device.</p>
                        </div>
                        <div className="bg-primary-light dark:bg-trust-blue border border-primary-light dark:border-trust-blue p-10 relative shadow-2xl scale-105 z-10 text-white">
                            <div className="w-12 h-12 bg-white/20 flex items-center justify-center mb-8 text-white">
                                <EyeOff className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-3">The Blind Notary</h4>
                            <p className="text-white/80 text-sm leading-relaxed font-normal">Sentinel verifies the TLS certificate and the signed data while it's still encrypted.</p>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark border border-grid-color dark:border-white/10 p-10 relative group hover:border-trust-blue/50 transition-colors shadow-sm">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-8 text-green-500">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-3 text-text-body-light dark:text-white">Verifiable Proof</h4>
                            <p className="text-text-muted text-sm leading-relaxed font-normal">A Zero-Knowledge Proof is generated. The destination gets the "Yes" without the "What".</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* zkTLS Handshake */}
            <section className="py-32 px-6 md:px-20 border-b border-grid-color dark:border-white/10 bg-grid-pattern-light dark:bg-grid-pattern-dark">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="relative bg-surface-light dark:bg-surface-dark p-8 border border-grid-color dark:border-white/10 shadow-2xl">
                            <div className="flex items-center justify-between mb-10 pb-4 border-b border-grid-color dark:border-white/5">
                                <span className="text-[10px] font-mono font-bold text-trust-blue uppercase tracking-widest">zkTLS Protocol Handshake</span>
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 border border-green-500/20 font-mono">ENCRYPTED</span>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-4 border border-grid-color dark:border-white/10">
                                    <div className="h-10 w-10 bg-trust-blue/20 flex items-center justify-center text-trust-blue">
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-1.5 w-3/4 bg-gray-200 dark:bg-white/10"></div>
                                        <div className="h-1.5 w-1/2 bg-gray-100 dark:bg-white/5"></div>
                                    </div>
                                </div>
                                <div className="flex justify-center py-2">
                                    <SearchCode className="text-trust-blue animate-pulse w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-4 bg-yellow-400/5 p-4 border border-yellow-400/20">
                                    <div className="h-10 w-10 bg-yellow-400/10 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                        <Handshake className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-1.5 w-full bg-yellow-400/10"></div>
                                        <div className="h-1.5 w-2/3 bg-yellow-400/5"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-10">
                                <div className="text-[10px] font-mono text-text-muted p-3 bg-gray-50 dark:bg-white/5 border border-dashed border-grid-color dark:border-white/10 text-center">
                                    SESSION_HASH: 0x71C94...5F3E [VERIFIED]
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2 space-y-8">
                        <div className="inline-block p-2 bg-trust-blue/10 border border-trust-blue/20">
                            <Terminal className="text-trust-blue w-6 h-6" />
                        </div>
                        <h3 className="text-4xl font-bold tracking-tighter-swiss text-text-body-light dark:text-white">zkTLS: The Digital Handshake</h3>
                        <p className="text-lg text-text-muted leading-relaxed font-normal">
                            Sentinel extends the standard TLS protocol to allow for 3rd-party verification. This enables you to prove that a specific piece of data was sent to you by a specific server, without sharing your session keys or private data.
                        </p>
                        <ul className="space-y-5">
                            <li className="flex items-center gap-4 text-text-body-light dark:text-white/90">
                                <CheckCircle className="text-trust-blue w-5 h-5" />
                                <span className="text-sm font-medium">Cryptographic integrity of web data</span>
                            </li>
                            <li className="flex items-center gap-4 text-text-body-light dark:text-white/90">
                                <CheckCircle className="text-trust-blue w-5 h-5" />
                                <span className="text-sm font-medium">Prevents man-in-the-middle tampering</span>
                            </li>
                            <li className="flex items-center gap-4 text-text-body-light dark:text-white/90">
                                <CheckCircle className="text-trust-blue w-5 h-5" />
                                <span className="text-sm font-medium">No server-side integration required</span>
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
                        <h3 className="text-4xl font-bold tracking-tighter-swiss text-text-body-light dark:text-white">Local Edge Processing</h3>
                        <p className="text-lg text-text-muted leading-relaxed font-normal">
                            Our 'Shielding' technology ensures that data extraction happens entirely on your device. We never send your raw sensitive data to our servers. Only the mathematical proof leaves your browser.
                        </p>
                        <div className="bg-surface-light dark:bg-surface-dark p-8 border border-grid-color dark:border-white/10 shadow-lg">
                            <h5 className="text-xs font-mono font-bold text-trust-blue mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <span className="w-2 h-2 bg-trust-blue rounded-full animate-pulse"></span>
                                Proof Generation Status
                            </h5>
                            <div className="space-y-3">
                                <div className="h-1 w-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                                    <div className="h-full w-2/3 bg-trust-blue"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-text-muted font-mono">
                                    <span>EXTRACTING_DATA...</span>
                                    <span>67% COMPLETE</span>
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
                                    <p className="text-text-body-light dark:text-white font-mono text-[10px] uppercase tracking-[0.3em]">Local Shield Active</p>
                                </div>
                                <div className="absolute bottom-4 right-4 text-[8px] text-text-muted font-mono">
                                    ENCLAVE_STATE: SECURE_ENVIRONMENT
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
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter-swiss text-text-body-light dark:text-white">Ready to integrate trust?</h2>
                            <p className="text-lg text-text-muted leading-relaxed font-normal">
                                The Yellow Sentinel Widget is the easiest way to add zkTLS verification to your dApp or website. It’s lightweight, secure, and ready for production.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-primary-light dark:bg-trust-blue hover:bg-indigo-500 text-white px-8 py-4 font-bold transition-all border-none cursor-pointer">
                                    Documentation
                                </button>
                                <button className="border border-grid-color dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 text-text-body-light dark:text-white px-8 py-4 font-bold transition-all bg-transparent cursor-pointer">
                                    Request Demo
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
