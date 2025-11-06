import { prisma } from "../prisma/client.js";

export const createCustomLease = async (landlordId, data) => {
    // console.log('this is data' + data)
    const listing = await prisma.listing.findUnique({
        where: { id: data.listingId },
    });

    if (!listing) {
        throw Object.assign(new Error("Listing not found"), { status: 404 });
    }

    if (listing.landlordId !== landlordId) {
        throw Object.assign(new Error("Unauthorized: You do not own this property"), { status: 403 });
    }

    return prisma.customLease.create({
        data: {
            listingId: data.listingId || null,
            tenantId: data.tenantId || null,
            landlordId,
            leaseName: data.leaseName,
            description: data.description,
            propertyType: data.propertyType,
            fileUrl: data.fileUrl,
        },
    });
};

export const getAllCustomLeases = async (userId, role) => {
    const include = {
        listing: {
            select: {
                id: true,
                title: true,
                streetAddress: true,
                city: true,
                state: true,
                country: true,
            },
        },
        tenant: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        },
        landlord: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        },
    };

    if (role === "LANDLORD" || role === "ADMIN") {
        return prisma.customLease.findMany({
            where: { landlordId: userId },
            include,
            orderBy: { createdAt: "desc" },
        });
    }

    if (role === "TENANT") {
        return prisma.customLease.findMany({
            where: { tenantId: userId },
            include,
            orderBy: { createdAt: "desc" },
        });
    }

    return prisma.customLease.findMany({
        include,
        orderBy: { createdAt: "desc" },
    });
};

export const getCustomLeaseById = (id) => {
    return prisma.customLease.findUnique({
        where: { id },
    });
};

export const updateCustomLeaseById = async (id, userId, data) => {
    const lease = await prisma.customLease.findUnique({ where: { id } });

    if (!lease) throw Object.assign(new Error("Lease not found"), { status: 404 });

    if (lease.landlordId !== userId)
        throw Object.assign(new Error("Unauthorized"), { status: 403 });

    return prisma.customLease.update({
        where: { id },
        data,
    });
};

export const deleteCustomLeaseById = async (id, userId) => {
    const lease = await prisma.customLease.findUnique({ where: { id } });

    if (!lease) throw Object.assign(new Error("Lease not found"), { status: 404 });

    if (lease.landlordId !== userId)
        throw Object.assign(new Error("Unauthorized"), { status: 403 });

    await prisma.customLease.delete({ where: { id } });

    return { message: "Custom lease deleted successfully" };
};
