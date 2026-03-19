import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { parse } from "csv-parse/sync";

const csv = readFileSync("IPL.csv", "utf-8");
const rows = parse(csv, { columns: true, skip_empty_lines: true });

mkdirSync("public/data", { recursive: true });

function normalizeSeason(s) {
  if (s.includes("/")) {
    const parts = s.split("/");
    return "20" + parts[1];
  }
  const n = parseInt(s);
  if (n >= 2007 && n <= 2030) return String(n);
  return null;
}

const CANONICAL = {
  "Delhi Daredevils": "Delhi Capitals",
  "Kings XI Punjab": "Punjab Kings",
  "Royal Challengers Bangalore": "Royal Challengers Bengaluru",
  "Rising Pune Supergiants": "Rising Pune Supergiant",
};

function canon(team) {
  return CANONICAL[team] ?? team;
}

// Filter to valid rows with parseable seasons
const data = rows
  .map((r) => ({ ...r, _season: normalizeSeason(r.season) }))
  .filter((r) => r._season !== null);

console.log(`Parsed ${data.length} deliveries`);

// ── Players ──
const playerMap = new Map();

for (const d of data) {
  const season = d._season;
  const batter = d.batter;
  const bowler = d.bowler;
  const batTeam = canon(d.batting_team);
  const bowlTeam = canon(d.bowling_team);
  const runsBatter = parseInt(d.runs_batter) || 0;
  const validBall = d.valid_ball === "1" || d.valid_ball === "True";
  const isWicket = d.wicket_kind && d.wicket_kind !== "";
  const playerOut = d.player_out || "";
  const pom = d.player_of_match || "";
  const matchId = d.match_id;

  // Batter stats
  const batKey = `${batter}|${season}`;
  if (!playerMap.has(batKey)) {
    playerMap.set(batKey, {
      name: batter,
      season,
      team: batTeam,
      runs: 0,
      ballsFaced: 0,
      wickets: 0,
      runsConceded: 0,
      ballsBowled: 0,
      catches: 0,
      matches: new Set(),
      pom: new Set(),
    });
  }
  const bp = playerMap.get(batKey);
  bp.runs += runsBatter;
  if (validBall) bp.ballsFaced += 1;
  bp.matches.add(matchId);
  if (pom === batter) bp.pom.add(matchId);

  // Bowler stats
  const bowlKey = `${bowler}|${season}`;
  if (!playerMap.has(bowlKey)) {
    playerMap.set(bowlKey, {
      name: bowler,
      season,
      team: bowlTeam,
      runs: 0,
      ballsFaced: 0,
      wickets: 0,
      runsConceded: 0,
      ballsBowled: 0,
      catches: 0,
      matches: new Set(),
      pom: new Set(),
    });
  }
  const bw = playerMap.get(bowlKey);
  bw.runsConceded += parseInt(d.runs_bowler) || 0;
  if (validBall) bw.ballsBowled += 1;
  if (isWicket && !["run out", "retired hurt", "retired out", "obstructing the field"].includes(d.wicket_kind)) {
    bw.wickets += 1;
  }
  bw.matches.add(matchId);
  if (pom === bowler) bw.pom.add(matchId);
}

const playersGrouped = new Map();
for (const [, v] of playerMap) {
  if (!playersGrouped.has(v.name)) playersGrouped.set(v.name, []);
  playersGrouped.get(v.name).push({
    season: v.season,
    team: v.team,
    matches: v.matches.size,
    runs: v.runs,
    ballsFaced: v.ballsFaced,
    wickets: v.wickets,
    runsConceded: v.runsConceded,
    ballsBowled: v.ballsBowled,
    catches: v.catches,
    strikeRate: v.ballsFaced > 0 ? +((v.runs / v.ballsFaced) * 100).toFixed(2) : 0,
    economyRate: v.ballsBowled > 0 ? +((v.runsConceded / v.ballsBowled) * 6).toFixed(2) : 0,
    playerOfMatch: v.pom.size,
  });
}

const players = [];
for (const [name, seasons] of playersGrouped) {
  seasons.sort((a, b) => parseInt(a.season) - parseInt(b.season));
  players.push({ name, seasons });
}
players.sort((a, b) => {
  const aRuns = a.seasons.reduce((s, x) => s + x.runs, 0);
  const bRuns = b.seasons.reduce((s, x) => s + x.runs, 0);
  return bRuns - aRuns;
});

