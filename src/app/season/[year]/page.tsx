import { readFileSync } from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  "Deccan Chargers": "#5C7A99",
  "Kochi Tuskers Kerala": "#6B4E3D",
  "Pune Warriors": "#6E7B8B",
  "Rising Pune Supergiant": "#6E7B8B",
  "Gujarat Lions": "#E04F16",
};

interface SeasonRecap {
  season: string;
  champion: string;
  totalMatches: number;
  topScorer: { name: string; runs: number };
  topWicketTaker: { name: string; wickets: number };
  mostSixes: { name: string; sixes: number };
  mostFours: { name: string; fours: number };
  highestScore: { name: string; runs: number; team: string; against: string };
  teams: string[];
}

function getData(): Record<string, SeasonRecap> {
  const filePath = path.join(process.cwd(), "public/data/season-recaps.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function generateStaticParams() {
  const data = getData();
  return Object.keys(data).map((year) => ({ year }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  return {
    title: `IPL ${year} Season Recap — IPLens`,
    description: `Complete stats and recap of IPL season ${year}`,
  };
}

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const data = getData();
  const recap = data[year];

  if (!recap) notFound();

  const years = Object.keys(data).sort();
  const idx = years.indexOf(year);
  const prevYear = idx > 0 ? years[idx - 1] : null;
  const nextYear = idx < years.length - 1 ? years[idx + 1] : null;
  const champColor = TEAM_COLORS[recap.champion] || "#666";

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        {prevYear ? (
          <Link
            href={`/season/${prevYear}`}
            className="rounded-md border border-card-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            ← {prevYear}
          </Link>
        ) : (
          <div />
        )}
        {nextYear ? (
          <Link
            href={`/season/${nextYear}`}
            className="rounded-md border border-card-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            {nextYear} →
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="mb-10 text-center">
        <h1 className="text-7xl font-bold tracking-tight text-foreground">
          {year}
        </h1>
        <div className="mt-4 text-xl font-semibold" style={{ color: champColor }}>
          🏆 {recap.champion}
        </div>
        <p className="mt-1 text-sm text-muted">
          {recap.totalMatches} matches played
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Top Scorer"
          value={recap.topScorer.name}
          sub={`${recap.topScorer.runs} runs`}
        />
        <StatCard
          label="Top Wicket Taker"
          value={recap.topWicketTaker.name}
          sub={`${recap.topWicketTaker.wickets} wickets`}
        />
        <StatCard
          label="Most Sixes"
          value={recap.mostSixes.name}
          sub={`${recap.mostSixes.sixes} sixes`}
        />
        <StatCard
          label="Most Fours"
          value={recap.mostFours.name}
          sub={`${recap.mostFours.fours} fours`}
        />
        <StatCard
          label="Highest Individual Score"
          value={recap.highestScore.name}
          sub={`${recap.highestScore.runs} runs vs ${recap.highestScore.against || "—"}`}
        />
        <StatCard
          label="Total Matches"
          value={String(recap.totalMatches)}
          sub={`${recap.teams.length} teams`}
        />
      </div>

      <div className="rounded-xl border border-card-border bg-card p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Teams
        </h3>
        <div className="flex flex-wrap gap-2">
          {recap.teams.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-card-border px-3 py-1 text-sm"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: TEAM_COLORS[t] || "#666" }}
              />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 text-lg font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}
