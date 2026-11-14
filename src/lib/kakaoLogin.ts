import { ENDPOINTS } from "@/api/endpoints";
import { post } from "@/api/request";
import type { TokenResponse } from "@/api/types";

// 카카오 로그인: 시작할 때 nonce 를 만들어 BE 에 넘기고, 콜백의 1회용 code 를 같은 nonce 로 토큰과 바꿈
// nonce 는 localStorage - 휴대폰에서 카카오톡 앱 로그인 뒤 같은 브라우저의 새 탭으로 돌아와도 교환되게 (다른 브라우저로 돌아오면 실패 안내)
// 남이 보낸 콜백 링크의 code 는 그 사람 nonce 에 묶여 있어서 이 탭에선 교환이 안 됨 (로그인 CSRF 방지)
// 두 탭에서 연달아 시작하면 nonce 가 덮이지만, BE 의 state 쿠키도 나중 시도로 덮여서 먼저 시작한 탭은 콜백에서 이미 실패(#error)
// -> 나중에 시작한 로그인만 성공. 다만 먼저 탭이 code 를 받은 직후에 다음 시도가 시작되면 먼저 탭이 덮인 nonce 로 교환을 시도할 수 있어서
//    nonce 는 교환에 성공했을 때만 지움 (실패한 교환이 다음 시도의 nonce 를 지우지 않게)
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

function readNonce() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// 교환에 성공한 nonce 만 지움 (그사이 다른 시도가 새 nonce 를 넣었으면 그건 남겨 둠)
function clearNonce(nonce: string) {
  try {
    if (localStorage.getItem(KEY) === nonce) localStorage.removeItem(KEY);
  } catch {
    // 저장소가 막혀 있으면 지울 것도 없음
  }
}

export async function exchangeKakaoCode(code: string) {
  const nonce = readNonce();
  if (!nonce) throw new Error("이 탭에서 시작한 카카오 로그인이 아니에요");
  const tokens = await post<TokenResponse>(ENDPOINTS.AUTH.KAKAO_EXCHANGE, { code, nonce });
  clearNonce(nonce);
  return tokens;
}
