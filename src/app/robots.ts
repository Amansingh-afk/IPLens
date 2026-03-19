import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/embed"],
      },
    ],
    sitemap: "https://iplens.in/sitemap.xml",
  };
}
