// Password hashing — works on Cloudflare Workers and Node.js

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const cryptoApi = (typeof globalThis !== "undefined" && globalThis.crypto)
    ? globalThis.crypto
    : await import("node:crypto") as unknown as Crypto;
  const hashBuffer = await cryptoApi.subtle.digest("SHA-256", data);
  return hex(hashBuffer);
}

const SALT = "atlas-v1";

export async function hashPassword(password: string): Promise<string> {
  return sha256(SALT + password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await sha256(SALT + password);
  return computed === hash;
}