writeFileSync("public/data/players.json", JSON.stringify(players));
console.log(`players.json: ${players.length} players`);

// ── Teams ──
const teamSeasonMap = new Map();
const matchWinners = new Map();

for (const d of data) {
  const matchId = d.match_id;
  if (!matchWinners.has(matchId)) {
    matchWinners.set(matchId, {
      season: d._season,
      winner: canon(d.match_won_by),
      teams: new Set(),
      result: d.result_type,
    });
  }
  matchWinners.get(matchId).teams.add(canon(d.batting_team));
  matchWinners.get(matchId).teams.add(canon(d.bowling_team));
}

for (const [, m] of matchWinners) {
  for (const team of m.teams) {
    const key = `${team}|${m.season}`;
    if (!teamSeasonMap.has(key)) {
      teamSeasonMap.set(key, { team, season: m.season, matches: 0, wins: 0, losses: 0, noResult: 0 });
    }
    const ts = teamSeasonMap.get(key);
    ts.matches += 1;
    if (m.result === "no result") ts.noResult += 1;
    else if (m.winner === team) ts.wins += 1;
    else ts.losses += 1;
  }
}

// Top scorer/bowler per team-season
const teamTopScorer = new Map();
const teamTopBowler = new Map();
for (const [, v] of playerMap) {
  const key = `${v.team}|${v.season}`;
  if (!teamTopScorer.has(key) || v.runs > teamTopScorer.get(key).runs) {
    teamTopScorer.set(key, { name: v.name, runs: v.runs });
  }
  if (!teamTopBowler.has(key) || v.wickets > teamTopBowler.get(key).wickets) {
    teamTopBowler.set(key, { name: v.name, wickets: v.wickets });
  }
}

const teams = [];
for (const [, ts] of teamSeasonMap) {
  const key = `${ts.team}|${ts.season}`;
  const scorer = teamTopScorer.get(key) || { name: "", runs: 0 };
  const bowler = teamTopBowler.get(key) || { name: "", wickets: 0 };
  teams.push({
    ...ts,
    topScorer: scorer.name,
    topScorerRuns: scorer.runs,
    topWicketTaker: bowler.name,
    topWicketTakerWickets: bowler.wickets,
  });
}
teams.sort((a, b) => parseInt(a.season) - parseInt(b.season) || a.team.localeCompare(b.team));

writeFileSync("public/data/teams.json", JSON.stringify(teams));
console.log(`teams.json: ${teams.length} team-seasons`);

// ── Matchups ──
const matchupMap = new Map();
for (const [, m] of matchWinners) {
  const arr = [...m.teams].sort();
  if (arr.length !== 2) continue;
  const key = arr.join("|");
  if (!matchupMap.has(key)) {
    matchupMap.set(key, {
      team1: arr[0],
      team2: arr[1],
      team1Wins: 0,
      team2Wins: 0,
      noResult: 0,
      totalMatches: 0,
      seasons: new Set(),
    });
  }
  const mu = matchupMap.get(key);
  mu.totalMatches += 1;
  mu.seasons.add(m.season);
  if (m.result === "no result") mu.noResult += 1;
  else if (m.winner === arr[0]) mu.team1Wins += 1;
  else if (m.winner === arr[1]) mu.team2Wins += 1;
}

const matchups = [];
for (const [, v] of matchupMap) {
  matchups.push({ ...v, seasons: [...v.seasons].sort() });
}
matchups.sort((a, b) => b.totalMatches - a.totalMatches);

writeFileSync("public/data/matchups.json", JSON.stringify(matchups));
console.log(`matchups.json: ${matchups.length} matchups`);

// ── Sankey ──
// For each player who played for team A in season X and team B in season X+1, create a link
const playerTeamsBySeason = new Map();
for (const p of players) {
  for (const s of p.seasons) {
    const key = `${p.name}|${s.season}`;
    playerTeamsBySeason.set(key, s.team);
  }
}

const allSeasons = [...new Set(data.map((d) => d._season))].sort((a, b) => parseInt(a) - parseInt(b));
const sankeyLinks = new Map();
const sankeyNodeSet = new Set();

