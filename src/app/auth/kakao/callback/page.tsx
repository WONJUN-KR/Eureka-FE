"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { buttonClass } from "@/components/ui/field";
import { useAuthStore } from "@/stores/useAuthStore";

// 카카오 로그인 콜백: BE 가 #accessToken=..&refreshToken=.. (실패면 #error=..) 로 돌려보냄
// 해시는 서버로 안 가서 토큰이 로그에 남지 않음 - 읽고 나면 주소에서 바로 지움
export default function KakaoCallbackPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    window.history.replaceState(null, "", window.location.pathname);
    const access = hash.get("accessToken");
    const refresh = hash.get("refreshToken");
    if (hash.get("error") || !access || !refresh) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 해시는 마운트 후에만 읽을 수 있음
      setFailed(true);
      return;
    }
    login(access, refresh);
    router.replace("/");
  }, [login, router]);

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
