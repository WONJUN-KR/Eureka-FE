"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useMyPosts, useUserPosts, useUserProfile } from "@/api/queries";
import { getErrorMessage } from "@/api/request";
import { pageInfo } from "@/api/types";
import KoreaMap, { project } from "@/components/map/KoreaMap";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import { buttonClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// 한 사람의 유레카: 다녀온 여행마다 들른 곳을 한국 지도 위 점선으로 잇고, 아래에 글 목록
// 공개 페이지(/users/:id)와 마이페이지가 같이 씀 - 링크를 복사해서 공유
export default function UserJourney({ userId, mine = false }: { userId: number; mine?: boolean }) {
  const { data: profile, isError, error } = useUserProfile(userId);
  // 내 페이지는 공개 전 글까지, 다른 사람 페이지는 공개 글만
  const publicPosts = useUserPosts(userId, !mine);
  const myPosts = useMyPosts(mine);
  const { data: posts, isLoading, isError: postsError } = mine ? myPosts : publicPosts;
  const [hover, setHover] = useState<number>();
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  if (isError)
    return <p className="py-16 text-center text-destructive">{getErrorMessage(error)}</p>;

  const list = posts?.content ?? [];
  const trips = list.filter((p) => (p.places ?? []).length > 0);
  const placeCount = trips.reduce((n, p) => n + p.places!.length, 0);
  const cityCount = new Set(list.map((p) => p.cityName)).size;
  const total = posts ? pageInfo(posts).totalElements : 0;

  const share = async () => {
    const url = `${window.location.origin}/users/${userId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("이 주소를 복사해 주세요", url);
    }
  };

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[15px] text-ink-2">{mine ? "내 유레카" : "유레카"}</p>
          <h1 className="font-serif text-[32px] leading-tight tracking-tight md:text-[40px]">
            {profile ? `${profile.nickname}의 유레카` : " "}
          </h1>
          <p className="mt-2 text-[15px] tabular-nums text-ink-2">
            {profile
              ? `글 ${profile.postCount}개 · 도시 ${cityCount}곳 · 들른 장소 ${placeCount}곳`
              : " "}
          </p>
        </div>
        <button type="button" onClick={share} className={buttonClass.ghost}>
          {copied ? (
            <Check className="size-[18px]" strokeWidth={1.5} aria-hidden />
          ) : (
            <Link2 className="size-[18px]" strokeWidth={1.5} aria-hidden />
          )}
          {copied ? "링크를 복사했어요" : "링크 복사"}
        </button>
      </div>

      <div className="grid gap-10 md:grid-cols-[5fr_7fr] md:gap-14">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="rounded-[20px] border bg-card p-6">
            <KoreaMap title={`다녀온 여행 ${trips.length}번의 경로`}>
              {trips.map((t) => {
                const pts = t.places!.map(project);
                const on = hover === t.id;
                return (
                  <g key={t.id} opacity={hover == null || on ? 1 : 0.25}>
                    {pts.length > 1 && (
                      <polyline
                        points={pts.map((p) => p.join(",")).join(" ")}
                        fill="none"
                        className="stroke-trail"
                        strokeWidth={on ? 3 : 2}
                        strokeDasharray="2 4"
                        strokeLinecap="round"
                      />
                    )}
                    {pts.map(([x, y], i) => (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={on ? 5 : 3.5}
                        className={cn(i === 0 ? "fill-trail" : "fill-card stroke-ink-2")}
                        strokeWidth={1.2}
                      />
                    ))}
                  </g>
                );
              })}
            </KoreaMap>
            <p className="mt-3 text-sm text-muted-foreground">
              주황 점이 여행의 첫 장소 · 글에 마우스를 올리면 그 여행만 진하게
              {total > list.length && ` · 최근 글 ${list.length}개 기준`}
            </p>
          </div>
        </div>

        <section aria-label="쓴 글">
          {postsError && <p className="py-12 text-destructive">글 목록을 불러오지 못했어요</p>}
          {!isLoading && !postsError && list.length === 0 && (
            <p className="py-12 text-ink-2">
              {mine ? "아직 쓴 글이 없어요" : "아직 공개한 글이 없어요"}
            </p>
          )}
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
            {isLoading && Array.from({ length: 4 }, (_, i) => <PostCardSkeleton key={i} />)}
            {list.map((p) => (
              <div
                key={p.id}
                // 장소가 없는 글은 지도에 여행이 없어서 강조하지 않음
                onMouseEnter={() => p.places?.length && setHover(p.id)}
                onMouseLeave={() => setHover(undefined)}
                onFocus={() => p.places?.length && setHover(p.id)}
                onBlur={() => setHover(undefined)}
              >
                <PostCard post={p} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
