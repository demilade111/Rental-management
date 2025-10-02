import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const registerUser = async (data) => {
    const { email, password, firstName, lastName, phone } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
        },
    });

    return user;
};

export const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return { user, token };
};
