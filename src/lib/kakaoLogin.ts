import { ENDPOINTS } from "@/api/endpoints";

// 카카오 로그인 시작 표시 - 이 탭에서 버튼을 눌러 시작한 로그인만 콜백 토큰을 받음
// (남이 만든 '#accessToken=…' 링크로 다른 계정에 로그인되는 것 막기. 근본 대책은 BE 1회용 코드 교환)
const KEY = "kakao-login-started";
const TTL = 10 * 60 * 1000;

export function startKakaoLogin() {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // 저장소가 막혀 있으면 콜백에서 실패 안내로 끝남
  }
  // 브라우저째 BE 로 이동해야 카카오 로그인 화면으로 넘어감
  window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${ENDPOINTS.AUTH.KAKAO}`;
}

// 콜백에서 한 번만 확인하고 지움
export function takeKakaoLoginStarted() {
  try {
    const at = Number(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
    return at > 0 && Date.now() - at < TTL;
  } catch {
    return false;
  }
}
