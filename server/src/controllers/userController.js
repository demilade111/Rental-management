import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserProfile = async (req, res) => {
  try {
    // Use the exact property name from your JWT
    const userId = req.user.userId;

    // Query the correct table and column names in your database
    const user = await prisma.user.findUnique({
      where: { id: userId }, // 'id' matches the column in your user table
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
