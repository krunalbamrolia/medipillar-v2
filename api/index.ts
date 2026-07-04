import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "../server/routes";
import { connectMongoDB as connectDatabase } from "../server/storage";

const app = express();

// Trust Vercel's reverse proxy for secure cookies
app.set("trust proxy", 1);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "medipillar-super-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax" as const,
    },
  })
);

declare module "express-session" {
  interface SessionData {
    userId?: string;
    adminId?: string;
    resetUserId?: string;
    resetVerified?: boolean;
    pendingUserId?: string;
  }
}

// Lazy initialization — runs once per cold start
let initialized = false;

async function ensureInit() {
  if (initialized) return;
  await connectDatabase();
  await registerRoutes(app);

  // Error handler (must be registered after routes)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  initialized = true;
}

export default async function handler(req: any, res: any) {
  await ensureInit();
  app(req, res);
}
