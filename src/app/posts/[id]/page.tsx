"use client";

/* eslint-disable @next/next/no-img-element */
import { ChevronLeft, ChevronRight, Eye, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { useDeletePost, useToggleLike } from "@/api/mutations";
import { useLikeStatus, useMe, usePost, usePostImages } from "@/api/queries";
import { getErrorMessage } from "@/api/request";
import { cn, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

// 원본 read.jsp 글 읽기 창: 제목 + 밑줄 · 사진 슬라이더 · 작성자 닉네임과 '추천' 버튼 · 본문 · 아래 한 줄 요약
// 원본은 목록 위에 뜨는 창(모달)이었는데 주소로 공유할 수 있게 페이지로 둠. '신고'는 BE 기능이 없어서 뺌
export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const loggedIn = isHydrated && isAuthenticated;
  // 삭제한 뒤엔 이 글 조회를 멈춤 (목록으로 가기 전에 다시 불러서 404 나지 않게)
  const [deleted, setDeleted] = useState(false);
  const [slide, setSlide] = useState(0);

  const { data: post, isLoading, isError, error } = usePost(postId, !deleted);
  const { data: images } = usePostImages(postId, !deleted);
  const { data: like } = useLikeStatus(postId, loggedIn && !deleted);
  const { data: me } = useMe(loggedIn);
  const toggleLike = useToggleLike(postId);
  const deletePost = useDeletePost();

  const wrap = "mx-auto max-w-3xl px-4 pb-8 pt-24 md:pt-32";
  if (isLoading) return <p className={cn(wrap, "text-center text-neutral-500")}>불러오는 중...</p>;
  if (isError || !post)
    return (
      <p className={cn(wrap, "text-center text-destructive")}>
        {getErrorMessage(error) || "게시글이 없어요."}
      </p>
    );

  const isMine = me?.id === post.author.id;
  const liked = like?.liked ?? false;
  const count = images?.length ?? 0;

  return (
    <div className={wrap}>
      <article className="relative rounded-xl border-2 border-neutral-300 bg-white px-5 py-6 text-center md:px-10">
        <Link
          href="/posts"
          aria-label="목록으로"
          className="absolute right-3 top-3 rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
        >
          <X className="size-6" />
        </Link>
        <p className="mb-2 px-8 text-sm text-neutral-500">
          {post.location.regionName} · {post.location.cityName} / {post.category.categoryName} ·{" "}
          {post.category.subCategoryName}
        </p>
        <h1 className="mb-3 text-2xl font-bold">{post.title}</h1>
        <div className="mx-auto mb-6 max-w-xl border-b-2 border-black" />

        {count > 0 && (
          <div className="relative mx-auto mb-6 max-w-xl overflow-hidden rounded">
            <img
              src={images![slide % count].url}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="이전 사진"
                  onClick={() => setSlide((s) => (s - 1 + count) % count)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="다음 사진"
                  onClick={() => setSlide((s) => (s + 1) % count)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between text-sm">
          <p className="font-semibold">
            {post.author.nickname}
            <span className="ml-2 font-normal text-neutral-500">{formatDate(post.createdAt)}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-neutral-500">
              <Eye className="size-4" aria-hidden />
              {post.viewCount}
            </span>
            <button
              type="button"
              onClick={() => (loggedIn ? toggleLike.mutate() : router.push("/login"))}
              disabled={toggleLike.isPending}
              aria-pressed={liked}
              className={cn(
                "rounded-md border px-3 py-1 font-medium",
                liked
                  ? "border-[rgb(6,119,207)] bg-[rgb(6,119,207)] text-white"
                  : "hover:bg-neutral-100"
              )}
            >
              추천 {like?.likeCount ?? post.likeCount}
            </button>
          </div>
        </div>

        <pre className="whitespace-pre-wrap text-left font-sans leading-7">{post.content}</pre>
        {post.summary && (
          <pre className="mt-6 whitespace-pre-wrap border-t pt-4 text-left font-sans text-sm text-neutral-500">
            {post.summary}
          </pre>
        )}

        {isMine && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() =>
                deletePost.mutate(post.id, {
                  onSuccess: () => {
                    setDeleted(true);
                    router.replace("/posts");
                  },
                })
              }
              disabled={deletePost.isPending}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" aria-hidden />
              삭제
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
