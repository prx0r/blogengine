import { NextRequest, NextResponse } from "next/server";

const OPENCODE_API = "https://opencode.ai/zen/go/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY || "sk-SDjjQ8NtTdpM2OmWl3GXDrPlhcQiLvZln60mSVVcJQ3rkg7trYHQoLKshcKSeg0Y";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(OPENCODE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model || "deepseek-v4-flash",
        messages: body.messages,
        temperature: body.temperature ?? 0.4,
        max_tokens: body.max_tokens ?? 30000,
      }),
    });
    const data = await res.json();
    // Some models return the response in reasoning_content instead of content
    if (data.choices?.[0]?.message && !data.choices[0].message.content && data.choices[0].message.reasoning_content) {
      data.choices[0].message.content = data.choices[0].message.reasoning_content;
    }
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: { message: e.message } }, { status: 500 });
  }
}
