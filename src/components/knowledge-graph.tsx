"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

interface GNode {
  id: string;
  type: "player" | "team" | "season" | "venue";
  label: string;
  runs?: number;
  wickets?: number;
  seasons?: number;
  city?: string;
  // d3 simulation props
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GEdge {
  source: string | GNode;
  target: string | GNode;
  type: "played_for" | "played_in" | "rivalry" | "played_at";
  season?: string;
  runs?: number;
  wickets?: number;
  wins?: number;
  losses?: number;
  matches?: number;
  team1Wins?: number;
  team2Wins?: number;
}

interface GraphData {
  nodes: GNode[];
  edges: GEdge[];
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

const NODE_COLORS: Record<string, string> = {
  player: "#3b82f6",
  team: "#f59e0b",
  season: "#10b981",
  venue: "#8b5cf6",
};

const EDGE_COLORS: Record<string, string> = {
  played_for: "#3b82f680",
  played_in: "#10b98140",
  rivalry: "#ef444480",
  played_at: "#8b5cf640",
};

interface Preset {
  name: string;
  description: string;
  filter: (nodes: GNode[], edges: GEdge[]) => { nodes: GNode[]; edges: GEdge[] };
}

const PRESETS: Preset[] = [
  {
    name: "CSK Dynasty",
    description: "Chennai Super Kings and all their players",
    filter: (nodes, edges) => {
      const cskId = "team:Chennai Super Kings";
      const connectedIds = new Set([cskId]);
      edges.forEach((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        if (src === cskId) connectedIds.add(tgt);
        if (tgt === cskId) connectedIds.add(src);
      });
      const filteredNodes = nodes.filter((n) => connectedIds.has(n.id));
      const nodeIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = edges.filter((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        return nodeIds.has(src) && nodeIds.has(tgt);
      });
      return { nodes: filteredNodes, edges: filteredEdges };
    },
  },
  {
    name: "Virat's Journey",
    description: "V Kohli's connections across IPL history",
    filter: (nodes, edges) => {
      const viratId = "player:V Kohli";
      const connectedIds = new Set([viratId]);
      edges.forEach((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        if (src === viratId) connectedIds.add(tgt);
        if (tgt === viratId) connectedIds.add(src);
      });
      const filteredNodes = nodes.filter((n) => connectedIds.has(n.id));
      const nodeIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = edges.filter((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        return nodeIds.has(src) && nodeIds.has(tgt);
      });
      return { nodes: filteredNodes, edges: filteredEdges };
    },
  },
  {
    name: "MI vs CSK",
    description: "The greatest rivalry and its players",
    filter: (nodes, edges) => {
      const teamIds = new Set(["team:Mumbai Indians", "team:Chennai Super Kings"]);
      const connectedIds = new Set(teamIds);
      edges.forEach((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        if (e.type === "played_for" && (teamIds.has(src) || teamIds.has(tgt))) {
          connectedIds.add(src);
          connectedIds.add(tgt);
        }
        if (e.type === "rivalry" && teamIds.has(src) && teamIds.has(tgt)) {
          connectedIds.add(src);
          connectedIds.add(tgt);
        }
      });
      const filteredNodes = nodes.filter((n) => connectedIds.has(n.id));
      const nodeIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = edges.filter((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        return nodeIds.has(src) && nodeIds.has(tgt) && (e.type === "played_for" || e.type === "rivalry");
      });
      return { nodes: filteredNodes, edges: filteredEdges };
    },
  },
  {
    name: "2024 Season",
    description: "All teams and players from IPL 2024",
    filter: (nodes, edges) => {
      const seasonEdges = edges.filter((e) => e.season === "2024");
      const connectedIds = new Set<string>();
      connectedIds.add("season:2024");
      seasonEdges.forEach((e) => {
        connectedIds.add(typeof e.source === "string" ? e.source : e.source.id);
        connectedIds.add(typeof e.target === "string" ? e.target : e.target.id);
      });
      const filteredNodes = nodes.filter((n) => connectedIds.has(n.id));
      const nodeIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = edges.filter((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        return nodeIds.has(src) && nodeIds.has(tgt) && (e.season === "2024" || e.type === "rivalry");
      });
      return { nodes: filteredNodes, edges: filteredEdges };
    },
  },
  {
    name: "All Teams",
    description: "All franchises and their rivalries",
    filter: (nodes, edges) => {
      const filteredNodes = nodes.filter((n) => n.type === "team");
      const nodeIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = edges.filter((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        return nodeIds.has(src) && nodeIds.has(tgt) && e.type === "rivalry";
      });
      return { nodes: filteredNodes, edges: filteredEdges };
    },
  },
];

interface Filters {
  showPlayers: boolean;
  showTeams: boolean;
  showSeasons: boolean;
  showVenues: boolean;
  seasonRange: [number, number];
  search: string;
  edgeTypes: Set<string>;
}

export function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GNode, GEdge> | null>(null);
  const [raw, setRaw] = useState<GraphData | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>("All Teams");
  const [filters, setFilters] = useState<Filters>({
    showPlayers: true,
    showTeams: true,
    showSeasons: false,
    showVenues: false,
    seasonRange: [2008, 2025],
    search: "",
    edgeTypes: new Set(["played_for", "rivalry"]),
  });
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);

