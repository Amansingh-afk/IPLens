import type { Metadata } from "next";
import OnThisDayView from "./on-this-day-view";

export const metadata: Metadata = {
  title: "On This Day in IPL",
  description:
    "Discover which IPL matches were played on this day in history. Browse results, venues, and player performances from every IPL season.",
  alternates: { canonical: "https://iplens.vercel.app/on-this-day" },
};

export default function OnThisDayPage() {
  return <OnThisDayView />;
}
