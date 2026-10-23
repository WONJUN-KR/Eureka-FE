"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCategories, useCities, useRegions, useSubCategories } from "@/api/queries";
import type { CityResponse } from "@/api/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

// 원본(2021 유레카 header.jsp) 구조: 로고 · 메뉴(지역 + 카테고리 3개) · 마이페이지·검색 아이콘
// - 홈 맨 위에선 배너 위에 투명하게 겹치고(흰 로고), 100px 넘게 내리면 흰 배경 + 검은 로고
// - 메뉴에 마우스를 올리면 큰 메뉴가 펼쳐짐: 지역은 시·도 → 도시, 카테고리는 세부 테마
// - 지역에서 도시를 고른 뒤 테마를 누르면 그 도시 + 테마로 목록 이동 (원본 city_no + detail_option_no)
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [openTab, setOpenTab] = useState<string | null>(null);
  const [hoverRegion, setHoverRegion] = useState<number>();
  const [pickedCity, setPickedCity] = useState<CityResponse | null>(null);
  const { isAuthenticated, isHydrated } = useAuthStore();
  const loggedIn = isHydrated && isAuthenticated;

  const { data: regions } = useRegions();
  const { data: categories } = useCategories();
  const { data: cities } = useCities(hoverRegion);
  const activeCategoryId = categories?.find((c) => `cat-${c.id}` === openTab)?.id;
  const { data: subCategories } = useSubCategories(activeCategoryId);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !isHome || scrolled || openTab !== null;
  const tabs = [
    { key: "area", label: pickedCity?.name ?? "지역" },
    ...(categories ?? []).map((c) => ({ key: `cat-${c.id}`, label: c.name })),
  ];

  const goList = (params: Record<string, number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v != null && q.set(k, String(v)));
    setOpenTab(null);
    router.push(`/posts${q.size ? `?${q}` : ""}`);
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-30 transition-colors duration-500",
        solid && "bg-white shadow-sm"
      )}
      onMouseLeave={() => setOpenTab(null)}
    >
      <header className="mx-auto flex h-16 max-w-6xl items-center px-4 md:h-24">
        <Link href="/" className="w-28 shrink-0 md:w-40" aria-label="FootPrint 홈">
          {/* 로고 원본 1024x512 → 화면 최대 160px 폭 */}
          <Image
            src={solid ? "/images/headerImages/blackLogo.png" : "/images/headerImages/logo.png"}
            alt="FootPrint"
            width={160}
            height={80}
            priority
            className="h-auto w-full"
          />
        </Link>
        <nav className="hidden flex-1 md:block" aria-label="주 메뉴">
          <ul className="flex">
            {tabs.map((t) => (
              <li key={t.key} className="flex-1 text-center" onMouseEnter={() => setOpenTab(t.key)}>
                <button
                  type="button"
                  onClick={() => setOpenTab(openTab === t.key ? null : t.key)}
                  aria-expanded={openTab === t.key}
                  className={cn(
                    "py-2 text-xl font-semibold transition-opacity hover:opacity-80",
                    solid ? "text-neutral-500" : "text-white drop-shadow"
                  )}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href={loggedIn ? "/mypage" : "/login"}
            aria-label={loggedIn ? "마이페이지" : "로그인"}
          >
            <Image
              width={28}
              height={28}
              src={
                solid
                  ? "/images/headerImages/mypage_icon_black.png"
                  : "/images/headerImages/mypage_icon.png"
              }
              alt=""
              className="size-7"
            />
          </Link>
          <Link href="/posts" aria-label="전체 발자취 보기">
            <Image
              width={28}
              height={28}
              src={
                solid
                  ? "/images/headerImages/search_icon_black.png"
                  : "/images/headerImages/search_icon.png"
              }
              alt=""
              className="size-7"
            />
          </Link>
        </div>
      </header>

      {/* 큰 메뉴 (원본 subMenu) */}
      {openTab && (
        <div className="hidden border-t bg-white md:block">
          <div className="mx-auto flex min-h-64 max-w-6xl px-4 py-6">
            {openTab === "area" ? (
              <>
                <ul className="w-2/5 border-r pr-10 text-right">
                  {regions?.map((r) => (
                    <li key={r.id} onMouseEnter={() => setHoverRegion(r.id)}>
                      <button
                        type="button"
                        onClick={() => goList({ regionId: r.id })}
                        className={cn(
                          "py-3 text-lg font-bold text-neutral-500 hover:text-primary",
                          hoverRegion === r.id && "text-primary"
                        )}
                      >
                        {r.name}
                      </button>
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-1 flex-wrap content-start gap-x-8 gap-y-3 pl-10 pt-3">
                  {hoverRegion == null && (
                    <li className="text-sm text-neutral-400">
                      시·도에 마우스를 올려 도시를 골라주세요
                    </li>
                  )}
                  {cities?.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPickedCity(c);
                          goList({ cityId: c.id });
                        }}
                        className="text-lg font-semibold text-neutral-500 hover:text-primary"
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex flex-1">
                <div className="w-2/5 border-r pr-10 text-right text-sm text-neutral-400">
                  {pickedCity ? (
                    <>
                      <p className="py-3 text-lg font-bold text-primary">{pickedCity.name}</p>
                      <button
                        type="button"
                        className="underline"
                        onClick={() => setPickedCity(null)}
                      >
                        지역 해제
                      </button>
                    </>
                  ) : (
                    <p className="py-3">지역을 먼저 고르면 그 도시 안에서 찾아요</p>
                  )}
                </div>
                <ul className="flex flex-1 flex-wrap content-start gap-x-8 gap-y-3 pl-10 pt-3">
                  {subCategories?.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => goList({ cityId: pickedCity?.id, subCategoryId: s.id })}
                        className="text-lg font-semibold text-neutral-500 hover:text-primary"
                      >
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