  useEffect(() => {
    fetch("/data/graph.json")
      .then((r) => r.json())
      .then(setRaw);
  }, []);

  const getFilteredData = useCallback((): { nodes: GNode[]; edges: GEdge[] } => {
    if (!raw) return { nodes: [], edges: [] };

    if (activePreset) {
      const preset = PRESETS.find((p) => p.name === activePreset);
      if (preset) return preset.filter(raw.nodes, raw.edges);
    }

    let nodes = raw.nodes.filter((n) => {
      if (n.type === "player" && !filters.showPlayers) return false;
      if (n.type === "team" && !filters.showTeams) return false;
      if (n.type === "season" && !filters.showSeasons) return false;
      if (n.type === "venue" && !filters.showVenues) return false;
      if (filters.search) {
        return n.label.toLowerCase().includes(filters.search.toLowerCase());
      }
      return true;
    });

    // If searching, also include connected nodes
    if (filters.search) {
      const matchIds = new Set(nodes.map((n) => n.id));
      const connectedIds = new Set(matchIds);
      raw.edges.forEach((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        if (matchIds.has(src)) connectedIds.add(tgt);
        if (matchIds.has(tgt)) connectedIds.add(src);
      });
      nodes = raw.nodes.filter((n) => connectedIds.has(n.id));
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = raw.edges.filter((e) => {
      const src = typeof e.source === "string" ? e.source : e.source.id;
      const tgt = typeof e.target === "string" ? e.target : e.target.id;
      if (!nodeIds.has(src) || !nodeIds.has(tgt)) return false;
      if (!filters.edgeTypes.has(e.type)) return false;
      if (e.season) {
        const s = parseInt(e.season);
        if (s < filters.seasonRange[0] || s > filters.seasonRange[1]) return false;
      }
      return true;
    });

    return { nodes, edges };
  }, [raw, activePreset, filters]);

  useEffect(() => {
    if (!raw || !svgRef.current || !containerRef.current) return;

    const { nodes, edges } = getFilteredData();
    if (nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 700;

    const svg = d3.select(svgRef.current);
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Deep copy nodes for simulation
    const simNodes: GNode[] = nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
    const simEdges = edges
      .map((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;
        const sourceNode = nodeMap.get(src);
        const targetNode = nodeMap.get(tgt);
        if (!sourceNode || !targetNode) return null;
        return { ...e, source: sourceNode, target: targetNode };
      })
      .filter(Boolean) as (GEdge & { source: GNode; target: GNode })[];

    function getNodeRadius(n: GNode) {
      if (n.type === "team") return 16;
      if (n.type === "season") return 12;
      if (n.type === "venue") return 8;
      const runs = n.runs || 0;
      return Math.max(4, Math.min(14, 4 + runs / 800));
    }

    function getNodeColor(n: GNode) {
      if (n.type === "team") return TEAM_COLORS[n.label] || NODE_COLORS.team;
      return NODE_COLORS[n.type] || "#666";
    }

    // Links
    const link = g
      .append("g")
      .selectAll("line")
      .data(simEdges)
      .join("line")
      .attr("stroke", (d) => EDGE_COLORS[d.type] || "#33333380")
      .attr("stroke-width", (d) => {
        if (d.type === "rivalry") return Math.max(1, Math.min(6, (d.matches || 1) / 5));
        return 0.5;
      });

    // Nodes
    const node = g
      .append("g")
      .selectAll<SVGCircleElement, GNode>("circle")
      .data(simNodes)
      .join("circle")
      .attr("r", getNodeRadius)
      .attr("fill", getNodeColor)
      .attr("stroke", "#06060a")
      .attr("stroke-width", 1.5)
      .attr("cursor", "pointer");

    // Labels for teams and seasons (always visible)
    const labels = g
      .append("g")
      .selectAll("text")
      .data(simNodes.filter((n) => n.type === "team" || n.type === "season"))
      .join("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => getNodeRadius(d) + 14)
      .attr("fill", "#a1a1aa")
      .attr("font-size", 10)
      .attr("pointer-events", "none")
      .text((d) => d.type === "team" ? d.label.split(" ").pop()! : d.label);

    // Drag behavior
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, GNode, GNode>) {
      if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    function dragged(event: d3.D3DragEvent<SVGCircleElement, GNode, GNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    function dragended(event: d3.D3DragEvent<SVGCircleElement, GNode, GNode>) {
      if (!event.active) simulationRef.current?.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    node.call(
      d3.drag<SVGCircleElement, GNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    // Hover tooltip
    node.on("mouseenter", (event: MouseEvent, d: GNode) => {
      if (!tooltipRef.current) return;
      let html = `<strong>${d.label}</strong><br/><span class="text-xs text-zinc-400">${d.type}</span>`;
      if (d.type === "player") {
        html += `<br/>Runs: ${(d.runs || 0).toLocaleString()} | Wickets: ${d.wickets || 0}<br/>Seasons: ${d.seasons || 0}`;
      }
      if (d.type === "venue") {
        html += `<br/>${d.city || ""}`;
      }
      tooltipRef.current.innerHTML = html;
      tooltipRef.current.style.display = "block";
      tooltipRef.current.style.left = event.clientX + 12 + "px";
      tooltipRef.current.style.top = event.clientY - 10 + "px";

      // Highlight connected
      const nodeId = d.id;
      const connectedIds = new Set([nodeId]);
      simEdges.forEach((e) => {
        if ((e.source as GNode).id === nodeId) connectedIds.add((e.target as GNode).id);
        if ((e.target as GNode).id === nodeId) connectedIds.add((e.source as GNode).id);
      });
      node.attr("opacity", (n) => connectedIds.has(n.id) ? 1 : 0.1);
      link.attr("opacity", (e) =>
        (e.source as GNode).id === nodeId || (e.target as GNode).id === nodeId ? 1 : 0.05
      );
      labels.attr("opacity", (n) => connectedIds.has(n.id) ? 1 : 0.1);
    })
    .on("mousemove", (event: MouseEvent) => {
      if (tooltipRef.current) {
        tooltipRef.current.style.left = event.clientX + 12 + "px";
        tooltipRef.current.style.top = event.clientY - 10 + "px";
      }
    })
    .on("mouseleave", () => {
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
      node.attr("opacity", 1);
      link.attr("opacity", 1);
      labels.attr("opacity", 1);
    })
    .on("click", (_event: MouseEvent, d: GNode) => {
      setSelectedNode(d);
    });

    // Simulation
    const sim = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink(simEdges)
          .id((d) => (d as GNode).id)
          .distance((d) => {
            const e = d as unknown as GEdge;
            if (e.type === "rivalry") return 100;
            if (e.type === "played_for") return 60;
            return 80;
          })
      )
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<GNode>().radius((d) => getNodeRadius(d) + 2));

    simulationRef.current = sim;

    sim.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GNode).x!)
        .attr("y1", (d) => (d.source as GNode).y!)
        .attr("x2", (d) => (d.target as GNode).x!)
        .attr("y2", (d) => (d.target as GNode).y!);
      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    // Initial zoom to fit
    setTimeout(() => {
      const bounds = g.node()?.getBBox();
      if (bounds) {
        const dx = bounds.width + 80;
        const dy = bounds.height + 80;
        const scale = Math.min(0.9, Math.min(width / dx, height / dy));
        const tx = width / 2 - (bounds.x + bounds.width / 2) * scale;
        const ty = height / 2 - (bounds.y + bounds.height / 2) * scale;
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(scale)
        );
      }
    }, 1500);

    return () => {
      sim.stop();
    };
  }, [raw, getFilteredData]);

  const toggleEdgeType = (type: string) => {
    setActivePreset(null);
    setFilters((f) => {
      const next = new Set(f.edgeTypes);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return { ...f, edgeTypes: next };
    });
  };

  if (!raw) {
    return (
      <div className="flex h-[700px] items-center justify-center text-muted text-sm">
        Loading graph...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full shrink-0 space-y-4 overflow-y-auto border-b border-card-border bg-card p-4 lg:w-72 lg:border-b-0 lg:border-r">
        {/* Search */}
        <input
          type="text"
          value={filters.search}
          onChange={(e) => {
            setActivePreset(null);
            setFilters((f) => ({ ...f, search: e.target.value }));
          }}
          placeholder="Search player, team, venue..."
          className="w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted focus:border-blue-400/50 focus:outline-none"
        />

        {/* Presets */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Presets
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setActivePreset(activePreset === p.name ? null : p.name);
                  setFilters((f) => ({ ...f, search: "" }));
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  activePreset === p.name
                    ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                    : "border border-card-border text-muted hover:text-foreground hover:bg-white/5"
                }`}
                title={p.description}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Node types */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Node Types
          </h3>
          <div className="space-y-1.5">
            {(["players", "teams", "seasons", "venues"] as const).map((key) => {
              const filterKey = `show${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof Filters;
              const color = NODE_COLORS[key.slice(0, -1)];
              return (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters[filterKey] as boolean}
                    onChange={() => {
                      setActivePreset(null);
                      setFilters((f) => ({ ...f, [filterKey]: !f[filterKey] }));
                    }}
                    className="accent-blue-400"
                  />
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-foreground capitalize">{key}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Edge types */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Edge Types
          </h3>
          <div className="space-y-1.5">
            {["played_for", "rivalry", "played_in", "played_at"].map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.edgeTypes.has(type)}
                  onChange={() => toggleEdgeType(type)}
                  className="accent-blue-400"
                />
                <span className="text-foreground">
                  {type.replace(/_/g, " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Season range */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Season Range
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={2008}
              max={2025}
              value={filters.seasonRange[0]}
              onChange={(e) => {
                setActivePreset(null);
                setFilters((f) => ({
                  ...f,
                  seasonRange: [parseInt(e.target.value), f.seasonRange[1]],
                }));
              }}
              className="w-16 rounded border border-card-border bg-background px-2 py-1 text-sm text-foreground"
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              min={2008}
              max={2025}
              value={filters.seasonRange[1]}
              onChange={(e) => {
                setActivePreset(null);
                setFilters((f) => ({
                  ...f,
                  seasonRange: [f.seasonRange[0], parseInt(e.target.value)],
                }));
              }}
              className="w-16 rounded border border-card-border bg-background px-2 py-1 text-sm text-foreground"
            />
          </div>
        </div>

        {/* Legend */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Legend
          </h3>
          <div className="space-y-1 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: NODE_COLORS.player }} />
              Player (size = career runs)
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: NODE_COLORS.team }} />
              Team (colored by franchise)
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: NODE_COLORS.season }} />
              Season
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: NODE_COLORS.venue }} />
              Venue
            </div>
          </div>
        </div>

        {/* Selected node detail */}
        {selectedNode && (
          <div className="rounded-xl border border-card-border bg-background p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                {selectedNode.label}
              </h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="mt-1 text-xs text-muted capitalize">
              {selectedNode.type}
            </div>
            {selectedNode.type === "player" && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted">Runs</span>
                  <div className="font-mono font-bold text-foreground">
                    {(selectedNode.runs || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted">Wickets</span>
                  <div className="font-mono font-bold text-foreground">
                    {selectedNode.wickets || 0}
                  </div>
                </div>
                <div>
                  <span className="text-muted">Seasons</span>
                  <div className="font-mono font-bold text-foreground">
                    {selectedNode.seasons || 0}
                  </div>
                </div>
              </div>
            )}
            {selectedNode.type === "venue" && selectedNode.city && (
              <div className="mt-1 text-xs text-muted">{selectedNode.city}</div>
            )}
          </div>
        )}
      </div>

      {/* Graph area */}
      <div className="relative flex-1 min-h-0" ref={containerRef}>
        <svg ref={svgRef} className="h-full w-full" />
        <div
          ref={tooltipRef}
          className="pointer-events-none fixed z-50 hidden rounded-lg border border-card-border bg-card px-3 py-2 text-sm shadow-xl"
          style={{ maxWidth: 300 }}
        />
      </div>
    </div>
  );
}
