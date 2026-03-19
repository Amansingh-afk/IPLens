import type { MetadataRoute } from "next";
import players from "../../public/data/players.json";
import recaps from "../../public/data/season-recaps.json";

const SITE_URL = "https://iplens.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const seasons = Object.keys(recaps);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    {
      url: `${SITE_URL}/bar-race`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${SITE_URL}/sankey`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${SITE_URL}/head-to-head`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${SITE_URL}/compare`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/graph`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/season`, changeFrequency: "yearly", priority: 0.7 },
    {
      url: `${SITE_URL}/on-this-day`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    { url: `${SITE_URL}/draft`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const seasonRoutes: MetadataRoute.Sitemap = seasons.map((year) => ({
    url: `${SITE_URL}/season/${year}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const playerRoutes: MetadataRoute.Sitemap = players.map(
    (p: { name: string }) => ({
      url: `${SITE_URL}/player/${encodeURIComponent(p.name)}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })
  );

  return [...staticRoutes, ...seasonRoutes, ...playerRoutes];
}
