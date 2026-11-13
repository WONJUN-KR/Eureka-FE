"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { ENDPOINTS } from "../endpoints";
import { queryKeys } from "../queryKeys";
import { get } from "../request";
import type {
  CategoryResponse,
  CityResponse,
  ImageResponse,
  LikeResponse,
  Page,
  PostDetailResponse,
  PostListParams,
  PostResponse,
  RegionResponse,
  SubCategoryResponse,
  UserProfileResponse,
  UserResponse,
} from "../types";
import { pageInfo } from "../types";

export function usePosts(params: PostListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.list(params as Record<string, unknown>),
    queryFn: () =>
      get<Page<PostResponse>>(ENDPOINTS.POSTS.LIST, {
        params,
        // 배열은 sort=a&sort=b 로 (Spring 이 받는 모양)
        paramsSerializer: { indexes: null },
      }),
    enabled,
  });
}

export function usePost(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => get<PostDetailResponse>(ENDPOINTS.POSTS.DETAIL(id)),
    enabled: enabled && Number.isFinite(id),
  });
}

export function usePostImages(postId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["posts", "images", postId],
    queryFn: () => get<ImageResponse[]>(ENDPOINTS.IMAGES.LIST(postId)),
    enabled: enabled && Number.isFinite(postId),
  });
}

export function useLikeStatus(postId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["posts", "like", postId],
    queryFn: () => get<LikeResponse>(ENDPOINTS.LIKES.STATUS(postId)),
    enabled: enabled && Number.isFinite(postId),
  });
}

export function useRegions() {
  return useQuery({
    queryKey: queryKeys.regions.all,
    queryFn: () => get<RegionResponse[]>(ENDPOINTS.REGIONS.LIST),
    staleTime: Infinity,
  });
}

export function useCities(regionId?: number) {
  return useQuery({
    queryKey: queryKeys.regions.cities(regionId ?? -1),
    queryFn: () => get<CityResponse[]>(ENDPOINTS.REGIONS.CITIES(regionId!)),
    enabled: regionId != null,
    staleTime: Infinity,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => get<CategoryResponse[]>(ENDPOINTS.CATEGORIES.LIST),
    staleTime: Infinity,
  });
}

export function useSubCategories(categoryId?: number) {
  return useQuery({
    queryKey: queryKeys.categories.sub(categoryId ?? -1),
    queryFn: () => get<SubCategoryResponse[]>(ENDPOINTS.CATEGORIES.SUB(categoryId!)),
    enabled: categoryId != null,
    staleTime: Infinity,
  });
}

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => get<UserResponse>(ENDPOINTS.USERS.ME),
    enabled,
  });
}

export function useUserProfile(id: number) {
  return useQuery({
    queryKey: queryKeys.user.profile(id),
    queryFn: () => get<UserProfileResponse>(ENDPOINTS.USERS.PROFILE(id)),
    enabled: Number.isFinite(id),
  });
}

// 사람별 글은 50개씩 - 지도에 여행을 넉넉히 그리고, 더 있으면 '더 보기'로 이어 받음
const USER_PAGE = 50;
const nextPage = (last: Page<PostResponse>) => {
  const { number, totalPages } = pageInfo(last);
  return number + 1 < totalPages ? number + 1 : undefined;
};

// 한 사람의 공개 글
export function useUserPosts(id: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.user.posts(id),
    queryFn: ({ pageParam }) =>
      get<Page<PostResponse>>(ENDPOINTS.USERS.POSTS(id), {
        params: { page: pageParam, size: USER_PAGE },
      }),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled: enabled && Number.isFinite(id),
  });
}

// 내가 좋아요한 글 - 좋아요 누른 순 (공개 · 삭제 안 된 글만)
export function useMyLikes(enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.user.myLikes(),
    queryFn: ({ pageParam }) =>
      get<Page<PostResponse>>(ENDPOINTS.USERS.MY_LIKES, {
        params: { page: pageParam, size: USER_PAGE },
      }),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
  });
}

// 내 글 - 공개 전 · 숨김 글까지 (마이페이지)
export function useMyPosts(enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.user.myPosts(),
    queryFn: ({ pageParam }) =>
      get<Page<PostResponse>>(ENDPOINTS.USERS.MY_POSTS, {
        params: { page: pageParam, size: USER_PAGE },
      }),
    initialPageParam: 0,
    getNextPageParam: nextPage,
    enabled,
  });
}
