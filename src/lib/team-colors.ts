export const TEAM_COLORS: Record<string, string> = {
  "Mumbai Indians": "#004BA0",
  "Chennai Super Kings": "#FDB913",
  "Royal Challengers Bengaluru": "#EC1C24",
  "Royal Challengers Bangalore": "#EC1C24",
  "Kolkata Knight Riders": "#3A225D",
  "Delhi Capitals": "#004C93",
  "Delhi Daredevils": "#004C93",
  "Rajasthan Royals": "#EA1A85",
  "Sunrisers Hyderabad": "#FF822A",
  "Punjab Kings": "#DD1F2D",
  "Kings XI Punjab": "#DD1F2D",
  "Gujarat Titans": "#1C1C2B",
  "Lucknow Super Giants": "#A72056",
  "Deccan Chargers": "#5C7A99",
  "Kochi Tuskers Kerala": "#6B4E3D",
  "Pune Warriors": "#6E7B8B",
  "Rising Pune Supergiant": "#6E7B8B",
  "Rising Pune Supergiants": "#6E7B8B",
  "Gujarat Lions": "#E04F16",
};

export const TEAM_SHORT: Record<string, string> = {
  "Mumbai Indians": "MI",
  "Chennai Super Kings": "CSK",
  "Royal Challengers Bengaluru": "RCB",
  "Royal Challengers Bangalore": "RCB",
  "Kolkata Knight Riders": "KKR",
  "Delhi Capitals": "DC",
  "Delhi Daredevils": "DD",
  "Rajasthan Royals": "RR",
  "Sunrisers Hyderabad": "SRH",
  "Punjab Kings": "PBKS",
  "Kings XI Punjab": "KXIP",
  "Gujarat Titans": "GT",
  "Lucknow Super Giants": "LSG",
  "Deccan Chargers": "DCH",
  "Kochi Tuskers Kerala": "KTK",
  "Pune Warriors": "PW",
  "Rising Pune Supergiant": "RPS",
  "Rising Pune Supergiants": "RPS",
  "Gujarat Lions": "GL",
};

export const CANONICAL_TEAM: Record<string, string> = {
  "Delhi Daredevils": "Delhi Capitals",
  "Kings XI Punjab": "Punjab Kings",
  "Royal Challengers Bangalore": "Royal Challengers Bengaluru",
  "Rising Pune Supergiants": "Rising Pune Supergiant",
};

export function getTeamColor(team: string): string {
  return TEAM_COLORS[team] ?? "#666666";
}

export function getTeamShort(team: string): string {
  return TEAM_SHORT[team] ?? team.slice(0, 3).toUpperCase();
}

export function canonicalTeamName(team: string): string {
  return CANONICAL_TEAM[team] ?? team;
}

export const ACTIVE_TEAMS = [
  "Mumbai Indians",
  "Chennai Super Kings",
  "Royal Challengers Bengaluru",
  "Kolkata Knight Riders",
  "Delhi Capitals",
  "Rajasthan Royals",
  "Sunrisers Hyderabad",
  "Punjab Kings",
  "Gujarat Titans",
  "Lucknow Super Giants",
];
