import { HeadToHead } from "@/components/head-to-head";

export const metadata = {
  title: "IPL Head to Head — Team Rivalries",
  description:
    "Compare any two IPL teams head-to-head. See win records, close matches, and rivalry stats from MI vs CSK to RCB vs SRH.",
  alternates: { canonical: "https://iplens.in/head-to-head" },
};

export default function HeadToHeadPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold">Head to Head</h1>
      <p className="mb-8 text-sm text-muted">
        Pick any two teams and compare their all-time IPL rivalry.
      </p>
      <HeadToHead />
    </div>
  );
}
