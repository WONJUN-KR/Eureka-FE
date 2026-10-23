"use client";

import { MapPinned, PenLine, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// 원본 bannerAd.jsp 자리: 3장이 3초마다 옆으로 넘어가고, 아래 점을 누르면 그 장으로
// 원본은 실제 업체 광고 이미지(상표)라 쓸 수 없어서 → 사이트 안 기능을 안내하는 배너(그라데이션 + 아이콘, 이미지 없음)
const ADS = [
  {
    href: "/posts/new",
    title: "나만의 장소를 공유해보세요",
    text: "혼자 알기 아까운 스팟, 사진 한 장이면 충분해요",
    Icon: PenLine,
    tone: "from-sky-500 to-cyan-400",
  },
  {
    href: "/posts",
    title: "다른 사람의 발자취 따라가기",
    text: "지역과 테마로 여행 기록을 찾아보세요",
    Icon: MapPinned,
    tone: "from-emerald-500 to-teal-400",
  },
  {
    href: "/posts?categoryId=2",
    title: "맛집가자, 이번 주말 어디 갈까?",
    text: "한식부터 카페까지 여행지 맛집 모음",
    Icon: UtensilsCrossed,
    tone: "from-orange-500 to-amber-400",
  },
];

export default function BannerAd() {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => (n + 1) % ADS.length), 3000);
    return () => clearInterval(t);
  }, [now]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12" aria-label="추천 배너">
      <div className="overflow-hidden rounded-[28px] md:rounded-[50px]">
        <div
          className="flex transition-transform duration-500 motion-reduce:transition-none"
          style={{ transform: `translateX(-${now * 100}%)` }}
        >
          {ADS.map((a, i) => (
            <Link
              key={a.href}
              href={a.href}
              tabIndex={i === now ? 0 : -1}
              className={cn(
                "flex min-h-32 w-full shrink-0 py-6 md:aspect-[11/3] md:min-h-0 md:py-0 items-center justify-between gap-4 bg-gradient-to-r px-6 text-white md:px-16",
                a.tone
              )}
            >
              <span>
                <span className="block text-lg font-bold md:text-3xl">{a.title}</span>
                <span className="mt-1 block text-sm opacity-90 md:mt-3 md:text-lg">{a.text}</span>
              </span>
              <a.Icon
                aria-hidden
                strokeWidth={1.5}
                className="size-12 shrink-0 opacity-90 md:size-24"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {ADS.map((a, i) => (
          <button
            key={a.href}
            type="button"
            aria-label={`배너 ${i + 1}`}
            aria-current={i === now}
            onClick={() => setNow(i)}
            className={cn(
              "relative size-2.5 rounded-sm before:absolute before:-inset-2 before:content-['']",
              i === now ? "bg-neutral-700" : "bg-neutral-300"
            )}
          />
        ))}
      </div>
    </section>
  );
}
