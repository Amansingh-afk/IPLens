import { SankeyDiagram } from "@/components/sankey-diagram";

export const metadata = {
  title: "Player Transfers — IPLens",
  description: "Sankey diagram showing player movement between IPL franchises",
};

export default function SankeyPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold">Player Transfers</h1>
      <p className="mb-8 text-sm text-muted">
        Flow of players between franchises across seasons. Thicker links mean more players moved.
      </p>
      <SankeyDiagram />
    </div>
  );
}
