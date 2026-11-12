"use client";

import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { ENDPOINTS } from "@/api/endpoints";
import { usePosts, useRegions } from "@/api/queries";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import { pageInfo, type Page, type PostResponse } from "@/api/types";
import KoreaMap, { inSouthKorea, project, REGION_PROVINCES } from "@/components/map/KoreaMap";
import SectionHead from "@/components/ui/SectionHead";
import { cn } from "@/lib/utils";

// 지역으로 찾기: 왼쪽 지역 목록(글 수), 오른쪽 한국 지도에 최근 글들이 들른 장소를 점으로
// 지역에 마우스를 올리면 지도에서 그 지역이 진해짐, 누르면 그 지역 글 목록
export default function RegionFinder() {
  const { data: regions, isError: regionsError, refetch: refetchRegions } = useRegions();
  const { data: recent, isError: recentError } = usePosts({ size: 50, sort: "createdAt,desc" });
  const counts = useQueries({
    queries: (regions ?? []).map((r) => ({
      queryKey: queryKeys.posts.list({ regionId: r.id, size: 1 }),
      queryFn: () =>
        get<Page<PostResponse>>(ENDPOINTS.POSTS.LIST, { params: { regionId: r.id, size: 1 } }),
      // 지역별 글 수는 자주 안 바뀌어서 5분 동안 다시 묻지 않음
      staleTime: 5 * 60 * 1000,
    })),
  });
  const [active, setActive] = useState<string>();
  const activeName = active;
  const posts = recent?.content ?? [];
  // 한국 지도 밖 좌표(해외 · 0/0 같은 잘못된 값)는 점으로 안 찍음
  const points = posts.flatMap((p) => p.places ?? []).filter(inSouthKorea);

  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 md:px-8 md:pt-24">
      <div className="grid items-center gap-10 rounded-[20px] border bg-card px-6 py-10 md:grid-cols-[5fr_7fr] md:gap-16 md:px-14 md:py-12">
        <div>
          <SectionHead
            title="지역으로 찾기"
            description="지역을 고르면 그 안의 여행 기록을 볼 수 있어요"
          />
          {regionsError && (
            <p className="border-t py-4 text-[15px] text-ink-2">
              지역 목록을 불러오지 못했어요{" "}
              <button
                type="button"
                onClick={() => refetchRegions()}
                className="ml-1 underline underline-offset-4 hover:text-foreground"
              >
                다시 불러오기
              </button>
            </p>
          )}
          <ul>
            {regions?.map((r, i) => {
              const n = counts[i]?.data ? pageInfo(counts[i].data!).totalElements : undefined;
              return (
                <li key={r.id}>
                  <Link
                    href={`/posts?regionId=${r.id}`}
                    onMouseEnter={() => setActive(r.name)}
                    onFocus={() => setActive(r.name)}
                    className={cn(
                      "flex items-center justify-between border-t py-3.5 text-base transition-colors",
                      activeName === r.name ? "text-foreground" : "text-ink-2 hover:text-foreground"
                    )}
                  >
                    <span>{r.name}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {n == null ? "" : n > 0 ? `${n}개` : "아직 없어요"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mx-auto w-full max-w-[460px]">
          <KoreaMap
            title={`최근 여행 기록이 들른 장소 ${points.length}곳`}
            highlight={activeName ? REGION_PROVINCES[activeName] : []}
          >
            {points.map((pt, i) => {
              const [x, y] = project(pt);
              return <circle key={i} cx={x} cy={y} r={4} className="fill-primary/70" />;
            })}
          </KoreaMap>
          <p className="mt-3 text-right text-xs text-muted-foreground">
            {recentError ? "최근 글을 불러오지 못했어요" : `최근 글 ${posts.length}개가 들른 장소`}
          </p>
          {/* 지도 모양 출처 (CC BY 4.0) */}
          <p className="mt-1 text-right text-xs text-muted-foreground">
            지도 모양{" "}
            <a
              href="https://www.npmjs.com/package/@svg-maps/south-korea"
              className="underline underline-offset-2 hover:text-foreground"
            >
              @svg-maps/south-korea
            </a>{" "}
            ·{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="underline underline-offset-2 hover:text-foreground"
            >
              CC BY 4.0
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
