import type { VercelRequest, VercelResponse } from "@vercel/node";

let appPromise: Promise<any> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = import("../server/_core/index").then(m => m.createApp());
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    app(req, res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[API Handler] Fatal error:", message, stack);
    res.status(500).json({ error: "Internal server error", detail: message });
  }
}
