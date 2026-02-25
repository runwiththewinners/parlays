"use client";

import { useState, useEffect, useCallback } from "react";
import type { Play, ParlayLeg, BetResult, UserAccess, Sport, BetType } from "@/lib/types";

const SPORTS_ICONS: Record<string, string> = {
  NBA: "🏀", NFL: "🏈", NCAAB: "🏀", NCAAF: "🏈",
  MLB: "⚾", NHL: "🏒", Soccer: "⚽", UFC: "🥊", Tennis: "🎾",
};

const BET_TYPES: BetType[] = [
  "SPREAD", "MONEYLINE", "OVER/UNDER", "ALTERNATE SPREAD",
  "PLAYER PROP", "FIRST HALF SPREAD", "FIRST HALF ML", "GAME TOTAL",
];

const SPORTS: Sport[] = [
  "NCAAB", "NBA", "NFL", "NCAAF", "NHL", "MLB", "Soccer", "UFC", "Tennis",
];

const RESULT_STYLES: Record<BetResult, { bg: string; border: string; text: string; label: string; glow: string }> = {
  win: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.5)", text: "#22c55e", label: "WIN", glow: "0 0 20px rgba(34,197,94,0.15)" },
  loss: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.5)", text: "#ef4444", label: "LOSS", glow: "0 0 20px rgba(239,68,68,0.15)" },
  push: { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.5)", text: "#eab308", label: "PUSH", glow: "0 0 20px rgba(234,179,8,0.15)" },
  pending: { bg: "rgba(212,168,67,0.03)", border: "rgba(212,168,67,0.2)", text: "#9ca3af", label: "PENDING", glow: "0 0 20px rgba(212,168,67,0.08)" },
};

