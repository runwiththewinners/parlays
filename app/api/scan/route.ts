import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  try {
    const body = await request.json();
    const { imageData, mediaType } = body;
    if (!imageData || !mediaType) return NextResponse.json({ error: "Missing imageData or mediaType" }, { status: 400 });
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: mediaType, data: imageData } }, { type: "text", text: "You are reading a sportsbook bet slip screenshot. This may be a parlay with multiple legs. Extract ALL legs and respond ONLY with JSON, no markdown, no backticks:\n{\"legs\":[{\"team\":\"Pick including line e.g. Duke -9.5 or Jalen Johnson Over 8.5 Rebounds\",\"betType\":\"SPREAD or MONEYLINE or OVER/UNDER or PLAYER PROP or GAME TOTAL or ALTERNATE SPREAD or FIRST HALF SPREAD or FIRST HALF ML\",\"odds\":\"Leg odds if shown e.g. -192 or empty string\",\"matchup\":\"Away vs Home e.g. ATL vs WAS\",\"sport\":\"NBA or NFL or NCAAB or NCAAF or NHL or MLB or Soccer or UFC or Tennis\"}],\"parlayOdds\":\"Total odds if shown e.g. +450 or 2.00x\",\"units\":\"Units if shown e.g. 2U or 1U\"}\nExtract EVERY leg. For player props put player name stat and line in team field." }] }] }) });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "AI scan failed", details: data }, { status: 500 });
    const text = data.content?.map((b: any) => (b.type === "text" ? b.text : "")).join("") || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json({ success: true, result: parsed });
  } catch (err) { console.error("Scan error:", err); return NextResponse.json({ error: "Failed to process bet slip" }, { status: 500 }); }
}
