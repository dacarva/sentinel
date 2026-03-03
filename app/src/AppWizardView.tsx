import { SentinelProofPage } from './SentinelProofPage'

export function AppWizardView() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 bg-[radial-gradient(circle_at_50%_10%,_rgba(59,130,246,0.08),_transparent_40%)]">
            <div className="w-full max-w-xl animate-fade-in delay-100">
                <SentinelProofPage />
            </div>
        </div>
    )
}
