import { readFileSync } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { parseTeamsFromSlug, generateAllMatchSlugs, TEAM_TO_SLUG } from "@/lib/match-utils";
import { TEAM_COLORS, TEAM_SHORT, ACTIVE_TEAMS } from "@/lib/team-colors";
import { MatchShare } from "./match-share";

interface Matchup {
  team1: string;
  team2: string;
  team1Wins: number;
  team2Wins: number;
  noResult: number;
  totalMatches: number;
  seasons: string[];
}

interface TeamSeason {
  team: string;
  season: string;
  matches: number;
  wins: number;
  losses: number;
  noResult: number;
  topScorer: string;
  topScorerRuns: number;
  topWicketTaker: string;
  topWicketTakerWickets: number;
}

interface PlayerSeason {
  season: string;
  team: string;
  matches: number;
  runs: number;
  ballsFaced: number;
  wickets: number;
  strikeRate: number;
  economyRate: number;
  playerOfMatch: number;
}

interface Player {
  name: string;
  seasons: PlayerSeason[];
}

function getData() {
  const read = (f: string) => JSON.parse(readFileSync(path.join(process.cwd(), `public/data/${f}`), "utf-8"));
  return {
    matchups: read("matchups.json") as Matchup[],
    teams: read("teams.json") as TeamSeason[],
    players: read("players.json") as Player[],
  };
}

export async function generateStaticParams() {
  return generateAllMatchSlugs().map((teams) => ({ teams }));
}

export async function generateMetadata({ params }: { params: Promise<{ teams: string }> }) {
  const { teams } = await params;
  const parsed = parseTeamsFromSlug(teams);
  if (!parsed) return { title: "Match Not Found" };

  const { team1, team2 } = parsed;
  const s1 = TEAM_SHORT[team1] ?? team1;
  const s2 = TEAM_SHORT[team2] ?? team2;

  const { matchups } = getData();
  const matchup = matchups.find(
    (m) => (m.team1 === team1 && m.team2 === team2) || (m.team1 === team2 && m.team2 === team1)
  );
  const total = matchup?.totalMatches ?? 0;

  const title = `${s1} vs ${s2} — Head to Head Stats, IPL Record & Match Preview`;
  const description = `${team1} vs ${team2} IPL head-to-head: ${total} matches played. Complete rivalry stats, recent form, key players, and match preview. ${s1} vs ${s2} all-time IPL record.`;

  return {
    title,
    description,
    keywords: [
      `${s1} vs ${s2}`,
      `${s2} vs ${s1}`,
      `${s1} vs ${s2} head to head`,
      `${s1} vs ${s2} IPL`,
      `${s1} vs ${s2} stats`,
      `${s1} vs ${s2} record`,
      `${team1} vs ${team2}`,
      `${team2} vs ${team1}`,
      `${s1} vs ${s2} IPL 2026`,
      `${s1} vs ${s2} match prediction`,
      "IPL head to head",
      "IPL stats",
      "IPL match preview",
    ],
    alternates: { canonical: `https://iplens.in/match/${teams}` },
    openGraph: {
      title: `${s1} vs ${s2} — IPL Head to Head`,
      description,
      url: `https://iplens.in/match/${teams}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${s1} vs ${s2} — IPL Match Preview`,
      description,
    },
  };
}

