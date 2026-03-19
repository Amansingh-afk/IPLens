import type { Metadata } from "next";
import EmbedBuilder from "./embed-builder";

export const metadata: Metadata = {
  title: "Embed IPLens Charts",
  description:
    "Add interactive IPL visualizations to your blog or website. Copy embed codes for bar races, Sankey diagrams, and head-to-head charts.",
  alternates: { canonical: "https://iplens.in/embed" },
  robots: { index: false },
};

export default function EmbedPage() {
  return <EmbedBuilder />;
}
