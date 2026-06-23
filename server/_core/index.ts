import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { generateWillPdf } from "../pdfGenerator";
import { generateWillDocument, type WillOptions } from "../willGenerator";
import { generateWillHtml, type WillHtmlOptions } from "../willHtmlGenerator";
import { generateWillDocx } from "../willDocxGenerator";
import { getDb } from "../db";
import { willInstructions, lpaRecords } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import path from "path";
import { fillLpaPdf } from "../lpaFillPdf";
import { serveStatic, setupVite } from "./vite";
import { generateWillHtml as generateWillV2Html } from "../willV2Generator";
import { generateCommentaryHtml } from "../willV2Commentary";
import { generateSigningGuideHtml } from "../willV2SigningGuide";
import { getMatterById } from "../mattersDb";
import { htmlToPdf } from "../htmlToPdf";
import { createRequire } from "module";
const _require = createRequire(import.meta.url);

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // PDF export endpoint
  app.get("/api/submissions/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const db = await getDb();
      if (!db) { res.status(503).json({ error: "Database unavailable" }); return; }
      const rows = await db.select().from(willInstructions).where(eq(willInstructions.id, id)).limit(1);
      if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
      const pdfBuffer = await generateWillPdf(rows[0]);
      const filename = `Genesis_${rows[0].referenceNumber ?? id}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[PDF] Error generating PDF:", err);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Will document generation endpoint
  app.get("/api/submissions/:id/will", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const db = await getDb();
      if (!db) { res.status(503).json({ error: "Database unavailable" }); return; }
      const rows = await db.select().from(willInstructions).where(eq(willInstructions.id, id)).limit(1);
      if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
      const willType = (req.query.willType as WillOptions["willType"]) || "single";
      const record = rows[0] as Record<string, unknown>;
      const clientName = willType === "mirror_client2"
        ? [rows[0].client2FirstName, rows[0].client2LastName].filter(Boolean).join("_")
        : [rows[0].client1FirstName, rows[0].client1LastName].filter(Boolean).join("_");
      // Use saved edited HTML if present — serve as printable HTML page
      const savedHtmlKey = willType === "mirror_client2" ? "editedWillHtmlClient2"
        : willType === "mirror_client1" ? "editedWillHtmlClient1"
        : "editedWillHtmlSingle";
      const savedHtml = record[savedHtmlKey] as string | null;
      if (savedHtml) {
        const printableHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Will</title><style>@media print{body{margin:0}}body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:20px}</style></head><body>${savedHtml}<script>window.onload=function(){window.print()}<\/script></body></html>`;
        const filename = `Will_${clientName || rows[0].referenceNumber}_${willType}_edited.html`;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(printableHtml);
        return;
      }
      const options: WillOptions = {
        willType,
        includePPT: req.query.ppt === "1",
        includeDiscretionaryTrust: req.query.discretionary === "1",
        includeVulnerableTrust: req.query.vulnerable === "1",
      };
      const pdfBuffer = await generateWillDocument(rows[0], options);
      const filename = `Will_${clientName || rows[0].referenceNumber}_${willType}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[Will] Error generating Will:", err);
      res.status(500).json({ error: "Failed to generate Will" });
    }
  });

  // Will Word (.docx) export endpoint
  app.get("/api/submissions/:id/will-docx", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const db = await getDb();
      if (!db) { res.status(503).json({ error: "Database unavailable" }); return; }
      const rows = await db.select().from(willInstructions).where(eq(willInstructions.id, id)).limit(1);
      if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
      const willType = (req.query.willType as "single" | "mirror_client1" | "mirror_client2") || "single";
      const record = rows[0] as Record<string, unknown>;
      const clientName = willType === "mirror_client2"
        ? [rows[0].client2FirstName, rows[0].client2LastName].filter(Boolean).join("_")
        : [rows[0].client1FirstName, rows[0].client1LastName].filter(Boolean).join("_");
      // Use saved edited HTML if present — convert to DOCX via html-to-docx
      const savedHtmlKey = willType === "mirror_client2" ? "editedWillHtmlClient2"
        : willType === "mirror_client1" ? "editedWillHtmlClient1"
        : "editedWillHtmlSingle";
      const savedHtml = record[savedHtmlKey] as string | null;
      if (savedHtml) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const HTMLtoDOCX = require("html-to-docx");
        const docxBuffer = await HTMLtoDOCX(savedHtml, null, {
          title: `Will - ${clientName || rows[0].referenceNumber}`,
          font: "Times New Roman",
          fontSize: 24,
          margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        });
        const filename = `Will_${clientName || rows[0].referenceNumber}_${willType}_edited.docx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(Buffer.from(docxBuffer));
        return;
      }
      const opts = {
        willType,
        ppt: req.query.ppt === "1",
        discretionary: req.query.discretionary === "1",
        vulnerable: req.query.vulnerable === "1",
      };
      const docxBuffer = await generateWillDocx(record, opts);
      const filename = `Will_${clientName || rows[0].referenceNumber}_${willType}.docx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(docxBuffer);
    } catch (err) {
      console.error("[WillDocx] Error:", err);
      res.status(500).json({ error: "Failed to generate Word document" });
    }
  });

  // Will HTML preview endpoint (returns saved HTML if present, else regenerates)
  app.get("/api/submissions/:id/will-html", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const db = await getDb();
      if (!db) { res.status(503).json({ error: "Database unavailable" }); return; }
      const rows = await db.select().from(willInstructions).where(eq(willInstructions.id, id)).limit(1);
      if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
      const willType = (req.query.willType as WillHtmlOptions["willType"]) || "single";
      const record = rows[0] as Record<string, unknown>;
      // Return saved edited HTML if present for this willType
      const savedHtmlKey = willType === "mirror_client2" ? "editedWillHtmlClient2"
        : willType === "mirror_client1" ? "editedWillHtmlClient1"
        : "editedWillHtmlSingle";
      const savedHtml = record[savedHtmlKey] as string | null;
      if (savedHtml) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Will-Edited", "true");
        res.send(savedHtml);
        return;
      }
      const options: WillHtmlOptions = {
        willType,
        includePPT: req.query.ppt === "1",
        includeDiscretionaryTrust: req.query.discretionary === "1",
        includeVulnerableTrust: req.query.vulnerable === "1",
      };
      const html = generateWillHtml(rows[0], options);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Will-Edited", "false");
      res.send(html);
    } catch (err) {
      console.error("[WillHTML] Error:", err);
      res.status(500).json({ error: "Failed to generate Will HTML" });
    }
  });

  // Save edited Will HTML endpoint
  app.post("/api/submissions/:id/will-html", express.json({ limit: "10mb" }), async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const db = await getDb();
      if (!db) { res.status(503).json({ error: "Database unavailable" }); return; }
      const { html, willType } = req.body as { html: string; willType: string };
      if (!html || typeof html !== "string") { res.status(400).json({ error: "html required" }); return; }
      const wt = (willType || "single") as string;
      const colName = wt === "mirror_client2" ? "editedWillHtmlClient2"
        : wt === "mirror_client1" ? "editedWillHtmlClient1"
        : "editedWillHtmlSingle";
      await db.update(willInstructions)
        .set({ [colName]: html } as Partial<typeof willInstructions.$inferInsert>)
        .where(eq(willInstructions.id, id));
      res.json({ ok: true });
    } catch (err) {
      console.error("[WillHTML Save] Error:", err);
      res.status(500).json({ error: "Failed to save Will HTML" });
    }
  });

  // Reset edited Will HTML (clear saved version)
  app.delete("/api/submissions/:id/will-html", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const db = await getDb();
      if (!db) { res.status(503).json({ error: "Database unavailable" }); return; }
      const wt = (req.query.willType as string) || "single";
      const colName = wt === "mirror_client2" ? "editedWillHtmlClient2"
        : wt === "mirror_client1" ? "editedWillHtmlClient1"
        : "editedWillHtmlSingle";
      await db.update(willInstructions)
        .set({ [colName]: null } as Partial<typeof willInstructions.$inferInsert>)
        .where(eq(willInstructions.id, id));
      res.json({ ok: true });
    } catch (err) {
      console.error("[WillHTML Reset] Error:", err);
      res.status(500).json({ error: "Failed to reset Will HTML" });
    }
  });

  // LPA PDF export endpoint (Node.js pdf-lib — works in production Cloud Run)
  app.get("/api/lpa/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const db = await getDb();
      if (!db) { res.status(503).json({ error: "Database unavailable" }); return; }
      const rows = await db.select().from(lpaRecords).where(eq(lpaRecords.id, id)).limit(1);
      if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
      const lpa = rows[0] as Record<string, unknown>;
      const lpaType = (lpa.lpaType as string) ?? "property_finance";
      // Normalise JSON arrays stored as strings
      const safeArr = (v: unknown) => { if (!v) return []; if (Array.isArray(v)) return v; try { return JSON.parse(v as string) ?? []; } catch { return []; } };
      const data = {
        ...lpa,
        lpaType,
        attorneys: safeArr(lpa.attorneys),
        replacementAttorneys: safeArr(lpa.replacementAttorneys),
        peopleToNotify: safeArr(lpa.peopleToNotify),
        // Section 12: applicant type — DB stores as snake_case
        applicantType: (lpa.applicant_type as string) ?? (lpa.applicantType as string) ?? "",
        // Section 13: recipient — DB stores as snake_case
        recipientType: (lpa.recipient_type as string) ?? (lpa.recipientType as string) ?? "",
        recipientTitle: (lpa.recipient_title as string) ?? (lpa.recipientTitle as string) ?? "",
        recipientFirstNames: (lpa.recipient_first_names as string) ?? (lpa.recipientFirstNames as string) ?? "",
        recipientLastName: (lpa.recipient_last_name as string) ?? (lpa.recipientLastName as string) ?? "",
        recipientCompany: (lpa.recipient_company as string) ?? (lpa.recipientCompany as string) ?? "",
        recipientAddressLine1: (lpa.recipient_address_line1 as string) ?? (lpa.recipientAddressLine1 as string) ?? "",
        recipientAddressLine2: (lpa.recipient_address_line2 as string) ?? (lpa.recipientAddressLine2 as string) ?? "",
        recipientAddressLine3: (lpa.recipient_address_line3 as string) ?? (lpa.recipientAddressLine3 as string) ?? "",
        recipientPostcode: (lpa.recipient_postcode as string) ?? (lpa.recipientPostcode as string) ?? "",
        // Section 13: delivery preferences stored as 0/1 ints — convert to boolean
        deliveryPost: !!(lpa.delivery_post ?? lpa.deliveryPost),
        deliveryPhone: !!(lpa.delivery_phone ?? lpa.deliveryPhone),
        deliveryEmail: !!(lpa.delivery_email ?? lpa.deliveryEmail),
        deliveryWelsh: !!(lpa.delivery_welsh ?? lpa.deliveryWelsh),
        // Section 14: fee options — DB stores as snake_case
        feePaymentMethod: (lpa.fee_payment_method as string) ?? (lpa.feePaymentMethod as string) ?? "",
        feeContactPhone: (lpa.fee_contact_phone as string) ?? (lpa.feeContactPhone as string) ?? "",
        reducedFee: !!(lpa.reduced_fee ?? lpa.reducedFee),
        repeatApplication: !!(lpa.repeat_application ?? lpa.repeatApplication),
        caseNumber: (lpa.case_number as string) ?? (lpa.caseNumber as string) ?? "",
      };
      const pdfBuffer = await fillLpaPdf(data as Parameters<typeof fillLpaPdf>[0]);
      const donorName = [lpa.donorFirstNames, lpa.donorLastName].filter(Boolean).join("_") || String(id);
      const typeLabel = lpaType === "property_finance" ? "LP1F" : "LP1H";
      const filename = `LPA_${typeLabel}_${donorName}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[LPA PDF] Error:", err);
      res.status(500).json({ error: "Failed to generate LPA PDF" });
    }
  });

  // LPA PDF export with manual overrides (POST body merges over DB data)
  app.post("/api/lpa/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const db = await getDb();
      if (!db) { res.status(503).json({ error: "Database unavailable" }); return; }
      const rows = await db.select().from(lpaRecords).where(eq(lpaRecords.id, id)).limit(1);
      if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
      const lpa = rows[0] as Record<string, unknown>;
      const overrides = (req.body ?? {}) as Record<string, unknown>;
      const lpaType = (overrides.lpaType as string) ?? (lpa.lpaType as string) ?? "property_finance";
      const safeArr = (v: unknown) => { if (!v) return []; if (Array.isArray(v)) return v; try { return JSON.parse(v as string) ?? []; } catch { return []; } };
      const data = {
        ...lpa,
        ...overrides,
        lpaType,
        attorneys: Array.isArray(overrides.attorneys) ? overrides.attorneys : safeArr(lpa.attorneys),
        replacementAttorneys: Array.isArray(overrides.replacementAttorneys) ? overrides.replacementAttorneys : safeArr(lpa.replacementAttorneys),
        peopleToNotify: Array.isArray(overrides.peopleToNotify) ? overrides.peopleToNotify : safeArr(lpa.peopleToNotify),
        applicantType: (overrides.applicantType as string) ?? (lpa.applicant_type as string) ?? (lpa.applicantType as string) ?? "",
        recipientType: (overrides.recipientType as string) ?? (lpa.recipient_type as string) ?? "",
        recipientTitle: (overrides.recipientTitle as string) ?? (lpa.recipient_title as string) ?? "",
        recipientFirstNames: (overrides.recipientFirstNames as string) ?? (lpa.recipient_first_names as string) ?? "",
        recipientLastName: (overrides.recipientLastName as string) ?? (lpa.recipient_last_name as string) ?? "",
        recipientCompany: (overrides.recipientCompany as string) ?? (lpa.recipient_company as string) ?? "",
        recipientAddressLine1: (overrides.recipientAddressLine1 as string) ?? (lpa.recipient_address_line1 as string) ?? "",
        recipientAddressLine2: (overrides.recipientAddressLine2 as string) ?? (lpa.recipient_address_line2 as string) ?? "",
        recipientAddressLine3: (overrides.recipientAddressLine3 as string) ?? (lpa.recipient_address_line3 as string) ?? "",
        recipientPostcode: (overrides.recipientPostcode as string) ?? (lpa.recipient_postcode as string) ?? "",
        deliveryPost: overrides.deliveryPost !== undefined ? !!overrides.deliveryPost : !!(lpa.delivery_post ?? lpa.deliveryPost),
        deliveryPhone: overrides.deliveryPhone !== undefined ? !!overrides.deliveryPhone : !!(lpa.delivery_phone ?? lpa.deliveryPhone),
        deliveryEmail: overrides.deliveryEmail !== undefined ? !!overrides.deliveryEmail : !!(lpa.delivery_email ?? lpa.deliveryEmail),
        deliveryWelsh: overrides.deliveryWelsh !== undefined ? !!overrides.deliveryWelsh : !!(lpa.delivery_welsh ?? lpa.deliveryWelsh),
        feePaymentMethod: (overrides.feePaymentMethod as string) ?? (lpa.fee_payment_method as string) ?? "",
        feeContactPhone: (overrides.feeContactPhone as string) ?? (lpa.fee_contact_phone as string) ?? "",
        reducedFee: overrides.reducedFee !== undefined ? !!overrides.reducedFee : !!(lpa.reduced_fee ?? lpa.reducedFee),
        repeatApplication: overrides.repeatApplication !== undefined ? !!overrides.repeatApplication : !!(lpa.repeat_application ?? lpa.repeatApplication),
        caseNumber: (overrides.caseNumber as string) ?? (lpa.case_number as string) ?? "",
      };
      const pdfBuffer = await fillLpaPdf(data as Parameters<typeof fillLpaPdf>[0]);
      const d = data as Record<string, unknown>;
      const donorName = [d.donorFirstNames, d.donorLastName].filter(Boolean).join("_") || String(id);
      const typeLabel = lpaType === "property_finance" ? "LP1F" : "LP1H";
      const filename = `LPA_${typeLabel}_${donorName}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[LPA PDF POST] Error:", err);
      res.status(500).json({ error: "Failed to generate LPA PDF" });
    }
  });

  // ── Will V2 document endpoints ─────────────────────────────────────────────
  app.get("/api/matters/:id/will", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = (req.query.testator as string) === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const matter = await getMatterById(id);
      if (!matter) { res.status(404).json({ error: "Not found" }); return; }
      // Return saved edited HTML if present, otherwise generate fresh
      const savedHtml = testatorRole === "testator1" ? matter.editedWillHtmlTestator1 : matter.editedWillHtmlTestator2;
      const html = savedHtml || generateWillV2Html(matter, testatorRole);
      const isEdited = !!savedHtml;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Will-Edited", isEdited ? "true" : "false");
      res.send(html);
    } catch (err) {
      console.error("[Will V2] Error:", err);
      res.status(500).json({ error: "Failed to generate Will" });
    }
  });

  app.get("/api/matters/:id/will-pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = (req.query.testator as string) === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const matter = await getMatterById(id);
      if (!matter) { res.status(404).json({ error: "Not found" }); return; }
      const savedHtml = testatorRole === "testator1" ? matter.editedWillHtmlTestator1 : matter.editedWillHtmlTestator2;
      const html = savedHtml || generateWillV2Html(matter, testatorRole);
      const client = matter.clients.find(c => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "Will").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      const pdfBuffer = await htmlToPdf(html);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}-Will.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[Will V2 PDF] Error:", err);
      res.status(500).json({ error: "Failed to generate Will PDF" });
    }
  });

  app.post("/api/matters/:id/will-html", express.json({ limit: "10mb" }), async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const { html, testatorRole } = req.body as { html: string; testatorRole?: string };
      if (!html) { res.status(400).json({ error: "html is required" }); return; }
      const role = testatorRole === "testator2" ? "testator2" : "testator1";
      const { saveEditedWillHtml } = await import("../mattersDb");
      await saveEditedWillHtml(id, role, html);
      res.json({ success: true });
    } catch (err) {
      console.error("[Will V2 Save] Error:", err);
      res.status(500).json({ error: "Failed to save Will HTML" });
    }
  });

  app.delete("/api/matters/:id/will-html", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const testatorRole = (req.query.testator as string) === "testator2" ? "testator2" : "testator1";
      const { clearEditedWillHtml } = await import("../mattersDb");
      await clearEditedWillHtml(id, testatorRole);
      res.json({ success: true });
    } catch (err) {
      console.error("[Will V2 Reset] Error:", err);
      res.status(500).json({ error: "Failed to reset Will HTML" });
    }
  });

  app.get("/api/matters/:id/commentary", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = (req.query.testator as string) === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const matter = await getMatterById(id);
      if (!matter) { res.status(404).json({ error: "Not found" }); return; }
      const html = generateCommentaryHtml(matter, testatorRole);
      const client = matter.clients.find(c => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "Commentary").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `inline; filename="${safeName}-WillCommentary.html"`);
      res.send(html);
    } catch (err) {
      console.error("[Commentary] Error:", err);
      res.status(500).json({ error: "Failed to generate commentary" });
    }
  });

  // Commentary — real PDF download
  app.get("/api/matters/:id/commentary-pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = (req.query.testator as string) === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const matter = await getMatterById(id);
      if (!matter) { res.status(404).json({ error: "Not found" }); return; }
      const html = generateCommentaryHtml(matter, testatorRole);
      const client = matter.clients.find(c => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "Commentary").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      const pdfBuffer = await htmlToPdf(html);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}-WillCommentary.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[Commentary PDF] Error:", err);
      res.status(500).json({ error: "Failed to generate commentary PDF" });
    }
  });

  // Commentary — Word (.docx) download
  app.get("/api/matters/:id/commentary-docx", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = (req.query.testator as string) === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const matter = await getMatterById(id);
      if (!matter) { res.status(404).json({ error: "Not found" }); return; }
      const html = generateCommentaryHtml(matter, testatorRole);
      const client = matter.clients.find(c => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "Commentary").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      // html-to-docx is CJS — loaded via createRequire at module top
      const HTMLtoDOCX = _require("html-to-docx");
      const docxBuffer = await HTMLtoDOCX(html, null, {
        title: `${safeName} — Will Commentary`,
        font: "Times New Roman",
        fontSize: 24,
        margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}-WillCommentary.docx"`);
      res.send(Buffer.from(docxBuffer));
    } catch (err) {
      console.error("[Commentary DOCX] Error:", err);
      res.status(500).json({ error: "Failed to generate commentary Word document" });
    }
  });

  app.get("/api/matters/:id/signing-guide", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = (req.query.testator as string) === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const matter = await getMatterById(id);
      if (!matter) { res.status(404).json({ error: "Not found" }); return; }
      const html = generateSigningGuideHtml(matter, testatorRole);
      const client = matter.clients.find(c => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "SigningGuide").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `inline; filename="${safeName}-WillSigningGuide.html"`);
      res.send(html);
    } catch (err) {
      console.error("[Signing Guide] Error:", err);
      res.status(500).json({ error: "Failed to generate signing guide" });
    }
  });

  // Signing Guide — real PDF download
  app.get("/api/matters/:id/signing-guide-pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const testatorRole = (req.query.testator as string) === "testator2" ? "testator2" : "testator1";
      if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
      const matter = await getMatterById(id);
      if (!matter) { res.status(404).json({ error: "Not found" }); return; }
      const html = generateSigningGuideHtml(matter, testatorRole);
      const client = matter.clients.find(c => c.clientRole === testatorRole);
      const safeName = (client?.fullName || "SigningGuide").replace(/[^a-zA-Z0-9 _-]/g, "").trim();
      const pdfBuffer = await htmlToPdf(html);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}-WillSigningGuide.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[Signing Guide PDF] Error:", err);
      res.status(500).json({ error: "Failed to generate signing guide PDF" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
