import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    username: string;
  };
}

const JWT_SECRET = process.env.SESSION_SECRET || "your-jwt-secret-key";

export function generateToken(user: { id: string; role: string; username: string }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string; username: string };
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  const user = await storage.getUser(decoded.id);
  if (!user || !user.isActive) {
    return res.status(403).json({ message: "User not found or inactive" });
  }

  req.user = decoded;
  next();
}

export function authorizeRoles(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}
