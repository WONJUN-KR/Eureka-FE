"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { buttonClass } from "@/components/ui/field";
import { exchangeKakaoCode } from "@/lib/kakaoLogin";
import { useAuthStore } from "@/stores/useAuthStore";

// 카카오 로그인 콜백: BE 가 #code=<1회용 코드> (실패면 #error=..) 로 돌려보냄 -> 시작할 때 만든 nonce 와 같이 토큰으로 교환
// 해시는 서버로 안 가서 로그에 남지 않음 - 읽고 나면 주소에서 바로 지움
export default function KakaoCallbackPage() {
  const router = useRouter();
  const { login, isHydrated, isAuthenticated } = useAuthStore();
  const [failed, setFailed] = useState(false);
  // 개발 모드에선 effect 가 두 번 돎 - 코드는 1회용이라 처음 한 번만 교환
  const handled = useRef(false);

  useEffect(() => {
    if (!isHydrated || handled.current) return;
    handled.current = true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const code = hash.get("code");
    // 이미 로그인된 채로 다시 온 경우(뒤로 가기 · 새로고침) - 해시가 없으면 그냥 홈으로
    if (!hash.size && isAuthenticated) {
      router.replace("/");
      return;
    }
    // 주소의 해시만 지움 - state 는 null 로 넘겨야 Next 가 받아서 라우터 주소도 같이 맞춤
    window.history.replaceState(null, "", window.location.pathname);
    if (hash.get("error") || !code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 해시는 마운트 후에만 읽을 수 있음
      setFailed(true);
      return;
    }
    exchangeKakaoCode(code)
      .then((t) => {
        try {
          login(t.accessToken, t.refreshToken);
        } catch (e) {
          // 저장소가 막혀 있으면(사파리 개인 정보 보호 모드 등) login 에서 예외 -> 실패 안내
          // 단 이번에 받은 토큰이 메모리에 들어가고 auth-storage 저장만 실패한 경우는 이번 접속 동안 로그인된 것 -> 성공으로 넘김
          // (이미 다른 계정으로 로그인돼 있던 경우를 성공으로 보지 않게 토큰까지 비교)
          const now = useAuthStore.getState();
          if (now.accessToken !== t.accessToken || now.refreshToken !== t.refreshToken) throw e;
        }
        router.replace("/");
      })
      .catch(() => setFailed(true));
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
