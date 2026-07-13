import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const results: Record<string, string> = {};
  
  // Test imports one by one
  const tests: [string, () => Promise<any>][] = [
    ["express", () => import("express")],
    ["drizzle-orm", () => import("drizzle-orm")],
    ["@trpc/server", () => import("@trpc/server")],
    ["nodemailer", () => import("nodemailer")],
    ["pdfkit", () => import("pdfkit")],
    ["puppeteer-core", () => import("puppeteer-core")],
    ["@sparticuz/chromium", () => import("@sparticuz/chromium")],
    ["../server/db", () => import("../server/db")],
    ["../server/_core/trpc", () => import("../server/_core/trpc")],
    ["../server/_core/env", () => import("../server/_core/env")],
    ["../server/_core/context", () => import("../server/_core/context")],
    ["../server/routers", () => import("../server/routers")],
    ["../server/_core/index", () => import("../server/_core/index")],
  ];
  
  for (const [name, fn] of tests) {
    try {
      await fn();
      results[name] = "OK";
    } catch (err: unknown) {
      results[name] = err instanceof Error ? err.message : String(err);
      // Stop at first failure to save time
      break;
    }
  }
  
  res.status(200).json({ results });
}
