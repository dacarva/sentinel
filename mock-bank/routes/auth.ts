/**
 * POST /auth/login — IMPLEMENTATION.md §1.
 * Authenticates user with users.json; returns JWT or 401.
 */
import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { readFile } from "fs/promises";
import { join } from "path";

const router = Router();
const JWT_SECRET = "mock-bank-secret";
const EXPIRES_IN = 3600;

interface UserRow {
  id: string;
  username: string;
  passwordHash: string;
  address: string;
  accountId?: string;
  balance?: number;
  currency?: string;
  transactions?: unknown[];
}

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      return res.status(400).json({
        error: "INVALID_CREDENTIALS",
        message: "Username and password required",
      });
    }
    const dataDir = join(import.meta.dir ?? "", "..", "data", "users.json");
    const raw = await readFile(dataDir, "utf-8");
    const users = JSON.parse(raw) as UserRow[];
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Username or password incorrect",
      });
    }
    const valid = await Bun.password.verify(password, user.passwordHash, "bcrypt");
    if (!valid) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Username or password incorrect",
      });
    }
    const token = jwt.sign(
      { sub: user.username, iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: EXPIRES_IN }
    );
    return res.status(200).json({ token, expires_in: EXPIRES_IN });
  } catch {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Login failed",
    });
  }
});

export default router;
