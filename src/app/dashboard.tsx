"use client";

import { BentoCard } from "@/components/bento-card";
import { BarRace } from "@/components/bar-race";
import { SankeyDiagram } from "@/components/sankey-diagram";
import { HeadToHead } from "@/components/head-to-head";
import { PlayerTimeline } from "@/components/player-timeline";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSupportAction } from "@/components/support-modal";

const OTD_TEAM_COLORS: Record<string, string> = {
  "Mumbai Indians": "#004BA0",
  "Chennai Super Kings": "#FDB913",
  "Royal Challengers Bengaluru": "#EC1C24",
  "Kolkata Knight Riders": "#3A225D",
  "Delhi Capitals": "#004C93",
  "Rajasthan Royals": "#EA1A85",
  "Sunrisers Hyderabad": "#FF822A",
  "Punjab Kings": "#DD1F2D",
  "Gujarat Titans": "#1C1C2B",
  "Lucknow Super Giants": "#A72056",
  "Deccan Chargers": "#FF6600",
  "Kochi Tuskers Kerala": "#8B4513",
  "Pune Warriors": "#2E8B57",
  "Gujarat Lions": "#FF6B35",
  "Rising Pune Supergiant": "#2E8B57",
};

type OTDMatch = {
  matchId: string;
  season: string;
  date: string;
  team1: string;
  team2: string;
  winner: string;
  winOutcome: string;
  venue: string;
  playerOfMatch: string;
};

const FEATURED_PLAYERS = [
  { name: "V Kohli", color: "#EC1C24" },
  { name: "MS Dhoni", color: "#FDB913" },
  { name: "RG Sharma", color: "#004BA0" },
  { name: "AB de Villiers", color: "#EC1C24" },
  { name: "DA Warner", color: "#FF822A" },
  { name: "CH Gayle", color: "#3A225D" },
  { name: "S Dhawan", color: "#004C93" },
  { name: "JJ Bumrah", color: "#004BA0" },
  { name: "SP Narine", color: "#3A225D" },
];

