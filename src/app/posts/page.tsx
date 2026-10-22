"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useCategories, useCities, usePosts, useRegions, useSubCategories } from "@/api/queries";
import { pageInfo } from "@/api/types";
import PostCard from "@/components/PostCard";
import { inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// 원본 boardList.jsp: 헤더 메뉴(지역·테마)에서 고른 조건으로 3칸 사진 목록
// 조건은 주소(?cityId=&subCategoryId=)에 둬서 헤더 메뉴·추천 도시·새로고침 모두 같은 화면
const num = (v: string | null) => (v ? Number(v) : undefined);

function BoardList() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const regionId = num(sp.get("regionId"));
  const cityId = num(sp.get("cityId"));
  const categoryId = num(sp.get("categoryId"));
  const subCategoryId = num(sp.get("subCategoryId"));
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
    page,
    size: 9,
  });
  const info = data ? pageInfo(data) : null;

  const setParams = (next: Record<string, number | undefined>) => {
    const q = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => (v == null ? q.delete(k) : q.set(k, String(v))));
    if (!("page" in next)) q.delete("page");
    router.push(`${pathname}${q.size ? `?${q}` : ""}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-24 md:pt-32">
      <h1 className="mb-6 text-center text-3xl font-bold">발자취</h1>
      <div
        className="mx-auto mb-10 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4"
        aria-label="게시글 필터"
      >
        <select
          aria-label="지역"
          className={inputClass}
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
          className={inputClass}
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
        <select
          aria-label="카테고리"
          className={inputClass}
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
          aria-label="세부 테마"
          className={inputClass}
          value={subCategoryId ?? ""}
          disabled={!categoryId && !subCategoryId}
          onChange={(e) => setParams({ subCategoryId: num(e.target.value) })}
        >
          <option value="">전체 테마</option>
          {subCategories?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          {subCategoryId && !subCategories?.some((s) => s.id === subCategoryId) && (
            <option value={subCategoryId}>선택한 테마</option>
          )}
        </select>
      </div>

      <section aria-live="polite">
        {isLoading && <p className="py-16 text-center text-neutral-500">불러오는 중...</p>}
        {isError && (
          <p className="py-16 text-center text-destructive">게시글을 불러오지 못했어요.</p>
        )}
        {data && data.content.length === 0 && (
          <p className="py-16 text-center text-neutral-500">아직 이 조건의 발자취가 없어요.</p>
        )}
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {data?.content.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      {info && info.totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="페이지">
          <button
            type="button"
            aria-label="이전 페이지"
            disabled={info.number === 0}
            onClick={() => setParams({ page: info.number - 1 })}
            className="rounded-md border p-2 disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          {Array.from({ length: info.totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-current={i === info.number ? "page" : undefined}
              onClick={() => setParams({ page: i })}
              className={cn(
                "min-w-9 rounded-md border px-3 py-1.5 text-sm",
                i === info.number && "border-neutral-800 bg-neutral-800 text-white"
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
            className="rounded-md border p-2 disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </div>
  );
}

// useSearchParams 는 Suspense 안에서 (정적 빌드 요구사항)
export default function PostsPage() {
  return (
    <Suspense>
      <BoardList />
    </Suspense>
  );
}
