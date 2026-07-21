let pool: any = null;
let pg: any = null;

async function getPg() {
  if (!pg) {
    try {
      pg = await import("pg");
    } catch {
      throw new Error("pg module not available in this environment");
    }
  }
  return pg;
}

export async function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL must be set");
    }
    const { Pool } = await getPg();
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function query(sql: string, params?: unknown[]) {
  const client = await (await getPool()).connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}
