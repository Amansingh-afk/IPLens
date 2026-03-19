import { getTeamColor } from "@/lib/team-colors";

interface PlayerAvatarProps {
  name: string;
  team?: string;
  size?: number;
}

export function PlayerAvatar({ name, team, size = 32 }: PlayerAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const bg = team ? getTeamColor(team) : "#3b82f6";

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}
