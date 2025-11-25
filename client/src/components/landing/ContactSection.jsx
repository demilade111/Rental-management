import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const ContactSection = ({ isVisible, sectionRef, animationKey }) => {
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e) => {
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
    };

    return (
        <section id="contact" className="pt-16 py-32 px-4 sm:px-6 lg:px-8 scroll-mt-24 relative overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 via-teal-100/20 to-pink-100/20 z-0"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-left mb-16" ref={sectionRef}>
                    <h2 key={`contact-title-${animationKey}`} className={`text-5xl font-bold text-primary mb-2 leading-relaxed ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        Contact Us
                    </h2>
                    <p key={`contact-desc-${animationKey}`} className={`text-2xl text-gray-500 max-w-2xl leading-relaxed ${isVisible ? 'animate-fade-in-up-delay' : 'opacity-0'}`}>
                        Get in touch with us. We'd love to hear from you.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Contact Form - Left Side */}
                    <div>
                        <form 
                            className="space-y-6"
                            onSubmit={handleSubmit}
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
                                className="w-full py-8 px-8 rounded-2xl bg-primary text-primary-foreground text-xl font-semibold transition-colors duration-300 hover:opacity-90"
                            >
                                Send Message
                            </Button>
                        </form>
                    </div>

                    {/* Image - Right Side */}
                    <div className={`flex justify-center items-center ${isVisible ? 'animate-fade-in-up-delay-3' : 'opacity-0'}`}>
                        <img
                            src="/images/dashboard-frame-mob.png"
                            alt="Dashboard Preview"
                            className="w-full h-auto max-w-2xl"
                            style={{
                                mixBlendMode: 'multiply',
                                backgroundColor: 'transparent'
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;

