"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Image from "next/image";
import { ShareModal, ShareButton } from "@/components/share-modal";
import type { ShareCardProps } from "@/components/share-card";

interface Matchup {
  team1: string;
  team2: string;
  team1Wins: number;
  team2Wins: number;
  noResult: number;
  totalMatches: number;
  seasons: string[];
}

const TEAM_COLORS: Record<string, string> = {
  "Mumbai Indians": "#004BA0",
  "Chennai Super Kings": "#FDB913",
  "Royal Challengers Bengaluru": "#EC1C24",
  "Kolkata Knight Riders": "#3A225D",
  "Delhi Capitals": "#004C93",
  "Rajasthan Royals": "#EA1A85",
  "Sunrisers Hyderabad": "#FF822A",
  "Punjab Kings": "#DD1F2D",
  "Gujarat Titans": "#1C1C2B",
  "Lucknow Super Giants": "#A72056",
  "Deccan Chargers": "#5C7A99",
  "Kochi Tuskers Kerala": "#6B4E3D",
  "Pune Warriors": "#6E7B8B",
  "Rising Pune Supergiant": "#6E7B8B",
  "Gujarat Lions": "#E04F16",
};

function getColor(team: string) {
  return TEAM_COLORS[team] ?? "#666";
}

const TEAM_LOGOS: Record<string, string> = {
  "Mumbai Indians": "/logos/MI.png",
  "Chennai Super Kings": "/logos/CSK.png",
  "Royal Challengers Bengaluru": "/logos/RCB.png",
  "Kolkata Knight Riders": "/logos/KKR.png",
  "Delhi Capitals": "/logos/DC.png",
  "Delhi Daredevils": "/logos/DD.png",
  "Rajasthan Royals": "/logos/RR.png",
  "Sunrisers Hyderabad": "/logos/SRH.png",
  "Punjab Kings": "/logos/PBKS.png",
  "Kings XI Punjab": "/logos/KXIP.png",
  "Gujarat Titans": "/logos/GT.png",
  "Lucknow Super Giants": "/logos/LSG.png",
  "Kochi Tuskers Kerala": "/logos/KTK.png",
  "Rising Pune Supergiant": "/logos/RPS.png",
  "Gujarat Lions": "/logos/GL.png",
};

function TeamLogo({ team, size = 32 }: { team: string; size?: number }) {
  const logo = TEAM_LOGOS[team];
  if (logo) {
    return (
      <Image
        src={logo}
        alt={team}
        width={size}
        height={size}
        className="object-contain"
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ width: size, height: size, backgroundColor: getColor(team) }}
    >
      {team.split(" ").map(w => w[0]).join("").slice(0, 3)}
    </div>
  );
}

const ACTIVE_TEAMS = [
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
];

interface HeadToHeadProps {
  mini?: boolean;
  presetTeam1?: string;
  presetTeam2?: string;
}

