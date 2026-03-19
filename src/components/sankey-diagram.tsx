"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey";

interface SNode {
  id: string;
  name: string;
  season: string;
}

interface SLink {
  source: string;
  target: string;
  value: number;
  players: string[];
}

interface SankeyRaw {
  nodes: SNode[];
  links: SLink[];
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

const SHORT_NAMES: Record<string, string> = {
  "Mumbai Indians": "MI",
  "Chennai Super Kings": "CSK",
  "Royal Challengers Bengaluru": "RCB",
  "Royal Challengers Bangalore": "RCB",
  "Kolkata Knight Riders": "KKR",
  "Delhi Capitals": "DC",
  "Delhi Daredevils": "DD",
  "Rajasthan Royals": "RR",
  "Sunrisers Hyderabad": "SRH",
  "Punjab Kings": "PBKS",
  "Kings XI Punjab": "KXIP",
  "Gujarat Titans": "GT",
  "Lucknow Super Giants": "LSG",
  "Deccan Chargers": "DCH",
  "Kochi Tuskers Kerala": "KTK",
  "Pune Warriors": "PW",
  "Rising Pune Supergiant": "RPS",
  "Rising Pune Supergiants": "RPS",
  "Gujarat Lions": "GL",
};

function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return mobile;
}

interface SankeyDiagramProps {
  mini?: boolean;
}

