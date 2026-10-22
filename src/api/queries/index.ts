"use client";

import { useQuery } from "@tanstack/react-query";

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
  UserResponse,
} from "../types";

export function usePosts(params: PostListParams) {
  return useQuery({
    queryKey: queryKeys.posts.list(params as Record<string, unknown>),
    queryFn: () => get<Page<PostResponse>>(ENDPOINTS.POSTS.LIST, { params }),
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
