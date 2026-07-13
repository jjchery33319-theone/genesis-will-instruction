import type { VercelRequest, VercelResponse } from "@vercel/node";

// Static import so ncc bundles the server code
let createApp: any;
let importError: string = "";

try {
  // Use require() which ncc will trace and bundle, but wrapped in try/catch
  // to capture the actual crash
  const mod = require("../server/_core/index");
  createApp = mod.createApp;
} catch (err: unknown) {
  importError = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
}

let appPromise: Promise<any> | null = null;

function getApp() {
  if (!appPromise && createApp) {
    appPromise = createApp().catch((err: unknown) => {
      importError = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
      return null;
    });
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (importError) {
    res.status(500).json({ error: "Module load failed", detail: importError });
    return;
  }

  try {
    const app = await getApp();
    if (!app) {
      res.status(500).json({ error: "App init failed", detail: importError });
      return;
    }
    app(req, res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
    res.status(500).json({ error: "Handler error", detail: msg });
  }
}
