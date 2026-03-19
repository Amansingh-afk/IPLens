import { KnowledgeGraph } from "@/components/knowledge-graph";

export const metadata = {
  title: "IPL Knowledge Graph",
  description:
    "Interactive knowledge graph connecting 291 IPL nodes — players, teams, seasons, and venues. Explore how everything in IPL history is connected.",
  alternates: { canonical: "https://iplens.in/graph" },
};

export default function GraphPage() {
  return <KnowledgeGraph />;
}
