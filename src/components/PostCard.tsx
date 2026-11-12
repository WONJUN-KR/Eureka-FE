import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PostResponse } from "@/api/types";
import { isOptimizable } from "@/lib/utils";

// 글 카드: 사진 · 제목 · 들른 장소 순서 · 도시 · 테마 · 좋아요
// 대표 사진이 없으면 추천 도시 사진을 글 번호로 돌려 씀
const FALLBACK = [
  "seoul",
  "busan",
  "jeju",
  "gangneung",
  "yeosu",
  "sokcho",
  "songdo",
  "gapyeong",
  "damyang",
  "pohang",
];

// 장소가 많으면 앞의 3곳만 보여주고 나머지는 개수로
export function routeLabel(names: string[]) {
  if (names.length <= 3) return names.join(" → ");
  return `${names.slice(0, 3).join(" → ")} 외 ${names.length - 3}곳`;
}

export default function PostCard({ post }: { post: PostResponse }) {
  const img =
    post.thumbnailUrl || `/images/recommendImages/${FALLBACK[post.id % FALLBACK.length]}.jpg`;
  const places = post.places ?? [];
  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
        <Image
          src={img}
          alt=""
          fill
          unoptimized={!isOptimizable(img)}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <h3 className="mt-3.5 text-[17px] font-medium leading-snug group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
        {post.title}
      </h3>
      {places.length > 0 && (
        <p className="mt-1 truncate text-sm text-ink-2">{routeLabel(places.map((p) => p.name))}</p>
      )}
      <p className="mt-1.5 flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
        <span>{post.cityName}</span>
        <span aria-hidden>·</span>
        <span>{post.subCategoryName}</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3.5" strokeWidth={1.5} aria-label="좋아요" />
          {post.likeCount}
        </span>
      </p>
    </Link>
  );
}

// 목록을 받아오는 동안 같은 크기의 빈 카드 - 받은 뒤 카드가 들어와도 아래 내용이 밀리지 않게(CLS)
export function PostCardSkeleton() {
  return (
    <div aria-hidden className="animate-pulse motion-reduce:animate-none">
      <div className="aspect-[4/3] rounded-xl bg-secondary" />
      <div className="mt-4 h-5 w-2/3 rounded bg-secondary" />
      <div className="mt-2 h-4 w-1/2 rounded bg-secondary/70" />
    </div>
  );
}
