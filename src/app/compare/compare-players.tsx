"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

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
  "Kolkata Knight Riders": "#3A225D",
  "Delhi Capitals": "#004C93",
  "Rajasthan Royals": "#EA1A85",
  "Sunrisers Hyderabad": "#FF822A",
  "Punjab Kings": "#DD1F2D",
  "Gujarat Titans": "#1C1C2B",
  "Lucknow Super Giants": "#A72056",
};

function getColor(team: string) {
  return TEAM_COLORS[team] ?? "#666";
}

function computeStats(p: Player) {
  const totalRuns = p.seasons.reduce((s, x) => s + x.runs, 0);
  const totalBalls = p.seasons.reduce((s, x) => s + x.ballsFaced, 0);
  const totalWickets = p.seasons.reduce((s, x) => s + x.wickets, 0);
  const totalMatches = p.seasons.reduce((s, x) => s + x.matches, 0);
  const totalPom = p.seasons.reduce((s, x) => s + x.playerOfMatch, 0);
  const careerSR = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;
  const lastTeam = p.seasons[p.seasons.length - 1]?.team ?? "";
  return {
    totalRuns,
    totalBalls,
    totalWickets,
    totalMatches,
    seasonsPlayed: p.seasons.length,
    careerSR,
    playerOfMatch: totalPom,
    lastTeam,
  };
}

