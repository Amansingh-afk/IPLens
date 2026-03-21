"use client";

import { useEffect } from "react";
import { ShareCard, type ShareCardProps } from "@/components/share-card";

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  shareProps: ShareCardProps;
}

export function ShareModal({ open, onClose, shareProps }: ShareModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fade-in_200ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-lg rounded-2xl border border-card-border bg-card p-6 shadow-2xl animate-[zoom-in_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center pt-2">
          <ShareCard {...shareProps} />
        </div>
      </div>
    </div>
  );
}

export interface ShareButtonProps {
  onClick: () => void;
}

export function ShareButton({ onClick }: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-md border border-card-border p-2 text-muted transition-colors hover:border-white/20 hover:text-foreground"
      aria-label="Share"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z"
        />
      </svg>
    </button>
  );
}
