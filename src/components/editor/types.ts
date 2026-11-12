import type { ImageResponse } from "@/api/types";

// 편집 중인 장소 한 곳 - 저장 전엔 id 가 없음
export type EditorPlace = {
  // 화면 목록용 키 (저장된 장소는 id 로, 새 장소는 임시 값)
  key: string;
  id?: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  kakaoPlaceId?: string;
  // 카카오 장소 분류(카페 · 음식점 등) - 종류 기본값을 고르는 데만 씀
  groupName?: string;
  subCategoryId?: number;
  memo: string;
  // "HH:mm" 또는 ""
  visitedAt: string;
  // 이미 올라간 사진 / 새로 고른 사진
  images: ImageResponse[];
  files: File[];
};

export const MAX_PLACES = 20;
export const MAX_PLACE_PHOTOS = 3;
