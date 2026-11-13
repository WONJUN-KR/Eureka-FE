"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import client from "../client";
import { ENDPOINTS } from "../endpoints";
import { queryKeys } from "../queryKeys";
import { del, patch, post } from "../request";
import type {
  ApiResponse,
  CreatePostRequest,
  ImageResponse,
  LikeResponse,
  PostDetailResponse,
  SignupRequest,
  TokenResponse,
  UpdatePostRequest,
} from "../types";

export function useLogin() {
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      post<TokenResponse>(ENDPOINTS.AUTH.LOGIN, body),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupRequest) => post<null>(ENDPOINTS.AUTH.SIGNUP, body),
  });
}

// 글이 바뀌면 글 목록 · 상세 + 사람별 글 목록 · 프로필(글 수) · 추천한 글을 다시 받음
const refreshPosts = (qc: ReturnType<typeof useQueryClient>, key: readonly unknown[]) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: key }),
    qc.invalidateQueries({ queryKey: queryKeys.user.postsAll }),
    qc.invalidateQueries({ queryKey: queryKeys.user.profileAll }),
    qc.invalidateQueries({ queryKey: queryKeys.user.myLikes() }),
  ]);

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostRequest) => post<PostDetailResponse>(ENDPOINTS.POSTS.CREATE, body),
    onSuccess: () => refreshPosts(qc, queryKeys.posts.all),
  });
}

export function useUpdatePost(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePostRequest) =>
      patch<PostDetailResponse>(ENDPOINTS.POSTS.UPDATE(id), body),
    onSuccess: () => refreshPosts(qc, queryKeys.posts.all),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del<null>(ENDPOINTS.POSTS.DELETE(id)),
    // 목록만 갱신. 지운 글의 상세는 화면에서 조회를 끄고 떠남(invalidate·remove 하면 떠나기 전에 다시 불러서 404)
    onSuccess: () => refreshPosts(qc, ["posts", "list"]),
  });
}

export function useToggleLike(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => post<LikeResponse>(ENDPOINTS.LIKES.TOGGLE(postId)),
    onSuccess: (data) => {
      qc.setQueryData(["posts", "like", postId], data);
      qc.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
      // 마이페이지 '추천한 글' · 받은 좋아요 수 · 사람별 글 카드의 좋아요 수
      qc.invalidateQueries({ queryKey: queryKeys.user.myLikes() });
      qc.invalidateQueries({ queryKey: queryKeys.user.profileAll });
      qc.invalidateQueries({ queryKey: queryKeys.user.postsAll });
    },
  });
}

// multipart 라 공통 헤더(Content-Type: application/json)를 덮어씀
// placeId 를 주면 그 장소의 사진 (장소당 3장)
export async function uploadImage(
  postId: number,
  file: File,
  placeId?: number
): Promise<ImageResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await client.post<ApiResponse<ImageResponse>>(ENDPOINTS.IMAGES.UPLOAD(postId), form, {
    headers: { "Content-Type": "multipart/form-data" },
    params: placeId != null ? { placeId } : undefined,
  });
  return res.data.data;
}

export function deleteImage(imageId: number) {
  return del<null>(ENDPOINTS.IMAGES.DELETE(imageId));
}
