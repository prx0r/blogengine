import { classifyClaim } from "@/atlas/ai/classifyClaim";
import { route } from "@/atlas/ai/router";
import { getPhaseCache, getCachedGraph } from "@/atlas/graph/phaseCache";
import { buildGraphPacket } from "@/atlas/graph/buildGraphPacket";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { PhaseCacheEntry } from "@/atlas/graph/phaseCache";
import type { SourceCard } from "@/atlas/graph/schema";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const OPENCODE_API = "https://opencode.ai/zen/go/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY || "sk-SDjjQ8NtTdpM2OmWl3GXDrPlhcQiLvZln60mSVVcJQ3rkg7trYHQoLKshcKSeg0Y";

function getSourceCardsForPhase(phaseNumber: number): SourceCard[] {
  const graph = getCachedGraph();
  return (graph.sourceCards ?? []).filter((s) => s.phase?.includes(phaseNumber)).slice(0, 3);
}

async function getBirthChartContext(clientId: string | null): Promise<string> {
  if (!clientId) return "";
  try {
    const { env } = getCloudflareContext();
    const db = env.ATLAS_DB;
    const row = await db.prepare("SELECT profile FROM users WHERE id = ?").bind(clientId).first<{ profile: string }>();
    if (!row) return "";
    const profile = JSON.parse(row.profile);
    const bc = profile.birthChart;
    if (!bc) return "";
    return `\nUser's birth chart: ${bc.name || "Unknown"}, born ${bc.year}-${String(bc.month).padStart(2, "0")}-${String(bc.day).padStart(2, "0")} at ${bc.hour}:${String(bc.minute).padStart(2, "0")}, ${bc.placeName || bc.lat + ", " + bc.lon}`;
  } catch {
    return "";
  }
}