// ─── Parlay Card ─────────────────────────────────────────────────
function ParlayCard({
  play, onUpdateResult, onDelete, isAdmin,
}: {
  play: Play;
  onUpdateResult: (id: string, result: BetResult) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const result = RESULT_STYLES[play.result] || RESULT_STYLES.pending;
  const isPending = play.result === "pending";
  const legCount = play.legs?.length || 0;

  return (
    <div style={{
      background: "#111111",
      border: `1px solid ${result.border}`,
      borderRadius: 16,
      overflow: "hidden",
      animation: "fadeSlideIn 0.5s ease forwards",
      boxShadow: result.glow,
    }}>
      {/* Gold accent bar */}
      <div style={{
        height: 3,
        background: isPending
          ? "linear-gradient(90deg, transparent, #d4a843, transparent)"
          : `linear-gradient(90deg, transparent, ${result.text}, transparent)`,
      }} />

      <div style={{ padding: "20px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎯</span>
            <div>
              <div style={{
                fontSize: 11, fontFamily: "'Courier Prime', monospace",
                color: "#d4a843", letterSpacing: 2, fontWeight: 700,
              }}>
                {legCount}-LEG PARLAY
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace" }}>
                {play.postedAt}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {play.units && (
              <span style={{
                fontSize: 11, fontFamily: "'Courier Prime', monospace",
                color: "#d4a843", background: "rgba(212,168,67,0.1)",
                border: "1px solid rgba(212,168,67,0.25)", borderRadius: 6,
                padding: "3px 8px", fontWeight: 700,
              }}>
                {play.units}
              </span>
            )}
            <span style={{
              fontSize: 11, fontFamily: "'Courier Prime', monospace",
              color: isPending ? "#d4a843" : result.text,
              background: isPending ? "rgba(212,168,67,0.1)" : result.bg,
              border: `1px solid ${isPending ? "rgba(212,168,67,0.3)" : result.border}`,
              borderRadius: 6, padding: "3px 8px", letterSpacing: 1, fontWeight: 700,
            }}>
              {result.label}
            </span>
          </div>
        </div>

        {/* Legs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {play.legs?.map((leg, i) => (
            <div key={i} style={{
              background: "rgba(212,168,67,0.03)",
              border: "1px solid rgba(212,168,67,0.1)",
              borderLeft: "3px solid rgba(212,168,67,0.4)",
              borderRadius: 10,
              padding: "12px 16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{
                  fontSize: 16, fontWeight: 800, color: "#f5f5f5",
                  fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5,
                }}>
                  {leg.team}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace" }}>
                      {SPORTS_ICONS[leg.sport] || "🎯"} {leg.sport}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace" }}>
                    {leg.matchup}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 12, color: "#d4a843", fontFamily: "'Courier Prime', monospace", marginTop: 4,
              }}>
                {leg.betType} {leg.odds}
              </div>
            </div>
          ))}
        </div>

        {/* Bet Slip Image */}
        {play.slipImage && (
          <div style={{
            marginBottom: 16, borderRadius: 12, overflow: "hidden",
            border: "1px solid rgba(212,168,67,0.1)", background: "rgba(0,0,0,0.4)", position: "relative",
          }}>
            <span style={{
              position: "absolute", top: 8, left: 8,
              fontFamily: "'Courier Prime', monospace", fontSize: 9, fontWeight: 700,
              letterSpacing: 1.5, textTransform: "uppercase", color: "#d4a843",
              background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
              padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(212,168,67,0.2)",
            }}>
              📋 VIEW SLIP
            </span>
            <img src={play.slipImage} alt="Bet slip" style={{
              width: "100%", display: "block", maxHeight: 220, objectFit: "contain", background: "#0a0a0a",
            }} />
          </div>
        )}

        {/* Parlay odds footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace", letterSpacing: 2 }}>
            PARLAY ODDS
          </span>
          <span style={{
            fontSize: 22, fontWeight: 800, color: isPending ? "#d4a843" : result.text,
            fontFamily: "'Oswald', sans-serif",
          }}>
            {play.parlayOdds}
          </span>
        </div>

        {/* Admin buttons */}
        {isAdmin && (
          <div style={{
            display: "flex", gap: 8, marginTop: 14, paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            {(["win", "loss", "push"] as BetResult[]).map((r) => {
              const s = RESULT_STYLES[r];
              const isActive = play.result === r;
              return (
                <button key={r}
                  onClick={() => onUpdateResult(play.id, r === play.result ? "pending" : r)}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 8,
                    border: isActive ? `2px solid ${s.text}` : `1px solid ${s.border}`,
                    background: isActive ? s.bg : "rgba(255,255,255,0.02)",
                    color: isActive ? s.text : `${s.text}88`,
                    fontSize: 13, fontFamily: "'Oswald', sans-serif", fontWeight: 700,
                    letterSpacing: 3, textTransform: "uppercase", cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}>
                  {r.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}
        {isAdmin && (
          <div style={{ marginTop: 8 }}>
            <button onClick={() => onDelete(play.id)} style={{
              width: "100%", padding: "8px 0", borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.04)",
              color: "#ef444488", fontSize: 11, fontFamily: "'Oswald', sans-serif",
              fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
            }}>
              🗑 DELETE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Paywall Card ────────────────────────────────────────────────
function PaywallCard({ play }: { play: Play }) {
  const handleUpgrade = () => {
    window.parent.postMessage({ type: "whop:navigate", productId: "prod_o1jjamUG8rP8W" }, "*");
  };
  const legCount = play.legs?.length || 0;

  return (
    <div style={{
      background: "#111111", border: "1px solid rgba(212,168,67,0.15)",
      borderRadius: 16, overflow: "hidden", animation: "fadeSlideIn 0.5s ease forwards",
    }}>
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #d4a843, transparent)" }} />
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎯</span>
            <div>
              <div style={{ fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "#d4a843", letterSpacing: 2, fontWeight: 700 }}>
                {legCount}-LEG PARLAY
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace" }}>
                {play.postedAt}
              </div>
            </div>
          </div>
          <span style={{
            fontSize: 10, fontFamily: "'Courier Prime', monospace", color: "#ef4444",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 6, padding: "3px 10px", letterSpacing: 2, fontWeight: 700,
          }}>
            🔒 LOCKED
          </span>
        </div>

        {/* Blurred legs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {play.legs?.map((_, i) => (
            <div key={i} style={{
              background: "rgba(212,168,67,0.03)", border: "1px solid rgba(212,168,67,0.08)",
              borderLeft: "3px solid rgba(212,168,67,0.2)", borderRadius: 10, padding: "12px 16px",
              filter: "blur(8px)", userSelect: "none" as any, pointerEvents: "none" as any,
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#f5f5f5", fontFamily: "'Oswald', sans-serif" }}>
                TEAM NAME +000
              </div>
              <div style={{ fontSize: 12, color: "#d4a843", fontFamily: "'Courier Prime', monospace", marginTop: 4 }}>
                SPREAD -110
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade CTA */}
        <div style={{
          padding: "16px 20px", borderRadius: 12,
          background: "rgba(212,168,67,0.04)", border: "1px solid rgba(212,168,67,0.15)", textAlign: "center",
        }}>
          <div style={{ fontSize: 14, fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#d4a843", letterSpacing: 1, marginBottom: 6 }}>
            🔒 UPGRADE TO UNLOCK
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace", marginBottom: 12, lineHeight: 1.5 }}>
            Premium & High Roller members get all parlay picks
          </div>
          <button onClick={handleUpgrade} style={{
            padding: "10px 28px", borderRadius: 10,
            border: "1px solid rgba(212,168,67,0.4)", background: "rgba(212,168,67,0.1)",
            color: "#d4a843", fontSize: 12, fontFamily: "'Oswald', sans-serif",
            fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
          }}>
            UPGRADE NOW
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel (Multi-Leg) ─────────────────────────────────────
function AdminPanel({ onPost, onClose }: { onPost: (play: any) => void; onClose: () => void }) {
  const emptyLeg = (): ParlayLeg => ({ team: "", betType: "SPREAD", odds: "", matchup: "", sport: "NBA" });
  const [legs, setLegs] = useState<ParlayLeg[]>([emptyLeg(), emptyLeg()]);
  const [parlayOdds, setParlayOdds] = useState("");
  const [units, setUnits] = useState("1U");
  const [scanning, setScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanError, setScanError] = useState("");

  const updateLeg = (index: number, field: keyof ParlayLeg, value: string) => {
    setLegs(prev => prev.map((leg, i) => i === index ? { ...leg, [field]: value } : leg));
  };
  const addLeg = () => setLegs(prev => [...prev, emptyLeg()]);
  const removeLeg = (index: number) => { if (legs.length > 2) setLegs(prev => prev.filter((_, i) => i !== index)); };

  const canPost = legs.every(l => l.team && l.matchup) && parlayOdds;

  const handlePost = () => {
    if (!canPost) return;
    onPost({ legs, parlayOdds, units, slipImage: scanPreview || undefined });
    setLegs([emptyLeg(), emptyLeg()]);
    setParlayOdds("");
    setUnits("1U");
    setScanPreview(null);
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError(""); setScanning(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      setScanPreview(base64Full);
      const base64Data = base64Full.split(",")[1];
      const mediaType = file.type || "image/png";
      try {
        const response = await fetch("/api/scan", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64Data, mediaType }),
        });
        const data = await response.json();
        if (data.success && data.result) {
          const parsed = data.result;
          if (parsed.legs && parsed.legs.length > 0) {
            setLegs(parsed.legs.map((l: any) => ({ team: l.team || '', betType: l.betType || 'SPREAD', odds: l.odds || '', matchup: l.matchup || '', sport: l.sport || 'NBA' })));
          }
          if (parsed.parlayOdds) setParlayOdds(parsed.parlayOdds);
          if (parsed.units) setUnits(parsed.units);
        }
      } catch (err) {
        console.error("Scan error:", err);
        setScanError("Couldn't read that slip. Fill in manually.");
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid rgba(212,168,67,0.15)", background: "rgba(212,168,67,0.03)",
    color: "#f5f5f5", fontSize: 13, fontFamily: "'Courier Prime', monospace",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontFamily: "'Courier Prime', monospace", color: "#d4a843",
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, display: "block", fontWeight: 700,
  };

  return (
    <div style={{
      background: "#111111", border: "1px solid rgba(212,168,67,0.2)",
      borderRadius: 16, overflow: "hidden", animation: "fadeSlideIn 0.4s ease forwards",
    }}>
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #d4a843, transparent)" }} />
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontFamily: "'Courier Prime', monospace", fontWeight: 700, color: "#d4a843", letterSpacing: 3 }}>
            🎯 NEW PARLAY
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#6b7280", fontSize: 16, cursor: "pointer", borderRadius: 8, width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Slip upload */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: scanPreview ? "10px" : "20px", borderRadius: 10,
            border: scanning ? "2px solid rgba(212,168,67,0.4)" : "2px dashed rgba(212,168,67,0.15)",
            background: "rgba(212,168,67,0.02)", cursor: "pointer",
          }}>
            <input type="file" accept="image/*" onChange={handleSlipUpload} style={{ display: "none" }} />
            {scanning ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🤖</div>
                <div style={{ fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "#d4a843", letterSpacing: 2, fontWeight: 700 }}>SCANNING...</div>
              </div>
            ) : scanPreview ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <img src={scanPreview} alt="Slip" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(212,168,67,0.2)" }} />
                <div>
                  <div style={{ fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "#22c55e", letterSpacing: 2, fontWeight: 700 }}>✓ SCANNED</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>Tap to re-upload</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 22, marginBottom: 4 }}>📸</div>
                <div style={{ fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "#d4a843", letterSpacing: 2, fontWeight: 700 }}>UPLOAD SLIP</div>
              </>
            )}
          </label>
          {scanError && <div style={{ marginTop: 6, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 11 }}>{scanError}</div>}
        </div>

        {/* Legs */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontFamily: "'Courier Prime', monospace", color: "#d4a843", letterSpacing: 2, fontWeight: 700 }}>
              LEGS ({legs.length})
            </span>
            <button onClick={addLeg} style={{
              padding: "4px 12px", borderRadius: 6, border: "1px solid rgba(212,168,67,0.3)",
              background: "rgba(212,168,67,0.08)", color: "#d4a843", fontSize: 11,
              fontFamily: "'Courier Prime', monospace", fontWeight: 700, cursor: "pointer",
            }}>
              + ADD LEG
            </button>
          </div>

          {legs.map((leg, i) => (
            <div key={i} style={{
              background: "rgba(212,168,67,0.03)", border: "1px solid rgba(212,168,67,0.1)",
              borderLeft: "3px solid rgba(212,168,67,0.4)", borderRadius: 10,
              padding: "14px", marginBottom: 8, position: "relative",
            }}>
              {legs.length > 2 && (
                <button onClick={() => removeLeg(i)} style={{
                  position: "absolute", top: 8, right: 8, background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 12,
                  cursor: "pointer", borderRadius: 6, width: 24, height: 24,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>×</button>
              )}
              <div style={{ fontSize: 10, fontFamily: "'Courier Prime', monospace", color: "#d4a843", letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>
                LEG {i + 1}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={labelStyle}>Pick / Team</label>
                  <input style={inputStyle} placeholder="e.g. Lakers ML" value={leg.team} onChange={(e) => updateLeg(i, "team", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Odds</label>
                  <input style={inputStyle} placeholder="e.g. -150" value={leg.odds} onChange={(e) => updateLeg(i, "odds", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={labelStyle}>Matchup</label>
                  <input style={inputStyle} placeholder="e.g. LAL @ BOS" value={leg.matchup} onChange={(e) => updateLeg(i, "matchup", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Sport</label>
                  <select style={{ ...inputStyle, cursor: "pointer", appearance: "none" as any }} value={leg.sport} onChange={(e) => updateLeg(i, "sport", e.target.value as Sport)}>
                    {SPORTS.map(s => <option key={s} value={s} style={{ background: "#111" }}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Bet Type</label>
                <select style={{ ...inputStyle, cursor: "pointer", appearance: "none" as any }} value={leg.betType} onChange={(e) => updateLeg(i, "betType", e.target.value as BetType)}>
                  {BET_TYPES.map(b => <option key={b} value={b} style={{ background: "#111" }}>{b}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Parlay details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Parlay Odds</label>
            <input style={inputStyle} placeholder="e.g. +450" value={parlayOdds} onChange={(e) => setParlayOdds(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Units</label>
            <input style={inputStyle} placeholder="e.g. 2U" value={units} onChange={(e) => setUnits(e.target.value)} />
          </div>
        </div>

        <button onClick={() => handlePost({ legs, parlayOdds, units, betSlipUrl: scanPreview || "" })} disabled={!canPost} style={{
          width: "100%", padding: "14px", borderRadius: 10,
          border: !canPost ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(212,168,67,0.4)",
          background: !canPost ? "rgba(255,255,255,0.03)" : "rgba(212,168,67,0.12)",
          color: !canPost ? "#4b5563" : "#d4a843",
          fontSize: 14, fontFamily: "'Oswald', sans-serif", fontWeight: 700,
          letterSpacing: 3, textTransform: "uppercase",
          cursor: !canPost ? "not-allowed" : "pointer",
        }}>
          DROP PARLAY 🎯
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function StraightBetsClient({ userAccess }: { userAccess: UserAccess }) {
  const [plays, setPlays] = useState<Play[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showGraded, setShowGraded] = useState(false);
  const [notification, setNotification] = useState<Play | null>(null);
  const [loading, setLoading] = useState(true);

  const { hasPremiumAccess, isAdmin } = userAccess;

  const migratePlay = (p: any): Play => {
    if (p.legs) return p;
    return { ...p, legs: [{ team: p.team || "", betType: p.betType || "SPREAD", odds: p.odds || "", matchup: p.matchup || "", sport: p.sport || "NBA" }], parlayOdds: p.odds || "", units: "1U" };
  };

  const fetchPlays = useCallback(async () => {
    try {
      const res = await fetch("/api/plays");
      if (res.ok) { const data = await res.json(); setPlays((data.plays || []).map(migratePlay)); }
    } catch (err) { console.error("Error fetching plays:", err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlays();
    const interval = setInterval(fetchPlays, 30000);
    return () => clearInterval(interval);
  }, [fetchPlays]);

  const handlePost = async (playData: any) => {
    try {
      const res = await fetch("/api/plays", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playData),
      });
      if (res.ok) {
        const data = await res.json();
        setPlays(prev => [data.play, ...prev]);
        setShowAdmin(false);
        try {
          await fetch("/api/notify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ team: playData.legs?.[0]?.team || "Parlay", odds: playData.parlayOdds, sport: playData.legs?.[0]?.sport || "NBA" }),
          });
        } catch {}
        setNotification(data.play);
        setTimeout(() => setNotification(null), 6000);
      }
    } catch (err) { console.error("Error posting:", err); }
  };

  const handleUpdateResult = async (id: string, result: BetResult) => {
    try {
      const res = await fetch("/api/plays", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, result }),
      });
      if (res.ok) { setPlays(prev => prev.map(p => p.id === id ? { ...p, result } : p)); }
    } catch (err) { console.error("Error updating:", err); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/plays", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) { setPlays(prev => prev.filter(p => p.id !== id)); }
    } catch (err) { console.error("Error deleting:", err); }
  };

  const pendingPlays = plays.filter(p => p.result === "pending");
  const gradedPlays = plays.filter(p => p.result !== "pending");
  const record = {
    wins: plays.filter(p => p.result === "win").length,
    losses: plays.filter(p => p.result === "loss").length,
    pushes: plays.filter(p => p.result === "push").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f5", fontFamily: "'Courier Prime', monospace" }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.2); border-radius: 3px; }
        select option { background: #111 !important; color: #f5f5f5; }
      `}</style>

      {/* Notification */}
      {notification && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, animation: "slideDown 0.4s ease forwards", padding: "0 16px" }}>
          <div style={{
            maxWidth: 640, margin: "12px auto", padding: "14px 18px", borderRadius: 14,
            background: "rgba(17,17,17,0.95)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(212,168,67,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: "rgba(212,168,67,0.12)",
              border: "1px solid rgba(212,168,67,0.3)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18, flexShrink: 0,
            }}>🎯</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "#d4a843", letterSpacing: 2, marginBottom: 2, fontWeight: 700 }}>
                NEW PARLAY
              </div>
              <div style={{ fontSize: 14, fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#f5f5f5" }}>
                {hasPremiumAccess || isAdmin
                  ? `${notification.legs?.length}-leg parlay (${notification.parlayOdds})`
                  : "New parlay dropped! Upgrade to view"}
              </div>
            </div>
            <button onClick={() => setNotification(null)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
        </div>
      )}

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeSlideIn 0.5s ease forwards" }}>
          <div style={{
            display: "inline-block", fontSize: 10, fontFamily: "'Courier Prime', monospace",
            color: "#d4a843", letterSpacing: 4, textTransform: "uppercase",
            border: "1px solid rgba(212,168,67,0.3)", borderRadius: 100, padding: "6px 20px",
            marginBottom: 20, background: "rgba(212,168,67,0.06)", fontWeight: 700,
          }}>🎯 Live Feed</div>

          <h1 style={{ fontSize: 48, fontFamily: "'Oswald', sans-serif", fontWeight: 800, lineHeight: 1, textTransform: "uppercase", marginBottom: 4 }}>
            <span style={{ color: "#f5f5f5" }}>Parlay</span><br />
            <span style={{ background: "linear-gradient(135deg, #b8860b, #d4a843, #f0d078)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Plays</span>
          </h1>

          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 380, margin: "12px auto 0", lineHeight: 1.6, fontFamily: "'Courier Prime', monospace" }}>
            Multi-leg parlay plays, posted live.
          </p>
        </div>

        {/* Record */}
        {isAdmin && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[
              { label: "WON", value: record.wins, color: "#22c55e", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.25)" },
              { label: "LOST", value: record.losses, color: "#ef4444", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.25)" },
              { label: "PUSH", value: record.pushes, color: "#eab308", bg: "rgba(234,179,8,0.06)", border: "rgba(234,179,8,0.25)" },
            ].map(stat => (
              <div key={stat.label} style={{ flex: 1, textAlign: "center", padding: "14px 12px", background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Oswald', sans-serif", color: stat.color, lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 10, fontFamily: "'Courier Prime', monospace", color: stat.color, letterSpacing: 2, opacity: 0.7, fontWeight: 700 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Admin */}
        {isAdmin && (
          <div style={{ marginBottom: 24 }}>
            {showAdmin ? (
              <AdminPanel onPost={handlePost} onClose={() => setShowAdmin(false)} />
            ) : (
              <button onClick={() => setShowAdmin(true)} style={{
                width: "100%", padding: "14px", borderRadius: 12,
                border: "1px solid rgba(212,168,67,0.2)", background: "rgba(212,168,67,0.06)",
                color: "#d4a843", fontSize: 12, fontFamily: "'Courier Prime', monospace",
                fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer",
              }}>⚙ ADMIN — POST NEW PARLAY</button>
            )}
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280", fontSize: 13, fontFamily: "'Courier Prime', monospace" }}>Loading parlays...</div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {pendingPlays.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#4b5563", fontSize: 13, fontFamily: "'Courier Prime', monospace" }}>No parlays yet. Check back soon.</div>
              ) : hasPremiumAccess || isAdmin ? (
                pendingPlays.map(play => <ParlayCard key={play.id} play={play} onUpdateResult={handleUpdateResult} onDelete={handleDelete} isAdmin={isAdmin} />)
              ) : (
                pendingPlays.map(play => <PaywallCard key={play.id} play={play} />)
              )}
            </div>

            {isAdmin && gradedPlays.length > 0 && (
              <div style={{ marginTop: 36 }}>
                <button onClick={() => setShowGraded(!showGraded)} style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)", color: "#6b7280", fontSize: 12,
                  fontFamily: "'Courier Prime', monospace", fontWeight: 700, letterSpacing: 3,
                  textTransform: "uppercase", cursor: "pointer", display: "flex",
                  justifyContent: "center", alignItems: "center", gap: 10,
                }}>
                  <span>📋 GRADED ({gradedPlays.length})</span>
                  <span style={{ transform: showGraded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease", fontSize: 10 }}>▼</span>
                </button>
                {showGraded && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                    {gradedPlays.map(play => <ParlayCard key={play.id} play={play} onUpdateResult={handleUpdateResult} onDelete={handleDelete} isAdmin={isAdmin} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 11, color: "#1f2937", fontFamily: "'Courier Prime', monospace", letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}>RWTW</div>
        </div>
      </div>
    </div>
  );
}
