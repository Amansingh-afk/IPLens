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
    sitemap: "https://iplens.vercel.app/sitemap.xml",
  };
}
