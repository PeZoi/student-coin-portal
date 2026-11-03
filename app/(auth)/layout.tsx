import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Cổng Học Chăm Tích Xu",
  description: "Bé hãy đăng nhập hoặc đăng ký tài khoản để tích lũy xu và đổi quà nhé!",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh w-full">{children}</div>;
}

