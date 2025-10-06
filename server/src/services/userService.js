import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserById = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
    });
};
