"use client";

import { useState, useEffect, useCallback } from "react";
import type { Play, BetResult, UserAccess, Sport, BetType } from "@/lib/types";

const SPORTS_ICONS: Record<string, string> = {
  NBA: "🏀",
  NFL: "🏈",
  NCAAB: "🏀",
  NCAAF: "🏈",
  MLB: "⚾",
  NHL: "🏒",
  Soccer: "⚽",
  UFC: "🥊",
  Tennis: "🎾",
};

const BET_TYPES: BetType[] = [
  "SPREAD",
  "MONEYLINE",
  "OVER/UNDER",
  "ALTERNATE SPREAD",
  "PLAYER PROP",
  "FIRST HALF SPREAD",
  "FIRST HALF ML",
  "GAME TOTAL",
];

const SPORTS: Sport[] = [
  "NCAAB",
  "NBA",
  "NFL",
  "NCAAF",
  "NHL",
  "MLB",
  "Soccer",
  "UFC",
  "Tennis",
];

const RESULT_STYLES: Record<
  BetResult,
  { bg: string; border: string; text: string; label: string }
> = {
  win: {
    bg: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.4)",
    text: "#22c55e",
    label: "WIN ✓",
  },
  loss: {
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.4)",
    text: "#ef4444",
    label: "LOSS ✗",
  },
  push: {
    bg: "rgba(234, 179, 8, 0.12)",
    border: "rgba(234, 179, 8, 0.4)",
    text: "#eab308",
    label: "PUSH",
  },
  pending: {
    bg: "rgba(255, 255, 255, 0.04)",
    border: "rgba(255, 255, 255, 0.1)",
    text: "#9ca3af",
    label: "PENDING",
  },
};