const FEATURED_RIVALRIES = [
  { team1: "Mumbai Indians", team2: "Chennai Super Kings", label: "MI vs CSK", color: "#FDB913" },
  { team1: "Royal Challengers Bengaluru", team2: "Mumbai Indians", label: "RCB vs MI", color: "#EC1C24" },
  { team1: "Kolkata Knight Riders", team2: "Chennai Super Kings", label: "KKR vs CSK", color: "#3A225D" },
  { team1: "Delhi Capitals", team2: "Mumbai Indians", label: "DC vs MI", color: "#004C93" },
  { team1: "Rajasthan Royals", team2: "Chennai Super Kings", label: "RR vs CSK", color: "#EA1A85" },
  { team1: "Sunrisers Hyderabad", team2: "Royal Challengers Bengaluru", label: "SRH vs RCB", color: "#FF822A" },
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [rivalryIdx, setRivalryIdx] = useState(0);
  const [playerFading, setPlayerFading] = useState(false);
  const [rivalryFading, setRivalryFading] = useState(false);

  const handleSupport = useSupportAction();
  const [otdMatches, setOtdMatches] = useState<OTDMatch[]>([]);
  const [otdLabel, setOtdLabel] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch("/data/on-this-day.json")
      .then((r) => r.json())
      .then((data: Record<string, OTDMatch[]>) => {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const key = `${mm}-${dd}`;
        const monthNames = [
          "January","February","March","April","May","June",
          "July","August","September","October","November","December",
        ];

        if (data[key]?.length) {
          setOtdMatches(data[key]);
          setOtdLabel(`${monthNames[now.getMonth()]} ${now.getDate()}`);
        } else {
          const keys = Object.keys(data).filter((k) => data[k]?.length).sort();
          const ord = (now.getMonth() + 1) * 31 + now.getDate();
          let best = keys[0];
          let bestDist = Infinity;
          for (const k of keys) {
            const [km, kd] = k.split("-").map(Number);
            const kOrd = km * 31 + kd;
            let dist = Math.abs(kOrd - ord);
            if (dist > 183) dist = 365 - dist;
            if (dist < bestDist) { bestDist = dist; best = k; }
          }
          if (best) {
            setOtdMatches(data[best] ?? []);
            const [bm, bd] = best.split("-").map(Number);
            setOtdLabel(`${monthNames[bm - 1]} ${bd}`);
          }
        }
      });
  }, []);

  const cyclePlayer = useCallback(() => {
    setPlayerFading(true);
    setTimeout(() => {
      setPlayerIdx((i) => (i + 1) % FEATURED_PLAYERS.length);
      setPlayerFading(false);
    }, 300);
  }, []);

  const cycleRivalry = useCallback(() => {
    setRivalryFading(true);
    setTimeout(() => {
      setRivalryIdx((i) => (i + 1) % FEATURED_RIVALRIES.length);
      setRivalryFading(false);
    }, 300);
  }, []);

  useEffect(() => {
    const playerTimer = setInterval(cyclePlayer, 5000);
    return () => clearInterval(playerTimer);
  }, [cyclePlayer]);

  useEffect(() => {
    const rivalryTimer = setInterval(cycleRivalry, 6000);
    return () => clearInterval(rivalryTimer);
  }, [cycleRivalry]);

  const currentPlayer = FEATURED_PLAYERS[playerIdx];
  const currentRivalry = FEATURED_RIVALRIES[rivalryIdx];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          IPL<span className="text-blue-400">ens</span>
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted">
          17 years of IPL cricket — visualized. Explore player journeys,
          franchise transfers, team rivalries, and the all-time run chase.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Hero — Bar Race */}
        <BentoCard
          title="All-Time Top Scorers"
          subtitle="Cumulative runs across seasons"
          href="/bar-race"
          className="md:col-span-2 min-h-[380px]"
          glowColor="#3b82f6"
        >
          {mounted && <BarRace mini maxBars={10} />}
        </BentoCard>

        {/* On This Day */}
        {otdMatches.length > 0 && (
          <div className="md:col-span-2 rounded-xl border border-card-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">On This Day — {otdLabel}</h2>
                <p className="text-xs text-muted">{otdMatches.length} match{otdMatches.length > 1 ? "es" : ""} played across IPL history</p>
              </div>
              <Link
                href="/on-this-day"
                className="rounded-md border border-card-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-blue-500 hover:text-foreground"
              >
                See all dates →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otdMatches.slice(0, 6).map((match) => {
                const winColor = OTD_TEAM_COLORS[match.winner] ?? "#71717a";
                return (
                  <div
                    key={match.matchId}
                    className="rounded-lg border border-card-border bg-background p-3 transition-colors hover:border-white/20"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium">{match.season}</span>
                    </div>
                    <div className="mb-1 text-sm">
                      <span style={{ color: OTD_TEAM_COLORS[match.team1] ?? "#71717a" }}>{match.team1}</span>
                      <span className="text-muted"> vs </span>
                      <span style={{ color: OTD_TEAM_COLORS[match.team2] ?? "#71717a" }}>{match.team2}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold" style={{ color: winColor }}>{match.winner}</span>
                      <span className="text-muted"> won by {match.winOutcome}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {otdMatches.length > 6 && (
              <div className="mt-3 text-center">
                <Link href="/on-this-day" className="text-xs text-muted hover:text-foreground">
                  +{otdMatches.length - 6} more matches →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Sankey */}
        <BentoCard
          title="Player Transfers"
          subtitle="Movement between franchises"
          href="/sankey"
          className="min-h-[300px]"
          glowColor="#a855f7"
        >
          {mounted && <SankeyDiagram mini />}
        </BentoCard>

        {/* Head to Head — rotating rivalries */}
        <BentoCard
          title={currentRivalry.label}
          subtitle="Tap to see all rivalries"
          href="/head-to-head"
          className="min-h-[200px]"
          glowColor={currentRivalry.color}
        >
          {mounted && (
            <div
              className={`flex h-full items-center justify-center transition-opacity duration-300 ${
                rivalryFading ? "opacity-0" : "opacity-100"
              }`}
            >
              <HeadToHead
                mini
                presetTeam1={currentRivalry.team1}
                presetTeam2={currentRivalry.team2}
                key={`${currentRivalry.team1}-${currentRivalry.team2}`}
              />
            </div>
          )}
        </BentoCard>

        {/* Knowledge Graph */}
        <BentoCard
          title="Knowledge Graph"
          subtitle="Players, teams, seasons — all connected"
          href="/graph"
          className="min-h-[180px]"
          glowColor="#8b5cf6"
        >
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="relative h-16 w-32">
              {/* Orbiting dots animation */}
              <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/80" />
              <span className="absolute h-3 w-3 rounded-full bg-blue-500 animate-[orbit_4s_linear_infinite]" style={{ offsetPath: "path('M 64,32 m -28,0 a 28,28 0 1,1 56,0 a 28,28 0 1,1 -56,0')", offsetDistance: "0%" }} />
              <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500 animate-[orbit_5s_linear_infinite]" style={{ offsetPath: "path('M 64,32 m -20,0 a 20,20 0 1,1 40,0 a 20,20 0 1,1 -40,0')", offsetDistance: "33%" }} />
              <span className="absolute h-2 w-2 rounded-full bg-violet-500 animate-[orbit_3s_linear_infinite]" style={{ offsetPath: "path('M 64,32 m -36,0 a 36,24 0 1,1 72,0 a 36,24 0 1,1 -72,0')", offsetDistance: "66%" }} />
              <span className="absolute h-2 w-2 rounded-full bg-red-500 animate-[orbit_6s_linear_infinite]" style={{ offsetPath: "path('M 64,32 m -32,0 a 32,18 0 1,1 64,0 a 32,18 0 1,1 -64,0')", offsetDistance: "50%" }} />
            </div>
            <div className="text-xs text-muted">
              291 nodes · 2,853 edges
            </div>
          </div>
        </BentoCard>

        {/* Player Timeline — rotating players */}
        <BentoCard
          title={currentPlayer.name}
          subtitle="Player journey across seasons"
          href={`/player/${encodeURIComponent(currentPlayer.name)}`}
          className="min-h-[180px]"
          glowColor={currentPlayer.color}
        >
          {mounted && (
            <div
              className={`h-full transition-opacity duration-300 ${
                playerFading ? "opacity-0" : "opacity-100"
              }`}
            >
              <PlayerTimeline
                playerName={currentPlayer.name}
                mini
                key={currentPlayer.name}
              />
            </div>
          )}
        </BentoCard>

        {/* Stats overview */}
        <BentoCard
          title="Quick Stats"
          subtitle="Dataset at a glance"
          href="/bar-race"
          className="min-h-[180px]"
          glowColor="#22c55e"
        >
          <div className="grid grid-cols-2 gap-3 pt-2">
            <QuickStat label="Matches" value="1,169" />
            <QuickStat label="Seasons" value="18" />
            <QuickStat label="Players" value="767" />
            <QuickStat label="Deliveries" value="278K" />
          </div>
        </BentoCard>

        {/* Fantasy Cricket CTA */}
        <a
          href="https://www.dream11.com"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card p-5 transition-all duration-300 hover:border-white/20 hover:scale-[1.01] min-h-[180px]"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: "radial-gradient(600px circle at 50% 50%, #22c55e10, transparent 40%)",
            }}
          />
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Play Fantasy Cricket</h3>
              <p className="mt-0.5 text-xs text-muted">Put your IPL knowledge to the test</p>
            </div>
            <span className="text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
              Play →
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="text-xs text-muted max-w-48">
              Think you know who&apos;ll score big tonight? Back your stats with fantasy picks.
            </p>
          </div>
        </a>
      </div>

      <footer className="mt-12 border-t border-card-border pt-8 pb-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted">
              Built by cricket nerds, for cricket nerds.
            </p>
            <button
              onClick={handleSupport}
              className="inline-flex items-center gap-2 rounded-lg border border-pink-500/30 bg-pink-500/5 px-4 py-2 text-sm font-medium text-pink-400 transition-all hover:border-pink-500/50 hover:bg-pink-500/10 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Support IPLens
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted/60">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Analytics active
            </span>
            <span>&middot;</span>
            <span>Built with Next.js</span>
            <span>&middot;</span>
            <a
              href="https://github.com/Amansingh-afk/IPLens"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
