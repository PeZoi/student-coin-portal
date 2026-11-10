import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import { UserInitializer } from "@/features/auth/components/UserInitializer";
import "./globals.css";

// Font tiêu đề hoạt hình 3D (Variable Font, hỗ trợ 100% tiếng Việt)
const baloo2 = Baloo_2({
  subsets: ["vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

// Font nội dung thân thiện, bo tròn (Variable Font, hỗ trợ 100% tiếng Việt)
const nunito = Nunito({
  subsets: ["vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Student Coin Portal",
  description: "Cổng thông tin đổi thưởng và tích lũy coin sinh viên",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${baloo2.variable} ${nunito.variable} min-h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <UserInitializer />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
