"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TEAM_COLORS: Record<string, string> = {
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

type SeasonRecap = {
  season: string;
  champion: string;
  totalMatches: number;
  topScorer: { name: string; runs: number };
  topWicketTaker: { name: string; wickets: number };
  mostSixes: { name: string; sixes: number };
  mostFours: { name: string; fours: number };
  highestScore: {
    name: string;
    runs: number;
    team: string;
    against: string;
    season: string;
  };
  teams: string[];
};

type SeasonRecapsData = Record<string, SeasonRecap>;

export default function SeasonIndexPage() {
  const [data, setData] = useState<SeasonRecapsData | null>(null);

  useEffect(() => {
    fetch("/data/season-recaps.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Seasons</h1>
        <div className="rounded-lg border border-card-border bg-card p-8 text-center text-muted">
          Loading…
        </div>
      </div>
    );
  }

  const years = Object.keys(data)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
        IPL Seasons
      </h1>
      <p className="mb-8 text-muted">
        Browse season recaps from {Math.min(...years)} to {Math.max(...years)}.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {years.map((year) => {
          const recap = data[String(year)];
          const championColor = TEAM_COLORS[recap.champion] ?? "#71717a";
          return (
            <Link
              key={year}
              href={`/season/${year}`}
              className="rounded-lg border border-card-border bg-card p-4 transition-colors hover:border-white/20 hover:bg-white/5"
            >
              <div className="text-2xl font-bold text-foreground">{year}</div>
              <div
                className="mt-1 text-sm font-medium"
                style={{ color: championColor }}
              >
                {recap.champion}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