for (const p of players) {
  const pSeasons = p.seasons.map((s) => s.season).sort((a, b) => parseInt(a) - parseInt(b));
  for (let i = 0; i < pSeasons.length - 1; i++) {
    const fromSeason = pSeasons[i];
    const toSeason = pSeasons[i + 1];
    const fromTeam = playerTeamsBySeason.get(`${p.name}|${fromSeason}`);
    const toTeam = playerTeamsBySeason.get(`${p.name}|${toSeason}`);
    if (fromTeam && toTeam && fromTeam !== toTeam) {
      const srcId = `${fromTeam}_${fromSeason}`;
      const tgtId = `${toTeam}_${toSeason}`;
      const linkKey = `${srcId}→${tgtId}`;
      sankeyNodeSet.add(srcId);
      sankeyNodeSet.add(tgtId);
      if (!sankeyLinks.has(linkKey)) {
        sankeyLinks.set(linkKey, { source: srcId, target: tgtId, value: 0, players: [] });
      }
      const link = sankeyLinks.get(linkKey);
      link.value += 1;
      if (link.players.length < 20) link.players.push(p.name);
    }
  }
}

const sankeyData = {
  nodes: [...sankeyNodeSet].map((id) => {
    const [teamPart, seasonPart] = [id.substring(0, id.lastIndexOf("_")), id.substring(id.lastIndexOf("_") + 1)];
    return { id, name: teamPart, season: seasonPart };
  }),
  links: [...sankeyLinks.values()],
};

writeFileSync("public/data/sankey.json", JSON.stringify(sankeyData));
console.log(`sankey.json: ${sankeyData.nodes.length} nodes, ${sankeyData.links.length} links`);

// ── Seasons (for bar race) ──
// Cumulative runs by player across seasons
const seasonRunsMap = new Map();
for (const p of players) {
  let cumulative = 0;
  for (const s of p.seasons) {
    cumulative += s.runs;
    const season = s.season;
    if (!seasonRunsMap.has(season)) seasonRunsMap.set(season, []);
    seasonRunsMap.get(season).push({
      player: p.name,
      team: s.team,
      runs: cumulative,
    });
  }
}

const seasons = {};
for (const [season, entries] of seasonRunsMap) {
  entries.sort((a, b) => b.runs - a.runs);
  seasons[season] = entries.slice(0, 15);
}

writeFileSync("public/data/seasons.json", JSON.stringify(seasons));
console.log(`seasons.json: ${Object.keys(seasons).length} seasons`);

// ── Knowledge Graph ──
const kgNodes = [];
const kgEdges = [];
const kgNodeIds = new Set();

function addNode(id, type, label, meta = {}) {
  if (kgNodeIds.has(id)) return;
  kgNodeIds.add(id);
  kgNodes.push({ id, type, label, ...meta });
}

// Team nodes
const allTeamNames = new Set();
for (const d of data) {
  allTeamNames.add(canon(d.batting_team));
  allTeamNames.add(canon(d.bowling_team));
}
for (const t of allTeamNames) {
  addNode(`team:${t}`, "team", t);
}

// Season nodes
const allSeasonSet = new Set(data.map((d) => d._season));
for (const s of allSeasonSet) {
  addNode(`season:${s}`, "season", s);
}

// Venue nodes
const allVenues = new Set();
for (const d of data) {
  if (d.venue) allVenues.add(d.venue);
}
for (const v of allVenues) {
  addNode(`venue:${v}`, "venue", v, { city: data.find((d) => d.venue === v)?.city || "" });
}

// Player nodes (top 200 by runs to keep graph manageable)
const topPlayers = players.slice(0, 200);
for (const p of topPlayers) {
  const totalRuns = p.seasons.reduce((s, x) => s + x.runs, 0);
  const totalWickets = p.seasons.reduce((s, x) => s + x.wickets, 0);
  addNode(`player:${p.name}`, "player", p.name, {
    runs: totalRuns,
    wickets: totalWickets,
    seasons: p.seasons.length,
  });
}

// Edges: player → played_for → team (per season)
const edgeSet = new Set();
for (const p of topPlayers) {
  for (const s of p.seasons) {
    const edgeId = `${p.name}|played_for|${s.team}|${s.season}`;
    if (!edgeSet.has(edgeId)) {
      edgeSet.add(edgeId);
      kgEdges.push({
        source: `player:${p.name}`,
        target: `team:${s.team}`,
        type: "played_for",
        season: s.season,
        runs: s.runs,
        wickets: s.wickets,
      });
    }
  }
}

