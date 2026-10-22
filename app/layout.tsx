import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Font tiêu đề hoạt hình 3D, hỗ trợ 100% tiếng Việt
const baloo2 = Baloo_2({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

// Font nội dung thân thiện, bo tròn, hỗ trợ 100% tiếng Việt
const nunito = Nunito({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Student Coin Portal - Học Chăm Tích Xu",
  description: "Cổng thông tin đổi thưởng và tích lũy coin sinh viên",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${baloo2.variable} ${nunito.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