// ─── Play Card ───────────────────────────────────────────────────
function PlayCard({
  play,
  onUpdateResult,
  onDelete,
  isAdmin,
}: {
  play: Play;
  onUpdateResult: (id: string, result: BetResult) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const result = RESULT_STYLES[play.result] || RESULT_STYLES.pending;
  const isPending = play.result === "pending";

  return (
    <div
      style={{
        background: result.bg,
        border: `1px solid ${result.border}`,
        borderRadius: 16,
        overflow: "hidden",
        animation: "fadeSlideIn 0.5s ease forwards",
      }}
    >
      <div
        style={{
          height: 3,
          background: isPending
            ? "linear-gradient(90deg, #b8860b, #d4a843, #b8860b)"
            : `linear-gradient(90deg, transparent, ${result.text}, transparent)`,
        }}
      />

      <div style={{ padding: "20px 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>
              {SPORTS_ICONS[play.sport] || "🎯"}
            </span>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'Courier Prime', monospace",
                  color: "#d4a843",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {play.sport}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  fontFamily: "'Courier Prime', monospace",
                }}
              >
                {play.postedAt}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {play.units > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'Courier Prime', monospace",
                  color: "#d4a843",
                  background: "rgba(212, 168, 67, 0.1)",
                  border: "1px solid rgba(212, 168, 67, 0.2)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  letterSpacing: 1,
                }}
              >
                {play.units}U
              </span>
            )}
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Courier Prime', monospace",
                color: result.text,
                background: result.bg,
                border: `1px solid ${result.border}`,
                borderRadius: 6,
                padding: "3px 8px",
                letterSpacing: 1,
                fontWeight: 700,
              }}
            >
              {result.label}
            </span>
          </div>
        </div>

        {/* Pick */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#f5f5f5",
                fontFamily: "'Oswald', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {play.team}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: isPending ? "#d4a843" : result.text,
                fontFamily: "'Oswald', sans-serif",
              }}
            >
              {play.odds}
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {play.betType}
          </div>
        </div>

        {/* Bet Slip Image */}
        {play.slipImage && (
          <div
            style={{
              margin: "14px 0",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(212,168,67,0.15)",
              background: "rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                fontFamily: "'Oswald', sans-serif",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "#d4a843",
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid rgba(212,168,67,0.2)",
              }}
            >
              📸 Bet Slip
            </span>
            <img
              src={play.slipImage}
              alt="Bet slip"
              style={{
                width: "100%",
                display: "block",
                maxHeight: 220,
                objectFit: "contain",
                background: "#111",
              }}
            />
          </div>
        )}

        {/* Matchup */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#d4a843",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            {play.matchup}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            {play.time}
          </span>
        </div>

        {/* Admin result buttons */}
        {isAdmin && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {(["win", "loss", "push", "pending"] as BetResult[]).map((r) => (
              <button
                key={r}
                onClick={() => onUpdateResult(play.id, r)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  border:
                    play.result === r
                      ? `2px solid ${RESULT_STYLES[r].text}`
                      : `1px solid ${RESULT_STYLES[r].border}`,
                  background:
                    play.result === r
                      ? RESULT_STYLES[r].bg
                      : "rgba(255,255,255,0.02)",
                  color:
                    play.result === r ? RESULT_STYLES[r].text : "#4b5563",
                  fontSize: 11,
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {r === "pending" ? "—" : r}
              </button>
            ))}
          </div>
        )}

        {/* Admin delete button */}
        {isAdmin && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => {
                if (confirm("Delete this play?")) onDelete(play.id);
              }}
              style={{
                width: "100%",
                padding: "8px 0",
                borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.06)",
                color: "#ef4444",
                fontSize: 11,
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              🗑 Delete Play
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
    window.parent.postMessage(
      { type: "whop:navigate", productId: "prod_o1jjamUG8rP8W" },
      "*"
    );
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        overflow: "hidden",
        animation: "fadeSlideIn 0.5s ease forwards",
      }}
    >
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg, #b8860b, #d4a843, #b8860b)",
        }}
      />
      <div style={{ padding: "20px 24px" }}>
        {/* Visible header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>
              {SPORTS_ICONS[play.sport] || "🎯"}
            </span>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'Courier Prime', monospace",
                  color: "#d4a843",
                  letterSpacing: 2,
                }}
              >
                {play.sport}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  fontFamily: "'Courier Prime', monospace",
                }}
              >
                {play.postedAt}
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Oswald', sans-serif",
              color: "#d4a843",
              background: "rgba(212,168,67,0.1)",
              border: "1px solid rgba(212,168,67,0.2)",
              borderRadius: 6,
              padding: "3px 10px",
              letterSpacing: 2,
            }}
          >
            🔒 LOCKED
          </span>
        </div>

        {/* Blurred pick */}
        <div style={{ position: "relative", padding: "18px 0", marginBottom: 16 }}>
          <div
            style={{
              filter: "blur(12px)",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#f5f5f5",
                fontFamily: "'Oswald', sans-serif",
              }}
            >
              Team Name -0.0
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#d4a843",
                fontFamily: "'Oswald', sans-serif",
              }}
            >
              -000
            </div>
          </div>
        </div>

        {/* Blurred matchup */}
        <div
          style={{
            filter: "blur(8px)",
            userSelect: "none",
            pointerEvents: "none",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#d4a843",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            Team A @ Team B
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            0:00PM ET
          </span>
        </div>

        {/* Upgrade CTA */}
        <div
          style={{
            marginTop: 18,
            padding: "16px 20px",
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgba(184,134,11,0.15), rgba(212,168,67,0.08))",
            border: "1px solid rgba(212,168,67,0.25)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              color: "#d4a843",
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            🔥 Upgrade to unlock this play
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#9ca3af",
              fontFamily: "'Courier Prime', monospace",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            Premium & High Roller members get instant access to all straight bets
          </div>
          <button
            onClick={handleUpgrade}
            style={{
              padding: "10px 28px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #b8860b, #d4a843)",
              color: "#0a0a0a",
              fontSize: 12,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────
function AdminPanel({
  onPost,
  onClose,
}: {
  onPost: (play: any) => void;
  onClose: () => void;
}) {
  const [team, setTeam] = useState("");
  const [betType, setBetType] = useState<BetType>("SPREAD");
  const [odds, setOdds] = useState("");
  const [matchup, setMatchup] = useState("");
  const [time, setTime] = useState("");
  const [sport, setSport] = useState<Sport>("NCAAB");
  const [units, setUnits] = useState("1");
  const [scanning, setScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanError, setScanError] = useState("");

  const handlePost = () => {
    if (!team || !odds || !matchup || !time) return;
    onPost({
      team,
      betType,
      odds: odds.startsWith("+") || odds.startsWith("-") ? odds : `-${odds}`,
      matchup,
      time,
      sport,
      units: parseFloat(units) || 1,
      slipImage: scanPreview || undefined,
    });
    setTeam("");
    setOdds("");
    setMatchup("");
    setTime("");
    setScanPreview(null);
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError("");
    setScanning(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      setScanPreview(base64Full);
      const base64Data = base64Full.split(",")[1];
      const mediaType = file.type || "image/png";

      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64Data, mediaType }),
        });

        const data = await response.json();
        if (!data.success || !data.result) {
          throw new Error(data.error || "Scan failed");
        }
        const parsed = data.result;

        if (parsed.team) setTeam(parsed.team);
        if (parsed.betType) setBetType(parsed.betType);
        if (parsed.odds) setOdds(parsed.odds);
        if (parsed.matchup) setMatchup(parsed.matchup);
        if (parsed.time) setTime(parsed.time);
        if (parsed.sport) setSport(parsed.sport);
      } catch (err) {
        console.error("Scan error:", err);
        setScanError(
          "Couldn't read that slip. Try a clearer screenshot or fill in manually."
        );
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#f5f5f5",
    fontSize: 14,
    fontFamily: "'Courier Prime', monospace",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontFamily: "'Oswald', sans-serif",
    color: "#d4a843",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(212, 168, 67, 0.2)",
        borderRadius: 20,
        padding: 28,
        marginBottom: 28,
        animation: "fadeSlideIn 0.4s ease forwards",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            color: "#d4a843",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          🔥 Post New Play
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {/* Bet Slip Upload */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: scanPreview ? "12px" : "28px 20px",
            borderRadius: 14,
            border: scanning
              ? "2px solid rgba(212,168,67,0.5)"
              : "2px dashed rgba(255,255,255,0.12)",
            background: scanning
              ? "rgba(212,168,67,0.06)"
              : "rgba(255,255,255,0.02)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            overflow: "hidden",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleSlipUpload}
            style={{ display: "none" }}
          />
          {scanning ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: "'Oswald', sans-serif",
                  color: "#d4a843",
                  letterSpacing: 2,
                }}
              >
                SCANNING BET SLIP...
              </div>
            </div>
          ) : scanPreview ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                width: "100%",
              }}
            >
              <img
                src={scanPreview}
                alt="Bet slip"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "'Oswald', sans-serif",
                    color: "#22c55e",
                    letterSpacing: 2,
                  }}
                >
                  ✓ SLIP SCANNED
                </div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  Review below and tap to re-upload
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: "'Oswald', sans-serif",
                  color: "#d4a843",
                  letterSpacing: 2,
                  marginBottom: 4,
                }}
              >
                UPLOAD BET SLIP
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Drop a screenshot from DraftKings, FanDuel, etc.
                
                AI will auto-fill the play details
              </div>
            </>
          )}
        </label>
        {scanError && (
          <div
            style={{
              marginTop: 8,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444",
              fontSize: 12,
            }}
          >
            {scanError}
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }}
        />
        <span
          style={{
            fontSize: 10,
            fontFamily: "'Oswald', sans-serif",
            color: "#4b5563",
            letterSpacing: 2,
          }}
        >
          OR FILL MANUALLY
        </span>
        <div
          style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }}
        />
      </div>

      {/* Form fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <label style={labelStyle}>Pick / Team</label>
          <input
            style={inputStyle}
            placeholder="e.g. Duke -9.5"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>Odds</label>
          <input
            style={inputStyle}
            placeholder="e.g. -192"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <label style={labelStyle}>Matchup</label>
          <input
            style={inputStyle}
            placeholder="e.g. Clemson @ Duke"
            value={matchup}
            onChange={(e) => setMatchup(e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>Game Time</label>
          <input
            style={inputStyle}
            placeholder="e.g. 8:00PM ET"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <label style={labelStyle}>Sport</label>
          <select
            style={{ ...inputStyle, cursor: "pointer", appearance: "none" as any }}
            value={sport}
            onChange={(e) => setSport(e.target.value as Sport)}
          >
            {SPORTS.map((s) => (
              <option key={s} value={s} style={{ background: "#111" }}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Bet Type</label>
          <select
            style={{ ...inputStyle, cursor: "pointer", appearance: "none" as any }}
            value={betType}
            onChange={(e) => setBetType(e.target.value as BetType)}
          >
            {BET_TYPES.map((b) => (
              <option key={b} value={b} style={{ background: "#111" }}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Units</label>
          <input
            style={inputStyle}
            placeholder="1"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handlePost}
        disabled={!team || !odds || !matchup || !time}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 12,
          border: "none",
          background:
            !team || !odds || !matchup || !time
              ? "rgba(255,255,255,0.05)"
              : "linear-gradient(135deg, #b8860b, #d4a843)",
          color:
            !team || !odds || !matchup || !time ? "#4b5563" : "#0a0a0a",
          fontSize: 14,
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          cursor:
            !team || !odds || !matchup || !time ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
        }}
      >
        Drop Play 🔥
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function StraightBetsClient({
  userAccess,
}: {
  userAccess: UserAccess;
}) {
  const [plays, setPlays] = useState<Play[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showGraded, setShowGraded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [notification, setNotification] = useState<Play | null>(null);
  const [loading, setLoading] = useState(true);

  const { hasPremiumAccess, isAdmin } = userAccess;

  // Fetch plays on mount
  const fetchPlays = useCallback(async () => {
    try {
      const res = await fetch("/api/plays");
      if (res.ok) {
        const data = await res.json();
        setPlays(data.plays);
      }
    } catch (err) {
      console.error("Error fetching plays:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlays();
    const interval = setInterval(fetchPlays, 30000);
    return () => clearInterval(interval);
  }, [fetchPlays]);

  // Post a new play
  const handlePost = async (playData: any) => {
    try {
      const res = await fetch("/api/plays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playData),
      });

      if (res.ok) {
        const data = await res.json();
        setPlays((prev) => [data.play, ...prev]);
        setShowAdmin(false);

        // Send push notification
        try {
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              team: playData.team,
              odds: playData.odds,
              sport: playData.sport,
            }),
          });
        } catch (err) {
          console.error("Notification error:", err);
        }

        // Show in-app notification
        setNotification(data.play);
        setTimeout(() => setNotification(null), 6000);
      }
    } catch (err) {
      console.error("Error posting play:", err);
    }
  };

  // Update play result
  const handleUpdateResult = async (id: string, result: BetResult) => {
    try {
      const res = await fetch("/api/plays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, result }),
      });

      if (res.ok) {
        setPlays((prev) =>
          prev.map((p) => (p.id === id ? { ...p, result } : p))
        );
      }
    } catch (err) {
      console.error("Error updating result:", err);
    }
  };

  // Delete play
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/plays", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPlays((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting play:", err);
    }
  };

  const pendingPlays = plays.filter((p) => p.result === "pending");
  const gradedPlays = plays.filter((p) => p.result !== "pending");

  const record = {
    wins: plays.filter((p) => p.result === "win").length,
    losses: plays.filter((p) => p.result === "loss").length,
    pushes: plays.filter((p) => p.result === "push").length,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#f5f5f5",
        fontFamily: "'Courier Prime', monospace",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 168, 67, 0.1); }
          50% { box-shadow: 0 0 30px rgba(212, 168, 67, 0.2); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,168,67,0.3); border-radius: 3px; }
        select option { background: #111 !important; color: #f5f5f5; }
      `}</style>

      {/* Notification Banner */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            animation: "slideDown 0.4s ease forwards",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              maxWidth: 640,
              margin: "12px auto",
              padding: "14px 18px",
              borderRadius: 16,
              background: "rgba(15,15,15,0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(212,168,67,0.3)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(212,168,67,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #b8860b, #d4a843)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🔥
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'Oswald', sans-serif",
                  color: "#d4a843",
                  letterSpacing: 2,
                  marginBottom: 2,
                }}
              >
                FLAREGOTLOCKS • STRAIGHT BET
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  color: "#f5f5f5",
                }}
              >
                {hasPremiumAccess || isAdmin
                  ? `${notification.team} (${notification.odds})`
                  : "New play just dropped! Upgrade to view"}
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "40px 20px 80px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 36,
            animation: "fadeSlideIn 0.5s ease forwards",
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontSize: 10,
              fontFamily: "'Oswald', sans-serif",
              color: "#d4a843",
              letterSpacing: 4,
              textTransform: "uppercase",
              border: "1px solid rgba(212,168,67,0.3)",
              borderRadius: 100,
              padding: "6px 20px",
              marginBottom: 20,
              background: "rgba(212,168,67,0.06)",
            }}
          >
            Live Feed
          </div>

          <h1
            style={{
              fontSize: 52,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 800,
              lineHeight: 1,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            <span style={{ color: "#f5f5f5" }}>Par</span>
            
            <span
              style={{
                background:
                  "linear-gradient(135deg, #b8860b, #d4a843, #f0d078)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              lays
            </span>
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
              maxWidth: 380,
              margin: "12px auto 0",
              lineHeight: 1.6,
            }}
          >
            Every parlay play, posted live.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            justifyContent: "center",
          }}
        >
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Live" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border:
                  filter === f.key
                    ? "1px solid rgba(212,168,67,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                background:
                  filter === f.key
                    ? "rgba(212,168,67,0.12)"
                    : "rgba(255,255,255,0.02)",
                color: filter === f.key ? "#d4a843" : "#6b7280",
                fontSize: 12,
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Admin-only record section */}
        {isAdmin && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "WON",
                value: record.wins,
                color: "#22c55e",
                bg: "rgba(34, 197, 94, 0.08)",
                border: "rgba(34, 197, 94, 0.25)",
              },
              {
                label: "LOST",
                value: record.losses,
                color: "#ef4444",
                bg: "rgba(239, 68, 68, 0.08)",
                border: "rgba(239, 68, 68, 0.25)",
              },
              {
                label: "PUSH",
                value: record.pushes,
                color: "#eab308",
                bg: "rgba(234, 179, 8, 0.08)",
                border: "rgba(234, 179, 8, 0.25)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "14px 12px",
                  background: stat.bg,
                  border: `1px solid ${stat.border}`,
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    fontFamily: "'Oswald', sans-serif",
                    color: stat.color,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "'Oswald', sans-serif",
                    color: stat.color,
                    letterSpacing: 2,
                    opacity: 0.7,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Admin controls */}
        {isAdmin && (
          <div style={{ marginBottom: 24 }}>
            {showAdmin ? (
              <AdminPanel onPost={handlePost} onClose={() => setShowAdmin(false)} />
            ) : (
              <button
                onClick={() => setShowAdmin(true)}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: "1px solid rgba(212,168,67,0.2)",
                  background: "rgba(212,168,67,0.06)",
                  color: "#d4a843",
                  fontSize: 13,
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                ⚙ Admin — Post New Play
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            Loading plays...
          </div>
        ) : (
          <>
            {/* Plays feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {pendingPlays.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#4b5563",
                    fontSize: 14,
                  }}
                >
                  No plays to show for this filter.
                </div>
              ) : hasPremiumAccess || isAdmin ? (
                pendingPlays.map((play) => (
                  <PlayCard
                    key={play.id}
                    play={play}
                    onUpdateResult={handleUpdateResult}
                    onDelete={handleDelete}
                    isAdmin={isAdmin}
                  />
                ))
              ) : (
                pendingPlays.map((play) => (
                  <PaywallCard key={play.id} play={play} />
                ))
              )}
            </div>

            {/* Admin-only graded plays history */}
            {isAdmin && gradedPlays.length > 0 && (
              <div style={{ marginTop: 36 }}>
                <button
                  onClick={() => setShowGraded(!showGraded)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    color: "#6b7280",
                    fontSize: 13,
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 600,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span>📋 Graded Plays ({gradedPlays.length})</span>
                  <span
                    style={{
                      transform: showGraded
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                      fontSize: 10,
                    }}
                  >
                    ▼
                  </span>
                </button>

                {showGraded && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      marginTop: 16,
                    }}
                  >
                    {gradedPlays.map((play) => (
                      <PlayCard
                        key={play.id}
                        play={play}
                        onUpdateResult={handleUpdateResult}
                        onDelete={handleDelete}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#374151",
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            FlareGotLocks
          </div>
        </div>
      </div>
    </div>
  );
}
