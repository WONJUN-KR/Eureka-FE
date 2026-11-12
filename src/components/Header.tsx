"use client";

import { Menu, PenLine, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCategories, useCities, useRegions, useSubCategories } from "@/api/queries";
import type { CityResponse } from "@/api/types";
import { buttonClass, inputClass } from "@/components/ui/field";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

// 원본(2021 유레카 header.jsp) 구조: 로고 · 메뉴(지역 + 카테고리 3개) · 오른쪽 계정 메뉴
// - 홈 맨 위에선 첫 화면 사진 위에 투명하게 겹치고, 내리면 종이색 배경
// - 메뉴에 마우스를 올리면 큰 메뉴가 펼쳐짐: 지역은 시·도 → 도시, 카테고리는 세부 테마
// - 지역에서 도시를 고른 뒤 테마를 누르면 그 도시 + 테마로 목록 이동 (원본 city_no + detail_option_no)
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [openTab, setOpenTab] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchButton = useRef<HTMLButtonElement>(null);
  const [hoverRegion, setHoverRegion] = useState<number>();
  // 고른 도시와 그 시·도 - 목록 화면에서 지역 · 도시 선택 상자가 같이 채워지게 둘 다 넘김
  const [pickedCity, setPickedCity] = useState<(CityResponse & { regionId?: number }) | null>(null);
  const { isAuthenticated, isHydrated } = useAuthStore();
  const loggedIn = isHydrated && isAuthenticated;

  const { data: regions } = useRegions();
  const { data: categories } = useCategories();
  const { data: cities } = useCities(hoverRegion);
  const activeCategoryId = categories?.find((c) => `cat-${c.id}` === openTab)?.id;
  const { data: subCategories } = useSubCategories(activeCategoryId);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 뒤로 · 앞으로 가기는 주소(pathname)가 같아도(쿼리만 바뀌어도) 메뉴를 닫음
  useEffect(() => {
    const onPop = () => {
      setOpenTab(null);
      setMobileOpen(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // 페이지를 옮기면 펼친 메뉴는 닫음 (렌더 중에 이전 주소와 비교 - effect 안 setState 대신)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenTab(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }

  const solid = !isHome || scrolled || openTab !== null || mobileOpen;
  const tabs = [
    { key: "area", label: pickedCity?.name ?? "지역" },
    ...(categories ?? []).map((c) => ({ key: `cat-${c.id}`, label: c.name })),
  ];

  const goList = (params: Record<string, number | string | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v != null && q.set(k, String(v)));
    setOpenTab(null);
    setMobileOpen(false);
    setSearchOpen(false);
    router.push(`/posts${q.size ? `?${q}` : ""}`);
  };

  // 헤더 검색은 사이트 전체에서 찾기 - 고른 도시도 풀어서 '지역' 탭 이름과 결과가 어긋나지 않게
  // (지금 목록 조건 안에서 찾기는 목록 화면의 검색칸)
  const search = (form: HTMLFormElement) => {
    const q = String(new FormData(form).get("keyword") ?? "").trim();
    if (!q) return;
    setPickedCity(null);
    goList({ keyword: q });
  };
  const closeSearch = () => {
    setSearchOpen(false);
    // 닫힌 검색칸 대신 검색 버튼으로 포커스를 돌려줌
    requestAnimationFrame(() => searchButton.current?.focus());
  };

  const quiet = solid ? "text-ink-2 hover:text-foreground" : "text-white/85 hover:text-white";

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-30 transition-colors duration-300",
        solid ? "border-b bg-background/95 backdrop-blur" : "bg-transparent"
      )}
      onMouseLeave={() => setOpenTab(null)}
    >
      <header className="mx-auto flex h-16 max-w-6xl items-center gap-10 px-4 md:px-8">
        <Link
          href="/"
          aria-label="유레카 홈"
          className={cn("text-[22px]", solid ? "text-primary" : "text-white")}
        >
          <Logo />
        </Link>
        <nav className="hidden md:block" aria-label="주 메뉴">
          <ul className="flex gap-7">
            {tabs.map((t) => (
              <li key={t.key} onMouseEnter={() => setOpenTab(t.key)}>
                <button
                  type="button"
                  onClick={() => setOpenTab(openTab === t.key ? null : t.key)}
                  aria-expanded={openTab === t.key}
                  className={cn(
                    "py-5 text-[15px] transition-colors",
                    quiet,
                    openTab === t.key && (solid ? "text-foreground" : "text-white")
                  )}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {/* 로그인 상태를 읽기 전엔 계정 메뉴를 비워 둠 - 로그인한 사람에게 '가입하기'가 깜빡 보이지 않게 */}
        <div
          className={cn(
            "ml-auto hidden items-center gap-5 text-[15px] md:flex",
            !isHydrated && "invisible"
          )}
        >
          {searchOpen ? (
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                search(e.currentTarget);
              }}
            >
              <input
                name="keyword"
                type="search"
                aria-label="여행 기록 검색"
                placeholder="제목 · 본문 · 장소"
                autoFocus
                onBlur={(e) => !e.currentTarget.value && setSearchOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                className={cn(inputClass, "h-9 w-56 py-0 text-sm text-foreground")}
              />
            </form>
          ) : (
            <button
              ref={searchButton}
              type="button"
              aria-label="검색"
              onClick={() => setSearchOpen(true)}
              className={quiet}
            >
              <Search className="size-[18px]" strokeWidth={1.5} />
            </button>
          )}
          <Link href={loggedIn ? "/posts/new" : "/login"} className={quiet}>
            글쓰기
          </Link>
          {loggedIn ? (
            <Link href="/mypage" className={quiet}>
              마이페이지
            </Link>
          ) : (
            <>
              <Link href="/login" className={quiet}>
                로그인
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonClass.primary,
                  "h-9 px-3.5 text-sm",
                  !solid && "bg-white text-foreground hover:bg-white/90"
                )}
              >
                가입하기
              </Link>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <Link
            href={loggedIn ? "/posts/new" : "/login"}
            aria-label="글쓰기"
            className={cn("rounded-lg p-2", solid ? "text-foreground" : "text-white")}
          >
            <PenLine className="size-[18px]" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className={cn("rounded-lg p-2", solid ? "text-foreground" : "text-white")}
          >
            {mobileOpen ? (
              <X className="size-[18px]" strokeWidth={1.5} />
            ) : (
              <Menu className="size-[18px]" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </header>

      {/* 큰 메뉴 (원본 subMenu) */}
      {openTab && (
        <div className="hidden border-t bg-background md:block">
          <div className="mx-auto flex min-h-56 max-w-6xl px-8 py-6">
            {openTab === "area" ? (
              <>
                <ul className="w-56 border-r pr-8">
                  {regions?.map((r) => (
                    <li key={r.id} onMouseEnter={() => setHoverRegion(r.id)}>
                      <button
                        type="button"
                        onClick={() => goList({ regionId: r.id })}
                        className={cn(
                          "w-full py-2 text-left text-[15px] text-ink-2 hover:text-foreground",
                          hoverRegion === r.id && "text-foreground"
                        )}
                      >
                        {r.name}
                      </button>
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-1 flex-wrap content-start gap-x-8 gap-y-2 pl-8 pt-2">
                  {hoverRegion == null && (
                    <li className="text-sm text-muted-foreground">
                      시·도에 마우스를 올려 도시를 골라주세요
                    </li>
                  )}
                  {cities?.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPickedCity({ ...c, regionId: hoverRegion });
                          goList({ regionId: hoverRegion, cityId: c.id });
                        }}
                        className="text-[15px] text-ink-2 hover:text-foreground"
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex flex-1">
                <div className="w-56 border-r pr-8 text-sm text-muted-foreground">
                  {pickedCity ? (
                    <>
                      <p className="py-2 text-[15px] text-foreground">{pickedCity.name}</p>
                      <button
                        type="button"
                        className="underline underline-offset-4"
                        onClick={() => setPickedCity(null)}
                      >
                        지역 해제
                      </button>
                    </>
                  ) : (
                    <p className="py-2">지역을 먼저 고르면 그 도시 안에서 찾아요</p>
                  )}
                </div>
                <ul className="flex flex-1 flex-wrap content-start gap-x-8 gap-y-2 pl-8 pt-2">
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        goList({
                          regionId: pickedCity?.regionId,
                          cityId: pickedCity?.id,
                          categoryId: activeCategoryId,
                        })
                      }
                      className="text-[15px] text-foreground hover:underline hover:underline-offset-4"
                    >
                      전체
                    </button>
                  </li>
                  {subCategories?.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() =>
                          goList({
                            regionId: pickedCity?.regionId,
                            cityId: pickedCity?.id,
                            categoryId: activeCategoryId,
                            subCategoryId: s.id,
                          })
                        }
                        className="text-[15px] text-ink-2 hover:text-foreground"
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

      {/* 휴대폰 메뉴 - 지역과 카테고리는 목록 화면의 필터로 바로 이동 */}
      {mobileOpen && (
        <nav
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t bg-background px-4 pb-6 pt-2 md:hidden"
          aria-label="휴대폰 메뉴"
        >
          <form
            role="search"
            className="pt-3"
            onSubmit={(e) => {
              e.preventDefault();
              search(e.currentTarget);
            }}
          >
            <input
              name="keyword"
              type="search"
              aria-label="여행 기록 검색"
              placeholder="제목 · 본문 · 장소로 찾기"
              className={inputClass}
            />
          </form>
          <p className="pb-1 pt-3 text-sm text-muted-foreground">카테고리</p>
          <ul>
            {categories?.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => goList({ categoryId: c.id })}
                  className="w-full py-2.5 text-left text-[15px]"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
          <p className="pb-1 pt-4 text-sm text-muted-foreground">지역</p>
          <ul className="grid grid-cols-2">
            {regions?.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => goList({ regionId: r.id })}
                  className="w-full py-2.5 text-left text-[15px]"
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2 border-t pt-4">
            {loggedIn ? (
              <Link href="/mypage" className={cn(buttonClass.ghost, "flex-1")}>
                마이페이지
              </Link>
            ) : (
              <>
                <Link href="/login" className={cn(buttonClass.ghost, "flex-1")}>
                  로그인
                </Link>
                <Link href="/signup" className={cn(buttonClass.primary, "flex-1")}>
                  가입하기
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
