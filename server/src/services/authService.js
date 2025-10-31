import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { signToken } from "../utils/signJwtToken.js";
import { prisma, UserRole } from "../prisma/client.js";
import { sendPasswordResetEmail } from "./emailService.js";


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

    const token = signToken(user);

    return { user: buildSafeUser(user), token };
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
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (!user) {
    const err = new Error("User not found. Please check the email you provided.");
    err.status = 404;
    throw err;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  await prisma.user.update({
    where: { email: email.toLowerCase().trim() },
    data: { resetToken, resetTokenExpiry },
  });

  // Send email with reset link
  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (error) {
  
    const err = new Error("Failed to send reset email. Please try again later.");
    err.status = 500;
    throw err;
  }

  return { message: "Password reset link sent to your email" };
};

export const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    const err = new Error("Token and new password are required");
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gte: new Date() },
    },
  });

  if (!user) {
    const err = new Error("Invalid or expired reset token");
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(process.env.SALT_ROUNDS) || 12
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    },
  });

  return { message: "Password reset successful" };
};

export const refreshToken = async (token) => {
  if (!token) {
    const err = new Error("Refresh token is required");
    err.status = 400;
    throw err;
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    // Generate new token
    const newToken = signToken(user);

    return {
      token: newToken,
      user: buildSafeUser(user)
    };
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      const err = new Error("Invalid or expired token");
      err.status = 401;
      throw err;
    }
    throw error;
  }
};