export function SankeyDiagram({ mini = false }: SankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [raw, setRaw] = useState<SankeyRaw | null>(null);
  const [seasonRange, setSeasonRange] = useState<[number, number]>([2020, 2025]);
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch("/data/sankey.json")
      .then((r) => r.json())
      .then(setRaw);
  }, []);

  const showTooltip = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (x: number, y: number, d: any) => {
      if (!tooltipRef.current) return;
      const names = (d.players || []).slice(0, 10).join(", ");
      const extra = d.value > 10 ? ` +${d.value - 10} more` : "";
      tooltipRef.current.innerHTML = `<strong>${d.source?.name} → ${d.target?.name}</strong><br/>${d.value} players<br/><span class="text-xs text-zinc-400">${names}${extra}</span>`;
      tooltipRef.current.style.display = "block";
      tooltipRef.current.style.left = x + 10 + "px";
      tooltipRef.current.style.top = y - 10 + "px";
    },
    []
  );

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
  }, []);

  useEffect(() => {
    if (!raw || !svgRef.current || !containerRef.current) return;

    const [sFrom, sTo] = seasonRange;
    let filteredNodes = raw.nodes.filter((n) => {
      const s = parseInt(n.season);
      return s >= sFrom && s <= sTo;
    });

    const seasonNodeIds = new Set(filteredNodes.map((n) => n.id));
    let filteredLinks = raw.links.filter(
      (l) => seasonNodeIds.has(l.source) && seasonNodeIds.has(l.target)
    );

    if (filterTeam !== "all") {
      const teamNodeIds = new Set(
        filteredNodes.filter((n) => n.name === filterTeam).map((n) => n.id)
      );
      filteredLinks = filteredLinks.filter(
        (l) => teamNodeIds.has(l.source) || teamNodeIds.has(l.target)
      );
    }

    if (filteredLinks.length === 0 || filteredNodes.length < 2) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    filteredLinks = filteredLinks.filter((l) => l.value > 0);
    if (filteredLinks.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    const usedNodeIds = new Set<string>();
    filteredLinks.forEach((l) => {
      usedNodeIds.add(l.source);
      usedNodeIds.add(l.target);
    });
    filteredNodes = filteredNodes.filter((n) => usedNodeIds.has(n.id));

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const seasonSpan = sTo - sFrom + 1;

    const MIN_WIDTH_PER_SEASON = isMobile ? 100 : 140;
    const naturalWidth = Math.max(containerWidth, seasonSpan * MIN_WIDTH_PER_SEASON);
    const width = mini ? containerWidth : naturalWidth;

    const height = mini ? 250 : Math.max(500, filteredNodes.length * 12);

    const svg = d3.select(svgRef.current);
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const nodeMap = new Map(filteredNodes.map((n, i) => [n.id, i]));
    const sankeyNodes = filteredNodes.map((n) => ({ ...n }));
    const sankeyLinks = filteredLinks.map((l) => ({
      source: nodeMap.get(l.source)!,
      target: nodeMap.get(l.target)!,
      value: l.value,
      players: l.players,
    }));

    const nodeWidth = mini ? 10 : isMobile ? 12 : 16;
    const nodePadding = mini ? 4 : isMobile ? 6 : 8;

    const indexedNodes = sankeyNodes.map((d, i) => ({ ...d, index: i }));
    const sankeyGen = d3Sankey<{ index: number; name: string; season: string }, { source: number; target: number; value: number; players: string[] }>()
      .nodeId((d) => d.index)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .extent([
        [1, 1],
        [width - 1, height - 1],
      ]);

    const graph = sankeyGen({
      nodes: indexedNodes,
      links: sankeyLinks.map((d) => ({ ...d })),
    });

    const g = svg.append("g");
    const linkPath = sankeyLinkHorizontal();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const linkSel = g.selectAll(".sankey-link")
      .data(graph.links)
      .join("path")
      .attr("class", "sankey-link")
      .attr("d", linkPath as any)
      .attr("fill", "none")
      .attr("stroke", (d: any) => getColor(d.source.name || ""))
      .attr("stroke-opacity", 0.35)
      .attr("stroke-width", (d: any) => Math.max(1, d.width || 1));

    linkSel
      .on("mouseenter", function (event: MouseEvent, d: any) {
        d3.select(this).attr("stroke-opacity", 0.7);
        showTooltip(event.offsetX, event.offsetY, d);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke-opacity", 0.35);
        hideTooltip();
      });

    linkSel
      .on("touchstart", function (event: TouchEvent, d: any) {
        event.preventDefault();
        g.selectAll(".sankey-link").attr("stroke-opacity", 0.35);
        d3.select(this).attr("stroke-opacity", 0.7);
        const touch = event.touches[0];
        const rect = svgRef.current!.getBoundingClientRect();
        const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
        showTooltip(
          touch.clientX - rect.left + scrollLeft,
          touch.clientY - rect.top,
          d
        );
      }, { passive: false });

    // Nodes
    g.selectAll(".sankey-node")
      .data(graph.nodes)
      .join("rect")
      .attr("class", "sankey-node")
      .attr("x", (d: any) => d.x0 ?? 0)
      .attr("y", (d: any) => d.y0 ?? 0)
      .attr("width", (d: any) => (d.x1 ?? 0) - (d.x0 ?? 0))
      .attr("height", (d: any) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr("fill", (d: any) => getColor(d.name || ""))
      .attr("rx", 2);

    if (!mini) {
      const labelFontSize = isMobile ? 9 : 11;
      g.selectAll(".sankey-label")
        .data(graph.nodes)
        .join("text")
        .attr("class", "sankey-label")
        .attr("x", (d: any) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr("y", (d: any) => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d: any) => (d.x0 < width / 2 ? "start" : "end"))
        .attr("fill", "#a1a1aa")
        .attr("font-size", labelFontSize)
        .text((d: any) => {
          const abbr = SHORT_NAMES[d.name] || d.name;
          const season = (d.season || "").slice(2);
          return isMobile ? `${abbr} '${season}` : `${d.name} '${season}`;
        });
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [raw, seasonRange, filterTeam, mini, isMobile, showTooltip, hideTooltip]);

  // Dismiss tooltip on outside tap
  useEffect(() => {
    const handler = (e: TouchEvent) => {
      const target = e.target as Element;
      if (!target.closest(".sankey-link")) {
        hideTooltip();
      }
    };
    document.addEventListener("touchstart", handler);
    return () => document.removeEventListener("touchstart", handler);
  }, [hideTooltip]);

  const allTeams = raw
    ? [...new Set(raw.nodes.map((n) => n.name))].sort()
    : [];

  if (!raw) {
    return (
      <div className="flex h-full items-center justify-center text-muted text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" ref={containerRef}>
      {!mini && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted">
              From
              <input
                type="number"
                min={2008}
                max={2025}
                value={seasonRange[0]}
                onChange={(e) =>
                  setSeasonRange([parseInt(e.target.value), seasonRange[1]])
                }
                className="w-20 rounded-md border border-card-border bg-card px-2 py-1 text-foreground"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              To
              <input
                type="number"
                min={2008}
                max={2025}
                value={seasonRange[1]}
                onChange={(e) =>
                  setSeasonRange([seasonRange[0], parseInt(e.target.value)])
                }
                className="w-20 rounded-md border border-card-border bg-card px-2 py-1 text-foreground"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            Team
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="flex-1 rounded-md border border-card-border bg-card px-2 py-1 text-foreground sm:flex-initial"
            >
              <option value="all">All Teams</option>
              {allTeams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div
        ref={scrollRef}
        className="relative flex-1 min-h-0 overflow-x-auto overscroll-x-contain -mx-1 px-1"
      >
        <svg ref={svgRef} className={mini ? "w-full" : ""} />
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute z-10 hidden max-w-[260px] rounded-lg border border-card-border bg-card px-3 py-2 text-sm shadow-xl"
        />
      </div>
      {!mini && isMobile && (
        <p className="mt-2 text-center text-[10px] text-muted/60">
          ← Scroll horizontally to explore →
        </p>
      )}
    </div>
  );
}
