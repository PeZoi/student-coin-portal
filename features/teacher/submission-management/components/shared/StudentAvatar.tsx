import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface StudentAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: "sm" | "md";
}

const SIZE_STYLES = {
  sm: { box: "w-9 h-9", px: 36 },
  md: { box: "w-10 h-10", px: 40 },
} as const;

/**
 * Component hiển thị Avatar học sinh kèm fallback chữ cái đầu (DRY cho Roster & Studio)
 */
export function StudentAvatar({
  name,
  avatarUrl,
  size = "md",
}: StudentAvatarProps) {
  const { box, px } = SIZE_STYLES[size];

  if (avatarUrl) {
    return (
      <div
        className={cn(
          box,
          "rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
        )}
      >
        <Image
          src={avatarUrl}
          alt={name}
          width={px}
          height={px}
          style={{ height: "auto" }}
          className="w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        box,
        "rounded-full bg-blue-100 text-[#0A62D6] font-bold text-xs flex items-center justify-center shrink-0"
      )}
    >
      {getInitials(name)}
    </div>
  );
}