// Edges: team → played_in → season
for (const [, ts] of teamSeasonMap) {
  kgEdges.push({
    source: `team:${ts.team}`,
    target: `season:${ts.season}`,
    type: "played_in",
    wins: ts.wins,
    losses: ts.losses,
  });
}

// Edges: team → match → team (from matchups, top rivalries)
for (const mu of matchups.slice(0, 50)) {
  kgEdges.push({
    source: `team:${mu.team1}`,
    target: `team:${mu.team2}`,
    type: "rivalry",
    matches: mu.totalMatches,
    team1Wins: mu.team1Wins,
    team2Wins: mu.team2Wins,
  });
}

// Edges: match → played_at → venue (aggregate: team played at venue in season)
const teamVenueSeason = new Map();
for (const d of data) {
  const key = `${canon(d.batting_team)}|${d.venue}|${d._season}`;
  if (!teamVenueSeason.has(key)) {
    teamVenueSeason.set(key, { team: canon(d.batting_team), venue: d.venue, season: d._season });
  }
}
for (const [, tv] of teamVenueSeason) {
  if (kgNodeIds.has(`venue:${tv.venue}`)) {
    kgEdges.push({
      source: `team:${tv.team}`,
      target: `venue:${tv.venue}`,
      type: "played_at",
      season: tv.season,
    });
  }
}

const graph = { nodes: kgNodes, edges: kgEdges };
writeFileSync("public/data/graph.json", JSON.stringify(graph));
console.log(`graph.json: ${kgNodes.length} nodes, ${kgEdges.length} edges`);

// ── On This Day ──
const matchIdToFirstRow = new Map();
for (const d of data) {
  if (!matchIdToFirstRow.has(d.match_id)) {
    matchIdToFirstRow.set(d.match_id, d);
  }
}

const onThisDay = {};
for (const [matchId, m] of matchWinners) {
  const row = matchIdToFirstRow.get(matchId);
  if (!row) continue;
  const month = String(row.month || "").padStart(2, "0");
  const day = String(row.day || "").padStart(2, "0");
  if (!month || !day || month === "00" || day === "00") continue;
  const key = `${month}-${day}`;
  const teams = [...m.teams].sort();
  if (teams.length !== 2) continue;
  const entry = {
    matchId,
    season: m.season,
    date: row.date || "",
    team1: canon(teams[0]),
    team2: canon(teams[1]),
    winner: m.winner,
    winOutcome: row.win_outcome || "",
    venue: row.venue || "",
    playerOfMatch: row.player_of_match || "",
  };
  if (!onThisDay[key]) onThisDay[key] = [];
  onThisDay[key].push(entry);
}

// Deduplicate by matchId (keep first occurrence per key)
for (const key of Object.keys(onThisDay)) {
  const seen = new Set();
  onThisDay[key] = onThisDay[key].filter((e) => {
    if (seen.has(e.matchId)) return false;
    seen.add(e.matchId);
    return true;
  });
  onThisDay[key].sort((a, b) => a.date.localeCompare(b.date));
}

writeFileSync("public/data/on-this-day.json", JSON.stringify(onThisDay));
const onThisDayCount = Object.values(onThisDay).reduce((s, arr) => s + arr.length, 0);
console.log(`on-this-day.json: ${Object.keys(onThisDay).length} dates, ${onThisDayCount} matches`);

// ── Season Recaps ──
const seasonRecaps = {};

// Champion: winner of match with latest date per season
const seasonLatestMatch = new Map();
for (const [matchId, m] of matchWinners) {
  const row = matchIdToFirstRow.get(matchId);
  if (!row || !row.date) continue;
  const season = m.season;
  const existing = seasonLatestMatch.get(season);
  if (!existing || row.date > existing.date) {
    seasonLatestMatch.set(season, { matchId, date: row.date, winner: m.winner });
  }
}

// Total matches per season
const seasonMatchCount = new Map();
for (const [, m] of matchWinners) {
  seasonMatchCount.set(m.season, (seasonMatchCount.get(m.season) || 0) + 1);
}

