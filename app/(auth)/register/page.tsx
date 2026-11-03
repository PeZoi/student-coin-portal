import { Suspense } from "react";
import { AuthView } from "@/features/auth/components/AuthView";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full bg-[#1672EA]" />}>
      <AuthView initialRole="student" initialMode="register" />
    </Suspense>
  );
}
