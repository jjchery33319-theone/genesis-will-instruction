import { ConfidentialClientApplication } from "@azure/msal-node";
import fetch from "node-fetch";

const clientId = process.env.AZURE_CLIENT_ID ?? "";
const tenantId = process.env.AZURE_TENANT_ID ?? "";
const clientSecret = process.env.AZURE_CLIENT_SECRET ?? "";
const targetEmail = "jacques.chery@rightwaywills.com";

const cca = new ConfidentialClientApplication({
  auth: { clientId, authority: `https://login.microsoftonline.com/${tenantId}`, clientSecret },
});

const { accessToken: token } = await cca.acquireTokenByClientCredential({
  scopes: ["https://graph.microsoft.com/.default"],
});
console.log("✓ Token acquired");

// Look up user by email
const userRes = await fetch(
  `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(targetEmail)}?$select=id,displayName,userPrincipalName`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const userBody = await userRes.text();
if (!userRes.ok) {
  console.error(`✗ User lookup failed (${userRes.status}):`, userBody);
  process.exit(1);
}
const user = JSON.parse(userBody);
console.log(`✓ User found: ${user.displayName} (${user.userPrincipalName})`);
console.log(`  User ID: ${user.id}`);

// Attempt upload to their OneDrive
const content = Buffer.from(`Genesis Estate Planning — OneDrive Test\nTimestamp: ${new Date().toISOString()}\nThis file confirms the OneDrive integration is working correctly.\n`, "utf-8");
const uploadRes = await fetch(
  `https://graph.microsoft.com/v1.0/users/${user.id}/drive/root:/Will Instructions/genesis-connection-test.txt:/content`,
  {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body: content,
  }
);
const uploadBody = await uploadRes.text();
if (!uploadRes.ok) {
  console.error(`✗ Upload failed (${uploadRes.status}):`, uploadBody);
  process.exit(1);
}
const uploaded = JSON.parse(uploadBody);
console.log(`✓ Upload successful!`);
console.log(`  File URL: ${uploaded.webUrl}`);
console.log(`  User ID to save: ${user.id}`);
