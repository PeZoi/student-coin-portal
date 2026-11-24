import Image from "next/image";
import { MissionSubmissionType } from "@/constants";
import { cn } from "@/lib/utils";
import { SUBMISSION_MEDIA_PATHS } from "../../constants";

interface MissionThumbnailProps {
  submissionType?: MissionSubmissionType;
  alt: string;
  size?: "md" | "lg";
  className?: string;
}

const SIZE_CONFIG = {
  md: { box: "w-11 h-11 sm:w-12 sm:h-12 rounded-xl", px: 48 },
  lg: { box: "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl", px: 56 },
} as const;

/**
 * Ảnh đại diện minh họa bài tập (Viết vở ô ly vs Chụp ảnh màn hình) — dùng chung Level 1 & Level 2
 */
export function MissionThumbnail({
  submissionType,
  alt,
  size = "md",
  className,
}: MissionThumbnailProps) {
  const src =
    submissionType === MissionSubmissionType.PLATFORM_PROOF
      ? SUBMISSION_MEDIA_PATHS.PLATFORM_PROOF_THUMBNAIL
      : SUBMISSION_MEDIA_PATHS.SUBJECTIVE_WRITING_THUMBNAIL;
  const { box, px } = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        box,
        "overflow-hidden border border-slate-200/90 bg-white shrink-0 relative shadow-2xs",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={px}
        height={px}
        style={{ height: "auto" }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
