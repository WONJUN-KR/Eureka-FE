"use client";

import { useQueries } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

import { ENDPOINTS } from "@/api/endpoints";
import { useRegions } from "@/api/queries";
import { queryKeys } from "@/api/queryKeys";
import { get } from "@/api/request";
import type { CityResponse } from "@/api/types";
import SectionHead from "@/components/ui/SectionHead";

// 원본 recommendTravel.jsp '떠나기 좋은 도시' 10곳 - 사진 아래 도시 이름과 지역
// 누르면 그 도시 글 목록 - 도시 id 는 이름으로 찾고, BE 에 없는 도시는 전체 목록으로
const CITIES = [
  { name: "강릉", img: "gangneung.jpg" },
  { name: "제주", img: "jeju.jpg", match: "제주" },
  { name: "여수", img: "yeosu.jpg" },
  { name: "부산", img: "busan.jpg" },
  { name: "담양", img: "damyang.jpg" },
  { name: "서울", img: "seoul.jpg" },
  { name: "속초", img: "sokcho.jpg" },
  { name: "송도", img: "songdo.jpg" },
  { name: "가평", img: "gapyeong.jpg" },
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
  const find = (name: string, match?: string) => {
    for (const [i, q] of cityLists.entries()) {
      const c = q.data?.find((x) => x.name === name || (match && x.name.includes(match)));
      if (c) return { id: c.id, region: regions![i].name };
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 md:px-8 md:pt-24">
      <SectionHead title="떠나기 좋은 도시" description="다른 사람들이 다녀온 도시 10곳" />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {CITIES.map((c) => {
          const found = find(c.name, c.match);
          return (
            <li key={c.name}>
              <Link href={found ? `/posts?cityId=${found.id}` : "/posts"} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
                  <Image
                    src={`/images/recommendImages/${c.img}`}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </div>
                <p className="mt-3 text-[17px] font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{found?.region ?? "\u00a0"}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
