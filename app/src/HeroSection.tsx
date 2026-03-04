import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Lock, EyeOff, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function HeroSection() {
    const { t } = useTranslation('common')

    return (
        <div className="w-full flex justify-center">
            <div className="w-full flex-col flex max-w-[1440px]">
                {/* Main Content Grid */}
                <main className="w-full grid grid-cols-1 lg:grid-cols-2 border-x border-grid-color dark:border-white/10 bg-background-light dark:bg-background-dark min-h-[calc(100vh-5rem-3rem)]">
                    {/* Left: Typography & Value Prop */}
                    <div className="flex flex-col justify-center px-6 py-12 lg:px-16 lg:py-20 border-b lg:border-b-0 lg:border-r border-grid-color dark:border-white/10 relative">
                        <div className="max-w-xl">
                            {/* Tagline */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 rounded-full mb-8 border border-grid-color dark:border-white/10">
                                <div className="w-2 h-2 rounded-full bg-primary-light dark:bg-trust-blue animate-pulse"></div>
                                <span className="text-xs font-mono font-medium text-primary-light dark:text-primary uppercase tracking-wider">
                                    {t('hero.tagline')}
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-5xl md:text-6xl lg:text-[72px] leading-[1.05] font-semibold text-text-body-light dark:text-white tracking-tighter-swiss mb-8">
                                {t('hero.headlinePart1')}
                                <span className="text-trust-blue">{t('hero.headlineEmphasis')}</span>
                                {t('hero.headlinePart2')}
                                <br />
                                {t('hero.headlineSecondLine')}
                            </h1>

                            {/* Subhead */}
                            <p className="text-lg md:text-xl text-text-muted leading-relaxed mb-10 max-w-lg font-normal">
                                {t('hero.subhead')}
                            </p>

                            {/* CTA Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <Link
                                    to="/app"
                                    className="bg-primary-light dark:bg-primary hover:-translate-y-[2px] transition-all duration-200 text-white text-base font-bold px-8 h-14 rounded-sm flex items-center justify-center gap-2 min-w-[200px] shadow-hard hover:shadow-hard-hover"
                                >
                                    <span>{t('hero.primaryCta')}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a
                                    className="group flex items-center gap-2 px-6 h-14 text-text-body-light dark:text-white font-medium border border-transparent hover:bg-surface-light dark:hover:bg-gray-800 rounded-sm transition-colors"
                                    href="#how-it-works"
                                >
                                    <span>{t('hero.secondaryCta')}</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-16 pt-8 border-t border-grid-color dark:border-white/10 flex gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="h-8 flex items-center text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">
                                    {t('hero.backedBy')}
                                </div>
                                <div className="h-8 flex items-center">
                                    <div className="w-24 h-6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" title="Investor Logo Placeholder"></div>
                                </div>
                                <div className="h-8 flex items-center">
                                    <div className="w-24 h-6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" title="Investor Logo Placeholder"></div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative corner accent */}
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-primary dark:border-primary-light"></div>
                    </div>

                    {/* Right: Abstract Geometric Visualization */}
                    <div className="relative bg-background-light dark:bg-[#07131f] flex items-center justify-center overflow-hidden min-h-[400px] lg:min-h-auto bg-grid-pattern-light dark:bg-grid-pattern-dark">
                        {/* Abstract ZK Representation */}
                        <div className="relative w-full max-w-lg aspect-square p-12">
                            {/* Outer Circle (Verifier) */}
                            <div className="absolute inset-0 m-auto w-[80%] h-[80%] border border-grid-color dark:border-white/10 rounded-full flex items-center justify-center animate-[spin_60s_linear_infinite]">
                                <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-trust-blue"></div>
                                <div className="absolute -bottom-1 left-1/2 w-2 h-2 rounded-full bg-trust-blue"></div>
                            </div>

                            {/* Middle Geometric Shape (The Proof) */}
                            <div className="absolute inset-0 m-auto w-[55%] h-[55%] border border-trust-blue/30 rotate-45 flex items-center justify-center transition-all duration-1000 group hover:scale-105">
                                <div className="w-full h-full bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-primary dark:border-trust-blue relative z-10 shadow-lg dark:shadow-2xl"></div>
                                {/* Decorative lines connecting to center */}
                                <div className="absolute w-[140%] h-[1px] bg-trust-blue/20 -rotate-45"></div>
                                <div className="absolute w-[1px] h-[140%] bg-trust-blue/20 -rotate-45"></div>
                            </div>

                            {/* Inner Secret (The Hidden Truth) */}
                            <div className="absolute inset-0 m-auto w-16 h-16 bg-primary dark:bg-trust-blue shadow-hard dark:shadow-[0_0_30px_rgba(99,102,241,0.5)] z-20 flex items-center justify-center group cursor-help transition-all duration-300">
                                <Lock className="w-8 h-8 text-white group-hover:opacity-0 transition-opacity duration-300 absolute" />
                                <EyeOff className="w-8 h-8 text-trust-blue dark:text-white absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Floating Elements representing Data Points */}
                            <div className="absolute top-[20%] right-[20%] w-3 h-3 bg-trust-blue rounded-sm animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="absolute bottom-[25%] left-[15%] w-4 h-4 border border-primary dark:border-primary-light rounded-full animate-bounce bg-white/70 dark:bg-transparent" style={{ animationDelay: '0.3s' }}></div>
                            <div className="absolute top-[15%] left-[25%] w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                        </div>

                        {/* Caption for Visual */}
                        <div className="absolute bottom-8 right-8 bg-white dark:bg-surface-dark/80 backdrop-blur-md border border-grid-color dark:border-white/10 px-4 py-2 shadow-sm dark:shadow-2xl max-w-xs">
                            <div className="flex items-start gap-3">
                                <Info className="w-4 h-4 text-trust-blue shrink-0 mt-0.5" />
                                <p className="text-xs text-text-muted font-mono leading-tight">
                                    <strong className="block mb-1 text-text-body-light dark:text-trust-blue">
                                        {t('hero.visualTitle')}
                                    </strong>
                                    {t('hero.visualCaption')}
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Scrolling Marquee Footer */}
                <div className="bg-white dark:bg-primary text-text-body-light dark:text-white border-y border-grid-color dark:border-indigo-900/50 h-12 flex items-center overflow-hidden relative z-20 w-full max-w-[1440px] mx-auto">
                    {/* Gradient Masks */}
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-primary hidden dark:block"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-primary to-transparent z-10"></div>

                    <div className="flex whitespace-nowrap animate-marquee">
                        {/* Marquee Content Repeated */}
                        <div className="flex items-center gap-16 px-8">
                            {[1, 2, 3].map((set) => (
                                <div key={set} className="flex hidden gap-16 contents">
                                    <span className="text-sm font-bold tracking-widest flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-trust-blue" />
                                        AUDITED BY TRAIL OF BITS
                                    </span>
                                    <span className="w-1.5 h-1.5 bg-grid-color dark:bg-gray-600 rounded-full"></span>

                                    <span className="text-sm font-bold tracking-widest flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-trust-blue" />
                                        SOC2 TYPE II COMPLIANT
                                    </span>
                                    <span className="w-1.5 h-1.5 bg-grid-color dark:bg-gray-600 rounded-full"></span>

                                    <span className="text-sm font-bold tracking-widest flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-trust-blue" />
                                        ISO 27001 READY
                                    </span>
                                    <span className="w-1.5 h-1.5 bg-grid-color dark:bg-gray-600 rounded-full"></span>

                                    <span className="text-sm font-bold tracking-widest flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-trust-blue" />
                                        ZK-SNARK COMPATIBLE
                                    </span>
                                    <span className="w-1.5 h-1.5 bg-grid-color dark:bg-gray-600 rounded-full"></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
