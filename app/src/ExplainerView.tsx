import { HeroSection } from './HeroSection'
import { PassportExperience } from './PassportExperience'
import { InstitutionalUseCases } from './InstitutionalUseCases'
import { MechanicsOfTrust } from './MechanicsOfTrust'
import { TechnicalDetails } from './TechnicalDetails'

export function ExplainerView() {
    return (
        <div className="w-full flex flex-col overflow-hidden items-center">
            {/* Hero Section */}
            <HeroSection />

            {/* Passport Experience Section */}
            <PassportExperience />

            {/* Institutional Use Cases Section */}
            <InstitutionalUseCases />

            {/* Mechanics of Trust Section */}
            <MechanicsOfTrust />

            {/* Technical Details Section */}
            <TechnicalDetails />

        </div>
    )
}
