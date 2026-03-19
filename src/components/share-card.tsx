"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const TEAM_COLORS: Record<string, string> = {
  "Mumbai Indians": "#004BA0",
  "Chennai Super Kings": "#FDB913",
  "Royal Challengers Bengaluru": "#EC1C24",
  "Royal Challengers Bangalore": "#EC1C24",
  "Kolkata Knight Riders": "#3A225D",
  "Delhi Capitals": "#004C93",
  "Delhi Daredevils": "#004C93",
  "Rajasthan Royals": "#EA1A85",
  "Sunrisers Hyderabad": "#FF822A",
  "Punjab Kings": "#DD1F2D",
  "Kings XI Punjab": "#DD1F2D",
  "Gujarat Titans": "#1C1C2B",
  "Lucknow Super Giants": "#A72056",
};

function getColor(team: string) {
  return TEAM_COLORS[team] ?? "#666";
}

export interface ShareCardProps {
  type: "player" | "matchup";
  playerData?: {
    name: string;
    runs: number;
    wickets: number;
    matches: number;
    seasons: number;
    bestSeason: { season: string; runs: number; team: string };
    teams: string[];
  };
  matchupData?: {
    team1: string;
    team2: string;
    team1Wins: number;
    team2Wins: number;
    totalMatches: number;
  };
}

const W = 400;
const H = 220;
const PAD = 20;
const RADIUS = 12;

export function ShareCard({ type, playerData, matchupData }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Rounded rect clip
    const path = new Path2D();
    path.roundRect(0, 0, W, H, RADIUS);
    ctx.save();
    ctx.clip(path);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0c0c14");
    bg.addColorStop(1, "#12121f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();

    // Border
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0.5, 0.5, W - 1, H - 1, RADIUS);
    ctx.stroke();

    // Watermark (always)
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#71717a";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("IPLens", W - PAD, H - PAD);
    ctx.restore();

    if (type === "player" && playerData) {
      drawPlayerCard(ctx);
    } else if (type === "matchup" && matchupData) {
      drawMatchupCard(ctx);
    }

    setPreviewDataUrl(canvas.toDataURL("image/png"));
  }, [type, playerData, matchupData]);

  function drawPlayerCard(ctx: CanvasRenderingContext2D) {
    if (!playerData) return;

    const primaryColor = playerData.teams?.length
      ? getColor(playerData.teams[0])
      : "#71717a";

    // Team color bar at top
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, 5, [RADIUS, RADIUS, 0, 0]);
    ctx.fill();

    // Player name
    ctx.fillStyle = "#fafafa";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(playerData.name, PAD, PAD + 8);

    // Stats row
    const stats = [
      { label: "Runs", value: playerData.runs.toLocaleString() },
      { label: "Wickets", value: String(playerData.wickets) },
      { label: "Matches", value: String(playerData.matches) },
      { label: "Seasons", value: String(playerData.seasons) },
    ];
    const statY = PAD + 52;
    const statGap = 72;
    stats.forEach((s, i) => {
      const x = PAD + i * statGap;
      ctx.fillStyle = "#71717a";
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText(s.label, x, statY);
      ctx.fillStyle = "#e4e4e7";
      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.fillText(s.value, x, statY + 18);
    });

    // Best season highlight
    if (playerData.bestSeason) {
      const bs = playerData.bestSeason;
      const bsColor = getColor(bs.team);
      const bsY = H - 58;
      ctx.fillStyle = "#3f3f46";
      ctx.beginPath();
      ctx.roundRect(PAD, bsY, W - PAD * 2, 36, 8);
      ctx.fill();
      ctx.strokeStyle = bsColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText("Best season", PAD + 12, bsY + 14);
      ctx.fillStyle = "#fafafa";
      ctx.font = "bold 14px system-ui, sans-serif";
      ctx.fillText(`${bs.season} · ${bs.runs} runs`, PAD + 12, bsY + 28);
      ctx.fillStyle = bsColor;
      ctx.font = "10px system-ui, sans-serif";
      ctx.fillText(bs.team, PAD + 12, bsY + 42);
    }
  }

  function drawMatchupCard(ctx: CanvasRenderingContext2D) {
    if (!matchupData) return;

    const c1 = getColor(matchupData.team1);
    const c2 = getColor(matchupData.team2);

    // Team color bars on sides
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 4, H);
    ctx.fillStyle = c2;
    ctx.fillRect(W - 4, 0, 4, H);

    // Team names
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = c1;
    ctx.fillText(
      matchupData.team1.split(" ").pop() ?? matchupData.team1,
      PAD + 12,
      PAD
    );
    ctx.textAlign = "right";
    ctx.fillStyle = c2;
    ctx.fillText(
      matchupData.team2.split(" ").pop() ?? matchupData.team2,
      W - PAD - 12,
      PAD
    );

    // Win record (large, center)
    const record = `${matchupData.team1Wins} - ${matchupData.team2Wins}`;
    ctx.fillStyle = "#fafafa";
    ctx.font = "bold 42px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(record, W / 2, H / 2 - 8);

    // Total matches
    ctx.fillStyle = "#71717a";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(
      `${matchupData.totalMatches} matches`,
      W / 2,
      H / 2 + 24
    );
  }

  useEffect(() => {
    draw();
  }, [draw]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const name =
      type === "player"
        ? playerData?.name.replace(/\s+/g, "-").toLowerCase() ?? "player"
        : matchupData
          ? `${(matchupData.team1 + "-vs-" + matchupData.team2)
              .replace(/\s+/g, "-")
              .toLowerCase()}`
          : "matchup";

    const link = document.createElement("a");
    link.download = `iplens-${name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard API may fail (e.g. non-HTTPS)
    }
  };

  const hasData =
    (type === "player" && playerData) || (type === "matchup" && matchupData);

  if (!hasData) {
    return (
      <div className="flex h-[220px] w-[400px] items-center justify-center rounded-xl border border-[#1a1a2e] bg-[#0c0c14] text-sm text-[#71717a]">
        No data to display
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col gap-3">
      {/* Hidden canvas for drawing */}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="hidden"
        aria-hidden
      />

      {/* Visible preview - identical to canvas output */}
      <div
        className="overflow-hidden rounded-xl border border-[#1a1a2e] shadow-xl"
        style={{ width: W, height: H }}
      >
        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt="Share card preview"
            width={W}
            height={H}
            className="block"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: "linear-gradient(135deg, #0c0c14 0%, #12121f 100%)",
            }}
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-lg bg-[#1a1a2e] px-4 py-2 text-sm font-medium text-[#e4e4e7] transition-colors hover:bg-[#252538]"
        >
          Download Card
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-[#1a1a2e] px-4 py-2 text-sm font-medium text-[#e4e4e7] transition-colors hover:bg-[#252538]"
        >
          {copied ? "Copied!" : "Copy Image"}
        </button>
      </div>
    </div>
  );
}
