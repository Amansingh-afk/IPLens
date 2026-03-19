# IPLens

> *The lens through which India watches cricket.*

IPLens is an interactive IPL data visualization platform — a beautiful, explorable history of 17 years of IPL cricket. Think of it as a knowledge graph for cricket: every player, every team, every season — connected, animated, and shareable.

**Inspiration:** [GitNexus](https://gitnexus.vercel.app/) — but for cricket data instead of codebases. Interactive node graphs, flowing Sankey diagrams, animated bar races — all explorable in the browser.

---

## What It Does

### Player Journey Timeline
- Every player's full IPL career across seasons
- Team colors, runs scored, wickets taken per season
- Visual timeline showing team transfers and auction history
- Performance trends — spikes, slumps, comeback seasons

### Player Movement — Sankey Diagram
- Flow diagram showing players moving between franchises across auctions
- Auction vs retention visually distinct
- Filter by season, team, or player type

### Head-to-Head Rivalry Stats
- Any two teams across all IPL seasons
- Win/loss record, run rates, key moments

### Visualizations

| Data | Chart Type |
|---|---|
| Player runs per season | Line chart with team color coding |
| Player movement between teams | Sankey / flow diagram |
| Win/loss per season | Heatmap calendar |
| Top scorers per season | Animated bar race |
| Venue performance breakdown | Grouped bar chart |

---

## Dataset

Using the **Cricsheet "Ashwin" format** — ball-by-ball IPL data, clean CSV, no scraping needed.

**What we have (`IPL.csv`):**

| Stat | Value |
|---|---|
| Total deliveries | 278,205 |
| Matches | 1,169 |
| Seasons | 2008–2025 (18 seasons) |
| Teams | 19 (including defunct: Deccan Chargers, Kochi Tuskers, etc.) |
| Venues | 59 |

**Key columns available:**

| Column | Use |
|---|---|
| `batter`, `bowler`, `non_striker` | Player journey, career stats |
| `batting_team`, `bowling_team` | Team matchups, head-to-head |
| `runs_batter`, `runs_total`, `runs_extras` | Scoring visualizations |
| `wicket_kind`, `player_out`, `fielders` | Wicket analysis, bowler stats |
| `bat_pos` | Batting order analysis |
| `venue`, `city` | Venue performance breakdowns |
| `season`, `year` | Timeline, season-over-season trends |
| `match_won_by`, `win_outcome` | Team rivalry records |
| `toss_winner`, `toss_decision` | Toss impact analysis |
| `player_of_match` | Awards tracking |

**What Cricsheet gives us that we need:** Everything for Phase 1. Ball-by-ball granularity means we can compute any aggregate — top scorers, strike rates, economy rates, partnership data, player movement across teams by season, head-to-head records. No supplementary data source needed.

**What's missing (not needed for Phase 1):**
- Auction prices (not in Cricsheet — would need manual curation or Kaggle supplement)
- Player photos / headshots
- Team logos (use from official IPL assets or create custom)

---

## Tech Stack

```
Frontend    → React + D3.js (interactive graphs, Sankey, bar race)
Data        → Pre-processed JSON from IPL.csv (build-time transform)
Hosting     → Vercel / Cloudflare Pages (static site, $0)
```

No backend. No database. Phase 1 is a pure static site — CSV gets transformed to JSON at build time, React + D3 renders it in the browser.

---

## Project Structure

```
iplens/
├── src/
│   ├── components/
│   │   ├── PlayerTimeline/
│   │   ├── SankeyDiagram/
│   │   ├── HeadToHead/
│   │   ├── BarRace/
│   │   └── HeatmapCalendar/
│   ├── pages/
│   ├── data/
│   │   └── process.js          ← CSV → JSON build script
│   └── utils/
├── public/
│   └── data/                   ← pre-built JSON files
├── IPL.csv                     ← source dataset
├── package.json
└── README.md
```

---

## MVP — Ship This

| Feature | Priority |
|---|---|
| CSV → JSON data pipeline | P0 |
| Player journey timeline chart | P0 |
| Player movement Sankey diagram | P0 |
| Head-to-head rivalry stats | P0 |
| Animated bar race — top scorers by season | P0 |
| Win/loss heatmap calendar | P1 |
| Venue performance breakdown | P1 |
| Shareable stat cards (PNG export) | P1 |
| Responsive web UI | P0 |

---

## Getting Started

```bash
git clone https://github.com/yourname/iplens.git
cd iplens
npm install
npm run build:data   # transforms IPL.csv → JSON
npm run dev           # start dev server
```

---

## License

MIT

---

## Future

Might add live trash talk rooms and Tribe Wars (team-based prediction battles) during IPL matches if this gets traction.
