import React, { useRef, useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DashboardImageSection from "@/components/landing/DashboardImageSection";
import PricingSection from "@/components/landing/PricingSection";
import ContactSection from "@/components/landing/ContactSection";
import TeamSection from "@/components/landing/TeamSection";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingStyles from "@/components/landing/LandingStyles";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const LandingPage = () => {
    const featuresRef = useRef(null);
    const dashboardRef = useRef(null);
    const pricingRef = useRef(null);
    const contactRef = useRef(null);
    const teamRef = useRef(null);

    const refs = [
        { ref: featuresRef, name: 'features' },
        { ref: dashboardRef, name: 'dashboard' },
        { ref: pricingRef, name: 'pricing' },
        { ref: contactRef, name: 'contact' },
        { ref: teamRef, name: 'team' }
    ];

    const { visibilityStates, animationKeys } = useIntersectionObserver(refs);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Auto-scroll to contact section if hash is present
    useEffect(() => {
        if (window.location.hash === '#contact') {
            // Small delay to ensure page is fully rendered
            setTimeout(() => {
                const contactElement = document.getElementById('contact');
                if (contactElement) {
                    contactElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, []);

    // Show/hide scroll to top button based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div 
            className="min-h-screen relative"
            style={{
                backgroundImage: 'url(/images/PropEase_bg.jpg)',
                backgroundAttachment: 'fixed',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            }}
        >
            {/* Matte filter overlay */}
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] z-0"></div>
            <div className="relative z-10">
            <LandingStyles />
            <LandingHeader />
            <HeroSection />
            <FeaturesSection 
                isVisible={visibilityStates.features} 
                sectionRef={featuresRef} 
            />
            <DashboardImageSection 
                isVisible={visibilityStates.dashboard} 
                sectionRef={dashboardRef} 
            />
            <PricingSection 
                isVisible={visibilityStates.pricing} 
                sectionRef={pricingRef}
                animationKey={animationKeys.pricing || 0}
            />
            <ContactSection 
                isVisible={visibilityStates.contact} 
                sectionRef={contactRef}
                animationKey={animationKeys.contact || 0}
            />
            <TeamSection 
                isVisible={visibilityStates.team} 
                sectionRef={teamRef}
                animationKey={animationKeys.team || 0}
            />
            <LandingFooter />
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <Button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 rounded-full w-14 h-14 p-0 bg-[#497c87] text-primary-foreground hover:bg-[#497c87]/90 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                    aria-label="Scroll to top"
                >
                    <ChevronUp className="w-6 h-6" />
                </Button>
            )}
        </div>
    );
};

export default LandingPage;
