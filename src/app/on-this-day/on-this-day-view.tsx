"use client";

import { useEffect, useState, useMemo } from "react";

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

type Match = {
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

type OnThisDayData = Record<string, Match[]>;

function getMMDD(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}-${day}`;
}

function formatDisplayDate(mmdd: string): string {
  const [m, d] = mmdd.split("-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${monthNames[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

function findClosestDateWithMatches(data: OnThisDayData, targetMMDD: string): string | null {
  const keys = Object.keys(data)
    .filter((k) => data[k]?.length)
    .sort();
  if (keys.length === 0) return null;
  if (data[targetMMDD]?.length) return targetMMDD;
  const [tm, td] = targetMMDD.split("-").map(Number);
  const targetOrd = tm * 31 + td;
  let best = keys[0];
  let bestDist = Infinity;
  for (const k of keys) {
    const [km, kd] = k.split("-").map(Number);
    const kOrd = km * 31 + kd;
    let dist = Math.abs(kOrd - targetOrd);
    if (dist > 183) dist = 365 - dist;
    if (dist < bestDist) {
      bestDist = dist;
      best = k;
    }
  }
  return best;
}

function getNearbyDates(mmdd: string, data: OnThisDayData, count = 3): string[] {
  const keys = Object.keys(data)
    .filter((k) => data[k]?.length)
    .sort();
  const [m, d] = mmdd.split("-").map(Number);
  const ord = m * 31 + d;
  const withDist = keys.map((k) => {
    const [km, kd] = k.split("-").map(Number);
    const kOrd = km * 31 + kd;
    let dist = Math.abs(kOrd - ord);
    if (kOrd < ord) dist = 366 - dist;
    return { k, dist };
  });
  withDist.sort((a, b) => a.dist - b.dist);
  return withDist.slice(0, count).map((x) => x.k);
}

export default function OnThisDayView() {
  const [data, setData] = useState<OnThisDayData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  useEffect(() => {
    fetch("/data/on-this-day.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const mmdd = useMemo(() => {
    const [y, m, d] = selectedDate.split("-");
    return `${m}-${d}`;
  }, [selectedDate]);

  const matches = useMemo(() => {
    if (!data) return [];
    const m = data[mmdd];
    if (m?.length) return m;
    const closest = findClosestDateWithMatches(data, mmdd);
    return closest ? data[closest] ?? [] : [];
  }, [data, mmdd]);

  const effectiveMMDD = useMemo(() => {
    if (!data) return mmdd;
    if (data[mmdd]?.length) return mmdd;
    return findClosestDateWithMatches(data, mmdd) ?? mmdd;
  }, [data, mmdd]);

  const nearbyDates = useMemo(() => {
    if (!data) return [];
    return getNearbyDates(mmdd, data);
  }, [data, mmdd]);

  const hasMatchesOnSelected = data ? (data[mmdd]?.length ?? 0) > 0 : false;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          On This Day in IPL
        </h1>
        <p className="mt-1 text-lg text-muted">
          {formatDisplayDate(effectiveMMDD)}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-muted">
          Pick a date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border border-card-border bg-card px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
      </div>

      {!data ? (
        <div className="rounded-lg border border-card-border bg-card p-8 text-center text-muted">
          Loading…
        </div>
      ) : !hasMatchesOnSelected && matches.length === 0 ? (
        <div className="rounded-lg border border-card-border bg-card p-8 text-center">
          <p className="text-foreground">No IPL matches on this date. Try another!</p>
          {nearbyDates.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {nearbyDates.map((d) => {
                const [m, day] = d.split("-");
                const year = new Date().getFullYear();
                const fullDate = `${year}-${m}-${day}`;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(fullDate)}
                    className="rounded-md border border-card-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-blue-500 hover:bg-white/5"
                  >
                    {formatDisplayDate(d)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {!hasMatchesOnSelected && (
            <p className="mb-4 text-sm text-muted">
              No matches on {formatDisplayDate(mmdd)}. Showing closest date with matches:{" "}
              {formatDisplayDate(effectiveMMDD)}
            </p>
          )}
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard key={match.matchId} match={match} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const winnerColor = TEAM_COLORS[match.winner] ?? "#71717a";
  const team1Color = TEAM_COLORS[match.team1] ?? "#71717a";
  const team2Color = TEAM_COLORS[match.team2] ?? "#71717a";

  return (
    <div className="rounded-lg border border-card-border bg-card p-4 transition-colors hover:border-white/20">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-foreground">
          {match.season}
        </span>
        <span className="text-xs text-muted">{match.date}</span>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-base">
        <span style={{ color: team1Color }}>{match.team1}</span>
        <span className="text-muted">vs</span>
        <span style={{ color: team2Color }}>{match.team2}</span>
      </div>
      <div className="mb-1">
        <span className="font-bold" style={{ color: winnerColor }}>
          {match.winner}
        </span>
        <span className="text-muted"> won by {match.winOutcome}</span>
      </div>
      <div className="text-sm text-muted">
        {match.venue} · Player of the match: {match.playerOfMatch}
      </div>
    </div>
  );
}
