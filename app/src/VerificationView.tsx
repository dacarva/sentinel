import { useParams, Link } from 'react-router-dom'
import { 
    ShieldCheck, 
    ExternalLink, 
    FileJson, 
    ChevronDown, 
    Search, 
    Database, 
    Lock,
    ArrowLeft,
    Share2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface ProofStamp {
    id: string;
    label: string;
    source: string;
    sourceUrl: string;
    status: 'verified' | 'pending' | 'failed';
    timestamp: string;
    revealedFact: string;
    technicalDetails: {
        sessionHash: string;
        circuitId: string;
        notarySignature: string;
        proofBytes: string;
    }
}

export function VerificationView() {
    const { proofId } = useParams<{ proofId: string }>()
    const [isValidating, setIsValidating] = useState(true)
    const [isExpanded, setIsExpanded] = useState<string | null>(null)
    const { t } = useTranslation('common')

    // Mock data based on the strategy
    const [proofs] = useState<ProofStamp[]>([
        {
            id: 'stamp-1',
            label: 'Solvency Proof',
            source: 'Bancolombia',
            sourceUrl: 'https://api.bancolombia.com',
            status: 'verified',
            timestamp: new Date().toISOString(),
            revealedFact: 'Account balance is greater than 1,000,000 COP',
            technicalDetails: {
                sessionHash: '0x71c94a5f3e2b1d0c8a4b6d9e5f7a1c3b',
                circuitId: 'noir-balance-threshold-v1.2',
                notarySignature: '0x8b2e1f4d9c7a3b5e1f0d8c7b6a9e5f4d3c2b1a0',
                proofBytes: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t'
            }
        }
    ])

    useEffect(() => {
        // Simulate re-verification logic
        const timer = setTimeout(() => {
            setIsValidating(false)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-background-light dark:bg-brand-base flex flex-col items-center py-12 px-6">
            <div className="max-w-3xl w-full flex flex-col gap-8">
                
                {/* Back Link */}
                <Link to="/" className="flex items-center gap-2 text-text-muted hover:text-primary-light dark:hover:text-white transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('verification.backToHome')}</span>
                </Link>

                {/* Main Receipt Header */}
                <div className="relative bg-white dark:bg-surface-dark border border-grid-color dark:border-white/10 p-8 md:p-12 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/5 dark:bg-brand-accent/5 blur-[100px] pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-light dark:bg-brand-accent rounded-lg shadow-sm">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-black uppercase tracking-tight m-0">
                                    {t('verification.title')}
                                </h1>
                            </div>
                            <p className="text-xs font-mono text-text-muted">
                                {t('verification.receiptIdLabel')}: {proofId || 'SN-ZK-2026-X'}
                            </p>
                        </div>

                        {isValidating ? (
                            <div className="flex items-center gap-3 bg-primary-light/10 dark:bg-brand-accent/10 border border-primary-light/20 dark:border-brand-accent/20 px-4 py-2 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-primary-light dark:bg-brand-accent animate-ping"></div>
                                <span className="text-xs font-bold uppercase tracking-widest text-primary-light dark:text-brand-accent">
                                    {t('verification.reverifying')}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-bold uppercase tracking-widest text-green-500">
                                    {t('verification.verdictAuthenticated')}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">
                                {t('verification.independentProofStamps')}
                            </h2>
                            <div className="h-px flex-1 bg-grid-color dark:bg-white/5"></div>
                        </div>

                        {/* Proof Stamps List */}
                        <div className="flex flex-col gap-4">
                            {proofs.map((proof) => (
                                <div key={proof.id} className="bg-background-light dark:bg-background-dark border border-grid-color dark:border-white/10 overflow-hidden">
                                    <div 
                                        className="p-6 cursor-pointer hover:bg-surface-light dark:hover:bg-white/5 transition-colors flex flex-col gap-4"
                                        onClick={() => setIsExpanded(isExpanded === proof.id ? null : proof.id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-primary-light dark:text-brand-accent uppercase tracking-widest">{proof.label}</span>
                                                    <div className="size-1 rounded-full bg-text-muted"></div>
                                                    <span className="text-xs font-medium text-text-muted">{proof.source}</span>
                                                </div>
                                                <h3 className="text-lg md:text-xl font-bold text-text-body-light dark:text-white leading-tight">
                                                    {proof.revealedFact}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-1.5 text-green-500">
                                                        <ShieldCheck className="w-4 h-4" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                                {t('verification.verifiedSource')}
                                                            </span>
                                                    </div>
                                                        <span className="text-[9px] font-mono text-text-muted uppercase">
                                                            {t('verification.verifiedOn', {
                                                              date: new Date(proof.timestamp).toLocaleDateString(),
                                                            })}
                                                        </span>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${isExpanded === proof.id ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Audit Trail */}
                                    {isExpanded === proof.id && (
                                        <div className="px-6 pb-6 pt-2 border-t border-grid-color dark:border-white/5 bg-surface-light/30 dark:bg-white/[0.02]">
                                            <div className="flex flex-col gap-4 mt-4">
                                                <div className="flex items-center gap-2">
                                                    <Search className="w-3 h-3 text-text-muted" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                                        {t('verification.auditTrail')}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1.5 p-3 bg-background-light dark:bg-background-dark border border-grid-color dark:border-white/5 rounded">
                                                        <span className="text-[8px] font-mono font-bold text-text-muted uppercase">
                                                            {t('verification.tlsSessionHash')}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-text-body-light dark:text-zinc-400 break-all">{proof.technicalDetails.sessionHash}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 p-3 bg-background-light dark:bg-background-dark border border-grid-color dark:border-white/5 rounded">
                                                        <span className="text-[8px] font-mono font-bold text-text-muted uppercase">
                                                            {t('verification.noirCircuitId')}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-text-body-light dark:text-zinc-400 break-all">{proof.technicalDetails.circuitId}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 p-3 bg-background-light dark:bg-background-dark border border-grid-color dark:border-white/5 rounded md:col-span-2">
                                                        <span className="text-[8px] font-mono font-bold text-text-muted uppercase">
                                                            {t('verification.notarySignature')}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-text-body-light dark:text-zinc-400 break-all">{proof.technicalDetails.notarySignature}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 pt-2">
                                                    <a 
                                                        href={proof.sourceUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-light dark:text-brand-accent hover:underline"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        {t('verification.visitSourceApi')}
                                                    </a>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                                        <Lock className="w-3 h-3" />
                                                        {t('verification.endToEndEncrypted')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust Footer */}
                    <div className="mt-12 pt-8 border-t border-grid-color dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                        <div className="flex items-center gap-4 text-text-muted">
                            <Database className="w-4 h-4" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
                                {t('verification.secureDatabase')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 h-10 px-4 bg-surface-light dark:bg-white/5 hover:bg-surface-light/80 dark:hover:bg-white/10 border border-grid-color dark:border-white/10 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer">
                                <FileJson className="w-4 h-4 text-primary-light dark:text-brand-accent" />
                                {t('verification.downloadJson')}
                            </button>
                            <button className="flex items-center gap-2 h-10 px-4 bg-primary-light dark:bg-brand-accent text-white border-none text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg cursor-pointer">
                                <Share2 className="w-4 h-4" />
                                {t('verification.shareReceipt')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* What is this? Info Box */}
                <div className="p-6 bg-primary-light/5 dark:bg-brand-accent/5 border border-primary-light/10 dark:border-brand-accent/10">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 text-primary-light dark:text-brand-accent shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-text-body-light dark:text-white">
                                {t('verification.isProofReal')}
                            </h4>
                            <p className="text-xs text-text-muted leading-relaxed font-normal">
                                {t('verification.proofExplanation')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
