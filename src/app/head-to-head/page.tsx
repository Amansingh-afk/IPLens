import { HeadToHead } from "@/components/head-to-head";

export const metadata = {
  title: "Head to Head — IPLens",
  description: "IPL team rivalry stats — pick any two teams and see their history",
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
