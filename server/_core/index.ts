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
import { getDb } from "../db";
import { willInstructions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { serveStatic, setupVite } from "./vite";

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
      const options: WillOptions = {
        willType: (req.query.willType as WillOptions["willType"]) || "single",
        includePPT: req.query.ppt === "1",
        includeDiscretionaryTrust: req.query.discretionary === "1",
        includeVulnerableTrust: req.query.vulnerable === "1",
      };
      const record = rows[0];
      const pdfBuffer = await generateWillDocument(record, options);
      const clientName = options.willType === "mirror_client2"
        ? [record.client2FirstName, record.client2LastName].filter(Boolean).join("_")
        : [record.client1FirstName, record.client1LastName].filter(Boolean).join("_");
      const filename = `Will_${clientName || record.referenceNumber}_${options.willType}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[Will] Error generating Will:", err);
      res.status(500).json({ error: "Failed to generate Will" });
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
