import Link from "next/link";

interface BentoCardProps {
  title: string;
  subtitle?: string;
  href: string;
  className?: string;
  glowColor?: string;
  children: React.ReactNode;
}

export function BentoCard({
  title,
  subtitle,
  href,
  className = "",
  glowColor,
  children,
}: BentoCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card p-5 transition-all duration-300 hover:border-white/20 hover:scale-[1.01] ${className}`}
      style={
        glowColor
          ? ({
              "--glow": glowColor,
            } as React.CSSProperties)
          : undefined
      }
    >
      {glowColor && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}10, transparent 40%)`,
          }}
        />
      )}
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          )}
        </div>
        <span className="text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
          Explore →
        </span>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </Link>
  );
}
