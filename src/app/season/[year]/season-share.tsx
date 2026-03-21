"use client";

import { useState } from "react";
import { ShareModal, ShareButton } from "@/components/share-modal";

interface SeasonShareProps {
  year: string;
  champion: string;
  totalMatches: number;
  topScorer: { name: string; runs: number };
  topWicketTaker: { name: string; wickets: number };
}

export function SeasonShare({
  year,
  champion,
  totalMatches,
  topScorer,
  topWicketTaker,
}: SeasonShareProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ShareButton onClick={() => setOpen(true)} />
      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        shareProps={{
          type: "season",
          seasonData: { year, champion, totalMatches, topScorer, topWicketTaker },
        }}
      />
    </>
  );
}
