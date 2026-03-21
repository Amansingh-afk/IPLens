"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { ShareModal, ShareButton } from "@/components/share-modal";

interface PlayerSeason {
  season: string;
  team: string;
  matches: number;
  runs: number;
  ballsFaced: number;
  wickets: number;
  strikeRate: number;
  economyRate: number;
  playerOfMatch: number;
}

interface Player {
  name: string;
  seasons: PlayerSeason[];
}

const TEAM_COLORS: Record<string, string> = {
  "Mumbai Indians": "#004BA0",
  "Chennai Super Kings": "#FDB913",
  "Royal Challengers Bengaluru": "#EC1C24",
  "Royal Challengers Bangalore": "#EC1C24",
  "Kolkata Knight Riders": "#3A225D",
  "Delhi Capitals": "#004C93",
  "Delhi Daredevils": "#004C93",
  "Rajasthan Royals": "#EA1A85",
  "Sunrisers Hyderabad": "#FF822A",
  "Punjab Kings": "#DD1F2D",
  "Kings XI Punjab": "#DD1F2D",
  "Gujarat Titans": "#1C1C2B",
  "Lucknow Super Giants": "#A72056",
  "Deccan Chargers": "#5C7A99",
  "Kochi Tuskers Kerala": "#6B4E3D",
  "Pune Warriors": "#6E7B8B",
  "Rising Pune Supergiant": "#6E7B8B",
  "Rising Pune Supergiants": "#6E7B8B",
  "Gujarat Lions": "#E04F16",
};

function getColor(team: string) {
  return TEAM_COLORS[team] ?? "#666";
}

interface PlayerTimelineProps {
  playerName?: string;
  mini?: boolean;
}

