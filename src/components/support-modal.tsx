"use client";

import { useEffect, useState, useCallback } from "react";

export function SupportModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-support", handler);
    return () => window.removeEventListener("open-support", handler);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative mx-4 w-full max-w-sm rounded-2xl border border-card-border bg-card p-6 shadow-2xl animate-[zoom-in_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-md p-1 text-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/10">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-pink-400">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">Support IPLens</h3>
            <p className="mt-1 text-sm text-muted">
              If IPLens made your IPL experience even a little better, consider buying us a chai.
            </p>
          </div>

          <div className="w-full rounded-xl border border-card-border bg-background p-4">
            <img
              src="/data/qr-code.jpg"
              alt="UPI QR Code"
              width={180}
              height={180}
              className="mx-auto rounded-lg"
            />
            <p className="mt-3 text-xs text-muted">Scan with any UPI app</p>
          </div>

          <p className="text-xs text-muted/50">
            Every contribution keeps the stats flowing. Thank you!
          </p>
        </div>
      </div>
    </div>
  );
}

export function useSupportAction() {
  return useCallback(() => {
    window.dispatchEvent(new Event("open-support"));
  }, []);
}
