import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";

const HeroSection = () => {
    const navigate = useNavigate();
    const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(false);

    return (
        <section
            id="home"
            className="min-h-screen pt-16 pb-32 md:pt-20 md:pb-40 lg:pt-24 lg:pb-48 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center"
            style={{
                backgroundImage: 'url(/images/bg-banner.jpg)',
                backgroundAttachment: 'fixed',
                backgroundPosition: 'bottom',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            }}
        >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/65 dark:bg-gray-950/90 z-0 backdrop-blur-xs"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-relaxed bg-gradient-to-r from-primary-foreground via-primary-foreground to-primary-foreground/70 bg-clip-text text-transparent">
                        Streamline Your Rental Management
                    </h1>
                    <p className="text-xl md:text-3xl mb-20 max-w-3xl mx-auto leading-relaxed bg-gradient-to-r from-primary-foreground/90 via-primary-foreground/70 to-primary-foreground/50 bg-clip-text text-transparent">
                        Manage properties, leases, and payments all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-8 justify-center">
                        <Button
                            onClick={() => setShowMaintenanceAlert(true)}
                            style={{ padding: '40px 50px', minWidth: '250px', background: 'linear-gradient(to right, rgb(29 55 66 / 100%), rgb(29 55 66 / 85%))', boxShadow: '0 3px 0px rgba(254, 255, 248, 0.1), 0 3px 7px rgba(254, 255, 248, 0.1)' }}
                            className="text-primary-foreground hover:opacity-90 rounded-4xl text-3xl animate-bounce-button flex items-center gap-1"
                        >
                            <span>Try the Demo </span>
                            <ArrowRight className="hero-btn-icon" />
                        </Button>
                        <Button
                            onClick={() => window.open("/documentation", "_blank")}
                            variant="outline"
                            style={{ padding: '40px 50px', minWidth: '250px', border: '2px solid rgba(254, 255, 248, 0.3)' }}
                            className="text-primary bg-primary-foreground/85 hover:bg-primary-foreground/55 rounded-4xl text-3xl flex items-center gap-3"
                        >
                            <span>Documentation</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Maintenance Mode Alert */}
            {showMaintenanceAlert && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    onClick={() => setShowMaintenanceAlert(false)}
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div 
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-white/20 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative mb-4">
                            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                                Maintenance Mode
                            </h3>
                        </div>
                        <p className="text-lg md:text-xl text-primary-foreground/90 mb-6">
                            App is in maintenance mode right now. Please try again later.
                        </p>
                        <Button
                            onClick={() => setShowMaintenanceAlert(false)}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-lg py-6"
                        >
                            OK
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default HeroSection;

