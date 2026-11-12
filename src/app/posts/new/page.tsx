"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import PostEditor from "@/components/editor/PostEditor";
import { useAuthStore } from "@/stores/useAuthStore";

// 글쓰기 - 비로그인은 로그인 화면으로 (글 작성 API 는 토큰 필요)
export default function NewPostPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace("/login");
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) return null;
  return <PostEditor />;
}
