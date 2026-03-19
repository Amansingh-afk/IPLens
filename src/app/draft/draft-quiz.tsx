"use client";

import { useState, useCallback } from "react";
import { TEAM_COLORS } from "@/lib/team-colors";

const TEAMS = [
  "Mumbai Indians",
  "Chennai Super Kings",
  "Royal Challengers Bengaluru",
  "Kolkata Knight Riders",
  "Delhi Capitals",
  "Rajasthan Royals",
  "Sunrisers Hyderabad",
  "Punjab Kings",
  "Gujarat Titans",
  "Lucknow Super Giants",
] as const;

type TeamKey = (typeof TEAMS)[number];

// Each answer option maps to teams that get +2 points
const ANSWER_TO_TEAMS: Record<string, TeamKey[]> = {
  // Q1: Batting style
  aggressive: ["Royal Challengers Bengaluru", "Punjab Kings", "Sunrisers Hyderabad"],
  anchor: ["Chennai Super Kings", "Gujarat Titans", "Rajasthan Royals"],
  allrounder: ["Mumbai Indians", "Kolkata Knight Riders", "Delhi Capitals"],
  purebowler: ["Sunrisers Hyderabad", "Mumbai Indians", "Lucknow Super Giants"],
  // Q2: Powerplay or Death
  powerplay: ["Delhi Capitals", "Mumbai Indians", "Punjab Kings"],
  middle: ["Royal Challengers Bengaluru", "Kolkata Knight Riders", "Rajasthan Royals"],
  death: ["Mumbai Indians", "Chennai Super Kings", "Gujarat Titans"],
  allphases: ["Mumbai Indians", "Royal Challengers Bengaluru", "Chennai Super Kings"],
  // Q3: Pressure situation
  smash: ["Royal Challengers Bengaluru", "Punjab Kings"],
  rotate: ["Chennai Super Kings", "Gujarat Titans", "Rajasthan Royals"],
  yorker: ["Mumbai Indians", "Sunrisers Hyderabad"],
  sledge: ["Kolkata Knight Riders", "Delhi Capitals"],
  // Q4: Ideal captain
  dhoni: ["Chennai Super Kings"],
  kohli: ["Royal Challengers Bengaluru"],
  williamson: ["Sunrisers Hyderabad", "Gujarat Titans"],
  pant: ["Delhi Capitals", "Lucknow Super Giants"],
  // Q5: Home ground vibe
  beach: ["Mumbai Indians"],
  temple: ["Chennai Super Kings"],
  garden: ["Royal Challengers Bengaluru"],
  royal: ["Rajasthan Royals"],
  // Q6: What matters most
  trophies: ["Mumbai Indians", "Chennai Super Kings", "Kolkata Knight Riders"],
  legends: ["Chennai Super Kings", "Royal Challengers Bengaluru"],
  loyalty: ["Royal Challengers Bengaluru", "Chennai Super Kings"],
  entertainment: ["Punjab Kings", "Kolkata Knight Riders", "Rajasthan Royals"],
};

const TEAM_ONE_LINERS: Record<TeamKey, string> = {
  "Mumbai Indians":
    "Your cool-headed approach and love for strategy makes you a perfect fit for the Blue & Gold!",
  "Chennai Super Kings":
    "Your calm under pressure and loyalty to the process — welcome to the Yellow Army!",
  "Royal Challengers Bengaluru":
    "Your fearless approach and passion for the game — you belong in Red & Gold!",
  "Kolkata Knight Riders":
    "Your flair for entertainment and clutch performances — Knight Riders unite!",
  "Delhi Capitals":
    "Your bold, fearless energy and love for the big stage — Delhi is your home!",
  "Rajasthan Royals":
    "Your royal swagger and love for the unconventional — Jaipur awaits!",
  "Sunrisers Hyderabad":
    "Your lethal precision and quiet confidence — Orange Army has found you!",
  "Punjab Kings":
    "Your entertainment-first mindset and never-say-die spirit — Punjab power!",
  "Gujarat Titans":
    "Your composed approach and strategic mindset — the Titans way!",
  "Lucknow Super Giants":
    "Your fun, fearless attitude and love for the new — Super Giants welcome you!",
};

