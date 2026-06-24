/**
 * htmlToPdf.ts
 * Converts an HTML string to a PDF Buffer using puppeteer-core.
 *
 * In production (Cloud Run / serverless) we use @sparticuz/chromium which
 * bundles a compatible Chromium binary.  In local dev we fall back to the
 * system Chromium at /usr/bin/chromium so the sandbox still works without
 * downloading the full bundle.
 */

import puppeteer from "puppeteer-core";
import { existsSync } from "fs";

let _browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

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

async function getBrowser() {
  if (_browser) {
    try {
      await _browser.version();
      return _browser;
    } catch {
      _browser = null;
    }
  }

  const executablePath = await getExecutablePath();

  // @sparticuz/chromium requires specific args
  let extraArgs: string[] = [];
  try {
    const chromium = await import("@sparticuz/chromium");
    extraArgs = chromium.default.args;
  } catch {
    // local dev — use minimal args
    extraArgs = [];
  }

  _browser = await puppeteer.launch({
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
  return _browser;
}

export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
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
    await page.close();
  }
}
