"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useMe } from "@/api/queries";
import { buttonClass } from "@/components/ui/field";
import UserJourney from "@/components/UserJourney";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

// 마이페이지: 내 유레카(공개 페이지와 같은 지도 · 글 목록) + 계정 정보 · 로그아웃
export default function MyPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, logout } = useAuthStore();
  const loggedIn = isHydrated && isAuthenticated;
  const { data: me, isError } = useMe(loggedIn);
  // 로그아웃으로 나가는 중엔 '비로그인 -> 로그인 화면' 이동을 건너뜀 (홈으로 가야 함)
  const leaving = useRef(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated && !leaving.current) router.replace("/login");
  }, [isHydrated, isAuthenticated, router]);

  const signOut = () => {
    leaving.current = true;
    logout();
    router.push("/");
  };

  // 내 정보를 못 받으면 빈 화면 대신 안내와 로그아웃 버튼
  if (loggedIn && isError)
    return (
      <div className="mx-auto max-w-md px-4 pt-32 text-center">
        <p className="mb-6 text-ink-2">내 정보를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요</p>
        <button type="button" onClick={signOut} className={buttonClass.ghost}>
          로그아웃
        </button>
      </div>
    );
  if (!loggedIn || !me) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-28 md:px-8 md:pt-32">
      <UserJourney userId={me.id} mine />

      <section
        className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t pt-8"
        aria-label="계정"
      >
        <div className="text-[15px]">
          <p className="font-medium">{me.nickname}</p>
          <p className="text-ink-2">{me.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/users/${me.id}`} className={buttonClass.ghost}>
            공개 페이지 보기
          </Link>
          <button type="button" onClick={signOut} className={cn(buttonClass.ghost, "text-ink-2")}>
            로그아웃
          </button>
        </div>
      </section>
    </div>
  );
}
