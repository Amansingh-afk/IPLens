"use client";

import { useState } from "react";

const EMBEDS = [
  {
    id: "bar-race",
    name: "Bar Race — Top Scorers",
    description: "Animated bar race of all-time IPL top run scorers",
    width: 800,
    height: 500,
  },
  {
    id: "head-to-head",
    name: "Head to Head — Team Rivalry",
    description: "Pick any two teams and show their rivalry stats",
    width: 600,
    height: 400,
  },
  {
    id: "sankey",
    name: "Player Transfers",
    description: "Sankey diagram of player movement between franchises",
    width: 900,
    height: 600,
  },
  {
    id: "graph",
    name: "Knowledge Graph",
    description: "Interactive knowledge graph of IPL data",
    width: 900,
    height: 700,
  },
];

export default function EmbedPage() {
  const [selected, setSelected] = useState(EMBEDS[0]);
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://iplens.vercel.app";

  const iframeCode = `<iframe src="${origin}/${selected.id}" width="${selected.width}" height="${selected.height}" frameborder="0" style="border-radius:12px;border:1px solid #1a1a2e;" allowfullscreen></iframe>`;

  const scriptCode = `<div id="iplens-embed"></div>
<script>
(function(){
  var d=document,f=d.createElement('iframe');
  f.src='${origin}/${selected.id}';
  f.width='${selected.width}';f.height='${selected.height}';
  f.frameBorder='0';f.style.borderRadius='12px';
  f.style.border='1px solid #1a1a2e';
  f.allowFullscreen=true;
  d.getElementById('iplens-embed').appendChild(f);
})();
</script>`;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold">Embed IPLens Charts</h1>
      <p className="mb-8 text-sm text-muted">
        Add IPLens visualizations to your blog, website, or YouTube description.
        Free to use with attribution.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {EMBEDS.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e)}
            className={`rounded-xl border p-4 text-left transition-all ${
              selected.id === e.id
                ? "border-blue-400/50 bg-blue-400/5"
                : "border-card-border bg-card hover:border-white/20"
            }`}
          >
            <div className="text-sm font-semibold text-foreground">
              {e.name}
            </div>
            <div className="mt-1 text-xs text-muted">{e.description}</div>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              iframe Embed
            </h3>
            <button
              onClick={() => copyToClipboard(iframeCode)}
              className="rounded-md border border-card-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-card-border bg-card p-4 text-xs text-foreground">
            <code>{iframeCode}</code>
          </pre>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Script Tag Embed
            </h3>
            <button
              onClick={() => copyToClipboard(scriptCode)}
              className="rounded-md border border-card-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-card-border bg-card p-4 text-xs text-foreground">
            <code>{scriptCode}</code>
          </pre>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Preview
          </h3>
          <div className="overflow-hidden rounded-xl border border-card-border">
            <iframe
              src={`/${selected.id}`}
              width="100%"
              height={400}
              className="bg-background"
            />
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 text-xs text-muted">
          <strong className="text-foreground">Attribution:</strong> Embeds are
          free to use. Please link back to{" "}
          <a
            href="https://github.com/Amansingh-afk/IPLens"
            className="text-blue-400 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            IPLens on GitHub
          </a>{" "}
          when possible.
        </div>
      </div>
    </div>
  );
}
