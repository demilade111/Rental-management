import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, FileText, Calculator, Wrench, ArrowRight, Home, Plus, Check } from "lucide-react";

const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
    const [isDashboardVisible, setIsDashboardVisible] = useState(false);
    const [isPricingVisible, setIsPricingVisible] = useState(false);
    const [isContactVisible, setIsContactVisible] = useState(false);
    const [isTeamVisible, setIsTeamVisible] = useState(false);
    const [pricingKey, setPricingKey] = useState(0);
    const [contactKey, setContactKey] = useState(0);
    const [teamKey, setTeamKey] = useState(0);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    });
    const featuresRef = useRef(null);
    const dashboardRef = useRef(null);
    const pricingRef = useRef(null);
    const contactRef = useRef(null);
    const teamRef = useRef(null);

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

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (entry.target === featuresRef.current) {
                            setIsFeaturesVisible(true);
                        } else if (entry.target === dashboardRef.current) {
                            setIsDashboardVisible(true);
                        } else if (entry.target === pricingRef.current) {
                            // Increment key to force animation replay for title/description
                            if (!isPricingVisible) {
                                setPricingKey(prev => prev + 1);
                            }
                            setIsPricingVisible(true);
                        } else if (entry.target === contactRef.current) {
                            // Increment key to force animation replay for title/description
                            if (!isContactVisible) {
                                setContactKey(prev => prev + 1);
                            }
                            setIsContactVisible(true);
                        } else if (entry.target === teamRef.current) {
                            // Increment key to force animation replay for title/description
                            if (!isTeamVisible) {
                                setTeamKey(prev => prev + 1);
                            }
                            setIsTeamVisible(true);
                        }
                    } else {
                        // Reset visibility when element leaves viewport (for features, dashboard, pricing, and contact to replay animations)
                        if (entry.target === featuresRef.current) {
                            setIsFeaturesVisible(false);
                        } else if (entry.target === dashboardRef.current) {
                            setIsDashboardVisible(false);
                        } else if (entry.target === pricingRef.current) {
                            setIsPricingVisible(false);
                        } else if (entry.target === contactRef.current) {
                            setIsContactVisible(false);
                        } else if (entry.target === teamRef.current) {
                            setIsTeamVisible(false);
                        }
                    }
                });
            },
            {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        const refs = [
            { ref: featuresRef, name: 'features' },
            { ref: dashboardRef, name: 'dashboard' },
            { ref: pricingRef, name: 'pricing' },
            { ref: contactRef, name: 'contact' },
            { ref: teamRef, name: 'team' }
        ];

        refs.forEach(({ ref }) => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });

        return () => {
            refs.forEach(({ ref }) => {
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            });
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-l from-[#f1efdc] via-[#ffffff] to-[#edeeeb]">
            {/* Header */}
            <header
                className="sticky top-0 z-50 shadow-lg shadow-primary-foreground/5 overflow-hidden"
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex justify-between items-center h-24">
                        {/* Logo */}
                        <div className="flex items-center">
                            <svg width="146" height="32" viewBox="0 0 146 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
                                <path d="M8.93487 25.3281V15.7329C8.93487 15.5683 9.31172 15.0193 9.43797 14.8587L18.0193 5.99608C18.4574 5.6288 19.0944 5.58098 19.6071 5.78948C22.0824 7.35234 24.6247 8.83677 27.0656 10.4494C28.3606 11.3044 29.4548 11.687 29.5906 13.4316C29.8948 17.29 29.3668 21.552 29.5753 25.4524C29.4969 26.6843 28.4333 27.57 27.2282 27.0899C24.5003 25.1827 21.5238 23.5701 18.8189 21.6381C18.3484 21.3014 17.7745 20.8576 17.6061 20.2799C17.3766 19.4956 17.3823 16.1365 17.6061 15.3158C17.916 14.1777 19.7505 13.9691 20.5023 14.8127C21.2541 15.6563 20.6974 17.9155 20.8868 18.9733L26.1914 22.3898V13.8505L19.4617 9.60577L19.1881 9.54838L12.2787 16.785L12.2289 28.7637C12.0223 29.9229 10.7789 30.5944 9.73065 29.9937L0.996241 23.9469C-0.264375 23.0402 0.116296 21.7069 0.125861 20.4176C0.148816 17.2135 -0.162991 13.3207 0.118209 10.2179C0.200465 9.30161 0.7533 8.76217 1.3597 8.15386C3.34722 6.15868 5.54517 4.21706 7.6073 2.2831C8.85262 1.11621 9.8722 -0.745061 11.7736 0.314698C12.8659 0.923008 15.2513 2.3424 16.1389 3.10948C17.4378 4.23045 16.5081 6.38632 14.8611 6.1319C14.6488 6.09938 14.423 5.94443 14.2318 5.84496C13.1624 5.29212 12.0893 4.41409 11.041 3.79431L10.8612 3.78474L4.75513 9.53307L3.44478 10.8855V21.4984L3.70877 21.7853L8.93296 25.3281H8.93487Z" fill="#FEFFF8" />
                                <path d="M36.1057 19.0841V25.3738C36.1057 26.0376 34.9445 26.7128 34.3152 26.7128C33.6858 26.7128 32.5247 26.0376 32.5247 25.3738V15.4113H40.8325C41.3471 15.4113 42.5599 14.6882 42.9463 14.3114C46.0261 11.3176 42.8296 6.09919 38.6767 7.65248C37.3893 8.13454 36.1057 9.74522 36.1057 11.1397V13.6648H32.5247V10.497C32.5247 8.18427 34.8833 5.43158 36.8976 4.49616C43.8932 1.24419 50.7931 9.28038 46.4603 15.7135C43.9754 19.4036 40.119 19.1836 36.1038 19.0822L36.1057 19.0841Z" fill="#FEFFF8" />
                                <path d="M101.191 5.12769V8.61686H93.1126V14.0343H97.2885C97.5888 14.0343 98.1761 14.3556 98.3942 14.5814C99.2282 15.4479 99.0121 16.9821 97.9179 17.5081C97.8299 17.5502 97.432 17.7071 97.3822 17.7071H93.1145V23.1245H99.5859C99.8614 23.1245 100.437 23.4248 100.646 23.6256C101.277 24.2378 101.375 25.1694 100.904 25.9097C100.747 26.1584 100.145 26.7055 99.8633 26.7055H89.5354V5.12769H101.195H101.191Z" fill="#FEFFF8" />
                                <path d="M76.4055 26.7053V31.8472H72.8245V23.2161C73.1765 23.2658 73.5285 23.1702 73.8651 23.1587C76.0554 23.0764 78.9057 23.4724 81.0328 23.1166C86.1671 22.2615 84.6215 14.1335 79.4298 15.3616C78.1558 15.6639 76.4055 17.2057 76.4055 18.5792V21.4715H72.9622C72.9527 21.4715 72.8245 21.3433 72.8245 21.3338V18.5792C72.8245 15.9642 75.2482 13.1407 77.5992 12.2455C84.5278 9.60946 90.6816 17.4677 86.4311 23.5585C85.4402 24.9779 83.0012 26.7053 81.2241 26.7053H76.4055Z" fill="#FEFFF8" />
                                <path d="M141.949 17.4312C141.018 15.3232 138.062 14.6307 136.228 15.9774C134.039 17.5842 133.963 20.708 136.123 22.3876C138.068 23.8988 140.995 22.445 142.41 23.5353C143.623 24.4688 143.126 26.5272 141.536 26.7051C138.087 27.0934 135.009 26.4889 132.721 23.7668C128.05 18.2117 133.494 10.1946 140.446 12.0004C143.944 12.9091 146.628 16.7617 145.869 20.3848C145.829 20.5722 145.833 20.9376 145.655 20.9969L137.888 20.9854C136.503 20.84 135.74 19.2523 136.626 18.1179C136.817 17.8731 137.481 17.4293 137.773 17.4293H141.949V17.4312Z" fill="#FEFFF8" />
                                <path d="M112.023 22.5732V26.4296C107.593 27.7476 102.729 24.6238 102.38 19.9601C101.761 11.6466 112.538 8.55912 116.444 15.9927C117.569 18.1333 117.559 22.4029 117.351 24.8266C117.129 27.4033 114.001 27.1833 113.768 25.0982C113.422 22.0127 115.055 16.8153 111.155 15.4992C106.916 14.0702 103.941 19.5967 107.431 22.3456C108.779 23.4091 110.551 23.3422 112.023 22.5732Z" fill="#FEFFF8" />
                                <path d="M62.984 11.7652C67.8008 11.3463 71.837 15.5815 71.0547 20.3887C70.0293 26.6841 62.106 28.9605 57.9569 24.0864C54.0392 19.4839 56.9775 12.2894 62.984 11.7672V11.7652ZM63.3532 15.2525C57.8765 15.6332 59.0549 24.2949 64.4952 23.0993C69.2221 22.0606 68.2293 14.9139 63.3532 15.2525Z" fill="#FEFFF8" />
                                <path d="M129.649 11.7385V15.2277L123.646 15.2373C122.105 15.4324 122.215 17.2841 123.449 17.4333C124.566 17.5691 125.458 17.3109 126.644 17.726C130.835 19.1989 130.548 25.4197 126.323 26.5465C125.23 26.8372 121.818 26.8162 120.601 26.7091C118.522 26.5254 118.52 23.5623 120.259 23.2371C121.659 22.975 123.518 23.4035 124.987 23.1931C126.456 22.9827 126.449 21.3242 125.427 21.0564C124.7 20.8651 123.528 21.0679 122.648 20.8976C118.839 20.1592 117.676 15.1856 120.699 12.7505C121.205 12.343 122.445 11.7385 123.084 11.7385H129.647H129.649Z" fill="#FEFFF8" />
                                <path d="M55.3841 11.7385V15.1818C55.3841 15.3635 54.6706 15.3138 54.4621 15.3616C49.9935 16.3678 51.8605 22.0205 51.4301 25.1825C51.1546 27.2083 48.0557 27.2504 47.8548 25.0104C47.7114 23.4112 47.7496 20.6585 47.8548 19.0344C48.0978 15.2602 51.5468 11.7385 55.386 11.7385H55.3841Z" fill="#FEFFF8" />
                            </svg>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#home" className="text-xl text-background/80 hover:text-background transition-colors">
                                Home
                            </a>
                            <a href="#contact" className="text-xl text-background/80 hover:text-background transition-colors">
                                Contact Us
                            </a>
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden text-background"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-background/20">
                            <nav className="flex flex-col space-y-4">
                                <a
                                    href="#home"
                                    className="text-background hover:text-background/80 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </a>
                                <a
                                    href="#contact"
                                    className="text-background hover:text-background/80 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Contact Us
                                </a>
                                <Button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        navigate("/login");
                                    }}
                                    className="bg-background text-primary hover:bg-background/90 rounded-2xl w-full"
                                >
                                    Get Started
                                </Button>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section - View Demo */}
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
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground leading-relaxed">
                            Streamline Your Rental Management
                        </h1>
                        <p className="text-xl md:text-3xl text-primary-foreground/70 mb-20 max-w-3xl mx-auto leading-relaxed">
                            Manage properties, leases, and payments all in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-8 justify-center">
                            <Button
                                onClick={() => navigate("/login")}
                                style={{ padding: '40px 60px', minWidth: '250px', background: 'linear-gradient(to right, rgb(29 55 66 / 100%), rgb(29 55 66 / 75%))', boxShadow: '0 3px 0px rgba(254, 255, 248, 0.1), 0 3px 7px rgba(254, 255, 248, 0.1)' }}
                                className="text-primary-foreground hover:opacity-90 rounded-full text-3xl animate-bounce-button flex items-center gap-3"
                            >
                                <span>Get Started</span>
                                <ArrowRight className="hero-btn-icon" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - New Leases */}
            <section id="demo" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16" ref={featuresRef}>
                        <h2 className={`text-5xl font-bold text-primary mb-8 leading-relaxed ${isFeaturesVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                            Powerful Modules
                        </h2>
                        <p className={`text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed ${isFeaturesVisible ? 'animate-fade-in-up-delay' : 'opacity-0'}`}>
                            Everything you need to manage your rental properties efficiently
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Leases Module */}
                        <div className="group relative cursor-pointer overflow-hidden bg-card rounded-2xl p-8 pb-4 shadow-lg ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <span className="absolute top-8 z-0 h-20 w-20 rounded-full bg-primary/90 transition-all duration-300 group-hover:scale-[20]"></span>
                            <div className="relative z-10">
                                <div className="grid h-20 w-20 rounded-full place-items-center transition-all duration-300 group-hover:bg-white mb-6">
                                    <FileText className="w-8 h-8 text-primary-foreground transition-all group-hover:text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary mb-4 leading-relaxed transition-all duration-300 group-hover:text-primary-foreground">Leases</h3>
                                <p className="text-xl text-gray-500 mb-4 leading-relaxed transition-all duration-300 group-hover:text-primary-foreground/90">
                                    Create and manage standard and custom lease agreements with ease.
                                </p>
                            </div>
                        </div>

                        {/* Maintenance Module */}
                        <div className="group relative cursor-pointer overflow-hidden bg-card rounded-2xl p-8 pb-4 shadow-lg ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <span className="absolute top-8 z-0 h-20 w-20 rounded-full bg-primary/90 transition-all duration-300 group-hover:scale-[20]"></span>
                            <div className="relative z-10">
                                <div className="grid h-20 w-20 rounded-full place-items-center transition-all duration-300 group-hover:bg-white mb-6">
                                    <Wrench className="w-8 h-8 text-primary-foreground transition-all group-hover:text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary mb-4 leading-relaxed transition-all duration-300 group-hover:text-primary-foreground">Maintenance</h3>
                                <p className="text-xl text-gray-500 mb-4 leading-relaxed transition-all duration-300 group-hover:text-primary-foreground/90">
                                    Track and manage maintenance requests efficiently.
                                </p>
                            </div>
                        </div>

                        {/* Accounting Module */}
                        <div className="group relative cursor-pointer overflow-hidden bg-card rounded-2xl p-8 pb-4 shadow-lg ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <span className="absolute top-8 z-0 h-20 w-20 rounded-full bg-primary/90 transition-all duration-300 group-hover:scale-[20]"></span>
                            <div className="relative z-10">
                                <div className="grid h-20 w-20 rounded-full place-items-center transition-all duration-300 group-hover:bg-white mb-6">
                                    <Calculator className="w-8 h-8 text-primary-foreground transition-all group-hover:text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary mb-4 leading-relaxed transition-all duration-300 group-hover:text-primary-foreground">Accounting</h3>
                                <p className="text-xl text-gray-500 mb-4 leading-relaxed transition-all duration-300 group-hover:text-primary-foreground/90">
                                    Manage financial transactions, auto generate invoices and payments.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Button */}
                    <div className="flex justify-center mt-16">
                        <Button
                            onClick={() => navigate("/login")}
                            style={{ padding: '30px 50px', minWidth: '220px', border: '1px solid #53848F', boxShadow: '0 3px 0px rgba(254, 255, 248, 0.1), 0 3px 7px rgba(254, 255, 248, 0.1)' }}
                            className="text-primary bg-primary-foreground hover:opacity-90 hover:text-primary-foreground rounded-full text-2xl flex items-center gap-3"
                        >
                            <span>Get Started</span>
                            <ArrowRight className="hero-btn-icon" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Dashboard Image */}
            <section className="pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex justify-center" ref={dashboardRef}>
                    <img
                        src="/images/dashboard-frame.png"
                        alt="Dashboard Preview"
                        className={`w-full max-w-5xl transition-opacity duration-500 ${isDashboardVisible ? 'animate-fade-in-up-slow' : 'opacity-0'}`}
                    />
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-16 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16" ref={pricingRef}>
                        <h2 key={`pricing-title-${pricingKey}`} className={`text-5xl font-bold text-primary mb-8 leading-relaxed ${isPricingVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                            Choose Your Plan
                        </h2>
                        <p key={`pricing-desc-${pricingKey}`} className={`text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed ${isPricingVisible ? 'animate-fade-in-up-delay' : 'opacity-0'}`}>
                            Flexible pricing options to suit your property management needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Free Plan */}
                        <div className="pricing-card bg-card border border-gray-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:scale-105 hover:-translate-y-1 flex flex-col">
                            <div className="p-6 md:p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                                <p className="text-gray-600 mb-6">Perfect for single property owners</p>

                                <div className="flex items-baseline mb-8">
                                    <span className="text-4xl md:text-5xl font-extrabold text-gray-900">$0</span>
                                    <span className="pricing-duration text-gray-500 font-medium ml-2">/ month</span>
                                </div>

                                <ul className="space-y-4 text-gray-600 mb-6">
                                    <li className="flex items-start">
                                        <Check className="pricing-check w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                        <span>1 property limit</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="pricing-check w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                                        <span>Basic rent & tenant tracking only</span>
                                    </li>
                                    <li className="flex items-start opacity-50">
                                        <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                        <span>No analytics or PropEase lease creation</span>
                                    </li>
                                    <li className="flex items-start opacity-50">
                                        <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                        <span>Payment tracking</span>
                                    </li>
                                    <li className="flex items-start opacity-50">
                                        <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                        <span>Maintenance requests</span>
                                    </li>
                                </ul>

                                <Button
                                    onClick={() => navigate("/login")}
                                    className="w-full py-5 px-6 rounded-lg bg-white border text-primary text-lg font-semibold transition-colors duration-300 hover:bg-white/90 mt-auto"
                                >
                                    Get Started
                                </Button>
                            </div>
                        </div>

                        {/* Premium Plan */}
                        <div className="pricing-card pricing-popular bg-primary rounded-2xl shadow-lg text-white transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 relative overflow-hidden flex flex-col">
                            <div className="p-6 md:p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-bold mb-2">Premium</h3>
                                <p className="text-primary-foreground/80 mb-6">For professional property management</p>

                                <div className="flex items-baseline mb-8">
                                    <span className="text-4xl md:text-5xl font-extrabold">$30</span>
                                    <span className="pricing-duration text-primary-foreground/80 font-medium ml-2">/ month</span>
                                </div>

                                <ul className="space-y-4 text-white mb-6">
                                    <li className="flex items-start">
                                        <Check className="pricing-check w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                                        <span>1-5 properties</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="pricing-check w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                                        <span>Includes lease management</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="pricing-check w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                                        <span>Payment tracking</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="pricing-check w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                                        <span>Maintenance requests and reminders</span>
                                    </li>
                                </ul>

                                <Button
                                    onClick={() => navigate("/login")}
                                    className="w-full py-5 px-6 rounded-lg bg-white text-primary text-lg font-semibold transition-colors duration-300 hover:bg-white/90 mt-auto"
                                >
                                    Get Started
                                </Button>
                            </div>
                        </div>

                        {/* Modules Plan */}
                        <div className="pricing-card group border border-gray-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:scale-105 hover:-translate-y-1 flex flex-col" style={{ backgroundColor: '#53848F' }}>
                            <div className="p-6 md:p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-white mb-2">Modules</h3>
                                <p className="text-white/80 mb-6">Add-on modules for enhanced features</p>

                                <div className="flex items-baseline mb-8">
                                    <span className="text-4xl md:text-5xl font-extrabold text-white">+$5</span>
                                    <span className="pricing-duration text-white/80 group-hover:text-white font-medium ml-2 transition-colors duration-300">/ month</span>
                                </div>

                                <ul className="space-y-4 text-white mb-6">
                                    <li className="flex items-start">
                                        <Check className="pricing-check w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                                        <span><span className="font-semibold">Analytics Module:</span> +$20/month</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="pricing-check w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                                        <span><span className="font-semibold">Lease Module:</span> +$5/month digital lease creation, signing, and renewal tools</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="pricing-check w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                                        <span>Add extra properties for <span className="font-semibold">$2.99/property/month</span></span>
                                    </li>
                                </ul>

                                <Button
                                    onClick={() => navigate("/login")}
                                    className="w-full py-5 px-6 rounded-lg bg-white text-primary text-lg font-semibold transition-colors duration-300 hover:bg-white/90 mt-auto"
                                >
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Us Form Section */}
            <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-24">
                <div className="max-w-7xl mx-auto">
                    <div className="text-left mb-16" ref={contactRef}>
                        <h2 key={`contact-title-${contactKey}`} className={`text-5xl font-bold text-primary mb-2 leading-relaxed ${isContactVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                            Contact Us
                        </h2>
                        <p key={`contact-desc-${contactKey}`} className={`text-2xl text-gray-500 max-w-2xl leading-relaxed ${isContactVisible ? 'animate-fade-in-up-delay' : 'opacity-0'}`}>
                            Get in touch with us. We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Contact Form - Left Side */}
                        <div>
                            <form 
                                className="space-y-6"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    
                                    // Validate required fields
                                    if (!contactForm.name.trim()) {
                                        alert('Please enter your name');
                                        return;
                                    }
                                    if (!contactForm.email.trim()) {
                                        alert('Please enter your email');
                                        return;
                                    }
                                    
                                    const subject = encodeURIComponent('Contact Form Inquiry');
                                    // Use default message if message is empty
                                    const messageText = contactForm.message.trim() || 'No message provided.';
                                    const body = encodeURIComponent(
                                        `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${messageText}`
                                    );
                                    const mailtoLink = `mailto:contact@raccons.dev?subject=${subject}&body=${body}`;
                                    window.location.href = mailtoLink;
                                }}
                            >
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-primary-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-primary-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={5}
                                        value={contactForm.message}
                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-primary-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="Your message..."
                                    ></textarea>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full py-6 px-8 rounded-2xl bg-primary text-primary-foreground text-xl font-semibold transition-colors duration-300 hover:opacity-90"
                                >
                                    Send Message
                                </Button>
                            </form>
                        </div>

                        {/* Image - Right Side */}
                        <div className={`flex justify-center items-center ${isContactVisible ? 'animate-fade-in-up-delay-3' : 'opacity-0'}`}>
                            <img
                                src="/images/dashboard-frame-mob.png"
                                alt="Dashboard Preview"
                                className="w-full h-auto max-w-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-12 bg-background sm:py-16 lg:py-20">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="text-center mb-16" ref={teamRef}>
                        <h2 key={`team-title-${teamKey}`} className={`text-5xl font-bold text-primary mb-8 leading-relaxed ${isTeamVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                            Meet Our Team
                        </h2>
                        <p key={`team-desc-${teamKey}`} className={`text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed ${isTeamVisible ? 'animate-fade-in-up-delay' : 'opacity-0'}`}>
                            Get to know the dedicated professionals who drive our success and innovation.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto mt-12 text-center sm:px-0 md:mt-20">
                        {/* First Row - 5 People */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12 lg:gap-x-16 xl:gap-x-20 mb-12 px-20 sm:px-0">
                            <div>
                                <div className="relative inline-block mx-auto group">
                                    <img
                                        className="object-cover w-24 h-24 rounded-full lg:w-32 lg:h-32 grayscale filter border-4 border-transparent transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 group-hover:border-blue-500"
                                        src="https://cdn.rareblocks.xyz/collection/clarity/images/team/1/team-member-1.png"
                                        alt="Team Member"
                                    />
                                    <span className="absolute bottom-0 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                </div>
                                <p className="mt-2 text-base font-bold text-primary sm:text-lg sm:mt-3 leading-relaxed">Jerome Bell</p>
                                <p className="mt-2 text-sm font-normal text-gray-600 leading-relaxed">Co founder, Chairman, Executive Director</p>
                            </div>

                            <div>
                                <div className="relative inline-block mx-auto group">
                                    <img
                                        className="object-cover w-24 h-24 rounded-full lg:w-32 lg:h-32 grayscale filter border-4 border-transparent transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 group-hover:border-blue-500"
                                        src="https://cdn.rareblocks.xyz/collection/clarity/images/team/1/team-member-2.png"
                                        alt="Team Member"
                                    />
                                    <span className="absolute bottom-0 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                </div>
                                <p className="mt-2 text-base font-bold text-primary sm:text-lg sm:mt-3 leading-relaxed">Jerome Bell</p>
                                <p className="mt-2 text-sm font-normal text-gray-600 leading-relaxed">Co founder, Chairman, Executive Director</p>
                            </div>

                            <div>
                                <div className="relative inline-block mx-auto group">
                                    <img
                                        className="object-cover w-24 h-24 rounded-full lg:w-32 lg:h-32 grayscale filter border-4 border-transparent transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 group-hover:border-blue-500"
                                        src="https://cdn.rareblocks.xyz/collection/clarity/images/team/1/team-member-3.png"
                                        alt="Team Member"
                                    />
                                    <span className="absolute bottom-0 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                </div>
                                <p className="mt-2 text-base font-bold text-primary sm:text-lg sm:mt-3 leading-relaxed">Jerome Bell</p>
                                <p className="mt-2 text-sm font-normal text-gray-600 leading-relaxed">Co founder, Chairman, Executive Director</p>
                            </div>

                            <div>
                                <div className="relative inline-block mx-auto group">
                                    <img
                                        className="object-cover w-24 h-24 rounded-full lg:w-32 lg:h-32 grayscale filter border-4 border-transparent transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 group-hover:border-blue-500"
                                        src="https://cdn.rareblocks.xyz/collection/clarity/images/team/1/team-member-4.png"
                                        alt="Team Member"
                                    />
                                    <span className="absolute bottom-0 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                </div>
                                <p className="mt-2 text-base font-bold text-primary sm:text-lg sm:mt-3 leading-relaxed">Jerome Bell</p>
                                <p className="mt-2 text-sm font-normal text-gray-600 leading-relaxed">Co founder, Chairman, Executive Director</p>
                            </div>

                            <div>
                                <div className="relative inline-block mx-auto group">
                                    <img
                                        className="object-cover w-24 h-24 rounded-full lg:w-32 lg:h-32 grayscale filter border-4 border-transparent transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 group-hover:border-blue-500"
                                        src="https://cdn.rareblocks.xyz/collection/clarity/images/team/1/team-member-1.png"
                                        alt="Team Member"
                                    />
                                    <span className="absolute bottom-0 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                </div>
                                <p className="mt-2 text-base font-bold text-primary sm:text-lg sm:mt-3 leading-relaxed">Sarah Johnson</p>
                                <p className="mt-2 text-sm font-normal text-gray-600 leading-relaxed">Chief Financial Officer</p>
                            </div>
                        </div>

                        {/* Second Row - 4 People */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 lg:gap-x-16 xl:gap-x-20 px-20 sm:px-0 md:max-w-5xl md:mx-auto">
                            <div>
                                <div className="relative inline-block mx-auto group">
                                    <img
                                        className="object-cover w-24 h-24 rounded-full lg:w-32 lg:h-32 grayscale filter border-4 border-transparent transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 group-hover:border-blue-500"
                                        src="https://cdn.rareblocks.xyz/collection/clarity/images/team/1/team-member-2.png"
                                        alt="Team Member"
                                    />
                                    <span className="absolute bottom-0 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                </div>
                                <p className="mt-2 text-base font-bold text-primary sm:text-lg sm:mt-3 leading-relaxed">Michael Chen</p>
                                <p className="mt-2 text-sm font-normal text-gray-600 leading-relaxed">Chief Technology Officer</p>
                            </div>

                            <div>
                                <div className="relative inline-block mx-auto group">
                                    <img
                                        className="object-cover w-24 h-24 rounded-full lg:w-32 lg:h-32 grayscale filter border-4 border-transparent transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 group-hover:border-blue-500"
                                        src="https://cdn.rareblocks.xyz/collection/clarity/images/team/1/team-member-3.png"
                                        alt="Team Member"
                                    />
                                    <span className="absolute bottom-0 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                </div>
                                <p className="mt-2 text-base font-bold text-primary sm:text-lg sm:mt-3 leading-relaxed">Emily Rodriguez</p>
                                <p className="mt-2 text-sm font-normal text-gray-600 leading-relaxed">Chief Operating Officer</p>
                            </div>

                            <div>
                                <div className="relative inline-block mx-auto group">
                                    <img
                                        className="object-cover w-24 h-24 rounded-full lg:w-32 lg:h-32 grayscale filter border-4 border-transparent transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 group-hover:border-blue-500"
                                        src="https://cdn.rareblocks.xyz/collection/clarity/images/team/1/team-member-4.png"
                                        alt="Team Member"
                                    />
                                    <span className="absolute bottom-0 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                </div>
                                <p className="mt-2 text-base font-bold text-primary sm:text-lg sm:mt-3 leading-relaxed">David Kim</p>
                                <p className="mt-2 text-sm font-normal text-gray-600 leading-relaxed">Board Member</p>
                            </div>

                            <div>
                                <div className="relative inline-block mx-auto group">
                                    <img
                                        className="object-cover w-24 h-24 rounded-full lg:w-32 lg:h-32 grayscale filter border-4 border-transparent transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105 group-hover:border-blue-500"
                                        src="https://cdn.rareblocks.xyz/collection/clarity/images/team/1/team-member-1.png"
                                        alt="Team Member"
                                    />
                                    <span className="absolute bottom-0 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                </div>
                                <p className="mt-2 text-base font-bold text-primary sm:text-lg sm:mt-3 leading-relaxed">Jennifer Williams</p>
                                <p className="mt-2 text-sm font-normal text-gray-600 leading-relaxed">Board Member</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 sm:mt-16">
                        <svg className="w-auto h-4 mx-auto text-gray-300" viewBox="0 0 172 16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 11 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 46 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 81 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 116 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 151 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 18 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 53 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 88 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 123 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 158 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 25 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 60 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 95 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 130 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 165 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 32 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 67 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 102 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 137 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 172 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 39 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 74 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 109 1)" />
                            <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 144 1)" />
                        </svg>
                    </div>

                    <div className="max-w-3xl mx-auto mt-12 space-y-8 sm:space-y-0 sm:flex sm:items-center sm:justify-center sm:mt-16 sm:gap-x-16">
                        <div className="flex justify-center">
                            <svg width="386" height="224" viewBox="0 0 386 224" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-auto h-12 md:h-16 grayscale filter opacity-60">
                                <g clipPath="url(#clip0_1526_7319)">
                                    <g filter="url(#filter0_i_1526_7319)">
                                        <path d="M45.7764 104.504C47.8845 103.45 52.7034 102.697 60.9854 104.504C67.6109 105.949 78.2016 112.334 82.6689 115.346C89.3447 120.666 103.721 132.482 107.816 137.18C112.936 143.052 112.635 148.474 112.334 151.485C112.033 154.497 109.021 158.563 107.063 160.068C105.498 161.273 104.203 161.473 103.751 161.423H59.6299C58.0643 161.423 57.7731 160.118 57.8232 159.466C57.5221 155.701 56.7689 152.69 48.7881 142.601C40.8072 132.512 19.1238 122.272 18.5215 121.82C17.9194 121.369 18.8231 120.917 18.9736 121.067C19.0943 121.188 19.626 121.118 19.877 121.067C28.0082 118.056 30.8688 110.225 31.9229 108.87C32.9769 107.515 34.1819 108.419 34.7842 109.172C35.2661 109.774 36.2905 109.523 36.7422 109.322L37.6455 108.87C39.6532 107.766 44.0895 105.347 45.7764 104.504ZM43.5176 72.8818C45.2041 70.2316 47.3332 71.7776 48.1865 72.8818C49.5419 75.3917 52.8845 80.8322 55.4141 82.5186C58.5762 84.6267 61.4372 85.2293 67.1592 82.9707C72.8812 80.712 82.9699 81.0132 86.584 82.9707C89.4751 84.5368 93.6118 83.6232 95.3184 82.9707C96.0714 82.5691 97.9383 81.5551 99.3838 80.7119C101.191 79.6578 106.913 74.0857 112.937 71.9775C117.755 70.2915 118.959 73.4841 118.959 75.291L118.809 78.4531C118.608 84.2255 118.237 97.2158 118.357 102.998C118.478 108.78 122.724 107.917 124.832 106.763L144.859 97.2754C155.25 91.3525 181.782 79.1458 204.791 77.7002C233.552 75.8934 252.375 95.0166 253.278 95.7695C254.001 96.3717 254.583 95.9203 254.784 95.6191C254.985 95.2171 256.14 93.4804 259.15 89.7471C262.915 85.079 273.606 81.0126 276.769 79.5068C279.298 78.3022 281.236 79.3065 281.889 79.959C282.291 79.8096 285.354 82.9125 294.387 96.5225C305.68 113.538 299.657 126.488 299.355 128.897C299.115 130.825 299.456 131.408 299.657 131.458C306.835 134.018 321.522 139.257 322.847 139.739C324.172 140.221 324.403 139.238 324.353 138.686C317.878 108.72 296.796 81.4656 295.29 79.959C293.785 78.4535 295.741 78.453 296.344 78.6035C296.826 78.724 305.78 80.0594 310.197 80.7119C310.749 80.4609 315.86 83.5126 331.882 97.7275C351.909 115.496 356.125 131.759 356.878 134.47C357.631 137.18 355.974 137.18 355.673 137.933C355.37 138.686 342.271 143.655 341.066 144.106C340.103 144.468 340.264 144.759 340.465 144.859L373.441 152.389C375.048 152.84 378.261 154.466 378.261 157.357C378.261 160.249 374.847 161.272 373.141 161.423H269.541C268.577 161.423 266.83 160.319 266.077 159.767C256.872 152.789 246.204 148.592 237.103 145.012L236.714 144.859C227.529 141.246 202.834 135.523 201.026 135.222C199.581 134.981 199.822 135.623 200.123 135.975L202.08 136.577C211.838 138.986 236.363 148.122 247.405 152.389C249.363 153.041 253.067 155.069 252.224 157.96C251.38 160.851 248.359 161.473 246.953 161.423H160.821C159.255 161.423 157.559 160.219 156.906 159.616C155.852 159.315 142.6 143.956 139.89 137.029C137.721 131.488 133.968 126.789 132.361 125.133C127.292 119.712 112.063 107.546 91.7041 102.245C66.2558 95.6195 43.0662 99.5346 42.4639 99.9863C41.9819 100.348 40.4567 100.539 39.7539 100.589H35.6875C35.206 100.468 35.4868 99.635 35.6875 99.2334C36.3902 96.6235 37.8865 91.1025 38.248 89.8975C38.6998 88.3917 41.4095 76.1953 43.5176 72.8818ZM6.02344 118.357C9.34977 118.358 12.0467 121.054 12.0469 124.38C12.0469 127.706 9.34991 130.403 6.02344 130.403C2.69689 130.403 0 127.706 0 124.38C0.000215171 121.054 2.69702 118.357 6.02344 118.357ZM49.9131 115.203C45.2738 112.884 41.3115 115.21 39.8711 116.713C39.2958 117.313 39.3158 118.266 39.916 118.842C40.5163 119.417 41.4695 119.397 42.0449 118.797C42.9135 117.891 45.4965 116.362 48.5664 117.896C50.7558 118.991 51.6849 120.101 52.1094 120.95C52.5415 121.815 52.5527 122.594 52.5527 123.326C52.5528 124.158 53.227 124.832 54.0586 124.832C54.8902 124.832 55.5644 124.158 55.5645 123.326C55.5645 122.553 55.5752 121.148 54.8027 119.604C54.0225 118.043 52.542 116.518 49.9131 115.203ZM316.07 77.3984C327.966 75.1398 340.765 78.0008 350.252 79.6572C359.667 81.301 382.874 91.2503 384.256 91.8428L384.284 91.8545C385.127 92.2159 385.438 93.009 385.488 93.3604C387.416 105.648 379.465 118.759 375.249 123.778C374.285 124.999 373.642 123.885 373.441 123.176C369.587 105.829 332.886 87.5386 315.017 80.5615C314.314 80.3106 312.878 79.7777 312.758 79.6572C312.607 79.5066 312.457 79.0553 312.607 78.4531C312.728 77.9713 313.16 77.7504 313.36 77.7002L316.07 77.3984ZM319.534 51.499C338.056 39.754 372.539 51.4985 374.346 51.9502C375.791 52.3116 376.454 53.1046 376.604 53.4561C377.659 55.5642 382.628 71.8278 382.778 72.8818C382.898 73.7242 382.327 73.735 382.025 73.6348C349.471 60.643 317.953 67.9392 315.522 68.502L315.468 68.5146C313.902 68.8759 314.113 67.6613 314.414 67.0088C315.267 63.5454 317.064 56.2272 317.426 54.6611C317.787 53.0951 318.982 51.9006 319.534 51.499ZM376.905 0C378.361 0.0502089 381.242 0.813663 381.121 3.46387C381 6.11348 377.558 6.4747 375.852 6.32422C375.099 6.27403 373.351 6.83634 372.388 9.48633C371.183 12.7991 370.581 24.0931 371.334 27.707C371.936 30.5948 371.986 31.4198 371.937 31.4717C371.836 31.8732 371.304 32.5252 369.979 31.9229C368.321 31.1693 352.36 17.7689 332.936 26.9541C332.484 27.0545 331.58 26.9843 331.58 25.9004C331.58 25.6996 331.671 25.1772 332.032 24.6953C332.487 24.0883 348.599 0.150566 376.905 0Z" fill="#53848F" />
                                    </g>
                                    <path d="M16.9582 222.385V195.911H6.24461V191.174H33.3384V195.911H22.6249V222.385H16.9582ZM36.3973 222.385V191.174H41.9311V205.075H41.3113C41.9606 203.511 42.9641 202.33 44.3218 201.533C45.7089 200.707 47.2732 200.294 49.0145 200.294C50.7558 200.294 52.1872 200.618 53.3088 201.268C54.4303 201.917 55.2714 202.906 55.8322 204.234C56.393 205.532 56.6733 207.185 56.6733 209.192V222.385H51.1395V209.458C51.1395 208.336 50.9919 207.421 50.6968 206.713C50.4311 206.005 50.0032 205.488 49.4129 205.163C48.8521 204.809 48.1291 204.632 47.2436 204.632C46.1811 204.632 45.2514 204.868 44.4546 205.341C43.6577 205.783 43.0379 206.433 42.5952 207.289C42.1525 208.115 41.9311 209.089 41.9311 210.21V222.385H36.3973ZM72.9633 222.828C70.5137 222.828 68.4034 222.37 66.6326 221.455C64.8617 220.54 63.4893 219.242 62.5154 217.559C61.5709 215.877 61.0987 213.885 61.0987 211.583C61.0987 209.34 61.5562 207.377 62.4711 205.695C63.4156 204.012 64.6994 202.699 66.3227 201.755C67.9755 200.781 69.8496 200.294 71.9451 200.294C74.0111 200.294 75.7819 200.736 77.2576 201.622C78.7333 202.507 79.8696 203.762 80.6665 205.385C81.4928 207.008 81.906 208.941 81.906 211.184V212.822H65.5701V209.635H78.0102L77.3019 210.299C77.3019 208.292 76.8592 206.757 75.9737 205.695C75.0883 204.603 73.8192 204.057 72.1664 204.057C70.9269 204.057 69.8644 204.352 68.9789 204.942C68.123 205.503 67.459 206.315 66.9867 207.377C66.544 208.41 66.3227 209.65 66.3227 211.096V211.406C66.3227 213.029 66.5735 214.372 67.0753 215.434C67.577 216.497 68.3296 217.294 69.3331 217.825C70.3366 218.356 71.5762 218.622 73.0519 218.622C74.2619 218.622 75.472 218.445 76.6821 218.091C77.8921 217.707 78.9989 217.117 80.0024 216.32L81.5519 220.039C80.5189 220.894 79.2203 221.573 77.656 222.075C76.0918 222.577 74.5276 222.828 72.9633 222.828ZM106.278 222.385V195.911H95.5647V191.174H122.658V195.911H111.945V222.385H106.278ZM125.363 196.088V190.687H131.561V196.088H125.363ZM125.717 222.385V200.736H131.251V222.385H125.717ZM137.001 222.385V200.736H142.402V205.96H141.96C142.373 204.19 143.184 202.847 144.394 201.932C145.605 200.987 147.213 200.441 149.22 200.294L150.902 200.161L151.256 204.854L148.069 205.163C146.269 205.341 144.911 205.901 143.996 206.846C143.081 207.761 142.624 209.059 142.624 210.742V222.385H137.001ZM164.661 222.828C162.212 222.828 160.101 222.37 158.33 221.455C156.56 220.54 155.187 219.242 154.213 217.559C153.269 215.877 152.797 213.885 152.797 211.583C152.797 209.34 153.254 207.377 154.169 205.695C155.113 204.012 156.397 202.699 158.021 201.755C159.673 200.781 161.547 200.294 163.643 200.294C165.709 200.294 167.48 200.736 168.955 201.622C170.431 202.507 171.567 203.762 172.364 205.385C173.191 207.008 173.604 208.941 173.604 211.184V212.822H157.268V209.635H169.708L169 210.299C169 208.292 168.557 206.757 167.672 205.695C166.786 204.603 165.517 204.057 163.864 204.057C162.625 204.057 161.562 204.352 160.677 204.942C159.821 205.503 159.157 206.315 158.685 207.377C158.242 208.41 158.021 209.65 158.021 211.096V211.406C158.021 213.029 158.271 214.372 158.773 215.434C159.275 216.497 160.028 217.294 161.031 217.825C162.034 218.356 163.274 218.622 164.75 218.622C165.96 218.622 167.17 218.445 168.38 218.091C169.59 217.707 170.697 217.117 171.7 216.32L173.25 220.039C172.217 220.894 170.918 221.573 169.354 222.075C167.79 222.577 166.225 222.828 164.661 222.828ZM186.309 222.828C184.42 222.828 182.753 222.37 181.307 221.455C179.89 220.54 178.783 219.242 177.986 217.559C177.19 215.848 176.791 213.841 176.791 211.539C176.791 209.207 177.19 207.215 177.986 205.562C178.783 203.88 179.89 202.581 181.307 201.666C182.753 200.751 184.42 200.294 186.309 200.294C188.11 200.294 189.674 200.736 191.002 201.622C192.36 202.507 193.275 203.673 193.747 205.119H193.26V191.174H198.794V222.385H193.393V217.781H193.791C193.348 219.315 192.448 220.54 191.091 221.455C189.733 222.37 188.139 222.828 186.309 222.828ZM187.859 218.622C189.512 218.622 190.84 218.032 191.843 216.851C192.847 215.641 193.348 213.87 193.348 211.539C193.348 209.177 192.847 207.421 191.843 206.27C190.84 205.09 189.512 204.499 187.859 204.499C186.206 204.499 184.878 205.09 183.874 206.27C182.871 207.421 182.369 209.177 182.369 211.539C182.369 213.87 182.871 215.641 183.874 216.851C184.878 218.032 186.206 218.622 187.859 218.622ZM216.995 222.385V191.174H230.542C233.966 191.174 236.607 192 238.467 193.653C240.326 195.276 241.256 197.564 241.256 200.515C241.256 202.433 240.828 204.086 239.972 205.473C239.146 206.861 237.935 207.923 236.342 208.661C234.748 209.399 232.815 209.768 230.542 209.768L230.941 209.104H232.402C233.612 209.104 234.659 209.399 235.545 209.989C236.46 210.579 237.257 211.509 237.935 212.778L243.159 222.385H236.917L231.516 212.424C231.162 211.775 230.764 211.273 230.321 210.919C229.878 210.535 229.376 210.269 228.816 210.122C228.255 209.974 227.606 209.9 226.868 209.9H222.662V222.385H216.995ZM222.662 205.695H229.568C231.605 205.695 233.139 205.282 234.172 204.455C235.235 203.599 235.766 202.33 235.766 200.648C235.766 198.995 235.235 197.755 234.172 196.929C233.139 196.073 231.605 195.645 229.568 195.645H222.662V205.695ZM253.725 222.828C252.161 222.828 250.759 222.532 249.52 221.942C248.31 221.322 247.35 220.496 246.642 219.463C245.963 218.43 245.624 217.264 245.624 215.966C245.624 214.372 246.037 213.118 246.863 212.203C247.69 211.258 249.033 210.579 250.892 210.166C252.751 209.753 255.245 209.546 258.374 209.546H260.587V212.734H258.418C257.031 212.734 255.865 212.793 254.921 212.911C253.976 212.999 253.209 213.162 252.619 213.398C252.058 213.604 251.645 213.9 251.379 214.283C251.143 214.667 251.025 215.139 251.025 215.7C251.025 216.674 251.364 217.471 252.043 218.091C252.722 218.71 253.666 219.02 254.876 219.02C255.85 219.02 256.706 218.799 257.444 218.356C258.211 217.884 258.816 217.249 259.259 216.453C259.702 215.656 259.923 214.741 259.923 213.708V208.617C259.923 207.141 259.599 206.078 258.949 205.429C258.3 204.78 257.208 204.455 255.673 204.455C254.463 204.455 253.224 204.647 251.954 205.031C250.685 205.385 249.402 205.946 248.103 206.713L246.509 202.95C247.277 202.419 248.177 201.961 249.21 201.578C250.272 201.164 251.379 200.854 252.53 200.648C253.711 200.412 254.817 200.294 255.85 200.294C257.975 200.294 259.717 200.618 261.074 201.268C262.461 201.917 263.494 202.906 264.173 204.234C264.852 205.532 265.191 207.215 265.191 209.281V222.385H260.012V217.781H260.366C260.159 218.814 259.746 219.714 259.126 220.481C258.536 221.219 257.783 221.795 256.869 222.208C255.954 222.621 254.906 222.828 253.725 222.828ZM280.814 222.828C278.541 222.828 276.564 222.37 274.881 221.455C273.199 220.511 271.9 219.183 270.985 217.471C270.071 215.759 269.613 213.752 269.613 211.45C269.613 209.148 270.071 207.17 270.985 205.518C271.9 203.835 273.199 202.552 274.881 201.666C276.564 200.751 278.541 200.294 280.814 200.294C282.201 200.294 283.573 200.515 284.931 200.958C286.288 201.4 287.41 202.02 288.295 202.817L286.657 206.669C285.89 205.99 285.019 205.473 284.045 205.119C283.101 204.765 282.186 204.588 281.301 204.588C279.382 204.588 277.892 205.193 276.829 206.403C275.796 207.584 275.28 209.281 275.28 211.494C275.28 213.678 275.796 215.405 276.829 216.674C277.892 217.914 279.382 218.533 281.301 218.533C282.156 218.533 283.071 218.356 284.045 218.002C285.019 217.648 285.89 217.117 286.657 216.408L288.295 220.304C287.41 221.072 286.274 221.691 284.887 222.164C283.529 222.606 282.171 222.828 280.814 222.828ZM301.263 222.828C298.99 222.828 297.013 222.37 295.331 221.455C293.648 220.511 292.35 219.183 291.435 217.471C290.52 215.759 290.062 213.752 290.062 211.45C290.062 209.148 290.52 207.17 291.435 205.518C292.35 203.835 293.648 202.552 295.331 201.666C297.013 200.751 298.99 200.294 301.263 200.294C302.65 200.294 304.023 200.515 305.38 200.958C306.738 201.4 307.859 202.02 308.745 202.817L307.107 206.669C306.339 205.99 305.469 205.473 304.495 205.119C303.55 204.765 302.635 204.588 301.75 204.588C299.832 204.588 298.341 205.193 297.279 206.403C296.246 207.584 295.729 209.281 295.729 211.494C295.729 213.678 296.246 215.405 297.279 216.674C298.341 217.914 299.832 218.533 301.75 218.533C302.606 218.533 303.521 218.356 304.495 218.002C305.469 217.648 306.339 217.117 307.107 216.408L308.745 220.304C307.859 221.072 306.723 221.691 305.336 222.164C303.978 222.606 302.621 222.828 301.263 222.828ZM321.579 222.828C319.336 222.828 317.389 222.37 315.736 221.455C314.083 220.54 312.799 219.242 311.884 217.559C310.969 215.848 310.512 213.841 310.512 211.539C310.512 209.236 310.969 207.244 311.884 205.562C312.799 203.88 314.083 202.581 315.736 201.666C317.389 200.751 319.336 200.294 321.579 200.294C323.823 200.294 325.77 200.751 327.423 201.666C329.076 202.581 330.36 203.88 331.275 205.562C332.19 207.244 332.647 209.236 332.647 211.539C332.647 213.841 332.19 215.848 331.275 217.559C330.36 219.242 329.076 220.54 327.423 221.455C325.77 222.37 323.823 222.828 321.579 222.828ZM321.579 218.622C323.232 218.622 324.56 218.032 325.564 216.851C326.567 215.641 327.069 213.87 327.069 211.539C327.069 209.177 326.567 207.421 325.564 206.27C324.56 205.09 323.232 204.499 321.579 204.499C319.927 204.499 318.599 205.09 317.595 206.27C316.592 207.421 316.09 209.177 316.09 211.539C316.09 213.87 316.592 215.641 317.595 216.851C318.599 218.032 319.927 218.622 321.579 218.622ZM347.087 222.828C344.844 222.828 342.896 222.37 341.243 221.455C339.591 220.54 338.307 219.242 337.392 217.559C336.477 215.848 336.019 213.841 336.019 211.539C336.019 209.236 336.477 207.244 337.392 205.562C338.307 203.88 339.591 202.581 341.243 201.666C342.896 200.751 344.844 200.294 347.087 200.294C349.33 200.294 351.278 200.751 352.931 201.666C354.584 202.581 355.868 203.88 356.783 205.562C357.697 207.244 358.155 209.236 358.155 211.539C358.155 213.841 357.697 215.848 356.783 217.559C355.868 219.242 354.584 220.54 352.931 221.455C351.278 222.37 349.33 222.828 347.087 222.828ZM347.087 218.622C348.74 218.622 350.068 218.032 351.072 216.851C352.075 215.641 352.577 213.87 352.577 211.539C352.577 209.177 352.075 207.421 351.072 206.27C350.068 205.09 348.74 204.499 347.087 204.499C345.434 204.499 344.106 205.09 343.103 206.27C342.099 207.421 341.598 209.177 341.598 211.539C341.598 213.87 342.099 215.641 343.103 216.851C344.106 218.032 345.434 218.622 347.087 218.622ZM362.722 222.385V200.736H368.123V205.075H367.637C368.286 203.511 369.289 202.33 370.647 201.533C372.034 200.707 373.598 200.294 375.34 200.294C377.081 200.294 378.512 200.618 379.634 201.268C380.755 201.917 381.597 202.906 382.157 204.234C382.718 205.532 382.999 207.185 382.999 209.192V222.385H377.465V209.458C377.465 208.336 377.317 207.421 377.022 206.713C376.756 206.005 376.328 205.488 375.738 205.163C375.177 204.809 374.454 204.632 373.569 204.632C372.506 204.632 371.577 204.868 370.78 205.341C369.983 205.783 369.363 206.433 368.92 207.289C368.478 208.115 368.256 209.089 368.256 210.21V222.385H362.722Z" fill="#1D3742" />
                                </g>
                                <defs>
                                    <filter id="filter0_i_1526_7319" x="-6.02326" y="0" width="391.808" height="165.947" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                        <feOffset dx="-6.02326" dy="4.51744" />
                                        <feGaussianBlur stdDeviation="4.36686" />
                                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                                        <feColorMatrix type="matrix" values="0 0 0 0 0.113725 0 0 0 0 0.215686 0 0 0 0 0.258824 0 0 0 1 0" />
                                        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1526_7319" />
                                    </filter>
                                    <clipPath id="clip0_1526_7319">
                                        <rect width="385.79" height="223.162" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        {/* Company Info */}
                        <div>
                            <div className="flex items-center mb-4">
                                <svg width="146" height="32" viewBox="0 0 146 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
                                    <path d="M8.93487 25.3281V15.7329C8.93487 15.5683 9.31172 15.0193 9.43797 14.8587L18.0193 5.99608C18.4574 5.6288 19.0944 5.58098 19.6071 5.78948C22.0824 7.35234 24.6247 8.83677 27.0656 10.4494C28.3606 11.3044 29.4548 11.687 29.5906 13.4316C29.8948 17.29 29.3668 21.552 29.5753 25.4524C29.4969 26.6843 28.4333 27.57 27.2282 27.0899C24.5003 25.1827 21.5238 23.5701 18.8189 21.6381C18.3484 21.3014 17.7745 20.8576 17.6061 20.2799C17.3766 19.4956 17.3823 16.1365 17.6061 15.3158C17.916 14.1777 19.7505 13.9691 20.5023 14.8127C21.2541 15.6563 20.6974 17.9155 20.8868 18.9733L26.1914 22.3898V13.8505L19.4617 9.60577L19.1881 9.54838L12.2787 16.785L12.2289 28.7637C12.0223 29.9229 10.7789 30.5944 9.73065 29.9937L0.996241 23.9469C-0.264375 23.0402 0.116296 21.7069 0.125861 20.4176C0.148816 17.2135 -0.162991 13.3207 0.118209 10.2179C0.200465 9.30161 0.7533 8.76217 1.3597 8.15386C3.34722 6.15868 5.54517 4.21706 7.6073 2.2831C8.85262 1.11621 9.8722 -0.745061 11.7736 0.314698C12.8659 0.923008 15.2513 2.3424 16.1389 3.10948C17.4378 4.23045 16.5081 6.38632 14.8611 6.1319C14.6488 6.09938 14.423 5.94443 14.2318 5.84496C13.1624 5.29212 12.0893 4.41409 11.041 3.79431L10.8612 3.78474L4.75513 9.53307L3.44478 10.8855V21.4984L3.70877 21.7853L8.93296 25.3281H8.93487Z" fill="#FEFFF8" />
                                    <path d="M36.1057 19.0841V25.3738C36.1057 26.0376 34.9445 26.7128 34.3152 26.7128C33.6858 26.7128 32.5247 26.0376 32.5247 25.3738V15.4113H40.8325C41.3471 15.4113 42.5599 14.6882 42.9463 14.3114C46.0261 11.3176 42.8296 6.09919 38.6767 7.65248C37.3893 8.13454 36.1057 9.74522 36.1057 11.1397V13.6648H32.5247V10.497C32.5247 8.18427 34.8833 5.43158 36.8976 4.49616C43.8932 1.24419 50.7931 9.28038 46.4603 15.7135C43.9754 19.4036 40.119 19.1836 36.1038 19.0822L36.1057 19.0841Z" fill="#FEFFF8" />
                                    <path d="M101.191 5.12769V8.61686H93.1126V14.0343H97.2885C97.5888 14.0343 98.1761 14.3556 98.3942 14.5814C99.2282 15.4479 99.0121 16.9821 97.9179 17.5081C97.8299 17.5502 97.432 17.7071 97.3822 17.7071H93.1145V23.1245H99.5859C99.8614 23.1245 100.437 23.4248 100.646 23.6256C101.277 24.2378 101.375 25.1694 100.904 25.9097C100.747 26.1584 100.145 26.7055 99.8633 26.7055H89.5354V5.12769H101.195H101.191Z" fill="#FEFFF8" />
                                    <path d="M76.4055 26.7053V31.8472H72.8245V23.2161C73.1765 23.2658 73.5285 23.1702 73.8651 23.1587C76.0554 23.0764 78.9057 23.4724 81.0328 23.1166C86.1671 22.2615 84.6215 14.1335 79.4298 15.3616C78.1558 15.6639 76.4055 17.2057 76.4055 18.5792V21.4715H72.9622C72.9527 21.4715 72.8245 21.3433 72.8245 21.3338V18.5792C72.8245 15.9642 75.2482 13.1407 77.5992 12.2455C84.5278 9.60946 90.6816 17.4677 86.4311 23.5585C85.4402 24.9779 83.0012 26.7053 81.2241 26.7053H76.4055Z" fill="#FEFFF8" />
                                    <path d="M141.949 17.4312C141.018 15.3232 138.062 14.6307 136.228 15.9774C134.039 17.5842 133.963 20.708 136.123 22.3876C138.068 23.8988 140.995 22.445 142.41 23.5353C143.623 24.4688 143.126 26.5272 141.536 26.7051C138.087 27.0934 135.009 26.4889 132.721 23.7668C128.05 18.2117 133.494 10.1946 140.446 12.0004C143.944 12.9091 146.628 16.7617 145.869 20.3848C145.829 20.5722 145.833 20.9376 145.655 20.9969L137.888 20.9854C136.503 20.84 135.74 19.2523 136.626 18.1179C136.817 17.8731 137.481 17.4293 137.773 17.4293H141.949V17.4312Z" fill="#FEFFF8" />
                                    <path d="M112.023 22.5732V26.4296C107.593 27.7476 102.729 24.6238 102.38 19.9601C101.761 11.6466 112.538 8.55912 116.444 15.9927C117.569 18.1333 117.559 22.4029 117.351 24.8266C117.129 27.4033 114.001 27.1833 113.768 25.0982C113.422 22.0127 115.055 16.8153 111.155 15.4992C106.916 14.0702 103.941 19.5967 107.431 22.3456C108.779 23.4091 110.551 23.3422 112.023 22.5732Z" fill="#FEFFF8" />
                                    <path d="M62.984 11.7652C67.8008 11.3463 71.837 15.5815 71.0547 20.3887C70.0293 26.6841 62.106 28.9605 57.9569 24.0864C54.0392 19.4839 56.9775 12.2894 62.984 11.7672V11.7652ZM63.3532 15.2525C57.8765 15.6332 59.0549 24.2949 64.4952 23.0993C69.2221 22.0606 68.2293 14.9139 63.3532 15.2525Z" fill="#FEFFF8" />
                                    <path d="M129.649 11.7385V15.2277L123.646 15.2373C122.105 15.4324 122.215 17.2841 123.449 17.4333C124.566 17.5691 125.458 17.3109 126.644 17.726C130.835 19.1989 130.548 25.4197 126.323 26.5465C125.23 26.8372 121.818 26.8162 120.601 26.7091C118.522 26.5254 118.52 23.5623 120.259 23.2371C121.659 22.975 123.518 23.4035 124.987 23.1931C126.456 22.9827 126.449 21.3242 125.427 21.0564C124.7 20.8651 123.528 21.0679 122.648 20.8976C118.839 20.1592 117.676 15.1856 120.699 12.7505C121.205 12.343 122.445 11.7385 123.084 11.7385H129.647H129.649Z" fill="#FEFFF8" />
                                    <path d="M55.3841 11.7385V15.1818C55.3841 15.3635 54.6706 15.3138 54.4621 15.3616C49.9935 16.3678 51.8605 22.0205 51.4301 25.1825C51.1546 27.2083 48.0557 27.2504 47.8548 25.0104C47.7114 23.4112 47.7496 20.6585 47.8548 19.0344C48.0978 15.2602 51.5468 11.7385 55.386 11.7385H55.3841Z" fill="#FEFFF8" />
                                </svg>
                            </div>
                            <p className="text-white/80 text-sm">
                                Simplifying property management for landlords and tenants.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li>
                                    <a href="#home" className="hover:text-white transition-colors">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a href="#contact" className="hover:text-white transition-colors">
                                        Contact Us
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="font-semibold mb-4">Contact Us</h3>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li>Email: contact@raccons.dev</li>
                                <li>Team: The Tired Raccons</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/20 pt-8 text-center text-sm text-white/60">
                        <p>&copy; {new Date().getFullYear()} The Tired Raccons (Raccons). All rights reserved.</p>
                    </div>
                </div>
            </footer>

            <style>{`
        @keyframes bounce-button {
          0%, 100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-10px);
          }
          50% {
            transform: translateY(0);
          }
          75% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-button {
          animation: bounce-button 2s ease-in-out infinite;
        }
        .hero-btn-icon {
          width: 1.8rem;
          height: 2.5rem;
          margin-left: 0.75rem;
          display: inline-block;
          vertical-align: middle;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          animation-fill-mode: forwards;
        }
        .animate-fade-in-up-delay {
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
          animation-fill-mode: forwards;
        }
        .animate-fade-in-up-delay-2 {
          animation: fadeInUp 0.8s ease-out 0.4s forwards;
          animation-fill-mode: forwards;
        }
        .animate-fade-in-up-delay-3 {
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
          animation-fill-mode: forwards;
        }
        .animate-fade-in-up-delay-4 {
          animation: fadeInUp 0.8s ease-out 0.8s forwards;
          animation-fill-mode: forwards;
        }
        .animate-fade-in-up-slow {
          animation: fadeInUp 1.2s ease-out forwards;
          animation-fill-mode: forwards;
        }
        .ribbon-wrapper {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 180px;
          height: 180px;
          overflow: visible;
          z-index: 10;
          pointer-events: none;
        }
        .ribbon {
          position: absolute;
          top: 35px;
          right: -45px;
          width: 220px;
          background: var(--chart-2);
          color: var(--foreground);
          text-align: center;
          padding: 10px 0;
          font-size: 0.875rem;
          font-weight: 600;
          transform: rotate(45deg);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          line-height: 1.2;
          pointer-events: auto;
        }
        .ribbon::before {
          content: '';
          position: absolute;
          left: 0;
          bottom: -10px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 10px 0 0 10px;
          border-color: rgba(0, 0, 0, 0.2) transparent transparent transparent;
        }
        .ribbon::after {
          content: '';
          position: absolute;
          right: 0;
          bottom: -10px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 10px 10px 0 0;
          border-color: rgba(0, 0, 0, 0.2) transparent transparent transparent;
        }
        .pricing-card:hover .pricing-check {
          color: currentColor;
        }
        .pricing-card:hover .pricing-duration {
          color: currentColor;
        }
        .pricing-card.group:hover .pricing-duration {
          color: white;
        }
        .pricing-popular::before {
          content: 'POPULAR';
          position: absolute;
          top: 30px;
          right: -30px;
          transform: rotate(45deg);
          background-color: #FFBA53;
          color: var(--foreground);
          padding: 4px 40px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          z-index: 1;
        }
      `}</style>
        </div>
    );
};

export default LandingPage;

