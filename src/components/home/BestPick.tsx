"use client";

import Image from "next/image";
import Link from "next/link";

import { usePosts } from "@/api/queries";
import type { PostResponse } from "@/api/types";
import { routeLabel } from "@/components/PostCard";
import SectionHead from "@/components/ui/SectionHead";
import { isOptimizable } from "@/lib/utils";

// 원본 bestpick.jsp '이 달의 Best 픽' 자리: 좋아요 1등 글 하나를 크게, 2~5등은 썸네일 목록
// 기간으로 거르는 API 가 없어서 '이 달의' 는 빼고 전체 좋아요 순
const thumb = (p: PostResponse) => p.thumbnailUrl || "/images/recommendImages/seoul.jpg";

function Meta({ post }: { post: PostResponse }) {
  return (
    <p className="flex flex-wrap items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
      <span>{post.cityName}</span>
      <span aria-hidden>·</span>
      <span>{post.subCategoryName}</span>
      <span aria-hidden>·</span>
      <span>{post.authorNickname}</span>
      <span aria-hidden>·</span>
      <span>좋아요 {post.likeCount}</span>
    </p>
  );
}

export default function BestPick() {
  const { data, isLoading, isError } = usePosts({ sort: "likeCount,desc", size: 5 });
  const [first, ...rest] = data?.content ?? [];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 md:px-8 md:pt-24">
      <SectionHead
        title="Best 픽"
        description="좋아요를 많이 받은 여행 기록"
        more={{ href: "/posts", label: "전체 글 보기" }}
      />
      {isLoading && (
        <div className="h-[420px] animate-pulse rounded-2xl bg-secondary motion-reduce:animate-none" />
      )}
      {isError && (
        <p className="py-12 text-ink-2">글을 불러오지 못했어요. 잠시 뒤 다시 들러 주세요</p>
      )}
      {!isLoading && !isError && !first && <p className="py-12 text-ink-2">아직 글이 없어요</p>}
      {first && (
        <div className="grid gap-10 md:grid-cols-[7fr_5fr] md:gap-12">
          <Link href={`/posts/${first.id}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
              <Image
                src={thumb(first)}
                alt=""
                fill
                unoptimized={!isOptimizable(thumb(first))}
                sizes="(min-width: 768px) 640px, 100vw"
                className="object-cover"
              />
            </div>
            <h3 className="mb-2 mt-5 font-serif text-2xl leading-snug tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 md:text-[28px]">
              {first.title}
            </h3>
            {first.places && first.places.length > 0 && (
              <p className="mb-2 text-[15px] text-ink-2">
                {routeLabel(first.places.map((p) => p.name))}
              </p>
            )}
            <Meta post={first} />
          </Link>
          <ol>
            {rest.map((p, i) => (
              <li key={p.id}>
                <Link
                  href={`/posts/${p.id}`}
                  className="group grid grid-cols-[28px_1fr_96px] items-center gap-4 border-t py-5"
                >
                  <span className="text-[15px] font-medium tabular-nums text-muted-foreground">
                    {i + 2}
                  </span>
                  <span className="min-w-0">
                    <span className="mb-1.5 block text-[17px] font-medium leading-snug group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                      {p.title}
                    </span>
                    <Meta post={p} />
                  </span>
                  <span className="relative h-[72px] w-24 overflow-hidden rounded-lg bg-secondary">
                    <Image
                      src={thumb(p)}
                      alt=""
                      fill
                      unoptimized={!isOptimizable(thumb(p))}
                      sizes="96px"
                      className="object-cover"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