function ComparisonBar({
  label,
  value1,
  value2,
  name1,
  name2,
  color1,
  color2,
  format = (n: number) => n.toLocaleString(),
}: {
  label: string;
  value1: number;
  value2: number;
  name1: string;
  name2: string;
  color1: string;
  color2: string;
  format?: (n: number) => string;
}) {
  const [animated, setAnimated] = useState(false);
  const [displayV1, setDisplayV1] = useState(0);
  const [displayV2, setDisplayV2] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [value1, value2]);

  // Count-up animation for numbers
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayV1(Math.round(value1 * ease));
      setDisplayV2(Math.round(value2 * ease));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value1, value2]);

  const total = value1 + value2;
  const pct1 = animated && total > 0 ? (value1 / total) * 100 : 50;
  const pct2 = animated && total > 0 ? (value2 / total) * 100 : 50;

  return (
    <div ref={ref} className="rounded-xl border border-card-border bg-card p-4">
      <div className="mb-2 text-xs text-muted">{label}</div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-foreground">{name1}</span>
        <span className="font-mono text-lg font-bold text-foreground">{format(displayV1)}</span>
      </div>
      <div
        className="mb-2 h-3 w-full overflow-hidden rounded-full bg-card-border"
        role="presentation"
      >
        <div className="flex h-full w-full">
          <div
            className="h-full transition-all duration-[800ms] ease-out"
            style={{
              width: `${pct1}%`,
              backgroundColor: color1,
            }}
          />
          <div
            className="h-full transition-all duration-[800ms] ease-out"
            style={{
              width: `${pct2}%`,
              backgroundColor: color2,
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-foreground">{name2}</span>
        <span className="font-mono text-lg font-bold text-foreground">{format(displayV2)}</span>
      </div>
    </div>
  );
}

function PlayerSearch({
  value,
  onChange,
  players,
  selected,
  onSelect,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  players: Player[];
  selected: Player | null;
  onSelect: (p: Player) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!value.trim()) return [];
    const lower = value.toLowerCase();
    return players
      .filter((p) => p.name.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [value, players]);

  const showDropdown = focused && suggestions.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-card-border bg-card px-4 py-2.5 text-foreground placeholder-muted focus:border-blue-400/50 focus:outline-none"
      />
      {showDropdown && (
        <div className="absolute top-full z-20 mt-1 w-full rounded-lg border border-card-border bg-card shadow-xl">
          {suggestions.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                onSelect(p);
                onChange(p.name);
                setFocused(false);
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
  );
}

export default function ComparePlayers() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);

  useEffect(() => {
    fetch("/data/players.json")
      .then((r) => r.json())
      .then((data: Player[]) => {
        setPlayers(data);
        const kohli = data.find((p) => p.name === "V Kohli");
        const rohit = data.find((p) => p.name === "RG Sharma");
        const p1 = kohli ?? data[0] ?? null;
        let p2 = rohit ?? data[1] ?? null;
        if (p1 && p2 && p1.name === p2.name) {
          p2 = data.find((p) => p.name !== p1.name) ?? data[1] ?? null;
        }
        setPlayer1(p1);
        setPlayer2(p2);
        setSearch1(p1?.name ?? "");
        setSearch2(p2?.name ?? "");
      });
  }, []);

  const stats1 = player1 ? computeStats(player1) : null;
  const stats2 = player2 ? computeStats(player2) : null;
  const color1 = stats1 ? getColor(stats1.lastTeam) : "#666";
  const color2 = stats2 ? getColor(stats2.lastTeam) : "#666";

  // Career line chart: both players' runs per season
  useEffect(() => {
    if (!player1 || !player2 || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 280;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const allSeasons = [
      ...new Set([
        ...player1.seasons.map((s) => s.season),
        ...player2.seasons.map((s) => s.season),
      ]),
    ].sort((a, b) => parseInt(a) - parseInt(b));

    const runsBySeason1 = new Map(player1.seasons.map((s) => [s.season, s.runs]));
    const runsBySeason2 = new Map(player2.seasons.map((s) => [s.season, s.runs]));

    const maxRuns = Math.max(
      ...player1.seasons.map((s) => s.runs),
      ...player2.seasons.map((s) => s.runs),
      1
    );

    const x = d3
      .scalePoint()
      .domain(allSeasons)
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, maxRuns * 1.1])
      .range([height - margin.bottom, margin.top]);

    const svg = d3.select(svgRef.current);
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const line = d3
      .line<{ season: string; runs: number }>()
      .x((d) => x(d.season)!)
      .y((d) => y(d.runs))
      .curve(d3.curveMonotoneX);

    const data1 = allSeasons
      .filter((s) => runsBySeason1.has(s))
      .map((s) => ({ season: s, runs: runsBySeason1.get(s)! }));
    const data2 = allSeasons
      .filter((s) => runsBySeason2.has(s))
      .map((s) => ({ season: s, runs: runsBySeason2.get(s)! }));

    function animateLine(
      data: { season: string; runs: number }[],
      color: string,
      cls: string,
      delay: number,
    ) {
      if (data.length === 0) return;
      const path = g.append("path")
        .datum(data)
        .attr("d", line as unknown as string)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");

      const totalLen = (path.node() as SVGPathElement)?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", `${totalLen} ${totalLen}`)
        .attr("stroke-dashoffset", totalLen)
        .transition()
        .delay(delay)
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);

      g.selectAll(`.${cls}`)
        .data(data)
        .join("circle")
        .attr("class", cls)
        .attr("cx", (d) => x(d.season)!)
        .attr("cy", (d) => y(d.runs))
        .attr("r", 0)
        .attr("fill", color)
        .attr("stroke", "#06060a")
        .attr("stroke-width", 2)
        .transition()
        .delay((_d, i) => delay + (i / data.length) * 1000)
        .duration(300)
        .attr("r", 4);
    }

    animateLine(data1, color1, "dot1", 0);
    animateLine(data2, color2, "dot2", 200);

    const xAxis = d3
      .axisBottom(x)
      .tickFormat((d) => "'" + String(d).slice(2));
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .attr("color", "#333")
      .selectAll("text")
      .attr("fill", "#71717a")
      .attr("font-size", 10);

    const yAxis = d3.axisLeft(y).ticks(5);
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .attr("color", "#333")
      .selectAll("text")
      .attr("fill", "#71717a")
      .attr("font-size", 10);
  }, [player1, player2, color1, color2]);

  const allSeasons = useMemo(() => {
    if (!player1 || !player2) return [];
    const set = new Set([
      ...player1.seasons.map((s) => s.season),
      ...player2.seasons.map((s) => s.season),
    ]);
    return [...set].sort((a, b) => parseInt(a) - parseInt(b));
  }, [player1, player2]);

  const seasonMap1 = useMemo(
    () => new Map(player1?.seasons.map((s) => [s.season, s]) ?? []),
    [player1]
  );
  const seasonMap2 = useMemo(
    () => new Map(player2?.seasons.map((s) => [s.season, s]) ?? []),
    [player2]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
        Compare Players
      </h1>
      <p className="mb-8 text-sm text-muted">
        Pick any two IPL players and see a side-by-side comparison.
      </p>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-medium text-muted">
            Player 1
          </label>
          <PlayerSearch
            value={search1}
            onChange={setSearch1}
            players={players}
            selected={player1}
            onSelect={setPlayer1}
            placeholder="Search player..."
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-muted">
            Player 2
          </label>
          <PlayerSearch
            value={search2}
            onChange={setSearch2}
            players={players}
            selected={player2}
            onSelect={setPlayer2}
            placeholder="Search player..."
          />
        </div>
      </div>

      {player1 && player2 && stats1 && stats2 && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ComparisonBar
              label="Total Runs"
              value1={stats1.totalRuns}
              value2={stats2.totalRuns}
              name1={player1.name}
              name2={player2.name}
              color1={color1}
              color2={color2}
            />
            <ComparisonBar
              label="Total Wickets"
              value1={stats1.totalWickets}
              value2={stats2.totalWickets}
              name1={player1.name}
              name2={player2.name}
              color1={color1}
              color2={color2}
            />
            <ComparisonBar
              label="Total Matches"
              value1={stats1.totalMatches}
              value2={stats2.totalMatches}
              name1={player1.name}
              name2={player2.name}
              color1={color1}
              color2={color2}
            />
            <ComparisonBar
              label="Seasons Played"
              value1={stats1.seasonsPlayed}
              value2={stats2.seasonsPlayed}
              name1={player1.name}
              name2={player2.name}
              color1={color1}
              color2={color2}
            />
            <ComparisonBar
              label="Career Strike Rate"
              value1={Math.round(stats1.careerSR * 10) / 10}
              value2={Math.round(stats2.careerSR * 10) / 10}
              name1={player1.name}
              name2={player2.name}
              color1={color1}
              color2={color2}
              format={(n) => n.toFixed(1)}
            />
            <ComparisonBar
              label="Player of Match"
              value1={stats1.playerOfMatch}
              value2={stats2.playerOfMatch}
              name1={player1.name}
              name2={player2.name}
              color1={color1}
              color2={color2}
            />
          </div>

          <div className="mb-8 rounded-xl border border-card-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Runs per Season
            </h2>
            <div className="mb-4 flex items-center gap-6">
              <span className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: color1 }}
                />
                {player1.name}
              </span>
              <span className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: color2 }}
                />
                {player2.name}
              </span>
            </div>
            <div ref={containerRef}>
              <svg ref={svgRef} className="w-full" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
            <h2 className="border-b border-card-border px-6 py-4 text-lg font-semibold text-foreground">
              Season-by-Season Comparison
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 text-left">Season</th>
                  <th className="px-4 py-3 text-left">
                    <span
                      className="inline-block h-2 w-2 rounded-full mr-2"
                      style={{ backgroundColor: color1 }}
                    />
                    {player1.name}
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span
                      className="inline-block h-2 w-2 rounded-full mr-2"
                      style={{ backgroundColor: color2 }}
                    />
                    {player2.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {allSeasons.map((season) => {
                  const s1 = seasonMap1.get(season);
                  const s2 = seasonMap2.get(season);
                  return (
                    <tr
                      key={season}
                      className="border-b border-card-border/50 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-mono text-foreground">
                        {season}
                      </td>
                      <td className="px-4 py-3">
                        {s1 ? (
                          <span className="text-foreground">
                            {s1.team} · {s1.matches} mat · {s1.runs} runs
                            {s1.ballsFaced > 0 && (
                              <span className="text-muted">
                                {" "}
                                (SR {s1.strikeRate})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {s2 ? (
                          <span className="text-foreground">
                            {s2.team} · {s2.matches} mat · {s2.runs} runs
                            {s2.ballsFaced > 0 && (
                              <span className="text-muted">
                                {" "}
                                (SR {s2.strikeRate})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
