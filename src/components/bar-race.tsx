"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

interface SeasonEntry {
  player: string;
  team: string;
  runs: number;
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

interface BarRaceProps {
  mini?: boolean;
  maxBars?: number;
}

export function BarRace({ mini = false, maxBars = 12 }: BarRaceProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<Record<string, SeasonEntry[]> | null>(null);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/data/seasons.json")
      .then((r) => r.json())
      .then((d: Record<string, SeasonEntry[]>) => {
        setData(d);
        const sorted = Object.keys(d).sort(
          (a, b) => parseInt(a) - parseInt(b)
        );
        setSeasons(sorted);
      });
  }, []);

  const animate = useCallback(() => {
    setCurrentIdx((prev) => {
      if (prev >= seasons.length - 1) {
        return 0;
      }
      return prev + 1;
    });
  }, [seasons.length]);

  useEffect(() => {
    if (playing && seasons.length > 0) {
      intervalRef.current = setInterval(animate, mini ? 1500 : 2000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, seasons.length, animate, mini]);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current || seasons.length === 0) return;

    const season = seasons[currentIdx];
    const entries = (data[season] || []).slice(0, maxBars);

    const container = containerRef.current;
    const width = container.clientWidth;
    const barHeight = mini ? 22 : 32;
    const height = entries.length * (barHeight + 4) + (mini ? 30 : 50);

    const svg = d3.select(svgRef.current);
    svg.attr("width", width).attr("height", height);

    const margin = { top: mini ? 24 : 40, right: mini ? 50 : 80, bottom: 0, left: mini ? 100 : 140 };
    const innerW = width - margin.left - margin.right;

    const maxRuns = d3.max(entries, (d) => d.runs) || 1;

    const x = d3.scaleLinear().domain([0, maxRuns]).range([0, innerW]);

    const y = d3
      .scaleBand()
      .domain(entries.map((d) => d.player))
      .range([margin.top, margin.top + entries.length * (barHeight + 4)])
      .padding(0.12);

    // Season label — watermark positioned at bottom-right of chart area
    svg.selectAll(".season-label").remove();
    svg
      .append("text")
      .attr("class", "season-label")
      .attr("x", width - margin.right)
      .attr("y", height - (mini ? 10 : 16))
      .attr("text-anchor", "end")
      .attr("fill", "#ffffff12")
      .attr("font-size", mini ? 48 : 72)
      .attr("font-weight", "bold")
      .text(season);

    // Bars
    const bars = svg.selectAll<SVGGElement, SeasonEntry>(".bar-g").data(entries, (d) => d.player);

    bars.exit().transition().duration(400).style("opacity", 0).remove();

    const enter = bars
      .enter()
      .append("g")
      .attr("class", "bar-g")
      .style("opacity", 0);

    enter
      .append("rect")
      .attr("class", "bar-rect")
      .attr("rx", 3)
      .attr("height", y.bandwidth());

    enter.append("text").attr("class", "bar-name");
    enter.append("text").attr("class", "bar-value");

    const merged = enter.merge(bars);

    merged.transition().duration(600).style("opacity", 1);

    merged
      .select<SVGRectElement>(".bar-rect")
      .transition()
      .duration(600)
      .attr("x", margin.left)
      .attr("y", (d) => y(d.player)!)
      .attr("width", (d) => Math.max(0, x(d.runs)))
      .attr("height", y.bandwidth())
      .attr("fill", (d) => getColor(d.team));

    merged
      .select<SVGTextElement>(".bar-name")
      .transition()
      .duration(600)
      .attr("x", margin.left - 6)
      .attr("y", (d) => y(d.player)! + y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "central")
      .attr("fill", "#e4e4e7")
      .attr("font-size", mini ? 10 : 13)
      .text((d) => d.player);

    merged
      .select<SVGTextElement>(".bar-value")
      .transition()
      .duration(600)
      .attr("x", (d) => margin.left + Math.max(0, x(d.runs)) + 6)
      .attr("y", (d) => y(d.player)! + y.bandwidth() / 2)
      .attr("dominant-baseline", "central")
      .attr("fill", "#a1a1aa")
      .attr("font-size", mini ? 9 : 12)
      .attr("font-family", "var(--font-geist-mono)")
      .text((d) => d.runs.toLocaleString());
  }, [data, currentIdx, seasons, mini, maxBars]);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-muted text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" ref={containerRef}>
      {!mini && (
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-lg border border-card-border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
          >
            {playing ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min={0}
            max={seasons.length - 1}
            value={currentIdx}
            onChange={(e) => {
              setCurrentIdx(parseInt(e.target.value));
              setPlaying(false);
            }}
            className="flex-1 accent-blue-400"
          />
          <span className="font-mono text-lg font-bold text-foreground tabular-nums">
            {seasons[currentIdx]}
          </span>
        </div>
      )}
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
