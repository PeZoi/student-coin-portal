import { redirect } from "next/navigation";
import { AppRoutes } from "@/constants/routes";

export default function RootPage() {
  redirect(AppRoutes.STUDENT.DASHBOARD);
}
