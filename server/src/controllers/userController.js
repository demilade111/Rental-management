import { getUserById } from "../services/userService.js";

export const getUserProfile = async (req, res) => {
    try {
        const user = await getUserById(req.user.userId);

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
