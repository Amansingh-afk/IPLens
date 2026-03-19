import type { Metadata } from "next";
import Dashboard from "./dashboard";

export const metadata: Metadata = {
  title: {
    absolute: "IPLens — The Lens Through Which India Watches Cricket",
  },
  description:
    "Interactive IPL data visualizations — player journeys, team rivalries, transfer flows, and 18 seasons of cricket history. Explore bar races, Sankey diagrams, head-to-head rivalries, and more.",
  alternates: { canonical: "https://iplens.vercel.app" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IPLens",
  url: "https://iplens.vercel.app",
  description:
    "Interactive IPL data visualizations — player journeys, team rivalries, transfer flows, and 18 seasons of cricket history.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://iplens.vercel.app/player/{search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Dashboard />
    </>
  );
}
