"use client";

import { BentoCard } from "@/components/bento-card";
import { BarRace } from "@/components/bar-race";
import { SankeyDiagram } from "@/components/sankey-diagram";
import { HeadToHead } from "@/components/head-to-head";
import { PlayerTimeline } from "@/components/player-timeline";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

        {/* Head to Head */}
        <BentoCard
          title="MI vs CSK"
          subtitle="The greatest IPL rivalry"
          href="/head-to-head"
          className="min-h-[200px]"
          glowColor="#FDB913"
        >
          {mounted && (
            <div className="flex h-full items-center justify-center">
              <HeadToHead
                mini
                presetTeam1="Mumbai Indians"
                presetTeam2="Chennai Super Kings"
              />
            </div>
          )}
        </BentoCard>

        {/* Player Timeline */}
        <BentoCard
          title="Player Journey"
          subtitle="Career across seasons"
          href="/player/V Kohli"
          className="min-h-[180px]"
          glowColor="#EC1C24"
        >
          {mounted && <PlayerTimeline playerName="V Kohli" mini />}
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
