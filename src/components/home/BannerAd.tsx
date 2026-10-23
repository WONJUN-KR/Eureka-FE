"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// 원본 bannerAd.jsp + bannerAd.js: 제휴 광고 3장이 3초마다 옆으로 넘어가고, 아래 점을 누르면 그 장으로
const ADS = [
  { href: "https://www.goodchoice.kr", src: "banner_ad1.png" },
  { href: "https://tadatada.com", src: "banner_ad2.jpg" },
  { href: "https://adventure.lotteworld.com", src: "banner_ad3.jpg" },
];

export default function BannerAd() {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setNow((n) => (n + 1) % ADS.length), 3000);
    return () => clearInterval(t);
  }, [now]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12" aria-label="제휴 광고">
      <div className="overflow-hidden rounded-[28px] md:rounded-[50px]">
        <div
          className="flex transition-transform duration-500 motion-reduce:transition-none"
          style={{ transform: `translateX(-${now * 100}%)` }}
        >
          {ADS.map((a, i) => (
            <a
              key={a.src}
              href={a.href}
              target="_blank"
              rel="noreferrer"
              className="w-full shrink-0"
              tabIndex={i === now ? 0 : -1}
            >
              <Image
                src={`/images/bannerAdImages/${a.src}`}
                alt={`제휴 광고 ${i + 1}`}
                width={1100}
                height={300}
                sizes="(min-width: 1152px) 1120px, 100vw"
                className="aspect-[11/3] w-full object-cover opacity-90 hover:opacity-100"
              />
            </a>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {ADS.map((a, i) => (
          <button
            key={a.src}
            type="button"
            aria-label={`광고 ${i + 1}`}
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
