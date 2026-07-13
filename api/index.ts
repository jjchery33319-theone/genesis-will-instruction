import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true, env: Object.keys(process.env).filter(k => k.startsWith("DATABASE") || k.startsWith("GMAIL") || k === "VERCEL" || k === "NODE_ENV").sort() });
}
