export interface PlayerSeason {
  season: string;
  team: string;
  matches: number;
  runs: number;
  ballsFaced: number;
  wickets: number;
  runsConceded: number;
  ballsBowled: number;
  catches: number;
  strikeRate: number;
  battingAvg: number;
  economyRate: number;
  playerOfMatch: number;
}

export interface Player {
  name: string;
  seasons: PlayerSeason[];
}

export interface TeamSeason {
  season: string;
  team: string;
  matches: number;
  wins: number;
  losses: number;
  noResult: number;
  topScorer: string;
  topScorerRuns: number;
  topWicketTaker: string;
  topWicketTakerWickets: number;
}

export interface Matchup {
  team1: string;
  team2: string;
  team1Wins: number;
  team2Wins: number;
  noResult: number;
  totalMatches: number;
  seasons: string[];
}

export interface SankeyNode {
  id: string;
  name: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  players: string[];
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SeasonEntry {
  player: string;
  team: string;
  runs: number;
}

export interface SeasonsData {
  [season: string]: SeasonEntry[];
}
