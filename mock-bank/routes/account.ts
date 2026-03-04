/**
 * GET /account/balance, GET /account/transactions — IMPLEMENTATION.md §1.
 * Protected by JWT; data from users.json by req.auth.sub (username).
 * Accepts JWT from Authorization header or from cookie (token).
 */
import { Router, type Request, type Response } from "express";
import { expressjwt } from "express-jwt";
import { readFile } from "fs/promises";
import { join } from "path";
import { detectLocale, t } from "../i18n";

const router = Router();
const JWT_SECRET = "mock-bank-secret";

interface UserRow {
  id: string;
  username: string;
  passwordHash: string;
  address: string;
  accountId: string;
  balance: number;
  currency: string;
  transactions: { date: string; amount: number; type: string; description: string }[];
}

/** If no Authorization header, set it from cookie so expressjwt can verify. */
router.use((req: Request, _res, next) => {
  const auth = req.headers.authorization;
  const cookieToken = (req as Request & { cookies?: { token?: string } }).cookies?.token;
  if (!auth && cookieToken) {
    req.headers.authorization = `Bearer ${cookieToken}`;
  }
  next();
});

router.use(
  expressjwt({
    secret: JWT_SECRET,
    algorithms: ["HS256"],
  })
);

router.get("/balance", async (req: Request, res: Response) => {
  try {
    const username = (req as Request & { auth?: { sub: string } }).auth?.sub;
    const locale = detectLocale(req.headers["accept-language"] as string | undefined);
    if (!username) return res.status(401).json({ error: "UNAUTHORIZED", message: t(locale, "account.noToken") });
    const dataDir = join(import.meta.dir ?? "", "..", "data", "users.json");
    const raw = await readFile(dataDir, "utf-8");
    const users = JSON.parse(raw) as UserRow[];
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(404).json({ error: "NOT_FOUND", message: t(locale, "account.userNotFound") });
    return res.status(200).json({
      account_id: user.accountId,
      balance: user.balance,
      currency: user.currency,
      last_updated: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: t(detectLocale(req.headers["accept-language"] as string | undefined), "account.failedBalance"),
    });
  }
});

router.get("/transactions", async (req: Request, res: Response) => {
  try {
    const username = (req as Request & { auth?: { sub: string } }).auth?.sub;
    const locale = detectLocale(req.headers["accept-language"] as string | undefined);
    if (!username) return res.status(401).json({ error: "UNAUTHORIZED", message: t(locale, "account.noToken") });
    const dataDir = join(import.meta.dir ?? "", "..", "data", "users.json");
    const raw = await readFile(dataDir, "utf-8");
    const users = JSON.parse(raw) as UserRow[];
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(404).json({ error: "NOT_FOUND", message: t(locale, "account.userNotFound") });
    const transactions = user.transactions ?? [];
    return res.status(200).json({ transactions });
  } catch (e) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: t(detectLocale(req.headers["accept-language"] as string | undefined), "account.failedTransactions"),
    });
  }
});

export default router;
