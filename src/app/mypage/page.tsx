"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMe } from "@/api/queries";
import { get } from "@/api/request";
import type { Page, PostResponse } from "@/api/types";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import { useAuthStore } from "@/stores/useAuthStore";

// 원본 myPage.jsp = 내가 쓴 글 목록(boardList 와 같은 3칸). 위에 내 정보와 로그아웃을 더함
// 내 글 API(GET /api/users/me/posts)는 4번이 BE 에 추가 중 - 없으면 안내 문구
export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, logout } = useAuthStore();
  const loggedIn = isHydrated && isAuthenticated;
  const { data: me } = useMe(loggedIn);
  const mine = useQuery({
    queryKey: ["user", "me", "posts"],
    queryFn: () => get<Page<PostResponse>>("/api/users/me/posts", { params: { size: 30 } }),
    enabled: loggedIn,
    retry: false,
  });

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace("/login");
  }, [isHydrated, isAuthenticated, router]);

  if (!loggedIn) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-24 md:pt-32">
      <section className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <h1 className="text-3xl font-bold">마이페이지</h1>
          {me && (
            <p className="mt-2 text-neutral-500">
              {me.nickname} · {me.email}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="rounded-md border px-4 py-2 text-sm hover:bg-neutral-100"
        >
          로그아웃
        </button>
      </section>

      <h2 className="mb-6 text-xl font-bold">내가 남긴 발자취</h2>
      {mine.isError && (
        <p className="py-12 text-center text-neutral-500">내 글 목록은 준비 중이에요.</p>
      )}
      {mine.data && mine.data.content.length === 0 && (
        <p className="py-12 text-center text-neutral-500">아직 남긴 발자취가 없어요.</p>
      )}
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {mine.isLoading && Array.from({ length: 6 }, (_, i) => <PostCardSkeleton key={i} />)}
        {mine.data?.content.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
