import type { Metadata } from "next";
import ComparePlayers from "./compare-players";

export const metadata: Metadata = {
  title: "Compare IPL Players",
  description:
    "Side-by-side comparison of any two IPL players — runs, wickets, strike rate, career timelines, and season-by-season stats.",
  alternates: { canonical: "https://iplens.in/compare" },
};

export default function ComparePage() {
  return <ComparePlayers />;
}
