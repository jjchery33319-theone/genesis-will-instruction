import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../_core/index";

let appPromise: ReturnType<typeof createApp> | null = null;
let loadError: string | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = createApp().catch((err: unknown) => {
      loadError = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
      console.error("[API] createApp failed:", loadError);
      return null as any;
    });
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    if (!app) {
      res.status(500).json({ error: "App init failed", detail: loadError });
      return;
    }
    app(req, res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    res.status(500).json({ error: "Handler error", detail: msg });
  }
}
