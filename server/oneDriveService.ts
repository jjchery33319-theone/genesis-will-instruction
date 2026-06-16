/**
 * OneDrive upload service — uses MSAL client-credentials flow + Microsoft Graph
 * to upload Will Instruction documents to the configured OneDrive folder.
 *
 * Required env vars (set via webdev_request_secrets):
 *   AZURE_CLIENT_ID     — App Registration Application (client) ID
 *   AZURE_TENANT_ID     — App Registration Directory (tenant) ID
 *   AZURE_CLIENT_SECRET — App Registration client secret value
 *   ONEDRIVE_FOLDER_PATH — Folder path in OneDrive, e.g. "/Will Instructions"
 */

import { ConfidentialClientApplication } from "@azure/msal-node";

// ─── Token acquisition ────────────────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  const clientId = process.env.AZURE_CLIENT_ID;
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!clientId || !tenantId || !clientSecret) {
    throw new Error(
      "[OneDrive] AZURE_CLIENT_ID, AZURE_TENANT_ID, or AZURE_CLIENT_SECRET not set"
    );
  }

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret,
    },
  });

  const result = await cca.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });

  if (!result?.accessToken) {
    throw new Error("[OneDrive] Failed to acquire access token");
  }

  return result.accessToken;
}

// ─── Graph API helper ─────────────────────────────────────────────────────────
async function graphRequest(
  method: string,
  path: string,
  token: string,
  body?: Buffer | string,
  contentType?: string
): Promise<unknown> {
  const fetch = (await import("node-fetch")).default;
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    ...(body !== undefined ? { body } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[OneDrive] Graph API ${method} ${path} → ${res.status}: ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── Ensure folder exists (creates it if missing) ─────────────────────────────
async function ensureFolder(token: string, folderPath: string): Promise<void> {
  // folderPath e.g. "/Will Instructions" or "/Genesis/Will Instructions"
  const parts = folderPath.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length === 0) return; // root — always exists

  // Walk the path, creating each segment if needed
  let currentPath = "/me/drive/root";
  for (const part of parts) {
    const encodedPart = encodeURIComponent(part);
    const checkPath = `${currentPath}:/${encodedPart}`;
    try {
      await graphRequest("GET", checkPath, token);
      currentPath = `${currentPath}:/${encodedPart}`;
    } catch {
      // Folder doesn't exist — create it
      const parentChildrenPath = `${currentPath}/children`;
      await graphRequest("POST", parentChildrenPath, token, JSON.stringify({
        name: part,
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename",
      }), "application/json");
      currentPath = `${currentPath}:/${encodedPart}`;
    }
  }
}

// ─── Public: upload a text file to OneDrive ───────────────────────────────────
export async function uploadToOneDrive(
  filename: string,
  content: string
): Promise<{ webUrl: string }> {
  const folderPath = (process.env.ONEDRIVE_FOLDER_PATH ?? "/Will Instructions").replace(/\/$/, "");

  const token = await getAccessToken();

  // Ensure the target folder exists
  await ensureFolder(token, folderPath);

  // Upload via simple PUT (files up to 4 MB — our text docs are well under that)
  const encodedFolder = folderPath.replace(/^\//, "").split("/").map(encodeURIComponent).join("/");
  const encodedFilename = encodeURIComponent(filename);
  const uploadPath = `/me/drive/root:/${encodedFolder}/${encodedFilename}:/content`;

  const result = (await graphRequest(
    "PUT",
    uploadPath,
    token,
    Buffer.from(content, "utf-8"),
    "text/plain; charset=utf-8"
  )) as { webUrl?: string };

  return { webUrl: result?.webUrl ?? "" };
}

// ─── Credential validation (used in tests) ───────────────────────────────────
export async function validateOneDriveCredentials(): Promise<boolean> {
  try {
    await getAccessToken();
    return true;
  } catch {
    return false;
  }
}
