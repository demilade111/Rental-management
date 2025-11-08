import { prisma } from "../prisma/client.js";

export const createCustomLease = async (landlordId, data) => {
    // console.log('this is data' + data)
    const listing = await prisma.Listing.findUnique({
        where: { id: data.listingId },
    });

    if (!listing) {
        throw Object.assign(new Error("Listing not found"), { status: 404 });
    }

    if (listing.landlordId !== landlordId) {
        throw Object.assign(new Error("Unauthorized: You do not own this property"), { status: 403 });
    }

    return prisma.CustomLease.create({
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
        Listing: {
            select: {
                id: true,
                title: true,
                streetAddress: true,
                city: true,
                state: true,
                country: true,
            },
        },
        users_CustomLease_tenantIdTousers: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        },
        users_CustomLease_landlordIdTousers: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        },
    };

    if (role === "LANDLORD" || role === "ADMIN") {
        return prisma.CustomLease.findMany({
            where: { landlordId: userId },
            include,
            orderBy: { createdAt: "desc" },
        });
    }

    if (role === "TENANT") {
        return prisma.CustomLease.findMany({
            where: { tenantId: userId },
            include,
            orderBy: { createdAt: "desc" },
        });
    }

    return prisma.CustomLease.findMany({
        include,
        orderBy: { createdAt: "desc" },
    });
};

export const getCustomLeaseById = (id) => {
    return prisma.CustomLease.findUnique({
        where: { id },
    });
};

export const updateCustomLeaseById = async (id, userId, data) => {
    const lease = await prisma.CustomLease.findUnique({ where: { id } });

    if (!lease) throw Object.assign(new Error("Lease not found"), { status: 404 });

    if (lease.landlordId !== userId)
        throw Object.assign(new Error("Unauthorized"), { status: 403 });

    return prisma.CustomLease.update({
        where: { id },
        data,
    });
};

export const deleteCustomLeaseById = async (id, userId) => {
    const lease = await prisma.CustomLease.findUnique({ where: { id } });

    if (!lease) throw Object.assign(new Error("Lease not found"), { status: 404 });

    if (lease.landlordId !== userId)
        throw Object.assign(new Error("Unauthorized"), { status: 403 });

    await prisma.CustomLease.delete({ where: { id } });

    return { message: "Custom lease deleted successfully" };
};
