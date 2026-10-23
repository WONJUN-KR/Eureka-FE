"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCategories, usePosts } from "@/api/queries";
import type { CategoryResponse } from "@/api/types";
import { cn, isOptimizable } from "@/lib/utils";

// 원본 bestpick.jsp: '이 달의 Best 픽' - 카테고리(여행가자·맛집가자·놀러가자)마다 1등 글을 슬라이드로, 가운데 것만 선명하게
const FALLBACK = ["seoul.jpg", "busan.jpg", "jeju.jpg"];

function PickCard({
  category,
  index,
  active,
}: {
  category: CategoryResponse;
  index: number;
  active: boolean;
}) {
  const { data } = usePosts({ categoryId: category.id, size: 1, sort: "likeCount,desc" });
  const best = data?.content[0];
  const img = best?.thumbnailUrl || `/images/recommendImages/${FALLBACK[index % FALLBACK.length]}`;

  return (
    <div
      className={cn(
        "flex flex-col items-center transition-opacity duration-300",
        active ? "opacity-100" : "opacity-20"
      )}
      aria-hidden={!active}
    >
      <h3 className="mb-4 text-lg font-bold text-neutral-500">{category.name} Best</h3>
      <Link
        href={best ? `/posts/${best.id}` : `/posts?categoryId=${category.id}`}
        tabIndex={active ? 0 : -1}
        className="relative block aspect-[5/3] w-full max-w-[500px] overflow-hidden rounded"
      >
        <Image
          src={img}
          alt={best ? best.title : `${category.name} 글 목록`}
          fill
          unoptimized={!isOptimizable(img)}
          sizes="(min-width: 768px) 360px, 100vw"
          className="object-cover"
        />
      </Link>
      <p className="mt-6 text-center font-semibold">{best ? best.title : "아직 글이 없어요"}</p>
      {best && (
        <p className="mt-1 text-sm text-neutral-500">
          {best.cityName} · 좋아요 {best.likeCount}
        </p>
      )}
    </div>
  );
}

export default function BestPick() {
  const { data: categories } = useCategories();
  const [index, setIndex] = useState(0);
  const n = categories?.length ?? 0;
  if (!n) return null;
  const move = (d: number) => setIndex((i) => (i + d + n) % n);

  return (
    <section className="relative mx-auto max-w-6xl px-12 py-12">
      <h2 className="mb-10 text-center text-4xl font-bold md:text-5xl">이 달의 Best 픽</h2>
      {/* 원본 slick center 모드 흉내: 가운데가 현재 픽, 양옆은 흐리게. 휴대폰은 가운데 것만 */}
      <div className="flex items-start justify-center gap-4">
        {[-1, 0, 1].map((offset) => {
          const i = (index + offset + n) % n;
          return (
            <div
              key={`${offset}-${i}`}
              className={cn("w-full md:w-1/3", offset !== 0 && "hidden md:block")}
            >
              <PickCard category={categories![i]} index={i} active={offset === 0} />
            </div>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="이전 픽"
        onClick={() => move(-1)}
        className="absolute left-0 top-[55%] -translate-y-1/2 text-neutral-300 hover:text-neutral-500"
      >
        <ChevronLeft className="size-14" />
      </button>
      <button
        type="button"
        aria-label="다음 픽"
        onClick={() => move(1)}
        className="absolute right-0 top-[55%] -translate-y-1/2 text-neutral-300 hover:text-neutral-500"
      >
        <ChevronRight className="size-14" />
      </button>
    </section>
  );
}
