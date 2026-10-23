"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// 원본 banner.jsp + banner.js: 사진 3장이 3초마다 페이드로 바뀌고, 가운데에 문구 + '나만의 장소 공유하기'
const SLIDES = ["banner1.jpg", "banner2.jpg", "banner3.jpg"];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative mx-auto h-[70vh] max-h-[800px] min-h-[420px] w-full max-w-6xl overflow-hidden">
      {SLIDES.map((src, i) => (
        <Image
          key={src}
          src={`/images/bannerImages/${src}`}
          alt=""
          fill
          // 첫 장이 첫 화면 가장 큰 요소(LCP) - 미리 받기, 나머지는 바뀔 때 보이니 기본(lazy)
          priority={i === 0}
          sizes="(min-width: 1152px) 1152px, 100vw"
          className={cn(
            "object-cover transition-opacity duration-1000 motion-reduce:transition-none",
            i === current ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      <div className="absolute inset-0 bg-black/15" />
      <div className="absolute inset-x-0 top-[44%] flex flex-col items-center gap-6 px-4 text-center">
        <h2 className="text-2xl font-semibold text-white drop-shadow md:text-3xl">
          여행의 발견, 유레카!
        </h2>
        <Link
          href="/posts/new"
          className="rounded-full bg-white/70 px-8 py-3 text-2xl font-bold text-[rgb(135,192,206)] transition-colors hover:bg-white/90 md:text-3xl"
        >
          나만의 장소 공유하기
        </Link>
      </div>
    </section>
  );
}