export function PlayerTimeline({
  playerName,
  mini = false,
}: PlayerTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState(playerName || "");
  const [selected, setSelected] = useState<Player | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    fetch("/data/players.json")
      .then((r) => r.json())
      .then((data: Player[]) => {
        setPlayers(data);
        if (playerName) {
          const p = data.find(
            (p) => p.name.toLowerCase() === playerName.toLowerCase()
          );
          if (p) setSelected(p);
        } else {
          setSelected(data[0] || null);
          setSearch(data[0]?.name || "");
        }
      });
  }, [playerName]);

  const suggestions = useMemo(() => {
    if (!search || search === selected?.name) return [];
    const lower = search.toLowerCase();
    return players
      .filter((p) => p.name.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [search, players, selected]);

  useEffect(() => {
    if (!selected || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = mini ? 100 : 300;
    const margin = {
      top: mini ? 10 : 30,
      right: mini ? 10 : 30,
      bottom: mini ? 20 : 40,
      left: mini ? 30 : 50,
    };

    const svg = d3.select(svgRef.current);
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const seasons = selected.seasons;
    const x = d3
      .scalePoint()
      .domain(seasons.map((s) => s.season))
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const maxRuns = d3.max(seasons, (s) => s.runs) || 1;
    const y = d3
      .scaleLinear()
      .domain([0, maxRuns * 1.1])
      .range([height - margin.bottom, margin.top]);

    // Area
    const area = d3
      .area<PlayerSeason>()
      .x((d) => x(d.season)!)
      .y0(height - margin.bottom)
      .y1((d) => y(d.runs))
      .curve(d3.curveMonotoneX);

    const g = svg.append("g");

    // Gradient per segment
    seasons.forEach((s, i) => {
      if (i === 0) return;
      const prev = seasons[i - 1];
      const color = getColor(s.team);

      g.append("path")
        .datum([prev, s])
        .attr("d", area as unknown as string)
        .attr("fill", color)
        .attr("fill-opacity", 0.15);
    });

    // Line
    const line = d3
      .line<PlayerSeason>()
      .x((d) => x(d.season)!)
      .y((d) => y(d.runs))
      .curve(d3.curveMonotoneX);

    seasons.forEach((s, i) => {
      if (i === 0) return;
      const prev = seasons[i - 1];
      g.append("path")
        .datum([prev, s])
        .attr("d", line as unknown as string)
        .attr("fill", "none")
        .attr("stroke", getColor(s.team))
        .attr("stroke-width", 2.5);
    });

    // Dots
    g.selectAll(".dot")
      .data(seasons)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.season)!)
      .attr("cy", (d) => y(d.runs))
      .attr("r", mini ? 3 : 5)
      .attr("fill", (d) => getColor(d.team))
      .attr("stroke", "#06060a")
      .attr("stroke-width", 2);

    // Labels on dots (not mini)
    if (!mini) {
      g.selectAll(".dot-label")
        .data(seasons)
        .join("text")
        .attr("class", "dot-label")
        .attr("x", (d) => x(d.season)!)
        .attr("y", (d) => y(d.runs) - 12)
        .attr("text-anchor", "middle")
        .attr("fill", "#a1a1aa")
        .attr("font-size", 10)
        .attr("font-family", "var(--font-geist-mono)")
        .text((d) => d.runs);
    }

    // X axis
    const xAxis = d3
      .axisBottom(x)
      .tickFormat((d) => "'" + String(d).slice(2));
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .attr("color", "#333")
      .selectAll("text")
      .attr("fill", "#71717a")
      .attr("font-size", mini ? 8 : 11);

    if (!mini) {
      const yAxis = d3.axisLeft(y).ticks(5);
      g.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
        .attr("color", "#333")
        .selectAll("text")
        .attr("fill", "#71717a")
        .attr("font-size", 11);
    }
  }, [selected, mini]);

  const totalRuns = selected?.seasons.reduce((s, x) => s + x.runs, 0) || 0;
  const totalWickets =
    selected?.seasons.reduce((s, x) => s + x.wickets, 0) || 0;
  const totalMatches =
    selected?.seasons.reduce((s, x) => s + x.matches, 0) || 0;

  const sharePlayerData =
    selected && selected.seasons.length > 0
      ? (() => {
          const totalRuns = selected.seasons.reduce((s, x) => s + x.runs, 0);
          const totalWickets = selected.seasons.reduce(
            (s, x) => s + x.wickets,
            0
          );
          const totalMatches = selected.seasons.reduce(
            (s, x) => s + x.matches,
            0
          );
          const bestSeason = selected.seasons.reduce(
            (best, s) => (s.runs > best.runs ? s : best),
            selected.seasons[0]
          );
          const teams = [...new Set(selected.seasons.map((s) => s.team))];
          return {
            name: selected.name,
            runs: totalRuns,
            wickets: totalWickets,
            matches: totalMatches,
            seasons: selected.seasons.length,
            bestSeason: {
              season: bestSeason.season,
              runs: bestSeason.runs,
              team: bestSeason.team,
            },
            teams,
          };
        })()
      : undefined;

  if (mini && selected) {
    return (
      <div ref={containerRef} className="h-full">
        <div className="mb-1 text-xs font-semibold text-foreground">
          {selected.name}
        </div>
        <svg ref={svgRef} className="w-full" />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <div className="relative mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="Search player..."
          className="w-full max-w-md rounded-lg border border-card-border bg-card px-4 py-2.5 text-foreground placeholder-muted focus:border-blue-400/50 focus:outline-none"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full z-20 mt-1 w-full max-w-md rounded-lg border border-card-border bg-card shadow-xl">
            {suggestions.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setSelected(p);
                  setSearch(p.name);
                }}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-white/5"
              >
                {p.name}
                <span className="ml-2 text-xs text-muted">
                  {p.seasons.length} seasons
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {selected.name}
            </h2>
            <ShareButton onClick={() => setShareOpen(true)} />
          </div>
          <div className="mb-6 grid grid-cols-3 gap-4 md:grid-cols-4">
            <MiniStat label="Total Runs" value={totalRuns.toLocaleString()} />
            <MiniStat label="Wickets" value={totalWickets.toString()} />
            <MiniStat label="Matches" value={totalMatches.toString()} />
            <MiniStat
              label="Seasons"
              value={selected.seasons.length.toString()}
            />
          </div>
          <svg ref={svgRef} className="w-full" />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-xs uppercase tracking-wider text-muted">
                  <th className="px-3 py-2 text-left">Season</th>
                  <th className="px-3 py-2 text-left">Team</th>
                  <th className="px-3 py-2 text-right">Mat</th>
                  <th className="px-3 py-2 text-right">Runs</th>
                  <th className="px-3 py-2 text-right">SR</th>
                  <th className="px-3 py-2 text-right">Wkts</th>
                  <th className="px-3 py-2 text-right">Econ</th>
                </tr>
              </thead>
              <tbody>
                {selected.seasons.map((s) => (
                  <tr
                    key={s.season}
                    className="border-b border-card-border/50 hover:bg-white/5"
                  >
                    <td className="px-3 py-2 font-mono">{s.season}</td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full mr-2"
                        style={{ backgroundColor: getColor(s.team) }}
                      />
                      {s.team}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {s.matches}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      {s.runs}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {s.strikeRate}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {s.wickets}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {s.economyRate > 0 ? s.economyRate : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareProps={{
          type: "player",
          playerData: sharePlayerData,
        }}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