export function HeadToHead({
  mini = false,
  presetTeam1,
  presetTeam2,
}: HeadToHeadProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [team1, setTeam1] = useState(presetTeam1 || "Mumbai Indians");
  const [team2, setTeam2] = useState(presetTeam2 || "Chennai Super Kings");
  const [allTeams, setAllTeams] = useState<string[]>(ACTIVE_TEAMS);
  const [barAnimated, setBarAnimated] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarAnimated(true), 200);
    return () => clearTimeout(t);
  }, [team1, team2, matchups]);

  useEffect(() => {
    setBarAnimated(false);
  }, [team1, team2]);

  useEffect(() => {
    fetch("/data/matchups.json")
      .then((r) => r.json())
      .then((data: Matchup[]) => {
        setMatchups(data);
        const teams = new Set<string>();
        data.forEach((m) => {
          teams.add(m.team1);
          teams.add(m.team2);
        });
        setAllTeams([...teams].sort());
      });
  }, []);

  const matchup = matchups.find(
    (m) =>
      (m.team1 === team1 && m.team2 === team2) ||
      (m.team1 === team2 && m.team2 === team1)
  );

  const t1Wins =
    matchup?.team1 === team1 ? matchup.team1Wins : matchup?.team2Wins || 0;
  const t2Wins =
    matchup?.team1 === team1 ? matchup.team2Wins : matchup?.team1Wins || 0;
  const total = matchup?.totalMatches || 0;

  useEffect(() => {
    if (!svgRef.current || !matchup) return;

    const svg = d3.select(svgRef.current);
    const size = mini ? 120 : 180;
    svg.attr("width", size).attr("height", size);
    svg.selectAll("*").remove();

    const radius = size / 2 - 10;
    const arc = d3.arc().innerRadius(radius * 0.65).outerRadius(radius);
    const pie = d3
      .pie<number>()
      .sort(null)
      .value((d) => d);

    const g = svg
      .append("g")
      .attr("transform", `translate(${size / 2},${size / 2})`);

    const data = [t1Wins, t2Wins, matchup.noResult];
    const colors = [getColor(team1), getColor(team2), "#333"];

    const arcs = g.selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("fill", (_d, i) => colors[i])
      .attr("stroke", "#06060a")
      .attr("stroke-width", 2);

    // Animate arcs sweeping in from 0
    arcs.each(function (d) {
      const el = d3.select(this);
      const interpolate = d3.interpolate(
        { startAngle: d.startAngle, endAngle: d.startAngle },
        { startAngle: d.startAngle, endAngle: d.endAngle }
      );
      el.transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attrTween("d", () => (t) => arc(interpolate(t) as unknown as d3.DefaultArcObject) || "");
    });

    // Animate center text counting up
    const centerText = g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", mini ? "-0.2em" : "-0.3em")
      .attr("fill", "#e4e4e7")
      .attr("font-size", mini ? 18 : 28)
      .attr("font-weight", "bold");

    centerText.transition()
      .duration(800)
      .tween("text", () => {
        const i1 = d3.interpolateRound(0, t1Wins);
        const i2 = d3.interpolateRound(0, t2Wins);
        return (t) => { centerText.text(`${i1(t)}-${i2(t)}`); };
      });

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", mini ? "1.2em" : "1.4em")
      .attr("fill", "#71717a")
      .attr("font-size", mini ? 9 : 12)
      .attr("opacity", 0)
      .transition()
      .delay(400)
      .duration(400)
      .attr("opacity", 1)
      .selection()
      .text(`${total} matches`);
  }, [matchup, team1, team2, t1Wins, t2Wins, mini, total]);

  if (mini) {
    return (
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <TeamLogo team={team1} size={36} />
          <div
            className="text-xs font-bold"
            style={{ color: getColor(team1) }}
          >
            {team1.split(" ").pop()}
          </div>
        </div>
        <svg ref={svgRef} />
        <div className="flex flex-col items-center gap-1">
          <TeamLogo team={team2} size={36} />
          <div
            className="text-xs font-bold"
            style={{ color: getColor(team2) }}
          >
            {team2.split(" ").pop()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <TeamLogo team={team1} size={40} />
          <select
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            className="rounded-md border border-card-border bg-card px-3 py-2 text-foreground"
          >
            {allTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <span className="text-lg font-bold text-muted">vs</span>
        <div className="flex items-center gap-2">
          <TeamLogo team={team2} size={40} />
          <select
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            className="rounded-md border border-card-border bg-card px-3 py-2 text-foreground"
          >
            {allTeams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <ShareButton onClick={() => setShareOpen(true)} />
      </div>
      {matchup ? (
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <svg ref={svgRef} />
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label={team1}
                value={t1Wins}
                sub="wins"
                color={getColor(team1)}
              />
              <StatCard
                label={team2}
                value={t2Wins}
                sub="wins"
                color={getColor(team2)}
              />
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Win Rate
              </h4>
              <div className="flex h-4 overflow-hidden rounded-full">
                <div
                  className="transition-all duration-[800ms] ease-out"
                  style={{
                    width: barAnimated && total > 0 ? `${(t1Wins / total) * 100}%` : "50%",
                    backgroundColor: getColor(team1),
                  }}
                />
                <div
                  className="transition-all duration-[800ms] ease-out"
                  style={{
                    width: barAnimated && total > 0 ? `${(t2Wins / total) * 100}%` : "50%",
                    backgroundColor: getColor(team2),
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted">
                <span>
                  {total > 0 ? ((t1Wins / total) * 100).toFixed(0) : 0}%
                </span>
                <span>
                  {total > 0 ? ((t2Wins / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
            <div className="text-xs text-muted">
              Seasons: {matchup.seasons.join(", ")}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted">No matchup data for these teams.</p>
      )}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareProps={{
          type: "matchup",
          matchupData: matchup
            ? {
                team1,
                team2,
                team1Wins: t1Wins,
                team2Wins: t2Wins,
                totalMatches: total,
              }
            : undefined,
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 text-3xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}
