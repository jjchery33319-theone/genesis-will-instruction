/**
 * htmlToPdf.ts
 * Converts an HTML string to a PDF Buffer using puppeteer-core + system Chromium.
 * Returns a Buffer containing the PDF bytes.
 */

import puppeteer from "puppeteer-core";

let _browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

async function getBrowser() {
  if (_browser) {
    try {
      // Check it's still alive
      await _browser.version();
      return _browser;
    } catch {
      _browser = null;
    }
  }
  _browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: [
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
    await page.setContent(html, { waitUntil: "load", timeout: 30000 });
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
