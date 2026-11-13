"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useSyncExternalStore } from "react";

import { useCategories, useCities, usePosts, useRegions, useSubCategories } from "@/api/queries";
import { pageInfo } from "@/api/types";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import { inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// 원본 boardList.jsp: 헤더 메뉴(지역·테마)에서 고른 조건으로 3칸 사진 목록 + '최신순' 정렬
// 조건은 주소(?cityId=&subCategoryId=&sort=)에 둬서 헤더 메뉴·추천 도시·새로고침 모두 같은 화면
const num = (v: string | null) => (v ? Number(v) : undefined);
const SORTS = [
  { value: "createdAt,desc", label: "최신순" },
  { value: "likeCount,desc", label: "좋아요순" },
  { value: "viewCount,desc", label: "조회순" },
];
const PAGE_SIZE = 9;
const selectClass = cn(inputClass, "h-10 py-0 pr-8 text-sm");
const noop = () => () => {};

function BoardList() {
  const router = useRouter();
  const pathname = usePathname();
  // 헤더 · 푸터가 같은 쿼리를 먼저 받아오면 hydration 시점에 서버 HTML 과 달라짐 -> 마운트 전엔 대체 화면
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
  const sp = useSearchParams();
  const regionId = num(sp.get("regionId"));
  const cityId = num(sp.get("cityId"));
  const categoryId = num(sp.get("categoryId"));
  const subCategoryId = num(sp.get("subCategoryId"));
  const keyword = sp.get("keyword")?.trim() || undefined;
  const sort = SORTS.find((s) => s.value === sp.get("sort"))?.value ?? SORTS[0].value;
  const page = num(sp.get("page")) ?? 0;

  const { data: regions } = useRegions();
  const { data: cities } = useCities(regionId);
  const { data: categories } = useCategories();
  const { data: subCategories } = useSubCategories(categoryId);
  const { data, isLoading, isError } = usePosts({
    regionId,
    cityId,
    categoryId,
    subCategoryId,
    keyword,
    page,
    size: PAGE_SIZE,
    // 좋아요 · 조회 수가 같은 글이 많아서 글 번호로 한 번 더 정렬 - 페이지가 바뀔 때 겹치거나 빠지지 않게
    sort: [sort, "id,desc"],
  });
  const info = data ? pageInfo(data) : null;

  const setParams = (next: Record<string, number | string | undefined>) => {
    const q = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => (v == null ? q.delete(k) : q.set(k, String(v))));
    if (!("page" in next)) q.delete("page");
    router.push(`${pathname}${q.size ? `?${q}` : ""}`);
  };

  // 제목: 장소(도시 > 시·도) · 주제(세부 테마 > 카테고리), 아무것도 안 골랐으면 전체 글
  const category = categories?.find((c) => c.id === categoryId);
  const subCategory = subCategories?.find((s) => s.id === subCategoryId);
  const region = regions?.find((r) => r.id === regionId);
  const city = cities?.find((c) => c.id === cityId);
  // 도시만 받은 주소(?cityId=)는 도시 목록을 못 불러옴 -> 이름 대신 선택 상태만
  const place =
    city?.name ?? region?.name ?? (cityId != null && regionId == null ? "선택한 도시" : undefined);
  const topic = subCategory?.name ?? category?.name;
  const filters = [place, topic].filter(Boolean).join(" · ");
  const title = keyword ? `'${keyword}' 검색 결과` : filters || "전체 글";
  // 검색칸 글자는 직접 들고 있고, 주소의 검색어가 바뀌면(뒤로 가기 등) 렌더 중에 맞춤 - 다시 그려도 포커스 유지
  const [text, setText] = useState(keyword ?? "");
  const [lastKeyword, setLastKeyword] = useState(keyword);
  // 칸을 비워서 직접 검색을 푼 경우에만 - 그 사이 새로 친 글자는 주소가 늦게 바뀌어도 남김 (뒤로 가기는 주소대로)
  const [clearing, setClearing] = useState(false);
  if (keyword !== lastKeyword) {
    setLastKeyword(keyword);
    setClearing(false);
    if (!(clearing && keyword == null)) setText(keyword ?? "");
  }
  // 목록에 없는 테마로 들어온 경우(카테고리 없이 테마만 등) - 고른 상태를 보이고 해제할 수 있게
  const unknownSub = subCategoryId != null && !subCategory;

  if (!mounted) return <BoardListFallback chips={categoryId != null} />;
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-28 md:px-8 md:pt-32">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-full">
          {/* 띄어쓰기 없는 긴 검색어도 줄을 바꿔 화면 밖으로 넘치지 않게 */}
          <h1 className="font-serif text-[32px] leading-tight tracking-tight [overflow-wrap:anywhere] md:text-[40px]">
            {title}
          </h1>
          <p className="mt-2 text-[15px] tabular-nums text-ink-2">
            {info
              ? `${keyword && filters ? `${filters} 안에서 ` : ""}${info.totalElements}개의 여행 기록`
              : "\u00a0"}
          </p>
        </div>
        <select
          aria-label="정렬"
          className={cn(selectClass, "w-auto")}
          value={sort}
          onChange={(e) => setParams({ sort: e.target.value })}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* 지금 고른 조건 안에서 찾기 - 칸 글자는 위에서 주소의 keyword 와 맞춰 둠 */}
      <form
        role="search"
        className="relative mb-4 md:max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          setParams({ keyword: text.trim() || undefined });
        }}
      >
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <input
          name="keyword"
          type="search"
          aria-label="여행 기록 검색"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            // 칸의 지우기(x)로 비우면 검색도 바로 풀림
            if (!e.target.value && keyword) {
              setClearing(true);
              setParams({ keyword: undefined });
            }
          }}
          placeholder="제목 · 본문 · 장소 이름"
          className={cn(inputClass, "h-10 py-0 pl-10 text-sm")}
        />
      </form>

      {/* 세부 테마는 칩으로 바로 고르고, 지역 · 도시 · 카테고리는 선택 상자 */}
      <div
        className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:max-w-2xl"
        aria-label="게시글 필터"
      >
        <select
          aria-label="카테고리"
          className={selectClass}
          value={categoryId ?? ""}
          onChange={(e) => setParams({ categoryId: num(e.target.value), subCategoryId: undefined })}
        >
          <option value="">전체 카테고리</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="지역"
          className={selectClass}
          value={regionId ?? ""}
          onChange={(e) => setParams({ regionId: num(e.target.value), cityId: undefined })}
        >
          <option value="">전체 지역</option>
          {regions?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          aria-label="도시"
          className={selectClass}
          value={cityId ?? ""}
          disabled={!regionId && !cityId}
          onChange={(e) => setParams({ cityId: num(e.target.value) })}
        >
          <option value="">전체 도시</option>
          {cities?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          {/* 헤더·추천 도시에서 도시만 골라 들어온 경우: 목록엔 없지만 선택 상태는 보이게 */}
          {cityId && !cities?.some((c) => c.id === cityId) && (
            <option value={cityId}>선택한 도시</option>
          )}
        </select>
      </div>
      {((subCategories && subCategories.length > 0) || unknownSub) && (
        <ul className="mb-10 flex flex-wrap gap-2" aria-label="세부 테마">
          {[
            { id: undefined, name: "전체" },
            ...(subCategories ?? []),
            ...(unknownSub ? [{ id: subCategoryId, name: "선택한 테마" }] : []),
          ].map((s) => {
            const on = s.id === subCategoryId;
            return (
              <li key={s.id ?? "all"}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setParams({ subCategoryId: s.id })}
                  className={cn(
                    "h-9 rounded-full border px-3.5 text-sm transition-colors",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-ink-2 hover:text-foreground"
                  )}
                >
                  {s.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {/* 칩이 없을 때도 같은 높이를 잡아 둠 - 카테고리를 고른 뒤 칩이 들어와도 카드가 밀리지 않게 */}
      {!subCategories?.length && !unknownSub && (
        <div className={categoryId ? "mb-10 h-9" : "mb-10"} />
      )}

      <section aria-live="polite">
        {isError && (
          <p className="py-16 text-center text-destructive">게시글을 불러오지 못했어요</p>
        )}
        {data && data.content.length === 0 && (
          <p className="py-16 text-center text-ink-2">
            {keyword ? "이 검색어로 찾은 여행 기록이 없어요" : "아직 이 조건의 글이 없어요"}
          </p>
        )}
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: PAGE_SIZE }, (_, i) => <PostCardSkeleton key={i} />)}
          {data?.content.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      {info && info.totalPages > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-1" aria-label="페이지">
          <button
            type="button"
            aria-label="이전 페이지"
            disabled={info.number === 0}
            onClick={() => setParams({ page: info.number - 1 })}
            className="rounded-lg p-2 text-ink-2 hover:bg-secondary disabled:opacity-40"
          >
            <ChevronLeft className="size-[18px]" strokeWidth={1.5} />
          </button>
          {Array.from({ length: info.totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-current={i === info.number ? "page" : undefined}
              onClick={() => setParams({ page: i })}
              className={cn(
                "min-w-9 rounded-lg px-3 py-1.5 text-sm tabular-nums",
                i === info.number
                  ? "bg-primary text-primary-foreground"
                  : "text-ink-2 hover:bg-secondary"
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            aria-label="다음 페이지"
            disabled={info.number >= info.totalPages - 1}
            onClick={() => setParams({ page: info.number + 1 })}
            className="rounded-lg p-2 text-ink-2 hover:bg-secondary disabled:opacity-40"
          >
            <ChevronRight className="size-[18px]" strokeWidth={1.5} />
          </button>
        </nav>
      )}
    </div>
  );
}

// 서버 HTML 에선 Suspense 대체 화면이 먼저 그려짐 - 제목 · 필터 · 카드 자리를 같은 크기로 미리 잡아둠 (CLS)
function BoardListFallback({ chips = false }: { chips?: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-28 md:px-8 md:pt-32" aria-busy="true">
      <div className="mb-8 h-[76px] md:h-[86px]" />
      {/* 검색칸 자리 */}
      <div className="mb-4 h-10 rounded-[10px] border bg-card md:max-w-2xl" />
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:max-w-2xl">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-10 rounded-[10px] border bg-card" />
        ))}
      </div>
      {/* 실제 화면과 같은 칩 행 자리 - 카테고리를 고른 주소면 칩 한 줄 높이까지 */}
      <div className={chips ? "mb-10 h-9" : "mb-10"} />
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: PAGE_SIZE }, (_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// useSearchParams 는 Suspense 안에서 (정적 빌드 요구사항)
export default function PostsPage() {
  return (
    <Suspense fallback={<BoardListFallback />}>
      <BoardList />
    </Suspense>
  );
}
