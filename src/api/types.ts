// FootPrint BE 응답 형식: { status: number, message: string, data: T }
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  data: null;
}

// Spring Data Page 직렬화 - 기본(PageImpl)은 최상위에 totalPages 등, VIA_DTO 설정이면 page 객체 안에 들어옴
export interface Page<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
  page?: { size: number; number: number; totalElements: number; totalPages: number };
}

export function pageInfo<T>(p: Page<T>) {
  return {
    number: p.page?.number ?? p.number ?? 0,
    totalPages: p.page?.totalPages ?? p.totalPages ?? 1,
    totalElements: p.page?.totalElements ?? p.totalElements ?? p.content.length,
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  name: string;
  birth?: string;
  gender?: Gender;
}

export interface UserResponse {
  id: number;
  email: string;
  nickname: string;
  name: string;
  birth: string | null;
  gender: Gender | null;
}

export interface PostResponse {
  id: number;
  title: string;
  summary: string | null;
  authorNickname: string;
  cityName: string;
  subCategoryName: string;
  viewCount: number;
  likeCount: number;
  status: string;
  createdAt: string;
  // 4번이 BE 에 추가 중 - 없거나 null 이면 기본 이미지
  thumbnailUrl?: string | null;
}

export interface PostDetailResponse {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  author: { id: number; nickname: string };
  location: { regionId: number; regionName: string; cityId: number; cityName: string };
  category: {
    categoryId: number;
    categoryName: string;
    subCategoryId: number;
    subCategoryName: string;
  };
  viewCount: number;
  likeCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  cityId: number;
  subCategoryId: number;
  title: string;
  content: string;
  summary?: string;
}

export interface PostListParams {
  regionId?: number;
  cityId?: number;
  categoryId?: number;
  subCategoryId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface RegionResponse {
  id: number;
  name: string;
}

export interface CityResponse {
  id: number;
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  type: string;
}

export interface SubCategoryResponse {
  id: number;
  name: string;
}

export interface LikeResponse {
  postId: number;
  liked: boolean;
  likeCount: number;
}

export interface ImageResponse {
  id: number;
  postId: number;
  url: string;
  seq: number;
}
