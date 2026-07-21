import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    ATLAS_DB: D1Database;
    ATLAS_R2: R2Bucket;
    ENVIRONMENT?: string;
  }
}

export {};
