import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import QuickMenu from "@/components/QuickMenu";

import Providers from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "유레카 - 여행 발자취 커뮤니티",
  description: "나의 여행 발자취를 기록하고 공유하는 커뮤니티",
  keywords: ["여행", "발자취", "커뮤니티", "여행기록", "유레카", "Eureka"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Header />
          {/* 헤더가 화면 위에 고정이라 각 페이지가 위 여백을 직접 정함 (홈은 배너가 헤더 밑까지 깔림) */}
          <main>{children}</main>
          <QuickMenu />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
