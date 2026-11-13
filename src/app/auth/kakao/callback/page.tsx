"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { buttonClass } from "@/components/ui/field";
import { takeKakaoLoginStarted } from "@/lib/kakaoLogin";
import { useAuthStore } from "@/stores/useAuthStore";

// 카카오 로그인 콜백: BE 가 #accessToken=..&refreshToken=.. (실패면 #error=..) 로 돌려보냄
// 해시는 서버로 안 가서 토큰이 로그에 남지 않음 - 읽고 나면 주소에서 바로 지움
export default function KakaoCallbackPage() {
  const router = useRouter();
  const { login, isHydrated, isAuthenticated } = useAuthStore();
  const [failed, setFailed] = useState(false);
  // 개발 모드에선 effect 가 두 번 돎 - 해시는 처음 한 번만 읽음
  const handled = useRef(false);

  useEffect(() => {
    if (!isHydrated || handled.current) return;
    handled.current = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access = hash.get("accessToken");
    const refresh = hash.get("refreshToken");
    // 이미 로그인된 채로 다시 온 경우(뒤로 가기 · 새로고침) - 해시가 없으면 그냥 홈으로
    if (!hash.size && isAuthenticated) {
      router.replace("/");
      return;
    }
    // Next 라우터가 history.state 에 넣어 둔 값은 그대로 두고 주소의 해시만 지움
    window.history.replaceState(window.history.state, "", window.location.pathname);
    const started = takeKakaoLoginStarted();
    if (hash.get("error") || !access || !refresh || !started) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 해시는 마운트 후에만 읽을 수 있음
      setFailed(true);
      return;
    }
    try {
      login(access, refresh);
    } catch {
      // 저장소가 막혀 있으면(사파리 개인 정보 보호 모드 등) 로그인을 못 남김
      setFailed(true);
      return;
    }
    router.replace("/");
  }, [isHydrated, isAuthenticated, login, router]);

  return (
    <div className="mx-auto max-w-md px-4 pb-8 pt-32 text-center md:pt-40" aria-live="polite">
      {failed ? (
        <>
          <p className="mb-6 text-ink-2">카카오 로그인에 실패했어요. 잠시 뒤 다시 시도해 주세요</p>
          <Link href="/login" className={buttonClass.ghost}>
            로그인 화면으로
          </Link>
        </>
      ) : (
        <p className="text-ink-2">로그인하는 중</p>
      )}
    </div>
  );
}