function buildDeepPrompt(query: string, matchedPhases: PhaseCacheEntry[], birthChartContext: string): string {
  const context = matchedPhases
    .map((p) => {
      const parts = [
        `Phase ${p.phaseNumber} — ${p.label}`,
        `Summary: ${p.summary}`,
        `Entry assumption: "${p.entryAssumption}"`,
        `What it challenges: ${p.proofMove}`,
        `Alternative view: ${p.replacementModel}`,
        `Practice: ${p.practiceMove}`,
      ];
      if (p.risks.length > 0) parts.push(`Risks: ${p.risks.map((r) => r.label + ": " + r.statement).join("\n")}`);
      if (p.correctives.length > 0) parts.push(`Correctives: ${p.correctives.map((c) => c.label + ": " + c.statement).join("\n")}`);
      if (p.warnings.length > 0) parts.push(`Warnings: ${p.warnings.join("\n")}`);
      return parts.join("\n");
    })
    .join("\n\n---\n\n");

  let prompt = `Retrieve and present the relevant information from the Atlas framework for this claim: "${query}"

Atlas context:
${context}

Present the information concisely. Use this format:
- Which phases are relevant and why
- What the framework says about this
- Any risks or category errors to note
- Any correctives or practices

Cite phases by number and name. Do not add opinions, greetings, or conversational filler.`;

  if (birthChartContext) {
    prompt += `\n\nNote: The user has a birth chart on file.${birthChartContext} Consider whether any astrological factors might be relevant to their question, but do not force astrology into the answer if it isn't pertinent.`;
  }

  return prompt;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { claim, mode = "atlas" } = body;

    if (!claim || typeof claim !== "string" || claim.trim().length === 0) {
      return new Response(JSON.stringify({ error: "claim is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const trimmed = claim.trim();
    const clientId = request.headers.get("x-client-id") || null;

    // Ensure phase cache is loaded
    getPhaseCache();

    // Run router — instant (<1ms)
    const { depth, matchedPhases } = route(trimmed);

    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    if (depth === "light" && matchedPhases.length > 0) {
      // ── Wiki retrieval mode: no LLM, return structured data ──
      const wikiEntries = matchedPhases.map((p) => ({
        phase: {
          number: p.phaseNumber,
          label: p.label,
          summary: p.summary,
          entryAssumption: p.entryAssumption,
          proofMove: p.proofMove,
          replacementModel: p.replacementModel,
          practiceMove: p.practiceMove,
          successMarker: p.successMarker,
          failureMode: p.failureMode,
          evidenceTier: p.evidenceTier,
          stream: p.stream,
        },
        risks: p.risks,
        correctives: p.correctives,
        warnings: p.warnings,
        sourceCards: getSourceCardsForPhase(p.phaseNumber),
      }));

      writer.write(encoder.encode(`event: wiki\ndata: ${JSON.stringify({ entries: wikiEntries, depth: "light" })}\n\n`));
      writer.close();

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── Deep analysis mode: factual LLM with streaming ──
    const birthChartContext = await getBirthChartContext(clientId);
    const systemPrompt = buildDeepPrompt(trimmed, matchedPhases, birthChartContext);

    // Fire LLM and classification in parallel
    const abortController = new AbortController();
    const streamFetchPromise = fetch(OPENCODE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: "You are a factual retrieval system. Present Atlas framework information concisely. Cite phases by number and name. No opinions, no greetings, no conversational filler." },
          { role: "user", content: systemPrompt },
        ],
        temperature: 0.2,
        max_tokens: 2048,
        stream: true,
      }),
      signal: abortController.signal,
    });

    const analysisPromise = classifyClaim(trimmed, { mode }).then(
      (classification) => {
        const graph = getCachedGraph();
        const phaseHint = classification.phaseCandidates[0];
        const packet = buildGraphPacket(graph, {
          claim: trimmed,
          mode: "atlas",
          phaseHint,
          riskHints: classification.risks,
        });
        return {
          classification: {
            normalizedClaim: classification.normalizedClaim,
            claimType: classification.claimType,
            evidenceTier: classification.evidenceTier,
            relationContext: classification.relationContext,
          },
          graphPacket: {
            primaryPhase: packet.primaryPhase
              ? { id: packet.primaryPhase.id, label: packet.primaryPhase.label, phaseNumber: packet.primaryPhase.phaseNumber }
              : null,
            graphPath: packet.graphPath.map((n) => n.label),
            risks: packet.risks.map((r) => r.label),
            correctives: packet.correctives.map((c) => c.label),
            evidenceTier: packet.evidenceTier,
            categoryWarnings: packet.categoryWarnings,
            suggestedPractice: packet.suggestedPractice,
          },
        };
      },
      () => null
    );

    // Send context event
    writer.write(
      encoder.encode(
        `event: context\ndata: ${JSON.stringify({ depth: "deep", matchedPhases: matchedPhases.map((p) => ({ id: p.id, label: p.label, phaseNumber: p.phaseNumber, summary: p.summary })) })}\n\n`
      )
    );

    // Wait for stream connection
    const streamRes = await streamFetchPromise;

    if (!streamRes.ok) {
      abortController.abort();
      const errorText = await streamRes.text().catch(() => "Unknown error");
      const analysis = await analysisPromise;
      writer.write(
        encoder.encode(
          `event: error\ndata: ${JSON.stringify({ error: `API error (${streamRes.status}): ${errorText}`, ...(analysis ? { analysis } : {}) })}\n\n`
        )
      );
      writer.close();
      return new Response(readable, {
        status: 500,
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    // Forward streaming tokens — decode OpenAI SSE, extract content
    const reader = streamRes.body!.getReader();
    let buffer = "";

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;

            try {
              const chunk = JSON.parse(payload);
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                writer.write(encoder.encode(`event: token\ndata: ${JSON.stringify({ token: delta })}\n\n`));
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err) {
        console.error("Stream read error:", err);
      }

      // Send analysis if ready
      try {
        const analysis = await analysisPromise;
        if (analysis) {
          writer.write(encoder.encode(`event: analysis\ndata: ${JSON.stringify(analysis)}\n\n`));
        }
      } catch {}

      writer.close();
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process claim",
        details: error instanceof Error ? error.message : "Unknown",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
