"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMe, usePost, usePostImages } from "@/api/queries";
import { getErrorMessage } from "@/api/request";
import PostEditor from "@/components/editor/PostEditor";
import { buttonClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

// 글 수정 - 내 글일 때만 편집기, 아니면 글 상세로 돌려보냄 (BE 도 남의 글 수정은 403)
export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const loggedIn = isHydrated && isAuthenticated;
  const { data: me, isError: meError, error: meErr, refetch: refetchMe } = useMe(loggedIn);
  const { data: post, isError, error } = usePost(postId, loggedIn);
  const {
    data: images,
    isSuccess: imagesReady,
    isError: imagesError,
    error: imagesErr,
  } = usePostImages(postId, loggedIn);
  const notMine = me && post && me.id !== post.author.id;

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace("/login");
    else if (notMine) router.replace(`/posts/${postId}`);
  }, [isHydrated, isAuthenticated, notMine, postId, router]);

  // 내 정보를 못 받으면 내 글인지 알 수 없어서 편집기를 못 띄움 - 다시 시도할 수 있게
  if (meError)
    return (
      <div className="px-4 pt-32 text-center">
        <p className="text-destructive">
          {getErrorMessage(meErr) || "내 정보를 불러오지 못했어요."}
        </p>
        <button type="button" onClick={() => refetchMe()} className={cn(buttonClass.ghost, "mt-4")}>
          다시 불러오기
        </button>
      </div>
    );
  if (isError || imagesError)
    return (
      <p className="px-4 pt-32 text-center text-destructive">
        {getErrorMessage(error ?? imagesErr) || "게시글을 불러오지 못했어요."}
      </p>
    );
  if (!loggedIn || !me || !post || !imagesReady || notMine) return null;
  return <PostEditor initial={post} initialImages={images} />;
}
