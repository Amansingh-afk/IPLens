import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Nav } from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://iplens.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IPLens — The Lens Through Which India Watches Cricket",
    template: "%s — IPLens",
  },
  description:
    "Interactive IPL data visualizations — player journeys, team rivalries, transfer flows, and 18 seasons of cricket history.",
  keywords: [
    "IPL",
    "IPL stats",
    "IPL statistics",
    "cricket",
    "Indian Premier League",
    "IPL player stats",
    "IPL head to head",
    "IPL transfers",
    "IPL data visualization",
    "cricket analytics",
    "IPL career timeline",
    "IPL season recap",
    "T20 cricket",
  ],
  authors: [{ name: "IPLens" }],
  creator: "IPLens",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "IPLens",
    title: "IPLens — The Lens Through Which India Watches Cricket",
    description:
      "Interactive IPL data visualizations — player journeys, team rivalries, transfer flows, and 18 seasons of cricket history.",
  },
  twitter: {
    card: "summary_large_image",
    title: "IPLens — The Lens Through Which India Watches Cricket",
    description:
      "Interactive IPL data visualizations — player journeys, team rivalries, transfer flows, and 18 seasons of cricket history.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <meta name="theme-color" content="#06060a" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1">{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
