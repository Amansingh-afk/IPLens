import { KnowledgeGraph } from "@/components/knowledge-graph";

export const metadata = {
  title: "Knowledge Graph — IPLens",
  description: "Interactive knowledge graph of IPL players, teams, seasons, and venues",
};

export default function GraphPage() {
  return <KnowledgeGraph />;
}
