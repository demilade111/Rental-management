import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.user_id; 

        const user = await prisma.users.findUnique({
            where: { user_id: userId },
            select: {
                user_id: true,
                name: true,
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
