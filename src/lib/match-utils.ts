import { ACTIVE_TEAMS, TEAM_SHORT } from "./team-colors";

const SLUG_TO_TEAM: Record<string, string> = {};
const TEAM_TO_SLUG: Record<string, string> = {};

for (const team of ACTIVE_TEAMS) {
  const slug = (TEAM_SHORT[team] ?? team.slice(0, 3)).toLowerCase();
  SLUG_TO_TEAM[slug] = team;
  TEAM_TO_SLUG[team] = slug;
}

export { SLUG_TO_TEAM, TEAM_TO_SLUG };

export function parseTeamsFromSlug(teams: string): { team1: string; team2: string } | null {
  const match = teams.match(/^([a-z]+)-vs-([a-z]+)$/);
  if (!match) return null;
  const t1 = SLUG_TO_TEAM[match[1]];
  const t2 = SLUG_TO_TEAM[match[2]];
  if (!t1 || !t2 || t1 === t2) return null;
  return { team1: t1, team2: t2 };
}

export function generateAllMatchSlugs(): string[] {
  const slugs: string[] = [];
  for (let i = 0; i < ACTIVE_TEAMS.length; i++) {
    for (let j = i + 1; j < ACTIVE_TEAMS.length; j++) {
      const s1 = TEAM_TO_SLUG[ACTIVE_TEAMS[i]];
      const s2 = TEAM_TO_SLUG[ACTIVE_TEAMS[j]];
      slugs.push(`${s1}-vs-${s2}`);
    }
  }
  return slugs;
}
