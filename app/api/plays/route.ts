import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { COMPANY_ID, PREMIUM_TIERS } from "@/lib/constants";
import { redisGet, redisSet } from "@/lib/redis";
import type { Play, BetResult } from "@/lib/types";

const PLAYS_KEY = "parlays:plays";

async function getPlays(): Promise<Play[]> {
  const plays = await redisGet(PLAYS_KEY);
  return plays || [];
}

async function savePlays(plays: Play[]): Promise<void> {
  await redisSet(PLAYS_KEY, plays);
}

async function getUser(request: NextRequest): Promise<{
  userId: string | null;
  isAdmin: boolean;
  hasPremiumAccess: boolean;
}> {
  try {
    const { userId } = await whopsdk.verifyUserToken(request.headers);
    if (!userId) return { userId: null, isAdmin: false, hasPremiumAccess: false };

    let isAdmin = false;
    try {
      const companyAccess = await whopsdk.users.checkAccess(COMPANY_ID, { id: userId });
      isAdmin = companyAccess.access_level === "admin";
    } catch { isAdmin = false; }

    let hasPremiumAccess = false;
    for (const productId of PREMIUM_TIERS) {
      try {
        const access = await whopsdk.users.checkAccess(productId, { id: userId });
        if (access.has_access) { hasPremiumAccess = true; break; }
      } catch {}
    }

    return { userId, isAdmin, hasPremiumAccess };
  } catch {
    return { userId: null, isAdmin: false, hasPremiumAccess: false };
  }
}

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plays = await getPlays();

  if (user.hasPremiumAccess || user.isAdmin) {
    return NextResponse.json({ plays, isAdmin: user.isAdmin });
  }

  const redacted = plays.map((p) => ({
    ...p,
    legs: p.legs.map(() => ({
      team: "XXXXXXXXXX",
      betType: "SPREAD",
      odds: "XXX",
      matchup: "XXX vs XXX",
      sport: "NBA",
    })),
    parlayOdds: "XXX",
    slipImage: undefined,
  }));
  return NextResponse.json({ plays: redacted, isAdmin: false });
}

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const newPlay: Play = {
    id: `play_${Date.now()}`,
    legs: body.legs || [],
    parlayOdds: body.parlayOdds || "",
    units: body.units || "1U",
    result: "pending" as BetResult,
    slipImage: body.slipImage || undefined,
    postedAt: new Date().toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      hour12: true, timeZone: "America/New_York",
    }) + " ET",
    createdAt: Date.now(),
  };

  const plays = await getPlays();
  plays.unshift(newPlay);
  await savePlays(plays);
  return NextResponse.json({ play: newPlay, success: true });
}

export async function PATCH(request: NextRequest) {
  const user = await getUser(request);
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { id, result } = body;
  const plays = await getPlays();
  const play = plays.find((p) => p.id === id);
  if (play) {
    play.result = result as BetResult;
    await savePlays(plays);
  }
  return NextResponse.json({ play, success: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getUser(request);
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { id } = body;
  let plays = await getPlays();
  const index = plays.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Play not found" }, { status: 404 });
  }
  plays.splice(index, 1);
  await savePlays(plays);
  return NextResponse.json({ success: true, id });
}
