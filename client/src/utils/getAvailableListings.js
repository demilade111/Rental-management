export const getAvailableListings = (listings, applications = []) => {
    return listings.filter(listing => {
        const hasActiveApp = applications.some(app =>
            app.listingId === listing.id &&
            ["PENDING", "NEW", "APPROVED"].includes(app.status)
        );
        return !hasActiveApp;
    });
};