export default async function MatchPage({ params }: { params: Promise<{ teams: string }> }) {
  const { teams } = await params;
  const parsed = parseTeamsFromSlug(teams);
  if (!parsed) notFound();

  const { team1, team2 } = parsed;
  const s1 = TEAM_SHORT[team1] ?? team1;
  const s2 = TEAM_SHORT[team2] ?? team2;
  const c1 = TEAM_COLORS[team1] ?? "#666";
  const c2 = TEAM_COLORS[team2] ?? "#666";

  const { matchups, teams: teamSeasons, players } = getData();

  const matchup = matchups.find(
    (m) => (m.team1 === team1 && m.team2 === team2) || (m.team1 === team2 && m.team2 === team1)
  );

  const t1Wins = matchup ? (matchup.team1 === team1 ? matchup.team1Wins : matchup.team2Wins) : 0;
  const t2Wins = matchup ? (matchup.team1 === team1 ? matchup.team2Wins : matchup.team1Wins) : 0;
  const total = matchup?.totalMatches ?? 0;

  const latestSeason = "2025";
  const t1Form = teamSeasons.filter((t) => t.team === team1).sort((a, b) => b.season.localeCompare(a.season)).slice(0, 3);
  const t2Form = teamSeasons.filter((t) => t.team === team2).sort((a, b) => b.season.localeCompare(a.season)).slice(0, 3);

  const getKeyPlayers = (team: string) => {
    return players
      .filter((p) => p.seasons.some((s) => s.team === team && s.season === latestSeason))
      .map((p) => {
        const latest = p.seasons.find((s) => s.team === team && s.season === latestSeason)!;
        const totalRuns = p.seasons.reduce((sum, s) => sum + s.runs, 0);
        const totalWickets = p.seasons.reduce((sum, s) => sum + s.wickets, 0);
        return { name: p.name, runs: latest.runs, wickets: latest.wickets, sr: latest.strikeRate, totalRuns, totalWickets, matches: latest.matches };
      })
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5);
  };

  const t1Players = getKeyPlayers(team1);
  const t2Players = getKeyPlayers(team2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${team1} vs ${team2} — IPL`,
    url: `https://iplens.in/match/${teams}`,
    sport: "Cricket",
    description: `IPL head-to-head: ${team1} vs ${team2}. ${total} matches played, ${t1Wins}-${t2Wins} record.`,
    competitor: [
      { "@type": "SportsTeam", name: team1 },
      { "@type": "SportsTeam", name: team2 },
    ],
  };

  const otherTeams = ACTIVE_TEAMS.filter((t) => t !== team1 && t !== team2);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">
            IPL Match Preview
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold sm:text-5xl" style={{ color: c1 }}>{s1}</div>
              <div className="mt-1 text-sm text-muted">{team1}</div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-muted">vs</span>
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold sm:text-5xl" style={{ color: c2 }}>{s2}</div>
              <div className="mt-1 text-sm text-muted">{team2}</div>
            </div>
          </div>
          <div className="mt-4">
            <MatchShare
              team1={team1}
              team2={team2}
              team1Wins={t1Wins}
              team2Wins={t2Wins}
              totalMatches={total}
            />
          </div>
        </div>

        {/* H2H Record */}
        {matchup && (
          <div className="mb-8 rounded-xl border border-card-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Head to Head Record</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold" style={{ color: c1 }}>{t1Wins}</div>
                <div className="text-xs text-muted">{s1} wins</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">{total}</div>
                <div className="text-xs text-muted">matches</div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: c2 }}>{t2Wins}</div>
                <div className="text-xs text-muted">{s2} wins</div>
              </div>
            </div>
            {total > 0 && (
              <div className="mt-4">
                <div className="flex h-3 overflow-hidden rounded-full">
                  <div style={{ width: `${(t1Wins / total) * 100}%`, backgroundColor: c1 }} />
                  {matchup.noResult > 0 && (
                    <div style={{ width: `${(matchup.noResult / total) * 100}%`, backgroundColor: "#333" }} />
                  )}
                  <div style={{ width: `${(t2Wins / total) * 100}%`, backgroundColor: c2 }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>{total > 0 ? ((t1Wins / total) * 100).toFixed(0) : 0}%</span>
                  <span>{total > 0 ? ((t2Wins / total) * 100).toFixed(0) : 0}%</span>
                </div>
              </div>
            )}
            {matchup.seasons.length > 0 && (
              <div className="mt-4 text-xs text-muted">
                Seasons played: {matchup.seasons.join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Recent Form */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <FormCard team={team1} short={s1} color={c1} form={t1Form} />
          <FormCard team={team2} short={s2} color={c2} form={t2Form} />
        </div>

        {/* Key Players */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <PlayersCard team={team1} short={s1} color={c1} players={t1Players} />
          <PlayersCard team={team2} short={s2} color={c2} players={t2Players} />
        </div>

        {/* Quick Links */}
        <div className="mb-8 rounded-xl border border-card-border bg-card p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            More matchups
          </h3>
          <div className="flex flex-wrap gap-2">
            {otherTeams.map((t) => {
              const slug1 = TEAM_TO_SLUG[team1];
              const tSlug = TEAM_TO_SLUG[t];
              const href = slug1 < tSlug ? `/match/${slug1}-vs-${tSlug}` : `/match/${tSlug}-vs-${slug1}`;
              return (
                <Link
                  key={t}
                  href={href}
                  className="rounded-full border border-card-border px-3 py-1 text-xs text-muted transition-colors hover:border-white/20 hover:text-foreground"
                >
                  {s1} vs {TEAM_SHORT[t] ?? t}
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA to full H2H page */}
        <div className="text-center">
          <Link
            href="/head-to-head"
            className="inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-sm text-muted transition-colors hover:border-white/20 hover:text-foreground"
          >
            Explore all rivalries →
          </Link>
        </div>
      </div>
    </>
  );
}

function FormCard({
  team,
  short,
  color,
  form,
}: {
  team: string;
  short: string;
  color: string;
  form: TeamSeason[];
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold" style={{ color }}>
        {short} — Recent Form
      </h3>
      {form.length === 0 ? (
        <p className="text-xs text-muted">No recent data</p>
      ) : (
        <div className="space-y-3">
          {form.map((s) => (
            <div key={s.season} className="flex items-center justify-between">
              <span className="text-xs text-muted">{s.season}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs">
                  <span className="font-semibold text-foreground">{s.wins}W</span>
                  <span className="text-muted">-</span>
                  <span className="text-foreground">{s.losses}L</span>
                </span>
                <span className="text-[10px] text-muted">{s.matches} played</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayersCard({
  team,
  short,
  color,
  players,
}: {
  team: string;
  short: string;
  color: string;
  players: { name: string; runs: number; wickets: number; sr: number; totalRuns: number; totalWickets: number; matches: number }[];
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold" style={{ color }}>
        {short} — Key Players <span className="text-xs font-normal text-muted">(2025)</span>
      </h3>
      {players.length === 0 ? (
        <p className="text-xs text-muted">No player data</p>
      ) : (
        <div className="space-y-2">
          {players.map((p) => (
            <Link
              key={p.name}
              href={`/player/${encodeURIComponent(p.name)}`}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/5"
            >
              <span className="font-medium text-foreground">{p.name}</span>
              <div className="flex gap-3 text-muted">
                {p.runs > 0 && <span>{p.runs} runs</span>}
                {p.wickets > 0 && <span>{p.wickets} wkts</span>}
                <span>SR {p.sr.toFixed(0)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
