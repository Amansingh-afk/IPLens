import { PlayerTimeline } from "@/components/player-timeline";

export const metadata = {
  title: "Player — IPLens",
  description: "Player career timeline across IPL seasons",
};

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name).replace(/-/g, " ");

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <PlayerTimeline playerName={decodedName} />
    </div>
  );
}
