import React from "react";

const DashboardImageSection = ({ sectionRef }) => {
    return (
        <section className="pt-8 py-16 sm:pt-16 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 via-teal-100/20 to-pink-100/20 z-0"></div>
            <div className="max-w-7xl mx-auto flex justify-center relative z-10" ref={sectionRef}>
                <img
                    src="/images/dashboard-frame.png"
                    alt="Dashboard Preview"
                    className="w-full max-w-5xl"
                />
            </div>
        </section>
    );
};

export default DashboardImageSection;

