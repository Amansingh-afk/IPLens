"use client";

import { BentoCard } from "@/components/bento-card";
import { BarRace } from "@/components/bar-race";
import { SankeyDiagram } from "@/components/sankey-diagram";
import { HeadToHead } from "@/components/head-to-head";
import { PlayerTimeline } from "@/components/player-timeline";
import { useEffect, useState, useCallback } from "react";

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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [rivalryIdx, setRivalryIdx] = useState(0);
  const [playerFading, setPlayerFading] = useState(false);
  const [rivalryFading, setRivalryFading] = useState(false);

  useEffect(() => setMounted(true), []);

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
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
              <span className="inline-block h-4 w-4 rounded-full bg-amber-500" />
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
            </div>
            <div className="text-xs text-muted">
              291 nodes · 2,853 edges
            </div>
            <div className="text-xs text-muted">
              Explore connections across 18 seasons
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
      </div>
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
