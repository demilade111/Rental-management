import bcrypt from "bcrypt";
import { signToken } from "../utils/signJwtToken.js";
import { prisma, UserRole } from "../prisma/client.js";


const buildSafeUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profileImage: user.profileImage,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const registerUser = async ({
  email,
  password,
  firstName,
  lastName,
  phone,
  role,
}) => {
  if (!Object.values(UserRole).includes(role)) {
    const err = new Error("Invalid role. Allowed values: TENANT or ADMIN");
    err.status = 400;
    throw err;
  }

  try {
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS) || 12
    );

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        phone: phone?.trim() || null,
        role,
      },
    });

    return { user: buildSafeUser(user) };
  } catch (err) {
    if (err.code === "P2002" && err.meta?.target.includes("email")) {
      const conflict = new Error("Email already exists");
      conflict.status = 409;
      throw conflict;
    }
    throw err;
  }
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = signToken(user);

  return { user: buildSafeUser(user), token };
};


export const requestPasswordReset = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found. Please check the email you provided.");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 30);
    
    await prisma.user.update({
        where: { email },
        data: { resetToken, resetTokenExpiry },
    });
    return resetToken;
};


export const resetPassword = async (token, newPassword) => {
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gte: new Date() },
        },
    });
    if (!user) throw new Error("Invalid or expired reset token.");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });
    return { message: "Password reset successful." };
};
