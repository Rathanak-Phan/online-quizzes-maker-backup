// src/lib/auth.ts
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  role?: string;
}

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET!, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET!) as JwtPayload;
  } catch (error) {
    console.error("JWT VERIFY ERROR:", error);
    return null;
  }
};
