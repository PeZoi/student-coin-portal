"use client";

import Image from "next/image";
import {
  School,
  Clock,
  Sparkles,
  MonitorCheck,
  PenTool,
  AlertCircle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import {
  MissionIconType,
  MissionSubmissionType,
  MissionAssignedClass,
  MissionCategory,
  MissionDifficulty,
} from "../types";
import {
  MISSION_ICON_OPTIONS,
  MISSION_CATEGORY_CONFIG,
  MISSION_DIFFICULTY_CONFIG,
} from "../constants";
import {
  formatRewardCoinsLabel,
  getMissionDeadlineMeta,
  isMissionExpired,
} from "../utils";

/**
 * 1. Icon đại diện của Bài tập (`missions.icon_type`)
 */
export function MissionIconAvatar({
  iconType,
  isDeleted,
  isActive,
  size = "md",
}: {
  iconType: MissionIconType | null;
  isDeleted?: boolean;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const iconConfig =
    MISSION_ICON_OPTIONS.find((opt) => opt.value === iconType) ||
    MISSION_ICON_OPTIONS[0];

  const sizeClass =
    size === "sm"
      ? "w-8 h-8 rounded-lg"
      : size === "lg"
      ? "w-11 h-11 rounded-2xl"
      : "w-10 h-10 rounded-xl";

  return (
    <div
      className={`${sizeClass} flex items-center justify-center shrink-0 border transition-colors ${
        isDeleted
          ? "bg-rose-50 border-rose-200 grayscale opacity-60"
          : !isActive
          ? "bg-slate-100 border-slate-200 grayscale opacity-70"
          : `${iconConfig.bgClass} ${iconConfig.borderClass}`
      }`}
    >
      <Image
        src={iconConfig.imageSrc}
        alt={iconConfig.label}
        width={28}
        height={28}
        unoptimized
        style={{ height: "auto" }}
        className={
          size === "sm"
            ? "w-5 h-5 object-contain drop-shadow-2xs"
            : size === "lg"
            ? "w-7 h-7 object-contain drop-shadow-2xs"
            : "w-6 h-6 object-contain drop-shadow-2xs"
        }
      />
    </div>
  );
}

/**
 * 2. Badge Cơ chế nộp bài (`missions.submission_type`)
 * - `platform_proof`: Minh chứng nền tảng khác (Quizizz, Wordwall, Azota...)
 * - `subjective_writing`: Đoạn văn / Tự luận viết tay (AI OCR & Chấm lỗi)
 */
export function MissionSubmissionTypeBadge({
  type,
  compact = false,
}: {
  type: MissionSubmissionType;
  compact?: boolean;
}) {
  if (type === "platform_proof") {
    return (
      <Tooltip
        content="Học sinh chụp ảnh điểm số từ nền tảng trắc nghiệm (Quizizz, Wordwall, Azota...)"
        side="top"
      >
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50/90 text-sky-800 border border-sky-200/80 text-xs font-semibold whitespace-nowrap">
          <MonitorCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>{compact ? "Ảnh điểm Online" : "Minh chứng nền tảng"}</span>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      content="Học sinh chụp ảnh vở viết tay, AI trợ giảng chấm lỗi chính tả/ngữ pháp & cô giáo duyệt cuối ngày"
      side="top"
    >
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50/90 text-purple-800 border border-purple-200/80 text-xs font-semibold whitespace-nowrap">
        <PenTool className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        <span>{compact ? "Tự luận (AI)" : "Vở viết tay (AI chấm)"}</span>
      </span>
    </Tooltip>
  );
}

/**
 * 3. Badge Mức thưởng Xu (`min_reward_coins` ~ `max_reward_coins`)
 */
export function MissionRewardCoinsBadge({
  minCoins,
  maxCoins,
}: {
  minCoins: number;
  maxCoins: number;
}) {
  const isFixed = minCoins === maxCoins || minCoins <= 0;
  const label = formatRewardCoinsLabel(minCoins, maxCoins);

  return (
    <Tooltip
      content={
        isFixed
          ? `Mức thưởng cố định: +${maxCoins} xu khi hoàn thành`
          : `Khoảng xu tham khảo: Tối thiểu +${minCoins} xu ~ Tối đa +${maxCoins} xu`
      }
      side="top"
    >
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-bold tabular-nums shadow-2xs whitespace-nowrap">
        <Image
          src="/wheel/coin.webp"
          alt="Xu"
          width={15}
          height={15}
          unoptimized
          style={{ height: "auto" }}
          className="w-3.5 h-3.5 drop-shadow-xs shrink-0"
        />
        <span>{label} xu</span>
      </div>
    </Tooltip>
  );
}

/**
 * 4. Badge Nhóm bài tập (`category`) & Độ khó (`difficulty`)
 */
export function MissionMetaBadges({
  category,
  difficulty,
  hasCustomAiPrompt,
}: {
  category?: MissionCategory;
  difficulty?: MissionDifficulty;
  hasCustomAiPrompt?: boolean;
}) {
  const catConfig = category ? MISSION_CATEGORY_CONFIG[category] : null;
  const diffConfig = difficulty ? MISSION_DIFFICULTY_CONFIG[difficulty] : null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {catConfig && (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${catConfig.badgeClass}`}
        >
          {catConfig.label}
        </span>
      )}
      {diffConfig && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${diffConfig.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dotClass}`} />
          <span>{diffConfig.label}</span>
        </span>
      )}
      {hasCustomAiPrompt && (
        <Tooltip
          content="Bài tập này có thiết lập chỉ dẫn AI chấm điểm riêng của giáo viên"
          side="top"
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>AI Prompt</span>
          </span>
        </Tooltip>
      )}
    </div>
  );
}

/**
 * 5. Danh sách Lớp học được giao (`mission_classes`)
 * - Hiển thị tối đa 2 lớp + badge "+N lớp", click vào mở ngay Modal Phân công lớp
 */
export function MissionAssignedClassesCell({
  classes,
  onClickAssign,
  disabled = false,
}: {
  classes: MissionAssignedClass[];
  onClickAssign?: () => void;
  disabled?: boolean;
}) {
  if (!classes || classes.length === 0) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onClickAssign}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-[#EAF2FF] text-slate-500 hover:text-[#0A62D6] border border-dashed border-slate-300 hover:border-[#0A62D6]/40 text-xs font-semibold transition-colors cursor-pointer disabled:pointer-events-none"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Chưa giao lớp</span>
      </button>
    );
  }

  const visibleClasses = classes.slice(0, 2);
  const remainingCount = classes.length - visibleClasses.length;
  const allNames = classes.map((c) => c.class_name).join(", ");

  return (
    <Tooltip
      content={`Được giao cho: ${allNames} (Bấm để chỉnh sửa phân công lớp)`}
      side="top"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onClickAssign}
        className="inline-flex items-center gap-1.5 flex-wrap text-left group cursor-pointer disabled:pointer-events-none"
      >
        {visibleClasses.map((cls) => (
          <span
            key={cls.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F0F6FE] group-hover:bg-[#E1EDFD] border border-[#CFE1FB] text-[#0A62D6] text-xs font-semibold transition-colors max-w-[165px] truncate"
          >
            <School className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {cls.class_name.split(" - ")[0] || cls.class_name}
            </span>
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold tabular-nums transition-colors">
            +{remainingCount}
          </span>
        )}
      </button>
    </Tooltip>
  );
}

