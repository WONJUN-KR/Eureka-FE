"use client";

/* eslint-disable @next/next/no-img-element */
import { useQueries } from "@tanstack/react-query";
import Link from "next/link";

import { ENDPOINTS } from "@/api/endpoints";
import { useRegions } from "@/api/queries";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { CityResponse } from "@/api/types";
import { cn } from "@/lib/utils";

// 원본 recommendTravel.jsp '떠나기 좋은 도시': 10곳 모자이크 (서울은 가로로 길게, 제주도는 세로로 길게)
// 누르면 그 도시 글 목록 - 도시 id 는 이름으로 찾고, BE 에 없는 도시는 전체 목록으로
const CITIES = [
  { name: "서울", img: "seoul.jpg", span: "col-span-2" },
  { name: "강릉", img: "gangneung.jpg" },
  { name: "속초", img: "sokcho.jpg" },
  { name: "송도", img: "songdo.jpg" },
  { name: "부산", img: "busan.jpg" },
  { name: "여수", img: "yeosu.jpg" },
  { name: "제주도", img: "jeju.jpg", span: "md:row-span-2", match: "제주" },
  { name: "가평", img: "gapyeong.jpg" },
  { name: "담양", img: "damyang.jpg" },
  { name: "포항", img: "pohang.jpg" },
];

export default function RecommendTravel() {
  const { data: regions } = useRegions();
  const cityLists = useQueries({
    queries: (regions ?? []).map((r) => ({
      queryKey: queryKeys.regions.cities(r.id),
      queryFn: () => get<CityResponse[]>(ENDPOINTS.REGIONS.CITIES(r.id)),
      staleTime: Infinity,
    })),
  });
  const allCities = cityLists.flatMap((q) => q.data ?? []);
  const findId = (name: string, match?: string) =>
    allCities.find((c) => c.name === name || (match && c.name.includes(match)))?.id;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-center text-3xl font-bold">떠나기 좋은 도시</h2>
      <hr className="mx-auto mb-10 mt-4 w-72 border-neutral-800" />
      <div className="grid auto-rows-[140px] grid-cols-2 gap-3 md:auto-rows-[250px] md:grid-cols-4 md:gap-5">
        {CITIES.map((c) => {
          const id = findId(c.name, c.match);
          return (
            <Link
              key={c.name}
              href={id ? `/posts?cityId=${id}` : "/posts"}
              className={cn("group relative overflow-hidden rounded", c.span)}
            >
              <img
                src={`/images/recommendImages/${c.img}`}
                alt=""
                className="size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
              />
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-medium text-white [text-shadow:2px_2px_2px_gray] md:text-[25px]">
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