// Top scorer and top wicket taker per season (from playerMap)
const seasonTopScorer = new Map();
const seasonTopWicketTaker = new Map();
for (const [, v] of playerMap) {
  const season = v.season;
  if (!seasonTopScorer.has(season) || v.runs > seasonTopScorer.get(season).runs) {
    seasonTopScorer.set(season, { name: v.name, runs: v.runs });
  }
  if (!seasonTopWicketTaker.has(season) || v.wickets > seasonTopWicketTaker.get(season).wickets) {
    seasonTopWicketTaker.set(season, { name: v.name, wickets: v.wickets });
  }
}

// Most sixes and fours per batter per season
const batterSixes = new Map();
const batterFours = new Map();
for (const d of data) {
  const key = `${d.batter}|${d._season}`;
  if (d.runs_batter === "6") {
    batterSixes.set(key, (batterSixes.get(key) || 0) + 1);
  }
  if (d.runs_batter === "4") {
    batterFours.set(key, (batterFours.get(key) || 0) + 1);
  }
}

const seasonMostSixes = new Map();
const seasonMostFours = new Map();
for (const [key, count] of batterSixes) {
  const [, season] = key.split("|");
  const name = key.split("|")[0];
  if (!seasonMostSixes.has(season) || count > seasonMostSixes.get(season).sixes) {
    seasonMostSixes.set(season, { name, sixes: count });
  }
}
for (const [key, count] of batterFours) {
  const [, season] = key.split("|");
  const name = key.split("|")[0];
  if (!seasonMostFours.has(season) || count > seasonMostFours.get(season).fours) {
    seasonMostFours.set(season, { name, fours: count });
  }
}

// Highest score per batter per match (group by matchId+batter, sum runs_batter)
const matchBatterRuns = new Map();
for (const d of data) {
  const key = `${d.match_id}|${d.batter}`;
  const runs = parseInt(d.runs_batter) || 0;
  if (!matchBatterRuns.has(key)) {
    matchBatterRuns.set(key, {
      batter: d.batter,
      runs: 0,
      team: canon(d.batting_team),
      against: canon(d.bowling_team),
      season: d._season,
    });
  }
  matchBatterRuns.get(key).runs += runs;
}

const seasonHighestScore = new Map();
for (const [, v] of matchBatterRuns) {
  const season = v.season;
  const existing = seasonHighestScore.get(season);
  if (!existing || v.runs > existing.runs) {
    seasonHighestScore.set(season, {
      name: v.batter,
      runs: v.runs,
      team: v.team,
      against: v.against,
      season,
    });
  }
}

// Teams per season
const seasonTeams = new Map();
for (const [, m] of matchWinners) {
  for (const t of m.teams) {
    const ct = canon(t);
    if (!seasonTeams.has(m.season)) seasonTeams.set(m.season, new Set());
    seasonTeams.get(m.season).add(ct);
  }
}

for (const season of allSeasons) {
  const latest = seasonLatestMatch.get(season);
  const champion = latest ? latest.winner : "";
  const totalMatches = seasonMatchCount.get(season) || 0;
  const topScorer = seasonTopScorer.get(season) || { name: "", runs: 0 };
  const topWicketTaker = seasonTopWicketTaker.get(season) || { name: "", wickets: 0 };
  const mostSixes = seasonMostSixes.get(season) || { name: "", sixes: 0 };
  const mostFours = seasonMostFours.get(season) || { name: "", fours: 0 };
  const highestScore = seasonHighestScore.get(season) || {
    name: "",
    runs: 0,
    team: "",
    against: "",
    season,
  };
  const teams = [...(seasonTeams.get(season) || [])].sort();

  seasonRecaps[season] = {
    season,
    champion,
    totalMatches,
    topScorer: { name: topScorer.name, runs: topScorer.runs },
    topWicketTaker: { name: topWicketTaker.name, wickets: topWicketTaker.wickets },
    mostSixes: { name: mostSixes.name, sixes: mostSixes.sixes },
    mostFours: { name: mostFours.name, fours: mostFours.fours },
    highestScore: {
      name: highestScore.name,
      runs: highestScore.runs,
      team: highestScore.team,
      against: highestScore.against,
      season,
    },
    teams,
  };
}

writeFileSync("public/data/season-recaps.json", JSON.stringify(seasonRecaps));
console.log(`season-recaps.json: ${Object.keys(seasonRecaps).length} seasons`);

console.log("Done!");
