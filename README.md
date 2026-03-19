# IPLens

> *The lens through which India watches cricket.*

Interactive IPL data visualization — 18 seasons of cricket history, animated and explorable in the browser.

**Inspiration:** [GitNexus](https://gitnexus.vercel.app/)

---

## What It Does

- **Bar Race** — Animated all-time top run scorers racing across seasons
- **Player Transfers** — Sankey diagram showing player movement between franchises
- **Head-to-Head** — Pick any two teams, see their all-time rivalry
- **Player Timeline** — Any player's career across seasons, colored by team

---

## Data

[Cricsheet](https://cricsheet.org/) ball-by-ball IPL data — 278K deliveries, 1,169 matches, 2008–2025.

---

## Getting Started

```bash
npm install
npm run build:data   # IPL.csv → JSON
npm run dev
```

---

## Future

Might add live trash talk rooms and Tribe Wars during IPL matches if this gets traction.
