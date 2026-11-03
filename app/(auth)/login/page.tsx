import { Suspense } from "react";
import { AuthView } from "@/features/auth/components/AuthView";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full bg-[#1672EA]" />}>
      <AuthView />
    </Suspense>
  );
}
