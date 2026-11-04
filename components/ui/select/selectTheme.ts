export type SelectSheetTone = "orange" | "blue" | "green" | "purple";

export interface SheetToneConfig {
  gradient: string;
  borderBottom: string;
}

export const SELECT_SHEET_TONES: Record<SelectSheetTone, SheetToneConfig> = {
  orange: {
    gradient: "bg-gradient-to-r from-[#FF8A1F] to-[#E64500]",
    borderBottom: "border-[#C93B00]",
  },
  blue: {
    gradient: "bg-gradient-to-r from-[#1E9BFF] to-[#0A62D6]",
    borderBottom: "border-[#084FB0]",
  },
  green: {
    gradient: "bg-gradient-to-r from-[#12B84F] to-[#08873A]",
    borderBottom: "border-[#066E2E]",
  },
  purple: {
    gradient: "bg-gradient-to-r from-[#A855F7] to-[#6B21A8]",
    borderBottom: "border-[#581C87]",
  },
};

