/**
 * htmlToPdf.ts
 * Converts an HTML string to a PDF Buffer using puppeteer-core.
 *
 * In production (Cloud Run / serverless) we use @sparticuz/chromium which
 * bundles a compatible Chromium binary.  In local dev we fall back to the
 * system Chromium at /usr/bin/chromium so the sandbox still works without
 * downloading the full bundle.
 *
 * NOTE: We launch a fresh browser per request (no singleton) to avoid
 * stale browser handles in serverless/Autoscale environments where the
 * process may be reused across requests but the browser process may have
 * crashed or been OOM-killed.
 */

import puppeteer from "puppeteer-core";
import { existsSync } from "fs";

async function getExecutablePath(): Promise<string> {
  // 1. Prefer @sparticuz/chromium when available (production / Cloud Run)
  try {
    const chromium = await import("@sparticuz/chromium");
    const path = await chromium.default.executablePath();
    if (path && existsSync(path)) {
      return path;
    }
  } catch {
    // not installed or not usable
  }

  // 2. Fall back to common system Chromium paths (local dev / sandbox)
  const candidates = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }

  throw new Error(
    "No Chromium binary found. Install @sparticuz/chromium or ensure a system Chromium is available."
  );
}

async function getLaunchArgs(): Promise<string[]> {
  try {
    const chromium = await import("@sparticuz/chromium");
    return chromium.default.args;
  } catch {
    // local dev — use minimal args
    return [];
  }
}

export async function htmlToPdf(html: string): Promise<Buffer> {
  const executablePath = await getExecutablePath();
  const extraArgs = await getLaunchArgs();

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      ...extraArgs,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });

  try {
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: "load", timeout: 60000 });
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close().catch(() => {});
    }
  } finally {
    await browser.close().catch(() => {});
  }
}
