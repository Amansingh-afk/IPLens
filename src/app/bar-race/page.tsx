import { BarRace } from "@/components/bar-race";

export const metadata = {
  title: "Bar Race — IPLens",
  description: "Animated bar race of all-time top IPL run scorers across seasons",
};

export default function BarRacePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold">Top Run Scorers — All Time</h1>
      <p className="mb-8 text-sm text-muted">
        Cumulative runs across IPL seasons. Watch the race unfold from 2008 to 2025.
      </p>
      <BarRace />
    </div>
  );
}
