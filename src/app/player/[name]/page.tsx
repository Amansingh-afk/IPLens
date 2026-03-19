import { readFileSync } from "fs";
import path from "path";
import { PlayerTimeline } from "@/components/player-timeline";

interface PlayerSeason {
  season: string;
  team: string;
  matches: number;
  runs: number;
  wickets: number;
}

interface PlayerData {
  name: string;
  seasons: PlayerSeason[];
}

function getPlayers(): PlayerData[] {
  const filePath = path.join(process.cwd(), "public/data/players.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export async function generateStaticParams() {
  const players = getPlayers();
  return players.map((p) => ({ name: encodeURIComponent(p.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decoded = decodeURIComponent(name).replace(/-/g, " ");
  const players = getPlayers();
  const player = players.find(
    (p) => p.name.toLowerCase() === decoded.toLowerCase()
  );

  if (!player) {
    return { title: "Player Not Found" };
  }

  const totalRuns = player.seasons.reduce((s, x) => s + x.runs, 0);
  const totalWickets = player.seasons.reduce((s, x) => s + x.wickets, 0);
  const totalMatches = player.seasons.reduce((s, x) => s + x.matches, 0);
  const lastTeam = player.seasons[player.seasons.length - 1]?.team ?? "";

  const statParts = [];
  if (totalRuns > 0) statParts.push(`${totalRuns.toLocaleString()} runs`);
  if (totalWickets > 0) statParts.push(`${totalWickets} wickets`);
  const statsStr = statParts.length > 0 ? statParts.join(", ") : "";

  return {
    title: `${player.name} — IPL Career Stats & Timeline`,
    description: `${player.name} IPL career: ${totalMatches} matches across ${player.seasons.length} seasons${statsStr ? ` — ${statsStr}` : ""}. ${lastTeam ? `Last played for ${lastTeam}.` : ""} Full season-by-season timeline.`,
    alternates: {
      canonical: `https://iplens.vercel.app/player/${encodeURIComponent(player.name)}`,
    },
    openGraph: {
      title: `${player.name} — IPL Career Timeline`,
      description: `${totalMatches} matches, ${player.seasons.length} seasons${statsStr ? ` — ${statsStr}` : ""}`,
    },
  };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name).replace(/-/g, " ");
  const players = getPlayers();
  const player = players.find(
    (p) => p.name.toLowerCase() === decodedName.toLowerCase()
  );

  const jsonLd = player
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: player.name,
        description: `IPL cricket player — ${player.seasons.length} seasons, ${player.seasons.reduce((s, x) => s + x.matches, 0)} matches`,
        url: `https://iplens.vercel.app/player/${encodeURIComponent(player.name)}`,
        sport: "Cricket",
        affiliation: player.seasons[player.seasons.length - 1]?.team,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <PlayerTimeline playerName={decodedName} />
      </div>
    </>
  );
}
