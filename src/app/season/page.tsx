import type { Metadata } from "next";
import SeasonsOverview from "./seasons-overview";

export const metadata: Metadata = {
  title: "All IPL Seasons",
  description:
    "Browse all 18 IPL seasons from 2008 to 2025. See champions, top scorers, top wicket-takers, and key stats for every season.",
  alternates: { canonical: "https://iplens.in/season" },
};

export default function SeasonsPage() {
  return <SeasonsOverview />;
}
