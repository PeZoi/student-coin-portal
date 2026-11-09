import { getTeacherColor, getTeacherInitial } from "./utils";

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
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
