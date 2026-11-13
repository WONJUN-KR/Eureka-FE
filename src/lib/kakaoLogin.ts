import { ENDPOINTS } from "@/api/endpoints";
import { post } from "@/api/request";
import type { TokenResponse } from "@/api/types";

// 카카오 로그인: 시작할 때 nonce 를 만들어 BE 에 넘기고, 콜백의 1회용 code 를 같은 nonce 로 토큰과 바꿈
// nonce 는 localStorage - 휴대폰에서 카카오톡 앱 로그인 뒤 같은 브라우저의 새 탭으로 돌아와도 교환되게 (다른 브라우저로 돌아오면 실패 안내)
// 남이 보낸 콜백 링크의 code 는 그 사람 nonce 에 묶여 있어서 이 탭에선 교환이 안 됨 (로그인 CSRF 방지)
const KEY = "kakao-login-nonce";

export function startKakaoLogin() {
  // 32바이트 -> base64url 43자 (BE 형식: 16~128자 [A-Za-z0-9_-])
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  try {
    localStorage.setItem(KEY, nonce);
  } catch {
    // 저장소가 막혀 있으면 콜백에서 교환을 못 해 실패 안내로 끝남
  }
  // 브라우저째 BE 로 이동해야 카카오 로그인 화면으로 넘어감
  window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${ENDPOINTS.AUTH.KAKAO}?nonce=${nonce}`;
}

// 콜백에서 한 번만 꺼내고 지움 (교환이 실패해도 다시 쓰지 않음 - code 도 1회용)
function takeNonce() {
  try {
    const nonce = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return nonce;
  } catch {
    return null;
  }
}

export async function exchangeKakaoCode(code: string) {
  const nonce = takeNonce();
  if (!nonce) throw new Error("이 탭에서 시작한 카카오 로그인이 아니에요");
  return post<TokenResponse>(ENDPOINTS.AUTH.KAKAO_EXCHANGE, { code, nonce });
}
