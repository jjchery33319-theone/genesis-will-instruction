import type { VercelRequest, VercelResponse } from "@vercel/node";

let appPromise: Promise<any> | null = null;
let loadError: string | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = import("../server/_core/index")
      .then(m => m.createApp())
      .catch((err: unknown) => {
        loadError = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
        console.error("[API] Failed to load app:", loadError);
        return null;
      });
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    if (!app) {
      res.status(500).json({
        error: "App failed to load",
        detail: loadError,
      });
      return;
    }
    app(req, res);
  } catch (err: unknown) {
    const message = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    console.error("[API Handler] Runtime error:", message);
    res.status(500).json({ error: "Runtime error", detail: message });
  }
}
