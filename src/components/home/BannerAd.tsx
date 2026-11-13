"use client";

import Link from "next/link";
import { useState } from "react";

// 원본 bannerAd.jsp 자리: 원본은 실제 업체 광고 이미지라 쓸 수 없어서 사이트 안 기능 안내 3장
// 자동으로 넘기지 않고 아래 번호로 고름 (읽는 중에 바뀌지 않게)
const ADS = [
  {
    href: "/posts/new",
    title: "오늘은 내가 투어가이드",
    text: "혼자 즐기기 아쉬운 스팟을 순서대로 공유해 주세요",
    cta: "나만의 장소 공유하기",
  },
  {
    href: "/posts",
    title: "처음 가는 곳도 나의 홈 그라운드",
    text: "다른 사람이 다녀온 경로를 지도 삼아 그대로 따라가 보세요",
    cta: "여행 기록 둘러보기",
  },
  {
    href: "/posts?categoryId=2",
    title: "맛집가자, 이번 주말 어디 갈까?",
    text: "한식부터 카페까지 여행지 맛집 모음",
    cta: "맛집 기록 보기",
  },
];

export default function BannerAd() {
  const [now, setNow] = useState(0);
  const ad = ADS[now];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 md:px-8 md:pt-24" aria-label="안내 배너">
      <div className="flex flex-col gap-6 rounded-[20px] bg-primary px-6 py-10 text-primary-foreground md:flex-row md:items-center md:justify-between md:px-14 md:py-12">
        <div>
          <div className="mb-3 flex gap-1" role="group" aria-label="배너 고르기">
            {ADS.map((a, i) => (
              <button
                key={a.href}
                type="button"
                aria-pressed={i === now}
                aria-label={`배너 ${i + 1}`}
                onClick={() => setNow(i)}
                className={`rounded px-1.5 text-sm tabular-nums ${i === now ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
              >
                {i + 1}
              </button>
            ))}
            <span className="ml-1 text-sm tabular-nums opacity-60">/ {ADS.length}</span>
          </div>
          <div aria-live="polite">
            <h3 className="mb-2 font-serif text-[22px] leading-snug md:text-[26px]">{ad.title}</h3>
            <p className="opacity-80">{ad.text}</p>
          </div>
        </div>
        <Link
          href={ad.href}
          className="inline-flex h-11 shrink-0 items-center self-start rounded-[10px] bg-card px-5 text-[15px] font-medium text-foreground hover:bg-card/90 md:self-center"
        >
          {ad.cta}
        </Link>
      </div>
    </section>
  );
}
