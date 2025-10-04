import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const registerUser = async (data) => {
    const { email, password, firstName, lastName, phone, role } = data;

    // ensure role is valid
    if (!Object.values(UserRole).includes(role)) {
        throw new Error("Invalid role. Allowed values: TENANT or ADMIN");
    }

    // check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) throw new Error("Username or email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role
        },
    });

    // generate token for new user
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return { user, token }; // return both
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

    return {
        user: { id: user.id, username: user.username, email: user.email },
        token,
    };
};
