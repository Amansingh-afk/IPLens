"use client";

import { useState } from "react";
import { ShareModal, ShareButton } from "@/components/share-modal";

interface MatchShareProps {
  team1: string;
  team2: string;
  team1Wins: number;
  team2Wins: number;
  totalMatches: number;
}

export function MatchShare({ team1, team2, team1Wins, team2Wins, totalMatches }: MatchShareProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ShareButton onClick={() => setOpen(true)} />
      <ShareModal
        open={open}
        onClose={() => setOpen(false)}
        shareProps={{
          type: "matchup",
          matchupData: { team1, team2, team1Wins, team2Wins, totalMatches },
        }}
      />
    </>
  );
}
