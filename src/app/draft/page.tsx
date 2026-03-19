import type { Metadata } from "next";
import DraftQuiz from "./draft-quiz";

export const metadata: Metadata = {
  title: "IPL Team Draft Quiz",
  description:
    "Take the quiz to find out which IPL franchise you belong to. Answer 6 questions and get drafted by your perfect IPL team.",
  alternates: { canonical: "https://iplens.vercel.app/draft" },
  openGraph: {
    title: "Which IPL Team Drafts You?",
    description: "Take the quiz and find your perfect IPL franchise.",
  },
};

export default function DraftPage() {
  return <DraftQuiz />;
}
