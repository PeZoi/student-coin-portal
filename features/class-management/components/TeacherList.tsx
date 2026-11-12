import { Tooltip } from "@/components/ui/tooltip";
import { getTeacherColor, getTeacherInitial } from "@/features/class-management/utils";

interface TeacherListProps {
  teachers: string[];
}

export function TeacherList({ teachers }: TeacherListProps) {
  if (!teachers || teachers.length === 0) {
    return <span className="text-slate-400 text-[13px] italic">Chưa phân công</span>;
  }

  const maxVisible = 2;
  const visibleTeachers = teachers.slice(0, maxVisible);
  const remainingCount = teachers.length - maxVisible;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleTeachers.map((teacherName) => {
        const color = getTeacherColor(teacherName);
        const initial = getTeacherInitial(teacherName);

        return (
          <div key={teacherName} className="inline-flex items-center gap-1.5">
            <span
              style={{ backgroundColor: color.bg, color: color.text }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            >
              {initial}
            </span>
            <span className="text-[13px] font-medium text-slate-700 whitespace-nowrap">
              {teacherName}
            </span>
          </div>
        );
      })}

      {remainingCount > 0 && (
        <Tooltip
          side="top"
          content={
            <div className="space-y-1.5 py-0.5 min-w-[150px]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-700/80">
                Giáo viên khác ({remainingCount})
              </div>
              <div className="space-y-1.5 pt-0.5">
                {teachers.slice(maxVisible).map((otherTeacher) => {
                  const otherColor = getTeacherColor(otherTeacher);
                  const otherInitial = getTeacherInitial(otherTeacher);
                  return (
                    <div key={otherTeacher} className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: otherColor.bg, color: otherColor.text }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      >
                        {otherInitial}
                      </span>
                      <span className="truncate text-slate-200 font-medium">{otherTeacher}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          }
        >
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 border border-slate-200 cursor-pointer transition-colors">
            +{remainingCount}
          </span>
        </Tooltip>
      )}
    </div>
  );
}
