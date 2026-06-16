/**
 * Diagnostic script — tests OneDrive upload end-to-end and prints detailed errors.
 * Run with: node scripts/test-onedrive.mjs
 */

import { ConfidentialClientApplication } from "@azure/msal-node";
import fetch from "node-fetch";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";

// Load .env if present
try { dotenv.config(); } catch {}

// Also try reading from the project .env file directly
const clientId = process.env.AZURE_CLIENT_ID;
const tenantId = process.env.AZURE_TENANT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const folderPath = process.env.ONEDRIVE_FOLDER_PATH ?? "/Will Instructions";

console.log("=== OneDrive Diagnostic ===");
console.log(`Client ID:    ${clientId ? clientId.slice(0,8) + "..." : "MISSING"}`);
console.log(`Tenant ID:    ${tenantId ? tenantId.slice(0,8) + "..." : "MISSING"}`);
console.log(`Secret:       ${clientSecret ? "SET (" + clientSecret.length + " chars)" : "MISSING"}`);
console.log(`Folder path:  ${folderPath}`);
console.log("");

if (!clientId || !tenantId || !clientSecret) {
  console.error("ERROR: Missing credentials. Make sure env vars are set.");
  process.exit(1);
}

// Step 1: Acquire token
console.log("Step 1: Acquiring access token...");
const cca = new ConfidentialClientApplication({
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientSecret,
  },
});

let token;
try {
  const result = await cca.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });
  token = result?.accessToken;
  if (!token) throw new Error("No token returned");
  console.log("  ✓ Token acquired successfully");
} catch (err) {
  console.error("  ✗ Token acquisition failed:", err.message);
  process.exit(1);
}

// Step 2: Check /me endpoint (will fail for app-only — expected)
console.log("\nStep 2: Checking /me endpoint (app-only will fail — this is expected)...");
const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
  headers: { Authorization: `Bearer ${token}` },
});
const meBody = await meRes.text();
if (meRes.ok) {
  const me = JSON.parse(meBody);
  console.log(`  ✓ /me works — user: ${me.displayName} (${me.userPrincipalName})`);
} else {
  console.log(`  ! /me returned ${meRes.status} — this is normal for app-only permissions`);
  console.log(`    Response: ${meBody.slice(0, 200)}`);
}

// Step 3: Try listing users (requires User.Read.All for app-only)
console.log("\nStep 3: Listing users in tenant to find a target OneDrive...");
const usersRes = await fetch("https://graph.microsoft.com/v1.0/users?$top=5&$select=id,displayName,userPrincipalName", {
  headers: { Authorization: `Bearer ${token}` },
});
const usersBody = await usersRes.text();
if (usersRes.ok) {
  const users = JSON.parse(usersBody);
  console.log(`  ✓ Found ${users.value?.length ?? 0} user(s):`);
  (users.value ?? []).forEach(u => {
    console.log(`    - ${u.displayName} (${u.userPrincipalName}) [id: ${u.id}]`);
  });
} else {
  console.log(`  ! Users list returned ${usersRes.status}`);
  console.log(`    Response: ${usersBody.slice(0, 400)}`);
  console.log("\n  DIAGNOSIS: The app likely needs 'User.Read.All' + 'Files.ReadWrite.All' Application permissions");
  console.log("  with Admin Consent granted in Azure Portal > App registrations > API permissions");
}

// Step 4: Try uploading a test file to the first user's OneDrive
if (usersRes.ok) {
  const users = JSON.parse(usersBody);
  const firstUser = users.value?.[0];
  if (firstUser) {
    console.log(`\nStep 4: Attempting test upload to ${firstUser.userPrincipalName}'s OneDrive...`);
    const testContent = Buffer.from(`Genesis OneDrive Test\nTimestamp: ${new Date().toISOString()}\n`, "utf-8");
    const uploadUrl = `/users/${firstUser.id}/drive/root:/Will Instructions/genesis-test.txt:/content`;
    const uploadRes = await fetch(`https://graph.microsoft.com/v1.0${uploadUrl}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: testContent,
    });
    const uploadBody = await uploadRes.text();
    if (uploadRes.ok) {
      const uploaded = JSON.parse(uploadBody);
      console.log(`  ✓ Upload successful!`);
      console.log(`    File URL: ${uploaded.webUrl}`);
      console.log(`\n  ACTION NEEDED: Update ONEDRIVE_USER_ID secret to: ${firstUser.id}`);
    } else {
      console.log(`  ✗ Upload failed: ${uploadRes.status}`);
      console.log(`    Response: ${uploadBody.slice(0, 400)}`);
    }
  }
}

console.log("\n=== Diagnostic complete ===");
