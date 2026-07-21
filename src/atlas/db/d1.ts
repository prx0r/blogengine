// D1 database client for Atlas profile data
// Bindings passed by Cloudflare Worker environment

import type { D1Database } from "@cloudflare/workers-types";

export interface FeedbackData {
  totalRatings: number;
  averageRating: number;
  byTopic: Record<string, { count: number; average: number; trend?: string }>;
  recentComments: { rating: number; comment?: string; topic?: string | null; date: string }[];
  responseStyleAdjustments?: Record<string, number>;
}

export interface ElementalProfile {
  fire?: string;    // Bardon-style elemental self-assessment
  water?: string;
  air?: string;
  earth?: string;
  notes?: string;
}

export interface ProfileData {
  elements?: ElementalProfile;
  birthChart?: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    lat: number;
    lon: number;
    placeName?: string;
    bodies?: Record<string, {
      sign: string;
      lon: number;
      house?: number;
      retrograde?: boolean;
    }>;
    angles?: {
      asc: number;
      mc: number;
    };
  };
  preferences?: {
    responseStyle?: "concise" | "conversational" | "scholarly";
    includeReferences?: boolean;
    humorLevel?: 0 | 1 | 2;
    insightDepth?: "light" | "normal" | "deep";
    birthChartInfluence?: number;
    customInstructions?: string;
    feedback?: FeedbackData;
  };
}

export async function getOrCreateUser(db: D1Database, clientId: string): Promise<{ id: string; profile: ProfileData }> {
  const existing = await db.prepare("SELECT id, profile FROM users WHERE id = ?").bind(clientId).first<{ id: string; profile: string }>();
  if (existing) {
    return { id: existing.id, profile: JSON.parse(existing.profile || "{}") };
  }

  // Create new user with this client ID
  await db.prepare(
    "INSERT INTO users (id, email, password_hash, display_name, profile) VALUES (?, ?, ?, ?, ?)"
  ).bind(clientId, `${clientId}@local`, "local-only", null, "{}").run();

  return { id: clientId, profile: {} };
}

export async function updateProfile(db: D1Database, userId: string, updates: Partial<ProfileData>): Promise<ProfileData> {
  const { profile } = await getOrCreateUser(db, userId);
  const merged = { ...profile, ...updates };
  await db.prepare("UPDATE users SET profile = ? WHERE id = ?").bind(JSON.stringify(merged), userId).run();
  return merged;
}

export async function getProfile(db: D1Database, userId: string): Promise<ProfileData> {
  const { profile } = await getOrCreateUser(db, userId);
  return profile;
}
