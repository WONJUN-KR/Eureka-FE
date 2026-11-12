// 카카오 지도 JavaScript SDK - 키(NEXT_PUBLIC_KAKAO_JS_KEY)가 있을 때만 한 번 불러옴
// 키가 없거나 불러오기에 실패하면 null -> 화면은 좌표만으로 그린 약도로 대신함

export type LatLng = { latitude: number; longitude: number };

// 이 프로젝트에서 쓰는 SDK 기능만 최소로 적은 타입
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Kakao = {
  maps: {
    load: (cb: () => void) => void;
    LatLng: new (lat: number, lng: number) => any;
    LatLngBounds: new () => any;
    Map: new (el: HTMLElement, options: { center: any; level: number }) => any;
    Polyline: new (options: Record<string, unknown>) => any;
    CustomOverlay: new (options: Record<string, unknown>) => any;
    event: { addListener: (target: any, type: string, cb: () => void) => void };
    services: {
      Places: new () => {
        keywordSearch: (
          query: string,
          cb: (result: KakaoPlace[], status: string, pagination: any) => void,
          options?: Record<string, unknown>
        ) => void;
      };
      Status: { OK: string; ZERO_RESULT: string; ERROR: string };
    };
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// 키워드 검색 결과 한 줄 (카카오 응답 필드 이름 그대로)
export type KakaoPlace = {
  id: string;
  place_name: string;
  category_name: string;
  category_group_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도
  y: string; // 위도
};

declare global {
  interface Window {
    kakao?: Kakao;
  }
}

const KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
let loading: Promise<Kakao | null> | null = null;

export const hasKakaoKey = Boolean(KEY);

export function loadKakao(): Promise<Kakao | null> {
  if (typeof window === "undefined" || !KEY) return Promise.resolve(null);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    // 스크립트는 받았는데 지도 준비가 끝나지 않는 경우(차단 확장 등) - 8초 뒤 약도로 넘어가고 다음에 다시 시도
    const timer = setTimeout(() => {
      loading = null;
      resolve(null);
    }, 8000);
    const finish = (k: Kakao | null) => {
      clearTimeout(timer);
      if (!k) loading = null;
      resolve(k);
    };
    const done = () => {
      if (!window.kakao?.maps) return finish(null);
      window.kakao.maps.load(() => finish(window.kakao!));
    };
    if (window.kakao?.maps) return done();
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = done;
    // 키가 틀렸거나 도메인이 등록되지 않았으면 여기로 옴 - 다음에 다시 시도할 수 있게 비움
    script.onerror = () => finish(null);
    document.head.appendChild(script);
  });
  return loading;
}