const QUESTIONS = [
  {
    id: "batting",
    question: "What's your batting style?",
    options: [
      { value: "aggressive", label: "Aggressive (6s or nothing)" },
      { value: "anchor", label: "Anchor (steady accumulator)" },
      { value: "allrounder", label: "All-rounder (bit of everything)" },
      { value: "purebowler", label: "I don't bat (pure bowler)" },
    ],
  },
  {
    id: "phase",
    question: "Powerplay or Death overs?",
    options: [
      { value: "powerplay", label: "Powerplay (I set the tone)" },
      { value: "middle", label: "Middle overs (I build innings)" },
      { value: "death", label: "Death overs (I finish games)" },
      { value: "allphases", label: "All phases" },
    ],
  },
  {
    id: "pressure",
    question: "Pressure situation. You...",
    options: [
      { value: "smash", label: "Smash it (attack is the best defense)" },
      { value: "rotate", label: "Rotate strike (keep calm)" },
      { value: "yorker", label: "Bowl a yorker" },
      { value: "sledge", label: "Sledge the opponent" },
    ],
  },
  {
    id: "captain",
    question: "Your ideal captain?",
    options: [
      { value: "dhoni", label: "Cool & strategic (Dhoni type)" },
      { value: "kohli", label: "Lead from front (Kohli type)" },
      { value: "williamson", label: "Quiet & lethal (Williamson type)" },
      { value: "pant", label: "Fun & fearless (Pant type)" },
    ],
  },
  {
    id: "vibe",
    question: "Pick your home ground vibe",
    options: [
      { value: "beach", label: "Beach city party (Mumbai/Goa)" },
      { value: "temple", label: "Temple town tradition (Chennai)" },
      { value: "garden", label: "Garden city chill (Bangalore)" },
      { value: "royal", label: "Royal palace grandeur (Jaipur/Rajasthan)" },
    ],
  },
  {
    id: "values",
    question: "What matters most?",
    options: [
      { value: "trophies", label: "Winning trophies" },
      { value: "legends", label: "Playing with legends" },
      { value: "loyalty", label: "Loyalty to one team" },
      { value: "entertainment", label: "Entertainment value" },
    ],
  },
];

function calculateResult(answers: string[]): TeamKey {
  const scores: Record<TeamKey, number> = {} as Record<TeamKey, number>;
  for (const team of TEAMS) {
    scores[team] = 0;
  }

  for (const answer of answers) {
    const teams = ANSWER_TO_TEAMS[answer];
    if (teams) {
      for (const team of teams) {
        scores[team] = (scores[team] ?? 0) + 2;
      }
    }
  }

  let maxScore = 0;
  let winner: TeamKey = TEAMS[0];
  for (const team of TEAMS) {
    if (scores[team] > maxScore) {
      maxScore = scores[team];
      winner = team;
    }
  }
  return winner;
}

export default function DraftQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [phase, setPhase] = useState<"quiz" | "calculating" | "result">("quiz");
  const [result, setResult] = useState<TeamKey | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnswer = useCallback(
    (value: string) => {
      const newAnswers = [...answers, value];
      setAnswers(newAnswers);

      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion((q) => q + 1);
      } else {
        setPhase("calculating");
        setTimeout(() => {
          setResult(calculateResult(newAnswers));
          setPhase("result");
        }, 1800);
      }
    },
    [answers, currentQuestion]
  );

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers([]);
    setPhase("quiz");
    setResult(null);
    setCopied(false);
  }, []);

  const handleShare = useCallback(() => {
    if (!result) return;
    const text = `I've been drafted by ${result}! 🏏 Find your IPL team at IPLens.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  const progress = (currentQuestion + (phase === "quiz" ? 0 : 1)) / QUESTIONS.length;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-card-border">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {phase === "quiz" && (
          <div
            key={currentQuestion}
            className="w-full max-w-xl animate-[fade-in_0.3s_ease-out]"
          >
            <p className="text-sm font-medium text-muted mb-2">
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">
              {QUESTIONS[currentQuestion].question}
            </h2>
            <div className="flex flex-col gap-3">
              {QUESTIONS[currentQuestion].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className="w-full rounded-xl border border-card-border bg-card/80 px-6 py-4 text-left text-base font-medium transition-all hover:border-white/30 hover:bg-white/5 active:scale-[0.99]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "calculating" && (
          <div className="flex flex-col items-center gap-6 animate-[fade-in_0.3s_ease-out]">
            <div className="relative overflow-hidden rounded-2xl bg-card border border-card-border px-12 py-8">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <p className="text-xl font-semibold text-muted">Calculating...</p>
              <p className="mt-1 text-sm text-muted">Finding your perfect IPL fit</p>
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <div className="w-full max-w-xl animate-[zoom-in_0.5s_ease-out]">
            <div
              className="rounded-2xl border border-white/10 p-8 md:p-10 text-center"
              style={{
                background: `linear-gradient(135deg, ${TEAM_COLORS[result]}22 0%, ${TEAM_COLORS[result]}08 50%, transparent 100%)`,
              }}
            >
              <p className="text-sm font-medium text-muted uppercase tracking-wider mb-2">
                Your IPL franchise
              </p>
              <h1
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: TEAM_COLORS[result] }}
              >
                You&apos;ve been drafted by {result}!
              </h1>
              <p className="text-muted text-lg mb-8 max-w-md mx-auto">
                {TEAM_ONE_LINERS[result]}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleShare}
                  className="rounded-xl px-6 py-3 font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    backgroundColor: TEAM_COLORS[result],
                    color: "#fff",
                  }}
                >
                  {copied ? "Copied!" : "Share Result"}
                </button>
                <button
                  onClick={handleRestart}
                  className="rounded-xl border border-card-border px-6 py-3 font-semibold transition-all hover:border-white/30 hover:bg-white/5 active:scale-[0.98]"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
