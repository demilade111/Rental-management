import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      profileImage: true,
      createdAt: true,
    },
  });
};
