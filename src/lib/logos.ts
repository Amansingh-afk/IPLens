const TEAM_LOGO_MAP: Record<string, string> = {
  "Mumbai Indians": "/logos/MI.png",
  "Chennai Super Kings": "/logos/CSK.png",
  "Royal Challengers Bengaluru": "/logos/RCB.png",
  "Royal Challengers Bangalore": "/logos/RCB.png",
  "Kolkata Knight Riders": "/logos/KKR.png",
  "Delhi Capitals": "/logos/DC.png",
  "Delhi Daredevils": "/logos/DD.png",
  "Rajasthan Royals": "/logos/RR.png",
  "Sunrisers Hyderabad": "/logos/SRH.png",
  "Punjab Kings": "/logos/PBKS.png",
  "Kings XI Punjab": "/logos/KXIP.png",
  "Gujarat Titans": "/logos/GT.png",
  "Lucknow Super Giants": "/logos/LSG.png",
  "Kochi Tuskers Kerala": "/logos/KTK.png",
  "Rising Pune Supergiant": "/logos/RPS.png",
  "Rising Pune Supergiants": "/logos/RPS.png",
  "Gujarat Lions": "/logos/GL.png",
};

export function getTeamLogo(team: string): string | null {
  return TEAM_LOGO_MAP[team] ?? null;
}
