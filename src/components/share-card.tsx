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
  type: "player" | "matchup" | "compare" | "season" | "barRace";
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
  compareData?: {
    player1: { name: string; runs: number; wickets: number; matches: number; sr: number; team: string };
    player2: { name: string; runs: number; wickets: number; matches: number; sr: number; team: string };
  };
  seasonData?: {
    year: string;
    champion: string;
    totalMatches: number;
    topScorer: { name: string; runs: number };
    topWicketTaker: { name: string; wickets: number };
  };
  barRaceData?: {
    season: string;
    entries: { player: string; team: string; runs: number }[];
  };
}

const W = 400;
const H = 220;
const PAD = 20;
const RADIUS = 12;

export function ShareCard({ type, playerData, matchupData, compareData, seasonData, barRaceData }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const h = (type === "compare" || type === "barRace") ? 280 : H;
    canvas.width = W;
    canvas.height = h;

    ctx.clearRect(0, 0, W, h);

    const path = new Path2D();
    path.roundRect(0, 0, W, h, RADIUS);
    ctx.save();
    ctx.clip(path);

    const bg = ctx.createLinearGradient(0, 0, W, h);
    bg.addColorStop(0, "#0c0c14");
    bg.addColorStop(1, "#12121f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, h);

    ctx.restore();

    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0.5, 0.5, W - 1, h - 1, RADIUS);
    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#71717a";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("iplens.in", W - PAD, h - 12);
    ctx.restore();

    if (type === "player" && playerData) {
      drawPlayerCard(ctx);
    } else if (type === "matchup" && matchupData) {
      drawMatchupCard(ctx);
    } else if (type === "compare" && compareData) {
      drawCompareCard(ctx, h);
    } else if (type === "season" && seasonData) {
      drawSeasonCard(ctx);
    } else if (type === "barRace" && barRaceData) {
      drawBarRaceCard(ctx, h);
    }

    setPreviewDataUrl(canvas.toDataURL("image/png"));
  }, [type, playerData, matchupData, compareData, seasonData, barRaceData]);

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

  function drawCompareCard(ctx: CanvasRenderingContext2D, h: number) {
    if (!compareData) return;
    const { player1: p1, player2: p2 } = compareData;
    const c1 = getColor(p1.team);
    const c2 = getColor(p2.team);

    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, 4, h);
    ctx.fillStyle = c2;
    ctx.fillRect(W - 4, 0, 4, h);

    ctx.fillStyle = c1;
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(p1.name, PAD + 12, PAD);

    ctx.fillStyle = c2;
    ctx.textAlign = "right";
    ctx.fillText(p2.name, W - PAD - 12, PAD);

    ctx.fillStyle = "#71717a";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("vs", W / 2, PAD + 4);

    const stats = [
      { label: "Runs", v1: p1.runs, v2: p2.runs },
      { label: "Wickets", v1: p1.wickets, v2: p2.wickets },
      { label: "Matches", v1: p1.matches, v2: p2.matches },
      { label: "Strike Rate", v1: Math.round(p1.sr), v2: Math.round(p2.sr) },
    ];

    const barY = PAD + 50;
    const barH = 18;
    const gap = 42;
    const barAreaW = W - PAD * 2 - 24;

    stats.forEach((s, i) => {
      const y = barY + i * gap;
      ctx.fillStyle = "#71717a";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.label, W / 2, y);

      const max = Math.max(s.v1, s.v2, 1);
      const halfW = (barAreaW - 20) / 2;
      const mid = W / 2;

      const w1 = (s.v1 / max) * halfW;
      const w2 = (s.v2 / max) * halfW;

      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.roundRect(mid - 10 - w1, y + 14, w1, barH, 4);
      ctx.fill();

      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.roundRect(mid + 10, y + 14, w2, barH, 4);
      ctx.fill();

      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#e4e4e7";
      ctx.textAlign = "right";
      ctx.fillText(s.v1.toLocaleString(), mid - 14 - w1, y + 14 + barH / 2);
      ctx.textAlign = "left";
      ctx.fillText(s.v2.toLocaleString(), mid + 14 + w2, y + 14 + barH / 2);
    });
  }

  function drawSeasonCard(ctx: CanvasRenderingContext2D) {
    if (!seasonData) return;
    const champColor = getColor(seasonData.champion);

    ctx.fillStyle = champColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, 5, [RADIUS, RADIUS, 0, 0]);
    ctx.fill();

    ctx.fillStyle = "#71717a";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("IPL Season", W / 2, PAD);

    ctx.fillStyle = "#fafafa";
    ctx.font = "bold 42px system-ui, sans-serif";
    ctx.fillText(seasonData.year, W / 2, PAD + 18);

    ctx.fillStyle = champColor;
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.fillText(`🏆 ${seasonData.champion}`, W / 2, PAD + 72);

    const infoY = PAD + 104;
    ctx.fillStyle = "#3f3f46";
    ctx.beginPath();
    ctx.roundRect(PAD, infoY, W - PAD * 2, 70, 8);
    ctx.fill();

    const col1 = PAD + (W - PAD * 2) / 3;
    const col2 = PAD + ((W - PAD * 2) * 2) / 3;
    const col3 = W - PAD;

    ctx.textAlign = "center";
    ctx.fillStyle = "#71717a";
    ctx.font = "10px system-ui, sans-serif";
    ctx.fillText("Matches", (PAD + col1) / 2, infoY + 14);
    ctx.fillText("Top Scorer", (col1 + col2) / 2, infoY + 14);
    ctx.fillText("Top Wickets", (col2 + col3) / 2, infoY + 14);

    ctx.fillStyle = "#e4e4e7";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.fillText(String(seasonData.totalMatches), (PAD + col1) / 2, infoY + 34);
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText(seasonData.topScorer.name, (col1 + col2) / 2, infoY + 32);
    ctx.fillText(seasonData.topWicketTaker.name, (col2 + col3) / 2, infoY + 32);

    ctx.fillStyle = "#71717a";
    ctx.font = "10px system-ui, sans-serif";
    ctx.fillText(`${seasonData.topScorer.runs} runs`, (col1 + col2) / 2, infoY + 52);
    ctx.fillText(`${seasonData.topWicketTaker.wickets} wkts`, (col2 + col3) / 2, infoY + 52);
  }

  function drawBarRaceCard(ctx: CanvasRenderingContext2D, h: number) {
    if (!barRaceData) return;

    ctx.fillStyle = "#71717a";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Top Run Scorers", PAD, PAD);

    ctx.fillStyle = "#fafafa";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.fillText(`IPL ${barRaceData.season}`, PAD, PAD + 18);

    const entries = barRaceData.entries.slice(0, 6);
    const maxRuns = Math.max(...entries.map((e) => e.runs), 1);
    const barStartY = PAD + 58;
    const barH = 22;
    const gap = 30;
    const maxBarW = W - PAD * 2 - 100;

    entries.forEach((entry, i) => {
      const y = barStartY + i * gap;
      const barW = (entry.runs / maxRuns) * maxBarW;
      const color = getColor(entry.team);

      ctx.fillStyle = "#71717a";
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(entry.player, PAD, y + barH / 2);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(PAD + 90, y, barW, barH, 4);
      ctx.fill();

      ctx.fillStyle = "#e4e4e7";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(entry.runs.toLocaleString(), PAD + 94 + barW, y + barH / 2);
    });
  }

  useEffect(() => {
    draw();
  }, [draw]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let name = "card";
    if (type === "player" && playerData) {
      name = playerData.name.replace(/\s+/g, "-").toLowerCase();
    } else if (type === "matchup" && matchupData) {
      name = `${matchupData.team1}-vs-${matchupData.team2}`.replace(/\s+/g, "-").toLowerCase();
    } else if (type === "compare" && compareData) {
      name = `${compareData.player1.name}-vs-${compareData.player2.name}`.replace(/\s+/g, "-").toLowerCase();
    } else if (type === "season" && seasonData) {
      name = `ipl-${seasonData.year}`;
    } else if (type === "barRace" && barRaceData) {
      name = `top-scorers-${barRaceData.season}`;
    }

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
    (type === "player" && playerData) ||
    (type === "matchup" && matchupData) ||
    (type === "compare" && compareData) ||
    (type === "season" && seasonData) ||
    (type === "barRace" && barRaceData);

  if (!hasData) {
    return (
      <div className="flex h-[220px] w-full max-w-[400px] items-center justify-center rounded-xl border border-[#1a1a2e] bg-[#0c0c14] text-sm text-[#71717a]">
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
        style={{ width: W, maxWidth: "100%" }}
      >
        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt="Share card preview"
            className="block w-full h-auto"
          />
        ) : (
          <div
            className="w-full aspect-video"
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