/**
 * 6. Ô Tiến độ nộp & Duyệt bài (`homework_submissions` aggregate)
 * - Hiển thị thanh tiến độ + số bài chờ duyệt + nút click mở Modal Bài nộp
 */
export function MissionProgressCell({
  submittedCount,
  totalStudents,
  pendingReviewCount,
  approvedCount,
  lateCount,
  onClickViewSubmissions,
}: {
  submittedCount: number;
  totalStudents: number;
  pendingReviewCount: number;
  approvedCount: number;
  lateCount: number;
  onClickViewSubmissions?: () => void;
}) {
  const percent =
    totalStudents > 0
      ? Math.min(100, Math.round((submittedCount / totalStudents) * 100))
      : 0;

  return (
    <Tooltip
      content={`Đã nộp: ${submittedCount}/${totalStudents} HS (${percent}%) • Đã duyệt: ${approvedCount} • Chờ duyệt: ${pendingReviewCount}. Bấm để xem danh sách bài nộp!`}
      side="top"
    >
      <button
        type="button"
        onClick={onClickViewSubmissions}
        className="w-full min-w-[150px] max-w-[200px] text-left p-2 -m-2 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
          <span className="font-bold text-[#0F172A] group-hover:text-[#0A62D6] transition-colors tabular-nums">
            {submittedCount}/{totalStudents}{" "}
            <span className="font-medium text-slate-500">HS</span>
          </span>
          <span className="font-bold text-slate-700 tabular-nums">
            {percent}%
          </span>
        </div>

        {/* Thanh Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all ${
              percent >= 80
                ? "bg-emerald-500"
                : percent >= 40
                ? "bg-[#0A62D6]"
                : "bg-amber-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Dòng trạng thái phụ: Chờ cô duyệt / Đã duyệt / Nộp trễ */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {pendingReviewCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Chờ duyệt: {pendingReviewCount}</span>
            </span>
          ) : submittedCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Đã duyệt đủ ({approvedCount})</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">
              Chưa có bài nộp
            </span>
          )}

          {lateCount > 0 && (
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
              {lateCount} trễ
            </span>
          )}
        </div>
      </button>
    </Tooltip>
  );
}

/**
 * 7. Ô Hạn chót nộp bài (`missions.due_at`)
 */
export function MissionDeadlineCell({
  dueAt,
  isActive,
  isDeleted,
}: {
  dueAt: string;
  isActive: boolean;
  isDeleted: boolean;
}) {
  const meta = getMissionDeadlineMeta(dueAt, isActive, isDeleted);

  const badgeColors =
    meta.urgency === "expired"
      ? "bg-rose-50 text-rose-700 border-rose-200/80"
      : meta.urgency === "soon"
      ? "bg-amber-50 text-amber-800 border-amber-200/80"
      : meta.urgency === "normal"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
      : "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <div className="space-y-1 whitespace-nowrap">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] tabular-nums">
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          {meta.formattedTime} - {meta.formattedDate}
        </span>
      </div>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${badgeColors}`}
      >
        {meta.urgency === "expired" && <AlertCircle className="w-3 h-3" />}
        <span>{meta.relativeLabel}</span>
      </span>
    </div>
  );
}

/**
 * 8. Huy hiệu Trạng thái Bài tập (`is_active`, `is_deleted`, `due_at`)
 * - Đồng bộ hoàn toàn phong cách với StatusBadge của Quản lý lớp học
 */
export function MissionStatusBadge({
  isActive,
  isDeleted,
  dueAt,
}: {
  isActive: boolean;
  isDeleted: boolean;
  dueAt: string;
}) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Đã xóa</span>
      </span>
    );
  }

  if (!isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>Tạm ẩn</span>
      </span>
    );
  }

  if (isMissionExpired(dueAt)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>Qua hạn nộp</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF3] text-[#15803D] border border-[#BBF7D0] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
      <span>Đang mở</span>
    </span>
  );
}
