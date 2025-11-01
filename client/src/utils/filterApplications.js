export const filterApplications = (applications, searchQuery, filters) => {
    return applications.filter((app) => {
        const matchSearch =
            app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchStatus = filters.status
            ? app.status === filters.status
            : true;

        const submissionDate = new Date(app.createdAt);

        const matchStart = filters.startDate
            ? submissionDate >= new Date(filters.startDate)
            : true;

        const matchEnd = filters.endDate
            ? submissionDate <= new Date(filters.endDate)
            : true;

        return matchSearch && matchStatus && matchStart && matchEnd;
    });
};
